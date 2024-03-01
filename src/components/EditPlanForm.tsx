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
  Icon,
  IconButton,
  Input,
  Text,
  Textarea,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useDb } from "../providers/DatabaseProvider.tsx";
import { useState } from "react";
import Course from "../models/Course.tsx";
import DragCourseCard from "./DragCourseCard.tsx";
import { getTagSet, sortAndFilterCourses } from "../util/course.ts";
import DeleteAlertDialog from "./DeleteAlertDialog.tsx";
import { useNavigate } from "react-router-dom";
import CourseStack from "./CourseStack.tsx";
import { useDrop } from "react-dnd";
import {
  BiChevronLeft,
  BiChevronRight,
  BiCopy,
  BiPencil,
  BiPlus,
  BiSave,
  BiTrash,
  BiX,
} from "react-icons/bi";
import { SortFilterControl } from "./SortFilterControl.tsx";
import DuplicateConfirmDialog from "./DuplicateConfirmDialog.tsx";
import { useSortFilter } from "../util/hooks.ts";

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
  const {
    isOpen: copyIsOpen,
    onOpen: copyOnOpen,
    onClose: copyOnClose,
  } = useDisclosure();
  const [editing, setEditing] = useState(false);
  const [plan, setPlan] = useState(initialPlan);
  const [numYears, setNumYears] = useState(initialPlan.years.length);
  const [selectedYear, setSelectedYear] = useState(0);
  const [useCount, setUseCount] = useState(buildUseCountMap(initialPlan));
  const {
    handleSubmit,
    register,
    reset,
    watch,
    control,
    formState: { errors, isSubmitting },
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
  const {
    sortCriteria,
    sortDirection,
    filter,
    tagFilter,
    filterOptions,
    fields: sortFields,
  } = useSortFilter();

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
    setSelectedYear(0);
    setNumYears(plan.years.length);
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

  async function duplicate() {
    const newPlan = { ...plan, name: `Copy of ${plan.name}` };
    await db.createPlan(newPlan);
    navigate("/plans");
  }

  const fullPlan = watch("years");
  const filteredCourses = sortAndFilterCourses(
    courses.filter(
      (course) => filterOptions.includes("used") || !useCount.get(course.id),
    ),
    sortCriteria,
    sortDirection,
    filter,
    tagFilter,
    filterOptions,
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
                    leftIcon={<Icon boxSize={6} as={BiSave} />}
                    type="submit"
                    isLoading={isSubmitting}
                  >
                    Save Plan
                  </Button>
                  <Button
                    onClick={cancelEdit}
                    leftIcon={<Icon boxSize={6} as={BiX} />}
                  >
                    Cancel
                  </Button>
                </HStack>
              ) : (
                <VStack align="start" spacing={4}>
                  <Button
                    onClick={() => setEditing(true)}
                    colorScheme="teal"
                    leftIcon={<Icon boxSize={6} as={BiPencil} />}
                  >
                    Edit Plan
                  </Button>
                  <Button
                    onClick={copyOnOpen}
                    colorScheme="orange"
                    leftIcon={<Icon boxSize={6} as={BiCopy} />}
                  >
                    Duplicate
                  </Button>
                  <DuplicateConfirmDialog
                    planName={plan.name}
                    isOpen={copyIsOpen}
                    onClose={copyOnClose}
                    onConfirm={duplicate}
                  />
                </VStack>
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
              {editing ? (
                <FormControl isInvalid={!!errors.description}>
                  <FormLabel>Description</FormLabel>
                  <Textarea {...register("description")} />
                  <FormErrorMessage>
                    {errors.description && errors.description.message}
                  </FormErrorMessage>
                </FormControl>
              ) : (
                <Text whiteSpace="pre-line">{plan.description}</Text>
              )}
              {editing && (
                <Button
                  onClick={dialogOnOpen}
                  colorScheme="red"
                  leftIcon={<Icon boxSize={6} as={BiTrash} />}
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
                    {...sortFields}
                    tags={getTagSet(courses)}
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
                          courseMap={courseMap}
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
                  leftIcon={<Icon boxSize={6} as={BiPlus} />}
                  mb={4}
                >
                  Add Year
                </Button>
              )}
              <Flex flexDir="column" align="start" h="100%">
                <HStack spacing={6}>
                  <IconButton
                    onClick={() => setSelectedYear((year) => year - 1)}
                    icon={<Icon boxSize={6} as={BiChevronLeft} />}
                    size="sm"
                    aria-label="Previous Year"
                    isDisabled={selectedYear <= 0}
                  />
                  <Heading size="md">Year {selectedYear + 1}</Heading>
                  <IconButton
                    onClick={() => setSelectedYear((year) => year + 1)}
                    icon={<Icon boxSize={6} as={BiChevronRight} />}
                    size="sm"
                    aria-label="Next Year"
                    isDisabled={selectedYear >= numYears - 1}
                  />
                  {editing && (
                    <IconButton
                      onClick={deleteYear}
                      icon={<Icon boxSize={6} as={BiX} />}
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
                      fullPlan={fullPlan}
                      year={index}
                      semester="fall"
                      control={control}
                      editing={editing}
                      sortCriteria={sortCriteria}
                      sortDirection={sortDirection}
                    />
                    <CourseStack
                      courseMap={courseMap}
                      fullPlan={fullPlan}
                      year={index}
                      semester="spring"
                      control={control}
                      editing={editing}
                      sortCriteria={sortCriteria}
                      sortDirection={sortDirection}
                    />
                    <CourseStack
                      courseMap={courseMap}
                      fullPlan={fullPlan}
                      year={index}
                      semester="summer"
                      control={control}
                      editing={editing}
                      sortCriteria={sortCriteria}
                      sortDirection={sortDirection}
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
