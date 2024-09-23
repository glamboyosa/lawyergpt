import { text, varchar, timestamp, pgTable } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { newId } from "@/lib/utils";
import { users } from "./user";

// Conversations table (unchanged)
export const conversations = pgTable("conversations", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => newId("convo")),
  title: text("title").notNull(),
  userId: varchar("user_id", { length: 191 })
    .references(() => users.id, { onDelete: "cascade" }) // foreign key
    .notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

// Messages table
export const messages = pgTable("messages", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => newId("msg")),
  conversationId: varchar("conversation_id", { length: 191 })
    .references(() => conversations.id, { onDelete: "cascade" })
    .notNull(),
  role: varchar("role", { length: 50 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

// Schema for inserting messages
export const insertMessageSchema = createSelectSchema(messages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Schema for inserting conversations
export const insertConvoSchema = createSelectSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type for messages
export type NewMessageParam = z.infer<typeof insertMessageSchema>;
