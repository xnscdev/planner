import Course from "../models/Course.tsx";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Heading,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { courseCardColor } from "../util/colors.ts";
import { useDrag } from "react-dnd";
import CoursePreviewDialog from "./CoursePreviewDialog.tsx";

export default function DragCourseCard({
  course,
  courseMap,
  origin,
  useCount,
  editing,
  onDrop,
}: {
  course: Course & { id: string };
  courseMap: Map<string, Course>;
  origin: string;
  useCount: number;
  editing: boolean;
  onDrop: () => void;
}) {
  const [bgColor] = courseCardColor(course.number);
  const { isOpen, onOpen, onClose } = useDisclosure();
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
      onClick={onOpen}
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
          <Text fontStyle="italic">
            Course added to plan {useCount} time{useCount > 1 && "s"}
          </Text>
        </CardFooter>
      )}
      <CoursePreviewDialog
        isOpen={isOpen}
        onClose={onClose}
        course={course}
        courseMap={courseMap}
      />
    </Card>
  );
}
