import { useForm } from "react-hook-form";
import {
  Button,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
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

type SignUpSchemaType = z.infer<typeof SignUpSchema>;

export default function SignUpPage() {
  const auth = useAuth();
  const [error, setError] = useState("");
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<SignUpSchemaType>({
    resolver: zodResolver(SignUpSchema),
  });

  async function onSubmit(values: SignUpSchemaType) {
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
        <Flex flexDirection="column" rowGap="6">
          <FormControl isInvalid={!!errors.email}>
            <FormLabel htmlFor="email">Email</FormLabel>
            <Input
              id="email"
              type="text"
              placeholder="Email"
              {...register("email")}
            />
            <FormErrorMessage>
              {errors.email && errors.email.message}
            </FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.password}>
            <FormLabel htmlFor="password">Password</FormLabel>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              {...register("password")}
            />
            <FormErrorMessage>
              {errors.password && errors.password.message}
            </FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.confirm}>
            <FormLabel htmlFor="confirm">Confirm Password</FormLabel>
            <Input
              id="confirm"
              type="password"
              placeholder="Re-type password"
              {...register("confirm")}
            />
            <FormErrorMessage>
              {errors.confirm && errors.confirm.message}
            </FormErrorMessage>
          </FormControl>
        </Flex>
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
