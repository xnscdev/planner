import Course, { CourseRef } from "../models/Course.tsx";
import {
  Box,
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
import { PlanYear } from "../models/Plan.tsx";
import { formatCourseOptions } from "../util/course.ts";

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
    ? checkError(course, courseMap, fullPlan, year!, semester!)
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
      {errors.length > 0 && (
        <CardFooter>
          <Box>
            {errors.map((error) => (
              <Text key={error} color="red">
                {error}
              </Text>
            ))}
          </Box>
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

function checkError(
  course: Course,
  courseMap: Map<string, Course>,
  fullPlan: PlanYear[],
  year: number,
  semester: "fall" | "spring" | "summer",
) {
  const errors: string[] = [];
  for (const req of course.requisites) {
    const courseIds = req.courses.map(({ courseId }) => courseId);
    switch (req.type) {
      case "pre":
        if (!hasCourseBefore(fullPlan, year, semester, courseIds)) {
          errors.push(
            `Prerequisite not met: ${formatCourseOptions(req, courseMap)}`,
          );
        }
        break;
      case "co":
        if (!hasCourseConcurrent(fullPlan, year, semester, courseIds)) {
          if (req.strict) {
            errors.push(
              `Strict corequisite not met: ${formatCourseOptions(req, courseMap)}`,
            );
          } else if (!hasCourseBefore(fullPlan, year, semester, courseIds)) {
            errors.push(
              `Corequisite not met: ${formatCourseOptions(req, courseMap)}`,
            );
          }
        }
        break;
      case "year":
        console.log(year, req.year);
        if (year + 1 !== req.year) {
          errors.push(`Must be taken in year ${req.year}`);
        }
    }
  }
  return errors;
}

function hasCourseBefore(
  fullPlan: PlanYear[],
  year: number,
  semester: "fall" | "spring" | "summer",
  courses: string[],
) {
  for (let i = 0; i < year; i++) {
    const semesters = [fullPlan[i].fall, fullPlan[i].spring, fullPlan[i].summer]
      .flat()
      .map(({ courseId }) => courseId);
    if (courses.some((course) => semesters.includes(course))) {
      return true;
    }
  }

  const semesterList: CourseRef[][] = [];
  switch (semester) {
    case "spring":
      semesterList.push(fullPlan[year].fall);
      break;
    case "summer":
      semesterList.push(fullPlan[year].fall);
      semesterList.push(fullPlan[year].spring);
      break;
  }
  const semesters = semesterList.flat().map(({ courseId }) => courseId);
  return courses.some((course) => semesters.includes(course));
}

function hasCourseConcurrent(
  fullPlan: PlanYear[],
  year: number,
  semester: "fall" | "spring" | "summer",
  courses: string[],
) {
  const courseIds = fullPlan[year][semester].map(({ courseId }) => courseId);
  return courses.some((course) => courseIds.includes(course));
}
