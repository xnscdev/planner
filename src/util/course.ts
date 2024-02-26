import Course from "../models/Course.tsx";

export function getSubject(number: string) {
  const match = number.match(/^[a-zA-Z]+/);
  return match ? match[0] : "";
}

export function getNumber(number: string) {
  const match = number.match(/[0-9]+.*/);
  return match ? match[0] : "";
}

export function sortCourses(
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

export function filterCourse(
  course: Course,
  filter: string,
  filterOptions: string[],
) {
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

export function sortAndFilterCourses(
  courses: (Course & { id: string })[],
  sortCriteria: string,
  sortDirection: string,
  filter: string,
  filterOptions: string[],
) {
  return courses
    .toSorted((a, b) => sortCourses(a, b, sortCriteria, sortDirection))
    .filter((course) => filterCourse(course, filter, filterOptions));
}
