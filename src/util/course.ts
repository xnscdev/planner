import Course, { CourseRef, CourseRequisite } from "../models/Course.tsx";
import { PlanYear } from "../models/Plan.tsx";

export function getSubject(number: string) {
  const match = number.match(/^[a-zA-Z]+/);
  return match ? match[0] : "";
}

export function getNumber(number: string) {
  const match = number.match(/[0-9]+.*/);
  return match ? match[0] : "";
}

function sortCourse(
  a: Course,
  b: Course,
  sortCriteria: string,
  sortDirection: string,
) {
  let val = a.number.localeCompare(b.number);
  if (sortCriteria === "number") {
    const numberA = getNumber(a.number);
    const numberB = getNumber(b.number);
    const byNumber = numberA.localeCompare(numberB);
    if (byNumber) {
      val = byNumber;
    }
  } else if (sortCriteria === "credits") {
    const byCredits = a.credits - b.credits;
    if (byCredits) {
      val = byCredits;
    }
  }
  return sortDirection === "dsc" ? -val : val;
}

function filterCourse(course: Course, filter: string, filterOptions: string[]) {
  const str = filter.toLowerCase();
  return (
    (course.number.toLowerCase().includes(str) ||
      course.title.toLowerCase().includes(str) ||
      course.description.toLowerCase().includes(str)) &&
    ((course.availableFall && filterOptions.includes("fall")) ||
      (course.availableSpring && filterOptions.includes("spring")) ||
      (course.availableSummer && filterOptions.includes("summer")))
  );
}

export function sortCourses(
  courses: (Course & { id: string })[],
  sortCriteria: string,
  sortDirection: string,
) {
  return courses.toSorted((a, b) =>
    sortCourse(a, b, sortCriteria, sortDirection),
  );
}

export function sortAndFilterCourses(
  courses: (Course & { id: string })[],
  sortCriteria: string,
  sortDirection: string,
  filter: string,
  filterOptions: string[],
) {
  return sortCourses(courses, sortCriteria, sortDirection).filter((course) =>
    filterCourse(course, filter, filterOptions),
  );
}

export function formatCourseOptions(
  { courses }: CourseRequisite,
  courseMap: Map<string, Course>,
) {
  return courses
    .map(({ courseId }) => courseMap.get(courseId)?.number)
    .filter(Boolean)
    .join(" or ");
}

export function getRequisiteErrors(
  course: Course,
  courseMap: Map<string, Course>,
  fullPlan: PlanYear[],
  year: number,
  semester: "fall" | "spring" | "summer",
) {
  const errors: string[] = [];
  if (
    ![
      course.availableFall && "fall",
      course.availableSpring && "spring",
      course.availableSummer && "summer",
    ]
      .filter(Boolean)
      .includes(semester)
  ) {
    errors.push(`Not available in ${semester} session`);
  }
  for (const req of course.requisites) {
    const courseIds = req.courses.map(({ courseId }) => courseId);
    switch (req.type) {
      case "pre":
        if (!hasCourseBefore(fullPlan, year, semester, courseIds)) {
          errors.push(
            `Prerequisite not met: ${formatCourseOptions(req, courseMap)}`,
          );
        }
        break;
      case "co":
        if (!hasCourseConcurrent(fullPlan, year, semester, courseIds)) {
          if (req.strict) {
            errors.push(
              `Strict corequisite not met: ${formatCourseOptions(req, courseMap)}`,
            );
          } else if (!hasCourseBefore(fullPlan, year, semester, courseIds)) {
            errors.push(
              `Corequisite not met: ${formatCourseOptions(req, courseMap)}`,
            );
          }
        }
        break;
      case "year":
        if (year + 1 !== req.year) {
          errors.push(`Must be taken in year ${req.year}`);
        }
    }
  }
  return errors;
}

export function hasCourseBefore(
  fullPlan: PlanYear[],
  year: number,
  semester: "fall" | "spring" | "summer",
  courses: string[],
) {
  for (let i = 0; i < year; i++) {
    const semesters = [fullPlan[i].fall, fullPlan[i].spring, fullPlan[i].summer]
      .flat()
      .map(({ courseId }) => courseId);
    if (courses.some((course) => semesters.includes(course))) {
      return true;
    }
  }

  const semesterList: CourseRef[][] = [];
  switch (semester) {
    case "spring":
      semesterList.push(fullPlan[year].fall);
      break;
    case "summer":
      semesterList.push(fullPlan[year].fall);
      semesterList.push(fullPlan[year].spring);
      break;
  }
  const semesters = semesterList.flat().map(({ courseId }) => courseId);
  return courses.some((course) => semesters.includes(course));
}

export function hasCourseConcurrent(
  fullPlan: PlanYear[],
  year: number,
  semester: "fall" | "spring" | "summer",
  courses: string[],
) {
  const courseIds = fullPlan[year][semester].map(({ courseId }) => courseId);
  return courses.some((course) => courseIds.includes(course));
}
