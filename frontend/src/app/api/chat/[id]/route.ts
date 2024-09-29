import { findRelevantContent } from "@/lib/ai/embedding";
import { google } from "@/lib/ai/google";
import { chatSystemPrompt } from "@/lib/ai/prompts";
import { hasAuthCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import { messages as messagesTable } from "@/lib/db/schema/conversations";
import { env } from "@/lib/env";
import { Ratelimit } from "@unkey/ratelimit";
import { convertToCoreMessages, streamText, tool } from "ai";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
export const maxDuration = 30;

const unkey = new Ratelimit({
	rootKey: env.UNKEY_ROOT_KEY,
	namespace: "/api/chat/[id]",
	limit: 5,
	duration: "1d",
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
	const isAllowed = hasAuthCookie();
	if (!isAllowed) {
		return NextResponse.redirect(new URL("/new-location", req.url));
	}
	const { messages } = await req.json();
	const m = convertToCoreMessages(messages);
	const userMessage = m.at(-1)?.content as string;
	const conversationId = params.id;
	const userId = cookies().get("userId")?.value;
	const user = cookies().get("user")?.value;
	try {
		if (user !== env.PRIMARY_MAIL_I && user !== env.PRIMARY_MAIL_II) {
			const ratelimit = await unkey.limit(userId as string);

			if (!ratelimit.success) {
				return NextResponse.json(
					{ success: false, error: "Rate limit reached, try again later" },
					{ status: 429 },
				);
			}
		}
		const result = await streamText({
			model: google("gemini-1.5-flash"),
			maxSteps: 3,
			messages: m,
			system: chatSystemPrompt,
			tools: {
				getInformation: tool({
					description: "get information from your knowledge base to answer questions.",
					parameters: z.object({
						question: z.string().describe("the users question"),
					}),
					execute: async ({ question }) => findRelevantContent(question),
				}),
			},
			async onFinish(event) {
				// save user's and assistant message to DB
				await db.insert(messagesTable).values([
					{ content: userMessage, role: "user", conversationId },
					{ content: event.text, role: "assistant", conversationId },
				]);
			},
		});

		return result.toDataStreamResponse();
	} catch (error) {
		console.error(error);
		return NextResponse.json({ success: false, error: "An error occurred" }, { status: 500 });
	}
}
