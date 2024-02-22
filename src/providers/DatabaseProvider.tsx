import { createContext, ReactNode, useContext } from "react";
import {
  addDoc,
  collection,
  CollectionReference,
  deleteDoc,
  doc,
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
  getAllCourses: () => Promise<Map<string, Course>>;
  createCourse: (course: Course) => Promise<void>;
  updateCourse: (id: string, course: Course) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
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
    return new Map(snapshot.docs.map((doc) => [doc.id, doc.data()]));
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

  const value: DatabaseContextData = {
    courses,
    plans,
    getAllCourses,
    createCourse,
    updateCourse,
    deleteCourse,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}
