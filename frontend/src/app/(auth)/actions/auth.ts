"use server";

import { cookies } from "next/headers";
import { z } from "zod";
type State = {
	status: string;
};
const signUpSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email address"),
});

const logInSchema = z.object({
	email: z.string().email("Invalid email address"),
});

export async function signUp(prevState: State, formData: FormData) {
	const validatedFields = signUpSchema.safeParse({
		name: formData.get("name"),
		email: formData.get("email"),
	});

	if (!validatedFields.success) {
		return { status: "Invalid input. Please check your details." };
	}

	// Here you would typically create a new user in your database
	// For this example, we'll just simulate a successful sign-up
	await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

	cookies().set("user", validatedFields.data.email, {
		expires: 604800000,
	});
	return { status: "success" };
}

export async function logIn(prevState: State, formData: FormData) {
	const validatedFields = logInSchema.safeParse({
		email: formData.get("email"),
	});

	if (!validatedFields.success) {
		return { status: "Invalid email address." };
	}

	// Here you would typically verify the user's credentials
	// For this example, we'll just simulate a successful login
	await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
	cookies().set("user", validatedFields.data.email, {
		expires: 604800000,
	});
	return { status: "success" };
}
