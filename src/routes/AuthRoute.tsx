import { ReactNode } from "react";
import { useAuth } from "../providers/AuthProvider.tsx";
import { Navigate } from "react-router-dom";

export default function AuthRoute({ children }: { children: ReactNode }) {
  const auth = useAuth();
  if (auth.user) {
    return <Navigate to="/" replace />;
  }
  return children;
}
