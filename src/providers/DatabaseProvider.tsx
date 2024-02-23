import { createContext, ReactNode, useContext } from "react";
import {
  addDoc,
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "./AuthProvider.tsx";
import Course from "../models/Course.tsx";
import Plan from "../models/Plan.tsx";

interface DatabaseContextData {
  courses: () => CollectionReference<Course>;
  plans: () => CollectionReference<Plan>;
  getAllCourses: () => Promise<(Course & { id: string })[]>;
  createCourse: (course: Course) => Promise<void>;
  updateCourse: (id: string, course: Course) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  getAllPlans: () => Promise<(Plan & { id: string })[]>;
  getPlan: (id: string) => Promise<Plan | undefined>;
  createPlan: (plan: Plan) => Promise<void>;
  updatePlan: (id: string, plan: Plan) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextData>(null!);

// eslint-disable-next-line react-refresh/only-export-components
export function useDb() {
  return useContext(DatabaseContext);
}

export default function DatabaseProvider({
  children,
}: {
  children: ReactNode;
}) {
  const auth = useAuth();
  const db = getFirestore();

  function courses() {
    return collection(
      db,
      "users",
      auth.user!.uid,
      "courses",
    ) as CollectionReference<Course>;
  }

  function plans() {
    return collection(
      db,
      "users",
      auth.user!.uid,
      "plans",
    ) as CollectionReference<Plan>;
  }

  async function getAllCourses() {
    const snapshot = await getDocs(courses());
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async function createCourse(course: Course) {
    await addDoc(courses(), course);
  }

  async function updateCourse(id: string, course: Course) {
    await updateDoc(doc(courses(), id), course as object);
  }

  async function deleteCourse(id: string) {
    await deleteDoc(doc(courses(), id));
  }

  async function getAllPlans() {
    const snapshot = await getDocs(plans());
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async function getPlan(id: string) {
    const snapshot = await getDoc(doc(plans(), id));
    return snapshot.data();
  }

  async function createPlan(plan: Plan) {
    await addDoc(plans(), plan);
  }

  async function updatePlan(id: string, plan: Plan) {
    await updateDoc(doc(plans(), id), plan as object);
  }

  async function deletePlan(id: string) {
    await deleteDoc(doc(plans(), id));
  }

  const value: DatabaseContextData = {
    courses,
    plans,
    getAllCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    getAllPlans,
    getPlan,
    createPlan,
    updatePlan,
    deletePlan,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}
