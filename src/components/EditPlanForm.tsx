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
import CourseStack from "./CourseStack.tsx";
import { useDrop } from "react-dnd";

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
  const [showUsed, setShowUsed] = useState(false);
  const [numYears, setNumYears] = useState(initialPlan.years.length);
  const [selectedYear, setSelectedYear] = useState(0);
  const [useCount, setUseCount] = useState(buildUseCountMap(initialPlan));
  const {
    handleSubmit,
    register,
    reset,
    control,
    formState: { errors },
  } = useForm<EditPlanData>({
    resolver: zodResolver(EditPlanSchema),
    defaultValues: initialPlan,
  });
  const {
    fields: yearFields,
    insert: yearInsert,
    remove: yearRemove,
  } = useFieldArray({
    control,
    name: "years",
  });
  const [, drop] = useDrop(
    () => ({
      accept: "Course",
      drop: (item: { courseId: string; origin: string }) =>
        subtractUseCount(item.courseId),
      canDrop: (item) => item.origin !== "courses",
    }),
    [],
  );
  const courseMap = new Map<string, Course>(
    courses.map((course) => {
      const { id, ...courseFields } = course;
      return [id, courseFields];
    }),
  );

  async function onSubmit(values: EditPlanData) {
    await db.updatePlan(id, values);
    setPlan(values);
    setEditing(false);
  }

  function cancelEdit() {
    reset(plan);
    setUseCount(buildUseCountMap(plan));
    setEditing(false);
  }

  async function deleteThis() {
    await db.deletePlan(id);
    navigate("/plans");
  }

  function buildUseCountMap(plan: Plan) {
    const map = new Map<string, number>();
    for (const year of plan.years) {
      for (const { courseId } of [year.fall, year.spring, year.summer].flat()) {
        map.set(courseId, (map.get(courseId) ?? 0) + 1);
      }
    }
    return map;
  }

  function addYear() {
    const newYear = selectedYear + 1;
    yearInsert(newYear, { fall: [], spring: [], summer: [] });
    setSelectedYear(newYear);
    setNumYears((numYears) => numYears + 1);
  }

  function deleteYear() {
    yearRemove(selectedYear);
    setSelectedYear(selectedYear ? selectedYear - 1 : 0);
    setNumYears((numYears) => numYears - 1);
  }

  function addUseCount(id: string) {
    setUseCount((useCount) => {
      const map = new Map([...useCount]);
      map.set(id, (map.get(id) ?? 0) + 1);
      return map;
    });
  }

  function subtractUseCount(id: string) {
    setUseCount((useCount) => {
      const map = new Map([...useCount]);
      map.set(id, map.get(id)! - 1);
      return map;
    });
  }

  const filteredCourses = sortAndFilterCourses(
    courses.filter((course) => showUsed || !useCount.get(course.id)),
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
            {editing && (
              <Flex
                flexDir="column"
                rowGap={6}
                maxW={300}
                align="start"
                h="100%"
              >
                <Heading size="md">Find Courses</Heading>
                <HStack>
                  <SortFilterControl
                    sortSubject={sortSubject}
                    setSortSubject={setSortSubject}
                    sortNumber={sortNumber}
                    setSortNumber={setSortNumber}
                    filter={filter}
                    setFilter={setFilter}
                    showUsed={showUsed}
                    setShowUsed={setShowUsed}
                    usedOption={true}
                  />
                </HStack>
                <Flex
                  flexGrow={1}
                  flexBasis={0}
                  overflowY="auto"
                  flexDir="column"
                  align="stretch"
                >
                  <VStack
                    ref={drop}
                    h="100%"
                    mr={3}
                    spacing={4}
                    align="stretch"
                  >
                    {filteredCourses.length ? (
                      filteredCourses.map((course) => (
                        <DragCourseCard
                          key={course.id}
                          course={course}
                          origin="courses"
                          useCount={useCount.get(course.id) ?? 0}
                          editing={editing}
                          onDrop={() => addUseCount(course.id)}
                        />
                      ))
                    ) : (
                      <Text color="gray.600">
                        No courses match your search.
                      </Text>
                    )}
                  </VStack>
                </Flex>
              </Flex>
            )}
            <Flex flexDir="column" align="start" h="100%">
              {editing && (
                <Button
                  onClick={addYear}
                  colorScheme="green"
                  leftIcon={<AddIcon />}
                  mb={4}
                >
                  Add Year
                </Button>
              )}
              <Flex flexDir="column" align="start" h="100%">
                <HStack spacing={6}>
                  <IconButton
                    onClick={() => setSelectedYear((year) => year - 1)}
                    icon={<ChevronLeftIcon />}
                    size="sm"
                    aria-label="Previous Year"
                    isDisabled={selectedYear <= 0}
                  />
                  <Heading size="md">Year {selectedYear + 1}</Heading>
                  <IconButton
                    onClick={() => setSelectedYear((year) => year + 1)}
                    icon={<ChevronRightIcon />}
                    size="sm"
                    aria-label="Next Year"
                    isDisabled={selectedYear >= numYears - 1}
                  />
                  {editing && (
                    <IconButton
                      onClick={deleteYear}
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      aria-label="Delete Year"
                      isDisabled={numYears === 1}
                    />
                  )}
                </HStack>
                {yearFields.map(({ id }, index) => (
                  <HStack
                    key={id}
                    flexGrow={1}
                    mt={4}
                    spacing={8}
                    align="start"
                    display={selectedYear === index ? "flex" : "none"}
                  >
                    <CourseStack
                      courseMap={courseMap}
                      year={index}
                      semester="fall"
                      control={control}
                      editing={editing}
                    />
                    <CourseStack
                      courseMap={courseMap}
                      year={index}
                      semester="spring"
                      control={control}
                      editing={editing}
                    />
                    <CourseStack
                      courseMap={courseMap}
                      year={index}
                      semester="summer"
                      control={control}
                      editing={editing}
                    />
                  </HStack>
                ))}
              </Flex>
            </Flex>
          </HStack>
        </Box>
      </Flex>
    </chakra.form>
  );
}
