import {
  Box,
  Button,
  Heading,
  useDisclosure,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import EditCourseForm from "../components/EditCourseForm.tsx";
import { useDb } from "../providers/DatabaseProvider.tsx";
import Course from "../models/Course.tsx";
import { useEffect, useState } from "react";
import CourseCard from "../components/CourseCard.tsx";

export default function CoursesPage() {
  const db = useDb();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState(new Map<string, Course>());

  function update() {
    db.getAllCourses().then((courses) => {
      setCourses(courses);
      setLoading(false);
    });
  }

  useEffect(() => {
    update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box p={10}>
      <Heading size="lg">Manage Courses</Heading>
      <Button
        onClick={onOpen}
        mt={8}
        mb={12}
        leftIcon={<AddIcon />}
        colorScheme="green"
        isDisabled={loading}
      >
        Add Course
      </Button>
      <EditCourseForm
        isOpen={isOpen}
        courses={courses}
        onClose={onClose}
        update={update}
      />
      {loading ? (
        <Heading size="md" color="gray">
          Loading&hellip;
        </Heading>
      ) : (
        <Wrap spacing={6}>
          {Array.from(courses.entries()).map(([id, course]) => (
            <WrapItem key={id}>
              <CourseCard
                id={id}
                course={course}
                courses={courses}
                update={update}
              />
            </WrapItem>
          ))}
        </Wrap>
      )}
    </Box>
  );
}
