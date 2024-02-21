import { Box, Button, Heading } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";

export default function CoursesPage() {
  return (
    <Box p={10}>
      <Heading size="lg">Manage Courses</Heading>
      <Button mt={8} leftIcon={<AddIcon />} colorScheme="green">
        Add Course
      </Button>
    </Box>
  );
}
