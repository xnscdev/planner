import {
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
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TagInput from "./TagInput.tsx";
import { useState } from "react";
import Course from "../models/Course.tsx";
import { addDoc } from "firebase/firestore";
import { useDb } from "../providers/DatabaseProvider.tsx";

const AddCourseSchema = z.object({
  number: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
});

type AddCourseSchemaType = z.infer<typeof AddCourseSchema>;

export default function AddCourseForm({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const db = useDb();
  const [tags, setTags] = useState<string[]>([]);
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<AddCourseSchemaType>({ resolver: zodResolver(AddCourseSchema) });

  async function onSubmit(values: AddCourseSchemaType) {
    const course: Course = {
      ...values,
      tags,
      requisites: [],
    };
    await addDoc(db.courses(), course);
    reset();
    setTags([]);
    onClose();
  }

  return (
    <Modal size={{ base: "full", sm: "md" }} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Add Course</ModalHeader>
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
            <Button
              colorScheme="green"
              mr={3}
              leftIcon={<AddIcon />}
              type="submit"
            >
              Add
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
