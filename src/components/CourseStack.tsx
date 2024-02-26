import { Flex, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { useDrop } from "react-dnd";
import Course from "../models/Course.tsx";
import { Control, useFieldArray } from "react-hook-form";
import Plan from "../models/Plan.tsx";
import DragCourseCard from "./DragCourseCard.tsx";

export default function CourseStack({
  courseMap,
  year,
  semester,
  control,
}: {
  courseMap: Map<string, Course>;
  year: number;
  semester: "fall" | "spring" | "summer";
  control: Control<Plan>;
}) {
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "Course",
      drop: onDrop,
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
      canDrop: (item) => item.origin !== getOrigin(),
    }),
    [],
  );
  const {
    fields: courseFields,
    append: courseAppend,
    remove: courseRemove,
  } = useFieldArray({ control, name: `years.${year}.${semester}` });

  function getOrigin() {
    return `${year}.${semester}`;
  }

  function onDrop({ courseId, origin }: { courseId: string; origin: string }) {
    console.log("accept drop", origin, year, semester, courseId);
    courseAppend({ courseId: courseId });
  }

  const totalCredits = courseFields
    .map(({ courseId }) => courseMap.get(courseId)!.credits)
    .reduce((a, b) => a + b, 0);
  return (
    <Flex flexDir="column" align="stretch" w={300} h="100%">
      <HStack spacing={8}>
        <Heading size="sm">
          {semester.charAt(0).toUpperCase()}
          {semester.substring(1)}
        </Heading>
        <Text>
          {totalCredits} credit
          {totalCredits !== 1 && "s"}
        </Text>
      </HStack>
      <Flex
        ref={drop}
        flexDir="column"
        align="stretch"
        flexGrow={1}
        flexBasis={0}
        overflowY="auto"
        p={4}
        mt={4}
        borderRadius={8}
        bgColor={isOver ? "gray.100" : "gray.200"}
      >
        <VStack spacing={4}>
          {courseFields.map(({ id, courseId }, index) => (
            <DragCourseCard
              key={`${id}${index}`}
              course={{ ...courseMap.get(courseId)!, id: courseId }}
              origin={getOrigin()}
              useCount={0}
              onDrop={() => courseRemove(index)}
            />
          ))}
        </VStack>
      </Flex>
    </Flex>
  );
}