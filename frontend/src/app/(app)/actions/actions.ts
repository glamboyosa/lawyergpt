"use server";
import { db } from "@/lib/db";
import {
  conversations,
  insertConvoSchema,
} from "@/lib/db/schema/conversations";
import { redirect } from "next/navigation";
import "server-only";

export async function createNewConversation(userId: string) {
  try {
    const convo = insertConvoSchema.parse({
      userId,
      title: "",
    });
    const newConversation = await db
      .insert(conversations)
      .values(convo)
      .returning({ id: conversations.id });
    const newConversationId = newConversation[0].id;

    redirect(`/conversations/${newConversationId}`);
  } catch (error) {
    console.error("Failed to create new conversation:", error);
    return "Failed to create new conversation. Please try again.";
  }
}
