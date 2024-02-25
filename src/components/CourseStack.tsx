import { Flex, VStack } from "@chakra-ui/react";
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

  return (
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
  );
}
