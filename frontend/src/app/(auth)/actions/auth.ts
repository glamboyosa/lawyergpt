"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/user";
import { eq } from "drizzle-orm";
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
	try {
		const validatedFields = signUpSchema.safeParse({
			name: formData.get("name"),
			email: formData.get("email"),
		});

		if (!validatedFields.success) {
			return { status: "Invalid input. Please check your details." };
		}

		await db.insert(users).values({
			name: validatedFields.data.name,
			email: validatedFields.data.email,
		});

		cookies().set("user", validatedFields.data.email, {
			expires: 604800000, // 7 days
		});
		cookies().set("name", validatedFields.data.name, {
			expires: 604800000, // 7 days
		});

		return { status: "success" };
	} catch {
		return { status: "error" };
	}
}

export async function logIn(prevState: State, formData: FormData) {
	try {
		const validatedFields = logInSchema.safeParse({
			email: formData.get("email"),
		});

		if (!validatedFields.success) {
			return { status: "Invalid email address." };
		}

		const existingUser = await db
			.select({ name: users.name })
			.from(users)
			.where(eq(users.email, validatedFields.data.email));

		if (!existingUser.length) {
			return { status: "User not found." };
		}

		const { name } = existingUser[0];

		cookies().set("user", validatedFields.data.email, {
			expires: 604800000, // 7 days
		});
		cookies().set("name", name, {
			expires: 604800000, // 7 days
		});

		return { status: "success" };
	} catch {
		return { status: "error" };
	}
}
