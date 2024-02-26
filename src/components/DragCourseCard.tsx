import Course from "../models/Course.tsx";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Heading,
  Text,
} from "@chakra-ui/react";
import { randomCourseColor } from "../util/colors.ts";
import { useDrag } from "react-dnd";

export default function DragCourseCard({
  course,
  origin,
  useCount,
  editing,
  onDrop,
}: {
  course: Course & { id: string };
  origin: string;
  useCount: number;
  editing: boolean;
  onDrop: () => void;
}) {
  const [bgColor] = randomCourseColor(course.number);
  const [{ isDragging }, ref] = useDrag(
    () => ({
      type: "Course",
      item: { courseId: course.id, origin },
      end: (_, monitor) => {
        if (monitor.didDrop()) {
          onDrop();
        }
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      canDrag: () => editing,
    }),
    [editing],
  );

  return (
    <Card
      ref={ref}
      size="sm"
      bgColor={bgColor}
      opacity={isDragging ? 0.5 : 1}
      cursor="pointer"
    >
      <CardHeader>
        <Heading size="md">{course.number}</Heading>
        <Heading size="sm">{course.title}</Heading>
        <Text>
          {course.credits} credit{course.credits > 1 && "s"}
        </Text>
      </CardHeader>
      {course.description && (
        <CardBody>
          <Text noOfLines={2} whiteSpace="pre-line">
            {course.description}
          </Text>
        </CardBody>
      )}
      {useCount > 0 && (
        <CardFooter>
          <Text as="i">
            Course added to plan {useCount} time{useCount > 1 && "s"}
          </Text>
        </CardFooter>
      )}
    </Card>
  );
}
