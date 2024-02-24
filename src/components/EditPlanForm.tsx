import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Plan from "../models/Plan.tsx";
import { z } from "zod";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useDb } from "../providers/DatabaseProvider.tsx";
import { useState } from "react";
import { CheckIcon, CloseIcon, EditIcon } from "@chakra-ui/icons";
import Course from "../models/Course.tsx";
import DragCourseCard from "./DragCourseCard.tsx";
import { sortAndFilterCourses } from "../util/course.ts";
import { SortFilterControl } from "./SortFilterControl.tsx";

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
  const [editing, setEditing] = useState(false);
  const [plan, setPlan] = useState(initialPlan);
  const [sortSubject, setSortSubject] = useState("asc");
  const [sortNumber, setSortNumber] = useState("asc");
  const [filter, setFilter] = useState("");
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<EditPlanData>({
    resolver: zodResolver(EditPlanSchema),
    defaultValues: plan,
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

  const filteredCourses = sortAndFilterCourses(
    courses,
    sortSubject,
    sortNumber,
    filter,
  );
  return (
    <Box p={10}>
      <Heading size="lg">{plan.name}</Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid mt={6} templateColumns="1fr 1fr 3fr" columnGap={8}>
          <GridItem>
            <VStack spacing={6} align="start">
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
            </VStack>
          </GridItem>
          <GridItem>
            <Heading size="md">Find Courses</Heading>
            <HStack mt={4}>
              <SortFilterControl
                sortSubject={sortSubject}
                setSortSubject={setSortSubject}
                sortNumber={sortNumber}
                setSortNumber={setSortNumber}
                filter={filter}
                setFilter={setFilter}
              />
            </HStack>
            <VStack mt={6} spacing={4} align="stretch">
              {filteredCourses.length ? (
                filteredCourses.map((course) => (
                  <DragCourseCard key={course.id} course={course} />
                ))
              ) : (
                <Text color="gray.600">No courses match your search.</Text>
              )}
            </VStack>
          </GridItem>
          <GridItem>
            <HStack spacing={6}>
              <Box>
                <Heading size="md">Year 1</Heading>
                <VStack mt={8} spacing={4}></VStack>
              </Box>
            </HStack>
          </GridItem>
        </Grid>
      </form>
    </Box>
  );
}
