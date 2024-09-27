import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

import { newId } from "@/lib/utils";
import { users } from "./user";

export const conversations = pgTable("conversations", {
	id: varchar("id", { length: 191 })
		.primaryKey()
		.$defaultFn(() => newId("convo")),
	title: text("title").notNull(),
	userId: varchar("user_id", { length: 191 })
		.references(() => users.id, { onDelete: "cascade" }) // foreign key
		.notNull(),
	createdAt: timestamp("created_at").notNull().default(sql`now()`),
	updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const messages = pgTable("messages", {
	id: varchar("id", { length: 191 })
		.primaryKey()
		.$defaultFn(() => newId("msg")),
	conversationId: varchar("conversation_id", { length: 191 })
		.references(() => conversations.id, { onDelete: "cascade" })
		.notNull(),
	role: varchar("role", { length: 50 }).notNull(),
	content: text("content").notNull(),
	createdAt: timestamp("created_at").notNull().default(sql`now()`),
	updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Schema for inserting messages
export const insertMessageSchema = createSelectSchema(messages).omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

export const insertConvoSchema = createSelectSchema(conversations).omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

export const ConvoSchema = createSelectSchema(conversations);
export const messagesSchema = createSelectSchema(messages).omit({
	conversationId: true,
});
export type NewMessageParam = z.infer<typeof insertMessageSchema>;

export type MessageType = z.infer<typeof messagesSchema> & {
	role: "assistant" | "user" | "system" | "data";
};

export type ConversationsType = z.infer<typeof ConvoSchema>;

export type NewConvoParams = z.infer<typeof insertConvoSchema>;
