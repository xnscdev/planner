import {
  Box,
  Card,
  CardBody,
  Checkbox,
  CloseButton,
  HStack,
  Icon,
  IconButton,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Controller, useFieldArray, UseFormReturn } from "react-hook-form";
import Course from "../models/Course.tsx";
import { BiPlus, BiX } from "react-icons/bi";
import { TagData } from "../models/Tag.tsx";

type FormType = Omit<Course, "tags"> & { tags: TagData[] };

export default function RequisiteCard({
  index,
  courses,
  formReturn: {
    register,
    watch,
    control,
    formState: { errors },
  },
  onDelete,
}: {
  index: number;
  courses: (Course & { id: string })[];
  formReturn: UseFormReturn<FormType>;
  onDelete: () => void;
}) {
  const {
    fields: courseFields,
    append: courseAppend,
    remove: courseRemove,
  } = useFieldArray({ control, name: `requisites.${index}.courses` });

  return (
    <Card>
      <CardBody>
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
                  <NumberInput min={1} size="sm" variant="flushed" {...fields}>
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
          <CloseButton onClick={onDelete} size="sm" />
        </HStack>
        {errors.requisites?.[index]?.year && (
          <Text color="red" fontSize="sm">
            {errors.requisites[index]!.year!.message}
          </Text>
        )}
        <VStack mt={4} spacing={3} align="stretch">
          {watch(`requisites.${index}.type`) !== "year" && (
            <>
              <HStack spacing={4}>
                <Text fontSize="sm">One of the following courses:</Text>
                <IconButton
                  onClick={() => courseAppend({ courseId: "" })}
                  size="xs"
                  icon={<Icon boxSize={5} as={BiPlus} />}
                  variant="ghost"
                  colorScheme="green"
                  aria-label="Add Course Option"
                />
              </HStack>
              {courseFields.map(({ id }, courseIndex) => (
                <Box key={id}>
                  <HStack spacing={2}>
                    <Select
                      size="sm"
                      variant="flushed"
                      {...register(
                        `requisites.${index}.courses.${courseIndex}.courseId`,
                      )}
                    >
                      <option value="">Select course&hellip;</option>
                      {courses
                        .toSorted((a, b) => a.number.localeCompare(b.number))
                        .map(({ id, number }) => (
                          <option key={id} value={id}>
                            {number}
                          </option>
                        ))}
                    </Select>
                    <IconButton
                      onClick={() => courseRemove(courseIndex)}
                      size="xs"
                      icon={<Icon boxSize={5} as={BiX} />}
                      colorScheme="red"
                      variant="ghost"
                      aria-label="Remove Course Option"
                    />
                  </HStack>
                  {errors.requisites?.[index]?.courses?.[courseIndex]
                    ?.courseId && (
                    <Text mt={2} color="red" fontSize="sm">
                      {
                        errors.requisites[index]!.courses![courseIndex]!
                          .courseId!.message
                      }
                    </Text>
                  )}
                </Box>
              ))}
            </>
          )}
          {watch(`requisites.${index}.type`) === "co" && (
            <Checkbox {...register(`requisites.${index}.strict`)}>
              Strict corequisite
            </Checkbox>
          )}
          <Checkbox {...register(`requisites.${index}.ignore`)}>
            Ignore
          </Checkbox>
        </VStack>
      </CardBody>
    </Card>
  );
}
