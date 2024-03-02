import {
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
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
  Text,
  Textarea,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { z } from "zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Course from "../models/Course.tsx";
import { useDb } from "../providers/DatabaseProvider.tsx";
import DeleteAlertDialog from "./DeleteAlertDialog.tsx";
import { BiPlus, BiSave, BiTrash } from "react-icons/bi";
import RequisiteCard from "./RequisiteCard.tsx";
import { TagData } from "../models/Tag.tsx";
import { tagColor } from "../util/colors.ts";
import { CreatableSelect, MultiValue } from "chakra-react-select";

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
        label: z.string(),
        value: z.string().min(1),
        colorScheme: z.string(),
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
  .superRefine(
    ({ availableFall, availableSpring, availableSummer, requisites }, ctx) => {
      if (!availableFall && !availableSpring && !availableSummer) {
        ctx.addIssue({
          path: ["availableFall"],
          code: "custom",
          message: "Please select at least one semester of availability",
        });
      }

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
    },
  );

type EditCourseData = z.infer<typeof EditCourseSchema>;

export default function EditCourseForm({
  id,
  course,
  courses,
  tags,
  isOpen,
  onClose,
  update,
}: {
  id?: string;
  course?: Course;
  courses: (Course & { id: string })[];
  tags: TagData[];
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
  const formReturn = useForm<EditCourseData>({
    resolver: zodResolver(EditCourseSchema),
    defaultValues: (() => {
      if (course) {
        const { tags, ...defaultCourse } = course;
        return {
          tags: tags.map((tag) => ({
            label: tag,
            value: tag,
            colorScheme: tagColor(tag),
          })),
          ...defaultCourse,
        };
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
    fields: requisiteFields,
    append: requisiteAppend,
    remove: requisiteRemove,
  } = useFieldArray({ control, name: "requisites" });

  async function onSubmit(values: EditCourseData) {
    const { tags, ...data } = values;
    const newCourse: Course = {
      tags: tags.map((tag) => tag.value),
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
      reset({
        tags: tags.map((tag) => ({
          label: tag,
          value: tag,
          colorScheme: tagColor(tag),
        })),
        ...courseFields,
      });
    }
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
              <FormControl isInvalid={!!errors.availableFall}>
                <FormLabel as="legend">Availability</FormLabel>
                <HStack spacing={5}>
                  <Checkbox {...register("availableFall")}>Fall</Checkbox>
                  <Checkbox {...register("availableSpring")}>Spring</Checkbox>
                  <Checkbox {...register("availableSummer")}>Summer</Checkbox>
                </HStack>
                <FormErrorMessage>
                  {errors.availableFall && errors.availableFall.message}
                </FormErrorMessage>
              </FormControl>
              <FormControl>
                <FormLabel>Tags</FormLabel>
                <Controller
                  name="tags"
                  control={control}
                  render={({ field: { onChange, ...field } }) => {
                    function replaceOnChange(newValue: MultiValue<TagData>) {
                      const coloredValues = newValue.map((v) => ({
                        ...v,
                        colorScheme: tagColor(v.value),
                      }));
                      onChange(coloredValues);
                    }

                    return (
                      <CreatableSelect
                        isClearable={true}
                        isMulti={true}
                        isSearchable={true}
                        options={tags}
                        onChange={replaceOnChange}
                        {...field}
                      />
                    );
                  }}
                />
                <FormErrorMessage>
                  {errors.tags && errors.tags.message}
                </FormErrorMessage>
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
