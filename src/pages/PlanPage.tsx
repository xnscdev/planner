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
      return navigate("/");
    }
    db.getPlan(id).then((plan) => {
      if (!plan) {
        return navigate("/");
      }
      db.getAllCourses().then((courses) => {
        setCourses(courses);
        const ids = new Set<string>(courses.map(({ id }) => id));
        for (const year of plan.years) {
          year.fall = year.fall.filter(({ courseId }) => ids.has(courseId));
          year.spring = year.spring.filter(({ courseId }) => ids.has(courseId));
          year.summer = year.summer.filter(({ courseId }) => ids.has(courseId));
        }
        setPlan(plan);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (plan) {
    return <EditPlanForm id={id!} initialPlan={plan} courses={courses} />;
  } else {
    return null;
  }
}
