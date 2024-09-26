"use server";
import "server-only";
import { hasAuthCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/user";
import { env } from "@/lib/env";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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
			return { status: "error" };
		}

		const u = await db
			.insert(users)
			.values({
				name: validatedFields.data.name,
				email: validatedFields.data.email,
			})
			.returning({
				id: users.id,
			});
		// ideally you make it a dictionary then deserialise but idgaf :)
		cookies().set("userId", u[0].id, {
			httpOnly: true,
			secure: env.NODE_ENV === "production",
			maxAge: 60 * 60 * 24 * 7, // 1 week
			path: "/",
		});
		cookies().set("user", validatedFields.data.email, {
			httpOnly: true,
			secure: env.NODE_ENV === "production",
			maxAge: 60 * 60 * 24 * 7, // 1 week
			path: "/",
		});
		cookies().set("name", validatedFields.data.name, {
			httpOnly: true,
			secure: env.NODE_ENV === "production",
			maxAge: 60 * 60 * 24 * 7, // 1 week
			path: "/",
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
			return { status: "error" };
		}

		const existingUser = await db
			.select({ name: users.name, id: users.id })
			.from(users)
			.where(eq(users.email, validatedFields.data.email));

		if (!existingUser.length) {
			return { status: "error" };
		}
		console.log("existing user", existingUser);
		const { name, id } = existingUser[0];

		cookies().set("userId", id, {
			httpOnly: true,
			secure: env.NODE_ENV === "production",
			maxAge: 60 * 60 * 24 * 7, // 1 week
			path: "/",
		});
		cookies().set("user", validatedFields.data.email, {
			httpOnly: true,
			secure: env.NODE_ENV === "production",
			maxAge: 60 * 60 * 24 * 7, // 1 week
			path: "/",
		});
		cookies().set("name", name, {
			httpOnly: true,
			secure: env.NODE_ENV === "production",
			maxAge: 60 * 60 * 24 * 7, // 1 week
			path: "/",
		});

		return { status: "success" };
	} catch {
		return { status: "error" };
	}
}
export async function logOut() {
	const isAllowed = hasAuthCookie();
	if (isAllowed) {
		cookies().delete("userId");
		cookies().delete("user");
		cookies().delete("name");
	}
	redirect("/auth");
}
