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
  const [courses, setCourses] = useState(new Map<string, Course>());

  function update() {
    db.getAllCourses().then((courses) => setCourses(courses));
  }

  useEffect(() => {
    update();
  }, []);

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
      <EditCourseForm isOpen={isOpen} onClose={onClose} update={update} />
      <Wrap mt={12} spacing={6}>
        {Array.from(courses.entries()).map(([id, course]) => (
          <WrapItem key={id}>
            <CourseCard id={id} course={course} update={update} />
          </WrapItem>
        ))}
      </Wrap>
    </Box>
  );
}
