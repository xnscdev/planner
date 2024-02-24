import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { FirebaseOptions, initializeApp } from "firebase/app";
import LogInPage from "./pages/LogInPage.tsx";
import SignUpPage from "./pages/SignUpPage.tsx";
import ProtectedRoute from "./routes/ProtectedRoute.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import AuthRoute from "./routes/AuthRoute.tsx";
import LogOutPage from "./pages/LogOutPage.tsx";
import Providers from "./providers/Providers.tsx";
import NavBar from "./components/NavBar.tsx";
import CoursesPage from "./pages/CoursesPage.tsx";
import PlansPage from "./pages/PlansPage.tsx";
import PlanPage from "./pages/PlanPage.tsx";
import { Box, Flex } from "@chakra-ui/react";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCmdG2hPeYNpgiaD0_X5TxNVA-hHNOoi_I",
  authDomain: "xnsc-planner.firebaseapp.com",
  projectId: "xnsc-planner",
  storageBucket: "xnsc-planner.appspot.com",
  messagingSenderId: "676999784983",
  appId: "1:676999784983:web:6760300467a37101910a52",
  measurementId: "G-R1MW3KEC8B",
};

initializeApp(firebaseConfig);

const router = createBrowserRouter([
  {
    element: (
      <Flex h="100vh" flexDir="column" align="stretch">
        <NavBar />
        <Box flexGrow={1} flexShrink={1} flexBasis="auto" overflowY="auto">
          <Outlet />
        </Box>
      </Flex>
    ),
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/courses",
        element: (
          <ProtectedRoute>
            <CoursesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/plans",
        element: (
          <ProtectedRoute>
            <PlansPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/plan/:id",
        element: (
          <ProtectedRoute>
            <PlanPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/login",
        element: (
          <AuthRoute>
            <LogInPage />
          </AuthRoute>
        ),
      },
      {
        path: "/signup",
        element: (
          <AuthRoute>
            <SignUpPage />
          </AuthRoute>
        ),
      },
      {
        path: "/logout",
        element: <LogOutPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </React.StrictMode>,
);
