import Course from "../models/Course.tsx";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Heading,
  Tag,
  Text,
  useDisclosure,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { randomColor, randomCourseColor } from "../util/colors.ts";
import EditCourseForm from "./EditCourseForm.tsx";

export default function CourseCard({
  id,
  course,
  update,
}: {
  id: string;
  course: Course;
  update: () => void;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [bgColor, bgColorHover] = randomCourseColor(course.number);
  return (
    <>
      <Card
        bgColor={bgColor}
        _hover={{ bgColor: bgColorHover }}
        maxW={360}
        cursor="pointer"
        onClick={onOpen}
      >
        <CardHeader>
          <Heading size="md">{course.number}</Heading>
          <Heading size="sm">{course.title}</Heading>
        </CardHeader>
        {course.description && (
          <CardBody>
            <Text noOfLines={4} whiteSpace="pre-line">
              {course.description}
            </Text>
          </CardBody>
        )}
        <CardFooter>
          <Wrap>
            {course.tags.map((tag) => (
              <WrapItem key={tag}>
                <Tag colorScheme={randomColor(tag)}>{tag}</Tag>
              </WrapItem>
            ))}
          </Wrap>
        </CardFooter>
      </Card>
      <EditCourseForm
        id={id}
        course={course}
        isOpen={isOpen}
        onClose={onClose}
        update={update}
      />
    </>
  );
}