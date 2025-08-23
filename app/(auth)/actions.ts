"use server";

import { z } from "zod";
import { redirect } from "next/navigation";

import { createUser, getUser as getDbUser } from "@/db/queries";

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export interface LoginActionState {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data";
}

export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    // Check if user exists in database
    const [user] = await getDbUser(validatedData.email);
    
    if (!user) {
      return { status: "failed" };
    }

    // For now, just validate the user exists
    // Civic Auth will handle the actual authentication flow
    // You may want to implement password verification here
    
    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    return { status: "failed" };
  }
};

export interface RegisterActionState {
  status:
    | "idle"
    | "in_progress"
    | "success"
    | "failed"
    | "user_exists"
    | "invalid_data";
  error?: string;
}

export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    let [user] = await getDbUser(validatedData.email);

    if (user) {
      return { status: "user_exists" };
    } else {
      await createUser(validatedData.email, validatedData.password);
      
      // After successful registration, redirect to login
      // Civic Auth will handle the authentication flow
      return { status: "success" };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";

    if (error instanceof z.ZodError) {
      return { status: "invalid_data", error: errorMessage };
    }

    return { status: "failed", error: errorMessage };
  }
};
