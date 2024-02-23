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
import { FirebaseError } from "@firebase/util";

const SignUpSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6).max(20),
    confirm: z.string().min(6).max(20),
  })
  .superRefine(({ password, confirm }, ctx) => {
    if (password !== confirm) {
      ctx.addIssue({
        path: ["confirm"],
        code: "custom",
        message: "Passwords do not match",
      });
    }
  });

type SignUpData = z.infer<typeof SignUpSchema>;

export default function SignUpPage() {
  const auth = useAuth();
  const [error, setError] = useState("");
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<SignUpData>({
    resolver: zodResolver(SignUpSchema),
  });

  async function onSubmit(values: SignUpData) {
    try {
      await auth.signUp(values.email, values.password);
    } catch (err) {
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case "auth/email-already-in-use":
            setError("Email is already in use");
            break;
          case "auth/weak-password":
            setError("Password is not strong enough");
            break;
          default:
            setError("An unknown error occurred");
        }
      }
    }
  }

  return (
    <Container maxW="container.md" mt={16}>
      <Heading size="lg" mb={8} textAlign="center">
        Sign up
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
          <FormControl isInvalid={!!errors.confirm}>
            <FormLabel>Confirm Password</FormLabel>
            <Input type="password" {...register("confirm")} />
            <FormErrorMessage>
              {errors.confirm && errors.confirm.message}
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
          Sign up
        </Button>
      </form>
    </Container>
  );
}
