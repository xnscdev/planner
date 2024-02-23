import { useForm } from "react-hook-form";
import {
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  VStack,
} from "@chakra-ui/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../providers/AuthProvider.tsx";
import { useState } from "react";

const LogInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(20),
});

type LogInData = z.infer<typeof LogInSchema>;

export default function LogInPage() {
  const auth = useAuth();
  const [error, setError] = useState("");
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<LogInData>({
    resolver: zodResolver(LogInSchema),
  });

  async function onSubmit(values: LogInData) {
    try {
      await auth.logIn(values.email, values.password);
    } catch {
      setError("Incorrect email or password");
    }
  }

  return (
    <Container maxW="container.md" mt={16}>
      <Heading size="lg" mb={8} textAlign="center">
        Log in
      </Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing={6}>
          <FormControl isInvalid={!!errors.email}>
            <FormLabel>Email</FormLabel>
            <Input type="text" {...register("email")} />
            <FormErrorMessage>
              {errors.email && errors.email.message}
            </FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.password}>
            <FormLabel>Password</FormLabel>
            <Input type="password" {...register("password")} />
            <FormErrorMessage>
              {errors.password && errors.password.message}
            </FormErrorMessage>
          </FormControl>
        </VStack>
        <FormControl isInvalid={!!error}>
          <FormErrorMessage mt={6}>{error}</FormErrorMessage>
        </FormControl>
        <Button
          mt={8}
          colorScheme="blue"
          isLoading={isSubmitting}
          type="submit"
        >
          Log in
        </Button>
      </form>
    </Container>
  );
}
