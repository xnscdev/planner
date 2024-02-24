import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Card,
  CardBody,
  Checkbox,
  CloseButton,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
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
  Select,
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
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { z } from "zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useRef, useState } from "react";
import Course from "../models/Course.tsx";
import { useDb } from "../providers/DatabaseProvider.tsx";
import { randomColor } from "../util/colors.ts";

const EditCourseSchema = z.object({
  number: z.string().min(1, "Course number is required"),
  title: z.string().min(1, "Course title is required"),
  description: z.string(),
  tags: z.array(
    z.object({
      text: z.string(),
    }),
  ),
  requisites: z.array(
    z.object({
      courseId: z.string().min(1, "Please select a course"),
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
  const {
    handleSubmit,
    register,
    reset,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EditCourseData>({
    resolver: zodResolver(EditCourseSchema),
    defaultValues: (() => {
      if (course) {
        const { tags, ...defaultCourse } = course;
        return { tags: tags.map((tag) => ({ text: tag })), ...defaultCourse };
      }
    })(),
  });
  const {
    fields: tagFields,
    append: tagAppend,
    replace: tagReplace,
    remove: tagRemove,
  } = useFieldArray({ control, name: "tags" });
  const {
    fields: requisiteFields,
    append: requisiteAppend,
    replace: requisiteReplace,
    remove: requisiteRemove,
  } = useFieldArray({ control, name: "requisites" });

  useEffect(() => {
    if (course) {
      tagReplace(course.tags.map((tag) => ({ text: tag })));
      requisiteReplace(course.requisites);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      reset({ requisites: [] });
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
                        <Tag
                          boxShadow="base"
                          colorScheme={randomColor(tag.text)}
                        >
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
                          courseId: "",
                          type: "pre",
                          ignore: false,
                          compare: "=",
                          year: 1,
                          strict: false,
                        })
                      }
                      icon={<AddIcon />}
                      aria-label="Add Prerequisite"
                      colorScheme="green"
                      size="sm"
                    />
                  </HStack>
                </FormLabel>
                <VStack spacing={4} align="stretch">
                  {requisiteFields.map((req, index) => (
                    <Card key={req.id}>
                      <CardBody>
                        <HStack>
                          <Select
                            variant="flushed"
                            {...register(`requisites.${index}.courseId`)}
                          >
                            <option value="">Select course&hellip;</option>
                            {courses.map(({ id, number }) => (
                              <option key={id} value={id}>
                                {number}
                              </option>
                            ))}
                          </Select>
                          <Spacer />
                          <CloseButton
                            onClick={() => requisiteRemove(index)}
                            size="sm"
                          />
                        </HStack>
                        {errors.requisites?.[index]?.courseId && (
                          <Text color="red" fontSize="sm">
                            {errors.requisites[index]!.courseId!.message}
                          </Text>
                        )}
                        <VStack mt={4} spacing={3} align="stretch">
                          <Box>
                            <HStack spacing={2}>
                              <Select
                                size="sm"
                                variant="flushed"
                                {...register(`requisites.${index}.type`)}
                              >
                                <option value="pre">Prerequisite</option>
                                <option value="co">Corequisite</option>
                                <option value="year">Year is</option>
                              </Select>
                              {watch(`requisites.${index}.type`) === "year" && (
                                <>
                                  <Select
                                    size="sm"
                                    variant="flushed"
                                    {...register(`requisites.${index}.compare`)}
                                  >
                                    <option value="=">equal to</option>
                                    <option value=">=">at least</option>
                                    <option value="<=">at most</option>
                                  </Select>
                                  <Controller
                                    name={`requisites.${index}.year`}
                                    control={control}
                                    render={({ field: { ref, ...fields } }) => (
                                      <NumberInput
                                        min={1}
                                        size="sm"
                                        variant="flushed"
                                        {...fields}
                                      >
                                        <NumberInputField ref={ref} />
                                        <NumberInputStepper>
                                          <NumberIncrementStepper />
                                          <NumberDecrementStepper />
                                        </NumberInputStepper>
                                      </NumberInput>
                                    )}
                                  />
                                </>
                              )}
                            </HStack>
                            {errors.requisites?.[index]?.year && (
                              <Text color="red" fontSize="sm">
                                {errors.requisites[index]!.year!.message}
                              </Text>
                            )}
                          </Box>
                          {watch(`requisites.${index}.type`) === "co" && (
                            <Checkbox
                              {...register(`requisites.${index}.strict`)}
                            >
                              Strict corequisite
                            </Checkbox>
                          )}
                          <Checkbox {...register(`requisites.${index}.ignore`)}>
                            Ignore
                          </Checkbox>
                        </VStack>
                      </CardBody>
                    </Card>
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
                  leftIcon={<DeleteIcon />}
                >
                  Delete
                </Button>
                <DeleteAlertDialog
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
                  leftIcon={<EditIcon />}
                  type="submit"
                >
                  Save
                </Button>
              </>
            ) : (
              <Button
                colorScheme="green"
                leftIcon={<AddIcon />}
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

function DeleteAlertDialog({
  isOpen,
  onClose,
  onDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  function onClick() {
    onClose();
    onDelete();
  }

  return (
    <AlertDialog
      leastDestructiveRef={cancelRef}
      isOpen={isOpen}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete Course
          </AlertDialogHeader>
          <AlertDialogBody>
            Are you sure? You can't undo this action.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button onClick={onClose} ref={cancelRef} mr={3}>
              Cancel
            </Button>
            <Button
              onClick={onClick}
              colorScheme="red"
              leftIcon={<DeleteIcon />}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
