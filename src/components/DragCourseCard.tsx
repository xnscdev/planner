import Course from "../models/Course.tsx";
import {
  Box,
  Card,
  CardFooter,
  CardHeader,
  Heading,
  Tag,
  Text,
  useDisclosure,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { courseCardColor, tagColor } from "../util/colors.ts";
import { useDrag } from "react-dnd";
import CoursePreviewDialog from "./CoursePreviewDialog.tsx";
import { PlanYear } from "../models/Plan.tsx";
import { getRequisiteErrors } from "../util/course.ts";

export default function DragCourseCard({
  course,
  courseMap,
  fullPlan,
  year,
  semester,
  origin,
  useCount,
  editing,
  onDrop,
}: {
  course: Course & { id: string };
  courseMap: Map<string, Course>;
  fullPlan?: PlanYear[];
  year?: number;
  semester?: "fall" | "spring" | "summer";
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

  const errors = fullPlan
    ? getRequisiteErrors(course, courseMap, fullPlan, year!, semester!)
    : [];
  const errorProps = errors.length ? { boxShadow: "0 0 5px 2px red" } : {};
  return (
    <Card
      ref={ref}
      onClick={onOpen}
      size="sm"
      bgColor={bgColor}
      opacity={isDragging ? 0.5 : 1}
      cursor="pointer"
      {...errorProps}
    >
      <CardHeader>
        <Heading size="md">{course.number}</Heading>
        <Heading size="sm">{course.title}</Heading>
        <Text>
          {course.credits} credit{course.credits !== 1 && "s"}
        </Text>
        <Text>
          {[
            course.availableFall && "Fall",
            course.availableSpring && "Spring",
            course.availableSummer && "Summer",
          ]
            .filter(Boolean)
            .join(", ")}
        </Text>
      </CardHeader>
      <CardFooter>
        <VStack align="start" spacing={2}>
          {course.tags.length > 0 && (
            <Wrap>
              {course.tags.map((tag) => (
                <WrapItem key={tag}>
                  <Tag boxShadow="base" colorScheme={tagColor(tag)}>
                    {tag}
                  </Tag>
                </WrapItem>
              ))}
            </Wrap>
          )}
          {useCount > 0 && (
            <Text fontStyle="italic">
              Course added to plan {useCount} time{useCount > 1 && "s"}
            </Text>
          )}
          {errors.length > 0 && (
            <Box>
              {errors.map((error) => (
                <Text key={error} color="red">
                  {error}
                </Text>
              ))}
            </Box>
          )}
        </VStack>
      </CardFooter>
      <CoursePreviewDialog
        isOpen={isOpen}
        onClose={onClose}
        course={course}
        courseMap={courseMap}
      />
    </Card>
  );
}
