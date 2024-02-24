import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Plan from "../models/Plan.tsx";
import { z } from "zod";
import {
  Box,
  Button,
  chakra,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  Text,
  Textarea,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useDb } from "../providers/DatabaseProvider.tsx";
import { useState } from "react";
import {
  AddIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  DeleteIcon,
  EditIcon,
} from "@chakra-ui/icons";
import Course from "../models/Course.tsx";
import DragCourseCard from "./DragCourseCard.tsx";
import { sortAndFilterCourses } from "../util/course.ts";
import { SortFilterControl } from "./SortFilterControl.tsx";
import DeleteAlertDialog from "./DeleteAlertDialog.tsx";
import { useNavigate } from "react-router-dom";

const EditPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  description: z.string(),
  years: z.array(
    z.object({
      fall: z.array(z.object({ courseId: z.string() })),
      spring: z.array(z.object({ courseId: z.string() })),
      summer: z.array(z.object({ courseId: z.string() })),
    }),
  ),
});

type EditPlanData = z.infer<typeof EditPlanSchema>;

export default function EditPlanForm({
  id,
  initialPlan,
  courses,
}: {
  id: string;
  initialPlan: Plan;
  courses: (Course & { id: string })[];
}) {
  const db = useDb();
  const navigate = useNavigate();
  const {
    isOpen: dialogIsOpen,
    onOpen: dialogOnOpen,
    onClose: dialogOnClose,
  } = useDisclosure();
  const [editing, setEditing] = useState(false);
  const [plan, setPlan] = useState(initialPlan);
  const [sortSubject, setSortSubject] = useState("asc");
  const [sortNumber, setSortNumber] = useState("asc");
  const [filter, setFilter] = useState("");
  const [year, setYear] = useState(0);
  const {
    handleSubmit,
    register,
    reset,
    control,
    formState: { errors },
  } = useForm<EditPlanData>({
    resolver: zodResolver(EditPlanSchema),
    defaultValues: plan,
  });
  const { fields, insert, remove } = useFieldArray({
    control,
    name: "years",
  });

  async function onSubmit(values: EditPlanData) {
    await db.updatePlan(id, values);
    setPlan(values);
    setEditing(false);
  }

  function cancelEdit() {
    reset(plan);
    setEditing(false);
  }

  async function deleteThis() {
    await db.deletePlan(id);
    navigate("/plans");
  }

  function addYear() {
    const newYear = year + 1;
    insert(newYear, { fall: [], spring: [], summer: [] });
    setYear(newYear);
  }

  function deleteYear() {
    remove(year);
    setYear(year ? year - 1 : 0);
  }

  const filteredCourses = sortAndFilterCourses(
    courses,
    sortSubject,
    sortNumber,
    filter,
  );
  return (
    <chakra.form onSubmit={handleSubmit(onSubmit)} h="100%">
      <Flex flexDir="column" align="stretch" h="100%" p={10}>
        <Heading size="lg">{plan.name}</Heading>
        <Box mt={6} flexGrow={1}>
          <HStack spacing={12} align="start" h="100%">
            <VStack maxW={300} spacing={6} align="start">
              {editing ? (
                <HStack spacing={4}>
                  <Button
                    colorScheme="teal"
                    leftIcon={<CheckIcon />}
                    type="submit"
                  >
                    Save Plan
                  </Button>
                  <Button onClick={cancelEdit} leftIcon={<CloseIcon />}>
                    Cancel
                  </Button>
                </HStack>
              ) : (
                <Button
                  onClick={() => setEditing(true)}
                  colorScheme="teal"
                  leftIcon={<EditIcon />}
                >
                  Edit Plan
                </Button>
              )}
              {editing && (
                <FormControl isInvalid={!!errors.name}>
                  <FormLabel>Name</FormLabel>
                  <Input type="text" {...register("name")} />
                  <FormErrorMessage>
                    {errors.name && errors.name.message}
                  </FormErrorMessage>
                </FormControl>
              )}
              <FormControl isInvalid={!!errors.description}>
                <FormLabel>Description</FormLabel>
                {editing ? (
                  <Textarea {...register("description")} />
                ) : (
                  <Text whiteSpace="pre-line">{plan.description}</Text>
                )}
                <FormErrorMessage>
                  {errors.description && errors.description.message}
                </FormErrorMessage>
              </FormControl>
              {editing && (
                <Button
                  onClick={dialogOnOpen}
                  colorScheme="red"
                  leftIcon={<DeleteIcon />}
                >
                  Delete
                </Button>
              )}
              <DeleteAlertDialog
                title="Delete Plan"
                isOpen={dialogIsOpen}
                onClose={dialogOnClose}
                onDelete={deleteThis}
              />
            </VStack>
            <Flex flexDir="column" rowGap={6} maxW={300} align="start" h="100%">
              <Heading size="md">Find Courses</Heading>
              <HStack>
                <SortFilterControl
                  sortSubject={sortSubject}
                  setSortSubject={setSortSubject}
                  sortNumber={sortNumber}
                  setSortNumber={setSortNumber}
                  filter={filter}
                  setFilter={setFilter}
                />
              </HStack>
              <Flex
                pr={3}
                flexGrow={1}
                flexBasis={0}
                overflowY="auto"
                flexDir="column"
                align="stretch"
              >
                <Box h="100%">
                  <VStack spacing={4} align="stretch">
                    {filteredCourses.length ? (
                      filteredCourses.map((course) => (
                        <DragCourseCard key={course.id} course={course} />
                      ))
                    ) : (
                      <Text color="gray.600">
                        No courses match your search.
                      </Text>
                    )}
                  </VStack>
                </Box>
              </Flex>
            </Flex>
            <Flex flexDir="column" align="start" h="100%">
              <Button
                onClick={addYear}
                colorScheme="green"
                leftIcon={<AddIcon />}
              >
                Add Year
              </Button>
              <Flex mt={4} flexDir="column" align="start" h="100%">
                <HStack spacing={6}>
                  <IconButton
                    onClick={() => setYear((year) => year - 1)}
                    icon={<ChevronLeftIcon />}
                    size="sm"
                    aria-label="Previous Year"
                    isDisabled={year <= 0}
                  />
                  <Heading size="md">Year {year + 1}</Heading>
                  <IconButton
                    onClick={() => setYear((year) => year + 1)}
                    icon={<ChevronRightIcon />}
                    size="sm"
                    aria-label="Next Year"
                    isDisabled={year >= fields.length - 1}
                  />
                  <IconButton
                    onClick={deleteYear}
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    aria-label="Delete Year"
                    isDisabled={fields.length === 1}
                  />
                </HStack>
                <HStack flexGrow={1} mt={4} spacing={8} align="start">
                  <Flex flexDir="column" align="stretch" w={300} h="100%">
                    <Heading size="sm">Fall</Heading>
                    <VStack
                      flexGrow={1}
                      p={4}
                      mt={4}
                      spacing={4}
                      borderRadius={8}
                      bgColor="gray.200"
                    ></VStack>
                  </Flex>
                  <Flex flexDir="column" align="stretch" w={300} h="100%">
                    <Heading size="sm">Spring</Heading>
                    <VStack
                      flexGrow={1}
                      p={4}
                      mt={4}
                      spacing={4}
                      borderRadius={8}
                      bgColor="gray.200"
                    ></VStack>
                  </Flex>
                  <Flex flexDir="column" align="stretch" w={300} h="100%">
                    <Heading size="sm">Summer</Heading>
                    <VStack
                      flexGrow={1}
                      p={4}
                      mt={4}
                      spacing={4}
                      borderRadius={8}
                      bgColor="gray.200"
                    ></VStack>
                  </Flex>
                </HStack>
              </Flex>
            </Flex>
          </HStack>
        </Box>
      </Flex>
    </chakra.form>
  );
}
