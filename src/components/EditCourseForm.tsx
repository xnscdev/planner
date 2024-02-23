import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TagInput from "./TagInput.tsx";
import { useEffect, useRef, useState } from "react";
import Course, { CourseRequisite } from "../models/Course.tsx";
import { useDb } from "../providers/DatabaseProvider.tsx";
import RequisiteInput from "./RequisiteInput.tsx";

const EditCourseSchema = z.object({
  number: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
});

type EditCourseSchemaType = z.infer<typeof EditCourseSchema>;

export default function EditCourseForm({
  id,
  course,
  isOpen,
  onClose,
  update,
}: {
  id?: string;
  course?: Course;
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
  const [requisites, setRequisites] = useState<CourseRequisite[]>([]);
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<EditCourseSchemaType>({
    resolver: zodResolver(EditCourseSchema),
    defaultValues: course,
  });

  useEffect(() => {
    if (course) {
      setTags(course.tags);
    }
  }, []);

  async function onSubmit(values: EditCourseSchemaType) {
    const newCourse: Course = {
      ...values,
      tags,
      requisites,
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
      setRequisites(course.requisites);
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
            <Flex flexDirection="column" rowGap="6">
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
              <RequisiteInput
                requisites={requisites}
                setRequisites={setRequisites}
              />
            </Flex>
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
