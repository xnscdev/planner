import Course from "../models/Course.tsx";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Heading,
  HStack,
  Tag,
  Text,
  useDisclosure,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { courseCardColor, tagColor } from "../util/colors.ts";
import EditCourseForm from "./EditCourseForm.tsx";
import { TagData } from "../models/Tag.tsx";

export default function CourseCard({
  id,
  course,
  courses,
  tags,
  update,
}: {
  id: string;
  course: Course;
  courses: (Course & { id: string })[];
  tags: TagData[];
  update: () => void;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [bgColor, bgColorHover] = courseCardColor(course.number);
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
          <HStack spacing={8}>
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
          </HStack>
        </CardHeader>
        {course.description && (
          <CardBody>
            <Text noOfLines={4} whiteSpace="pre-line">
              {course.description}
            </Text>
          </CardBody>
        )}
        {course.tags.length > 0 && (
          <CardFooter>
            <Wrap>
              {course.tags.map((tag) => (
                <WrapItem key={tag}>
                  <Tag boxShadow="base" colorScheme={tagColor(tag)}>
                    {tag}
                  </Tag>
                </WrapItem>
              ))}
            </Wrap>
          </CardFooter>
        )}
      </Card>
      <EditCourseForm
        id={id}
        course={course}
        courses={courses}
        tags={tags}
        isOpen={isOpen}
        onClose={onClose}
        update={update}
      />
    </>
  );
}
