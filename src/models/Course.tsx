export interface CourseRef {
  courseId: string;
}

export interface CourseRequisite {
  courses: CourseRef[];
  type: "pre" | "co" | "year";
  ignore: boolean;
  compare: "<=" | "=" | ">=";
  year: number;
  strict: boolean;
}

export default interface Course {
  number: string;
  title: string;
  credits: number;
  availableFall: boolean;
  availableSpring: boolean;
  availableSummer: boolean;
  ignoreAvailability: boolean;
  description: string;
  tags: string[];
  requisites: CourseRequisite[];
}
