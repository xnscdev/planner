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
  Text,
  Textarea,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { z } from "zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TagInput from "./TagInput.tsx";
import { useEffect, useRef, useState } from "react";
import Course from "../models/Course.tsx";
import { useDb } from "../providers/DatabaseProvider.tsx";

const EditCourseSchema = z.object({
  number: z.string().min(1, "Course number is required"),
  title: z.string().min(1, "Course title is required"),
  description: z.string(),
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
  courses: Map<string, Course>;
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
  const [tags, setTags] = useState<string[]>([]);
  const {
    handleSubmit,
    register,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<EditCourseData>({
    resolver: zodResolver(EditCourseSchema),
    defaultValues: course,
  });
  const {
    fields: requisiteFields,
    append: requisiteAppend,
    replace: requisiteReplace,
    remove: requisiteRemove,
  } = useFieldArray({
    control,
    name: "requisites",
  });

  useEffect(() => {
    if (course) {
      setTags(course.tags);
      requisiteReplace(course.requisites);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(values: EditCourseData) {
    const newCourse: Course = {
      ...values,
      tags,
    };
    if (course) {
      await db.updateCourse(id!, newCourse);
      reset(newCourse);
    } else {
      await db.createCourse(newCourse);
      reset();
      setTags([]);
    }
    onClose();
    update();
  }

  async function deleteThis() {
    await db.deleteCourse(id!);
    update();
  }

  function resetForm() {
    reset(course);
    if (course) {
      setTags(course.tags);
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
              <TagInput tags={tags} setTags={setTags} />
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
                            {Array.from(courses.entries()).map(
                              ([id, { number }]) => (
                                <option key={id} value={id}>
                                  {number}
                                </option>
                              ),
                            )}
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
                    // <Flex columnGap={3} key={req.id}>
                    //   <IconButton
                    //     onClick={() => requisiteRemove(index)}
                    //     icon={<CloseIcon />}
                    //     aria-label="Delete Prerequisite"
                    //     colorScheme="red"
                    //     size="sm"
                    //   />
                    //   <Box>
                    //     <HStack spacing={3}>
                    //       <Select
                    //         variant="unstyled"
                    //         {...register(`requisites.${index}.courseId`)}
                    //       >
                    //         <option value="">Select course&hellip;</option>
                    //         {Array.from(courses.entries()).map(
                    //           ([id, { number }]) => (
                    //             <option key={id} value={id}>
                    //               {number}
                    //             </option>
                    //           ),
                    //         )}
                    //       </Select>
                    //       <Checkbox {...register(`requisites.${index}.ignore`)}>
                    //         Ignore
                    //       </Checkbox>
                    //     </HStack>
                    //     {errors.requisites?.[index]?.courseId && (
                    //       <Text color="red" fontSize="sm">
                    //         {errors.requisites[index]!.courseId!.message}
                    //       </Text>
                    //     )}
                    //     <HStack mt={3} ml={6} spacing={3}>
                    //       <Text>Type:</Text>
                    //       <Select
                    //         variant="unstyled"
                    //         {...register(`requisites.${index}.type`)}
                    //       >
                    //         <option value="pre">Prerequisite</option>
                    //         <option value="co">Corequisite</option>
                    //         <option value="year">Year is</option>
                    //       </Select>
                    //     </HStack>
                    //   </Box>
                    // </Flex>
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
              <Button colorScheme="green" leftIcon={<AddIcon />} type="submit">
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
