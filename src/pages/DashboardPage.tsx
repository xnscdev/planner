import { Box } from "@chakra-ui/react";
import { useAuth } from "../providers/AuthProvider.tsx";

export default function DashboardPage() {
  return (
    <Box p={10}>
      <h1>Dashboard for {useAuth().user?.email}</h1>
    </Box>
  );
}
