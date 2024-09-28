"use server";
import "server-only";
import { generateTextInstruction, generateTextSystemPrompt } from "@/lib/ai/prompts";
import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema/conversations";
import { env } from "@/lib/env";
import { google } from "@ai-sdk/google";
import { Ratelimit } from "@unkey/ratelimit";
import { generateText } from "ai";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
const model = google("gemini-1.5-flash", {
	safetySettings: [
		{
			category: "HARM_CATEGORY_DANGEROUS_CONTENT",
			threshold: "BLOCK_ONLY_HIGH",
		},
	],
});
const unkey = new Ratelimit({
	rootKey: env.UNKEY_ROOT_KEY,
	namespace: "/api/chat/[id]",
	limit: 10,
	duration: "1d",
});
export async function generateTitle(conversationId: string, content: string) {
	try {
		const { text } = await generateText({
			model,
			system: generateTextSystemPrompt,
			prompt: generateTextInstruction(content),
			maxRetries: 2,
		});
		db.update(conversations)
			.set({
				title: text,
			})
			.where(eq(conversations.id, conversationId));

		revalidatePath(`/conversations/${conversationId}`);
	} catch (error) {
		return "Failed to generate title. Please try again later";
	}
}
export async function remainingLimit() {
	const userId = cookies().get("userId")?.value;
	const user = cookies().get("user")?.value;
}
