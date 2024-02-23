import { z } from "zod";
import { useDb } from "../providers/DatabaseProvider.tsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
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
  VStack,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import Plan from "../models/Plan.tsx";

const AddPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  description: z.string(),
});

type AddPlanData = z.infer<typeof AddPlanSchema>;

export default function AddPlanForm({
  isOpen,
  onClose,
  update,
}: {
  isOpen: boolean;
  onClose: () => void;
  update: () => void;
}) {
  const db = useDb();
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<AddPlanData>({
    resolver: zodResolver(AddPlanSchema),
  });

  async function onSubmit(values: AddPlanData) {
    const newPlan: Plan = { ...values, years: [] };
    await db.createPlan(newPlan);
    reset();
    onClose();
    update();
  }

  return (
    <Modal size={{ base: "full", sm: "md" }} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Add Plan</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6}>
              <FormControl isInvalid={!!errors.name}>
                <FormLabel>Name</FormLabel>
                <Input type="text" {...register("name")} />
                <FormErrorMessage>
                  {errors.name && errors.name.message}
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.description}>
                <FormLabel>Description</FormLabel>
                <Textarea {...register("description")} />
                <FormErrorMessage>
                  {errors.description && errors.description.message}
                </FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" leftIcon={<AddIcon />} type="submit">
              Add
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
