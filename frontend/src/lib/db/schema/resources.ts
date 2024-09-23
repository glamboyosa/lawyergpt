import { newId } from "@/lib/utils";
import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export const resources = pgTable("resources", {
	id: varchar("id", { length: 191 })
		.primaryKey()
		.$defaultFn(() => newId("resource")),
	content: text("content").notNull(),

	createdAt: timestamp("created_at").notNull().default(sql`now()`),
	updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Schema for resources - used to validate API requests
export const insertResourceSchema = createSelectSchema(resources).extend({}).omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

// Type for resources - used to type API request params and within Components
export type NewResourceParams = z.infer<typeof insertResourceSchema>;
