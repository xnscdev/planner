import { createContext, ReactNode, useContext } from "react";
import {
  CollectionReference,
  getFirestore,
  collection,
} from "firebase/firestore";
import { useAuth } from "./AuthProvider.tsx";
import Course from "../models/Course.tsx";
import Plan from "../models/Plan.tsx";

interface DatabaseContextData {
  courses: () => CollectionReference<Course>;
  plans: () => CollectionReference<Plan>;
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

  const value: DatabaseContextData = {
    courses,
    plans,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}
