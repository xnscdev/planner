import { z } from "zod";
import { useDb } from "../providers/DatabaseProvider.tsx";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
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
  Textarea,
  VStack,
} from "@chakra-ui/react";
import Plan from "../models/Plan.tsx";
import { BiPlus } from "react-icons/bi";

const AddPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  description: z.string(),
  years: z.preprocess((x) => parseInt(x as string, 10), z.number().positive()),
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
    control,
    formState: { errors },
  } = useForm<AddPlanData>({
    resolver: zodResolver(AddPlanSchema),
    defaultValues: { years: 4 },
  });

  async function onSubmit(values: AddPlanData) {
    const { years, ...fields } = values;
    const newPlan: Plan = {
      ...fields,
      years: Array(years).fill({ fall: [], spring: [], summer: [] }),
    };
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
              <FormControl isInvalid={!!errors.years}>
                <FormLabel>Number of Years</FormLabel>
                <Controller
                  name="years"
                  control={control}
                  render={({ field: { ref, ...fields } }) => (
                    <NumberInput min={1} {...fields}>
                      <NumberInputField ref={ref} />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  )}
                />
                <FormErrorMessage>
                  {errors.years && errors.years.message}
                </FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="green"
              leftIcon={<Icon boxSize={6} as={BiPlus} />}
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
