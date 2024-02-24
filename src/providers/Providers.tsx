import { ReactNode } from "react";
import AuthProvider from "./AuthProvider.tsx";
import { ChakraProvider } from "@chakra-ui/react";
import DatabaseProvider from "./DatabaseProvider.tsx";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider>
      <AuthProvider>
        <DatabaseProvider>
          <DndProvider backend={HTML5Backend}>{children}</DndProvider>
        </DatabaseProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}
