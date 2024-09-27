"use server";
import "server-only";
import { generateTextInstruction, generateTextSystemPrompt } from "@/lib/ai/prompts";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
const model = google("gemini-1.5-flash", {
	safetySettings: [
		{
			category: "HARM_CATEGORY_DANGEROUS_CONTENT",
			threshold: "BLOCK_ONLY_HIGH",
		},
	],
});
export async function generateTitle(conversationId: string, content: string) {
	try {
		const { text } = await generateText({
			model,
			system: generateTextSystemPrompt,
			prompt: generateTextInstruction(content),
			maxRetries: 2,
		});
	} catch (error) {
		return "Failed to generate title. Please try again later";
	}
}
