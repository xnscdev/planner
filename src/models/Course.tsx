export interface CourseRequisite {
  id: string;
  type: "pre" | "co" | "year";
  ignore: boolean;
  year?: number;
  strict?: boolean;
}

export default interface Course {
  number: string;
  title: string;
  description: string;
  tags: string[];
  requisites: CourseRequisite[];
}
