import { CourseRef } from "./Course.tsx";

export interface PlanYear {
  fall: CourseRef[];
  spring: CourseRef[];
  summer: CourseRef[];
}

export default interface Plan {
  name: string;
  description: string;
  years: PlanYear[];
}
