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
  Textarea,
  useDisclosure,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TagInput from "./TagInput.tsx";
import { useEffect, useRef, useState } from "react";
import Course from "../models/Course.tsx";
import { useDb } from "../providers/DatabaseProvider.tsx";

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
      requisites: [],
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
                <FormLabel htmlFor="number">Course Number</FormLabel>
                <Input id="number" type="text" {...register("number")} />
                <FormErrorMessage>
                  {errors.number && errors.number.message}
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.title}>
                <FormLabel htmlFor="title">Title</FormLabel>
                <Input id="title" type="text" {...register("title")} />
                <FormErrorMessage>
                  {errors.title && errors.title.message}
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.description}>
                <FormLabel htmlFor="description">Description</FormLabel>
                <Textarea id="description" {...register("description")} />
                <FormErrorMessage>
                  {errors.description && errors.description.message}
                </FormErrorMessage>
              </FormControl>
              <TagInput tags={tags} setTags={setTags} />
            </Flex>
          </ModalBody>
          <ModalFooter>
            {course ? (
              <>
                <Button
                  onClick={dialogOnOpen}
                  colorScheme="red"
                  leftIcon={<DeleteIcon />}
                  mr={3}
                >
                  Delete
                </Button>
                <DeleteAlertDialog
                  isOpen={dialogIsOpen}
                  onClose={dialogOnClose}
                />
                <Button
                  colorScheme="teal"
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
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement | null>(null);
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
              onClick={onClose}
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
