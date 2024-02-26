export interface CourseRequisite {
  courseId: string;
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
  description: string;
  tags: string[];
  requisites: CourseRequisite[];
}
