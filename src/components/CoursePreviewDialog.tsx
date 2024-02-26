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
import Course from "../models/Course.tsx";
import { randomColor } from "../util/colors.ts";

export default function CoursePreviewDialog({
  isOpen,
  onClose,
  course,
}: {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
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
              </Text>
            </Box>
            <Text>{course.description}</Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Wrap>
            {course.tags.map((tag) => (
              <WrapItem key={tag}>
                <Tag boxShadow="base" colorScheme={randomColor(tag)}>
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
