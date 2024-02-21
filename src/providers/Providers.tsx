import { ReactNode } from "react";
import AuthProvider from "./AuthProvider.tsx";
import { ChakraProvider } from "@chakra-ui/react";
import DatabaseProvider from "./DatabaseProvider.tsx";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider>
      <AuthProvider>
        <DatabaseProvider>{children}</DatabaseProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}
