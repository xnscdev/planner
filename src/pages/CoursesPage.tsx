import {
  Box,
  Button,
  Heading,
  HStack,
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
import { sortAndFilterCourses } from "../util/course.ts";
import { SortFilterControl } from "../components/SortFilterControl.tsx";

export default function CoursesPage() {
  const db = useDb();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<(Course & { id: string })[]>([]);
  const [sortSubject, setSortSubject] = useState("asc");
  const [sortNumber, setSortNumber] = useState("asc");
  const [filter, setFilter] = useState("");

  function update() {
    setLoading(true);
    db.getAllCourses().then((courses) => {
      setCourses(courses);
      setLoading(false);
    });
  }

  useEffect(() => {
    update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredCourses = sortAndFilterCourses(
    courses,
    sortSubject,
    sortNumber,
    filter,
  );
  return (
    <Box p={10}>
      <Heading size="lg">Manage Courses</Heading>
      <HStack mt={8} mb={12} spacing={4} wrap="wrap">
        <Button
          onClick={onOpen}
          leftIcon={<AddIcon />}
          colorScheme="green"
          isDisabled={loading}
        >
          Add Course
        </Button>
        <SortFilterControl
          sortSubject={sortSubject}
          setSortSubject={setSortSubject}
          sortNumber={sortNumber}
          setSortNumber={setSortNumber}
          filter={filter}
          setFilter={setFilter}
        />
      </HStack>
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
      ) : filteredCourses.length ? (
        <Wrap spacing={6}>
          {filteredCourses.map(({ id, ...course }) => (
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
      ) : courses.length ? (
        <Heading size="md">No courses matched your search.</Heading>
      ) : (
        <Heading size="md">
          No courses yet! Add a course above to get started.
        </Heading>
      )}
    </Box>
  );
}
