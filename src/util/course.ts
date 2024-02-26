import Course from "../models/Course.tsx";

export function getSubject(number: string) {
  const match = number.match(/^[a-zA-Z]+/);
  return match ? match[0] : "";
}

export function getNumber(number: string) {
  const match = number.match(/[0-9]+.*/);
  return match ? match[0] : "";
}

export function filterCourse(
  course: Course,
  filter: string,
  availability: string[],
) {
  const str = filter.toLowerCase();
  return (
    (course.number.toLowerCase().includes(str) ||
      course.title.toLowerCase().includes(str) ||
      course.description.toLowerCase().includes(str)) &&
    ((course.availableFall && availability.includes("fall")) ||
      (course.availableSpring && availability.includes("spring")) ||
      (course.availableSummer && availability.includes("summer")))
  );
}

export function sortCourses(
  a: Course,
  b: Course,
  sortSubject: string,
  sortNumber: string,
) {
  const subjectA = getSubject(a.number);
  const subjectB = getSubject(b.number);
  let subjectCompare = subjectA.localeCompare(subjectB);
  if (sortSubject === "dsc") {
    subjectCompare = -subjectCompare;
  }
  if (subjectCompare) {
    return subjectCompare;
  }

  const numberA = getNumber(a.number);
  const numberB = getNumber(b.number);
  const numberCompare = numberA.localeCompare(numberB);
  return sortNumber === "dsc" ? -numberCompare : numberCompare;
}

export function sortAndFilterCourses(
  courses: (Course & { id: string })[],
  sortSubject: string,
  sortNumber: string,
  showAvailability: string[],
  filter: string,
) {
  return courses
    .toSorted((a, b) => sortCourses(a, b, sortSubject, sortNumber))
    .filter((course) => filterCourse(course, filter, showAvailability));
}
