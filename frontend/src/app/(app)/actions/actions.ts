"use server";
import "server-only";
import { hasAuthCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  conversations,
  insertConvoSchema,
} from "@/lib/db/schema/conversations";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createNewConversation(userId: string) {
  const isAllowed = hasAuthCookie();
  if (!isAllowed) {
    redirect("/auth");
  }
  try {
    throw new Error("Error");
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
    // ideally use useActionState and co but this is fun
    console.error("Failed to create new conversation:", error);
    revalidatePath("/?error=A problem occurred creating a new conversation");
    redirect("/?error=A problem occurred creating a new conversation");
  }
}
