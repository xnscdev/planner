import Course from "../models/Course.tsx";
import { Card, CardBody, CardHeader, Heading, Text } from "@chakra-ui/react";
import { randomCourseColor } from "../util/colors.ts";
import { useDrag } from "react-dnd";

export default function DragCourseCard({
  course,
}: {
  course: Course & { id: string };
}) {
  const [bgColor] = randomCourseColor(course.number);
  const [{ isDragging }, ref] = useDrag(
    () => ({
      type: "Course",
      item: course,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [],
  );

  return (
    <Card
      ref={ref}
      bgColor={bgColor}
      opacity={isDragging ? 0.5 : 1}
      cursor="pointer"
    >
      <CardHeader>
        <Heading size="md">{course.number}</Heading>
        <Heading size="sm">{course.title}</Heading>
      </CardHeader>
      {course.description && (
        <CardBody>
          <Text noOfLines={2} whiteSpace="pre-line">
            {course.description}
          </Text>
        </CardBody>
      )}
    </Card>
  );
}
