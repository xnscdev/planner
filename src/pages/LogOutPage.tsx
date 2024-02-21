import { useEffect } from "react";
import { useAuth } from "../providers/AuthProvider.tsx";
import { Navigate } from "react-router-dom";

export default function LogOutPage() {
  const auth = useAuth();
  useEffect(() => {
    auth.logOut();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <Navigate to="/login" replace />;
}
