import { Box, Button, Heading, useDisclosure } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import AddCourseForm from "../components/AddCourseForm.tsx";

export default function CoursesPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Box p={10}>
      <Heading size="lg">Manage Courses</Heading>
      <Button
        onClick={onOpen}
        mt={8}
        leftIcon={<AddIcon />}
        colorScheme="green"
      >
        Add Course
      </Button>
      <AddCourseForm isOpen={isOpen} onClose={onClose} />
    </Box>
  );
}
