import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

import { newId } from "@/lib/utils";

export const users = pgTable(
	"users",
	{
		id: varchar("id", { length: 191 })
			.primaryKey()
			.$defaultFn(() => newId("user")),
		name: text("name").notNull(),
		email: text("email").notNull().unique(),
		createdAt: timestamp("created_at").notNull().default(sql`now()`),
		updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
	},
	(table) => {
		return {
			emailIdx: uniqueIndex("email_idx").on(table.email),
		};
	},
);

// Schema for resources - used to validate API requests
export const insertUsersSchema = createSelectSchema(users).extend({}).omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

// Type for resources - used to type API request params and within Components
export type NewUsersParam = z.infer<typeof insertUsersSchema>;
