import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Tag,
  Text,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import Course, { CourseRequisite } from "../models/Course.tsx";
import { tagColor } from "../util/colors.ts";
import { formatCourseOptions, formatYearRequirement } from "../util/course.ts";

export default function CoursePreviewDialog({
  isOpen,
  onClose,
  course,
  courseMap,
}: {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  courseMap: Map<string, Course>;
}) {
  return (
    <Modal size={{ base: "full", sm: "md" }} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {course.number} - {course.title}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="start">
            <Box>
              <Text fontWeight="semibold">
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
                {course.ignoreAvailability && " (ignored)"}
              </Text>
            </Box>
            <Text>{course.description}</Text>
            {course.requisites.length && (
              <Box>
                {course.requisites.map((req, index) => (
                  <RequisitePreview
                    key={index}
                    requisite={req}
                    courseMap={courseMap}
                  />
                ))}
              </Box>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Wrap>
            {course.tags.map((tag) => (
              <WrapItem key={tag}>
                <Tag boxShadow="base" colorScheme={tagColor(tag)}>
                  {tag}
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
          <Spacer />
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function RequisitePreview({
  requisite,
  courseMap,
}: {
  requisite: CourseRequisite;
  courseMap: Map<string, Course>;
}) {
  switch (requisite.type) {
    case "pre":
      return (
        <Text>
          Prerequisite:{" "}
          {requisite.courses
            .map(({ courseId }) => courseMap.get(courseId)?.number)
            .filter(Boolean)
            .join(" or ")}
          {requisite.ignore && " (ignored)"}
        </Text>
      );
    case "co":
      return (
        <Text>
          Corequisite{requisite.strict && " (strict)"}:{" "}
          {formatCourseOptions(requisite, courseMap)}
          {requisite.ignore && " (ignored)"}
        </Text>
      );
    case "year":
      return (
        <Text>
          {formatYearRequirement(requisite.year, requisite.compare)}
          {requisite.ignore && " (ignored)"}
        </Text>
      );
  }
}
