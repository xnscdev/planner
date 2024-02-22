import { createContext, ReactNode, useContext } from "react";
import {
  collection,
  CollectionReference,
  getDocs,
  getFirestore,
} from "firebase/firestore";
import { useAuth } from "./AuthProvider.tsx";
import Course from "../models/Course.tsx";
import Plan from "../models/Plan.tsx";

interface DatabaseContextData {
  courses: () => CollectionReference<Course>;
  plans: () => CollectionReference<Plan>;
  getAllCourses: () => Promise<(Course & { id: string })[]>;
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
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  }

  const value: DatabaseContextData = {
    courses,
    plans,
    getAllCourses,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}
