import {
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  useDisclosure,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import EditCourseForm from "../components/EditCourseForm.tsx";
import { useDb } from "../providers/DatabaseProvider.tsx";
import Course from "../models/Course.tsx";
import { useEffect, useState } from "react";
import CourseCard from "../components/CourseCard.tsx";
import { getTagSet, sortAndFilterCourses } from "../util/course.ts";
import { BiPlus } from "react-icons/bi";
import { SortFilterControl } from "../components/SortFilterControl.tsx";
import { useSortFilter } from "../util/hooks.ts";

export default function CoursesPage() {
  const db = useDb();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<(Course & { id: string })[]>([]);
  const {
    sortCriteria,
    sortDirection,
    filter,
    tagFilter,
    filterOptions,
    fields: sortFields,
  } = useSortFilter();

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
    sortCriteria,
    sortDirection,
    filter,
    tagFilter,
    filterOptions,
  );
  const existingTags = getTagSet(courses);
  return (
    <Flex flexDir="column" align="stretch" h="100%" p={10}>
      <Heading size="lg">Manage Courses</Heading>
      <HStack mt={8} mb={12} spacing={4} wrap="wrap">
        <Button
          onClick={onOpen}
          leftIcon={<Icon boxSize={6} as={BiPlus} />}
          colorScheme="green"
          isDisabled={loading}
        >
          Add Course
        </Button>
        <SortFilterControl
          {...sortFields}
          tags={existingTags}
          usedOption={false}
        />
      </HStack>
      <EditCourseForm
        isOpen={isOpen}
        courses={courses}
        tags={existingTags}
        onClose={onClose}
        update={update}
      />
      <Flex
        p={6}
        borderRadius={8}
        borderColor="gray.200"
        borderWidth={1}
        flexGrow={1}
        overflowY="auto"
        flexDir="column"
        align="stretch"
      >
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
      </Flex>
    </Flex>
  );
}
