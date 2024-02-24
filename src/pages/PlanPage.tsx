import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Plan from "../models/Plan.tsx";
import { useDb } from "../providers/DatabaseProvider.tsx";
import EditPlanForm from "../components/EditPlanForm.tsx";
import Course from "../models/Course.tsx";

export default function PlanPage() {
  const db = useDb();
  const navigate = useNavigate();
  const { id } = useParams();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [courses, setCourses] = useState<(Course & { id: string })[]>([]);

  useEffect(() => {
    if (!id) {
      return navigate("/plans");
    }
    db.getPlan(id).then((plan) => {
      if (!plan) {
        return navigate("/plans");
      }
      setPlan(plan);
      db.getAllCourses().then((courses) => setCourses(courses));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (plan) {
    return <EditPlanForm id={id!} initialPlan={plan} courses={courses} />;
  } else {
    return null;
  }
}
