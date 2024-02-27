import {
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Spacer,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  Textarea,
  useDisclosure,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { z } from "zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import Course from "../models/Course.tsx";
import { useDb } from "../providers/DatabaseProvider.tsx";
import { tagColor } from "../util/colors.ts";
import DeleteAlertDialog from "./DeleteAlertDialog.tsx";
import { BiPlus, BiSave, BiTrash } from "react-icons/bi";
import RequisiteCard from "./RequisiteCard.tsx";

const EditCourseSchema = z
  .object({
    number: z.string().min(1, "Course number is required"),
    title: z.string().min(1, "Course title is required"),
    description: z.string(),
    credits: z.preprocess(
      (x) => parseInt(x as string, 10),
      z.number().nonnegative(),
    ),
    availableFall: z.boolean(),
    availableSpring: z.boolean(),
    availableSummer: z.boolean(),
    tags: z.array(
      z.object({
        text: z.string(),
      }),
    ),
    requisites: z.array(
      z.object({
        courses: z.array(z.object({ courseId: z.string() })),
        type: z.union([z.literal("pre"), z.literal("co"), z.literal("year")]),
        ignore: z.boolean(),
        compare: z.union([z.literal("<="), z.literal("="), z.literal(">=")]),
        year: z.preprocess(
          (x) => parseInt(x as string, 10),
          z.number().positive(),
        ),
        strict: z.boolean(),
      }),
    ),
  })
  .superRefine(({ requisites }, ctx) => {
    requisites.forEach(({ type, courses }, index) => {
      if (type !== "year") {
        courses.forEach(({ courseId }, courseIndex) => {
          if (!courseId) {
            ctx.addIssue({
              path: ["requisites", index, "courses", courseIndex, "courseId"],
              code: "custom",
              message: "Please select a course",
            });
          }
        });
      }
    });
  });

type EditCourseData = z.infer<typeof EditCourseSchema>;

export default function EditCourseForm({
  id,
  course,
  courses,
  isOpen,
  onClose,
  update,
}: {
  id?: string;
  course?: Course;
  courses: (Course & { id: string })[];
  isOpen: boolean;
  onClose: () => void;
  update: () => void;
}) {
  const db = useDb();
  const {
    isOpen: dialogIsOpen,
    onOpen: dialogOnOpen,
    onClose: dialogOnClose,
  } = useDisclosure();
  const [tag, setTag] = useState("");
  const formReturn = useForm<EditCourseData>({
    resolver: zodResolver(EditCourseSchema),
    defaultValues: (() => {
      if (course) {
        const { tags, ...defaultCourse } = course;
        return { tags: tags.map((tag) => ({ text: tag })), ...defaultCourse };
      } else {
        return { credits: 3, tags: [], requisites: [] };
      }
    })(),
  });
  const {
    handleSubmit,
    register,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = formReturn;
  const {
    fields: tagFields,
    append: tagAppend,
    remove: tagRemove,
  } = useFieldArray({ control, name: "tags" });
  const {
    fields: requisiteFields,
    append: requisiteAppend,
    remove: requisiteRemove,
  } = useFieldArray({ control, name: "requisites" });

  async function onSubmit(values: EditCourseData) {
    const { tags, ...data } = values;
    const newCourse: Course = {
      tags: tags.map((tag) => tag.text),
      ...data,
    };
    if (course) {
      await db.updateCourse(id!, newCourse);
      reset(values);
    } else {
      await db.createCourse(newCourse);
      reset();
    }
    onClose();
    update();
  }

  async function deleteThis() {
    await db.deleteCourse(id!);
    update();
  }

  function resetForm() {
    if (course) {
      const { tags, ...courseFields } = course;
      reset({ tags: tags.map((tag) => ({ text: tag })), ...courseFields });
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === " ") {
      addTag();
      event.preventDefault();
    }
  }

  function onBlur(event: React.FocusEvent<HTMLInputElement>) {
    addTag();
    event.preventDefault();
  }

  function addTag() {
    const name = tag.trim();
    if (!name) {
      return;
    }

    tagAppend({ text: name });
    setTag("");
  }

  return (
    <Modal size={{ base: "full", sm: "md" }} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>{course ? "Edit" : "Add"} Course</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6}>
              <FormControl isInvalid={!!errors.number}>
                <FormLabel>Course Number</FormLabel>
                <Input type="text" {...register("number")} />
                <FormErrorMessage>
                  {errors.number && errors.number.message}
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.title}>
                <FormLabel>Title</FormLabel>
                <Input type="text" {...register("title")} />
                <FormErrorMessage>
                  {errors.title && errors.title.message}
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.description}>
                <FormLabel>Description</FormLabel>
                <Textarea {...register("description")} />
                <FormErrorMessage>
                  {errors.description && errors.description.message}
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.credits}>
                <FormLabel>Credits</FormLabel>
                <Controller
                  name="credits"
                  control={control}
                  render={({ field: { ref, ...fields } }) => (
                    <NumberInput min={0} {...fields}>
                      <NumberInputField ref={ref} />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  )}
                />
                <FormErrorMessage>
                  {errors.credits && errors.credits.message}
                </FormErrorMessage>
              </FormControl>
              <FormControl>
                <FormLabel as="legend">Availability</FormLabel>
                <HStack spacing={5}>
                  <Checkbox {...register("availableFall")}>Fall</Checkbox>
                  <Checkbox {...register("availableSpring")}>Spring</Checkbox>
                  <Checkbox {...register("availableSummer")}>Summer</Checkbox>
                </HStack>
              </FormControl>
              <FormControl>
                <FormLabel>Tags</FormLabel>
                <Input
                  type="text"
                  value={tag}
                  onChange={(event) => setTag(event.target.value)}
                  onKeyDown={onKeyDown}
                  onBlur={onBlur}
                />
                <FormHelperText>
                  <Wrap>
                    {tagFields.map((tag, index) => (
                      <WrapItem key={tag.id}>
                        <Tag boxShadow="base" colorScheme={tagColor(tag.text)}>
                          <TagLabel>{tag.text}</TagLabel>
                          <TagCloseButton onClick={() => tagRemove(index)} />
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </FormHelperText>
              </FormControl>
              <FormControl>
                <FormLabel>
                  <HStack spacing={4}>
                    <Text>Prerequisites</Text>
                    <IconButton
                      onClick={() =>
                        requisiteAppend({
                          courses: [{ courseId: "" }],
                          type: "pre",
                          ignore: false,
                          compare: "=",
                          year: 1,
                          strict: false,
                        })
                      }
                      icon={<Icon boxSize={6} as={BiPlus} />}
                      aria-label="Add Prerequisite"
                      colorScheme="green"
                      size="sm"
                    />
                  </HStack>
                </FormLabel>
                <VStack spacing={4} align="stretch">
                  {requisiteFields.map((req, index) => (
                    <RequisiteCard
                      key={req.id}
                      index={index}
                      courses={courses}
                      formReturn={formReturn}
                      onDelete={() => requisiteRemove(index)}
                    />
                  ))}
                </VStack>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            {course ? (
              <>
                <Button
                  onClick={dialogOnOpen}
                  colorScheme="red"
                  leftIcon={<Icon boxSize={6} as={BiTrash} />}
                >
                  Delete
                </Button>
                <DeleteAlertDialog
                  title="Delete Course"
                  isOpen={dialogIsOpen}
                  onClose={dialogOnClose}
                  onDelete={deleteThis}
                />
                <Spacer />
                <Button onClick={resetForm} colorScheme="teal">
                  Reset
                </Button>
                <Button
                  ml={3}
                  colorScheme="blue"
                  leftIcon={<Icon boxSize={6} as={BiSave} />}
                  type="submit"
                >
                  Save
                </Button>
              </>
            ) : (
              <Button
                colorScheme="green"
                leftIcon={<Icon boxSize={6} as={BiPlus} />}
                isLoading={isSubmitting}
                type="submit"
              >
                Add
              </Button>
            )}
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
