export interface PlanYear {
  fall: string[];
  spring: string[];
  summer: string[];
}

export default interface Plan {
  name: string;
  description: string;
  years: PlanYear[];
}
