import { newId } from "@/lib/utils";
import { index, pgTable, text, varchar, vector } from "drizzle-orm/pg-core";
import { resources } from "./resources";

export const embeddings = pgTable(
	"embeddings",
	{
		id: varchar("id", { length: 191 })
			.primaryKey()
			.$defaultFn(() => newId("embedding")),
		resourceId: varchar("resource_id", { length: 191 }).references(() => resources.id, {
			onDelete: "cascade",
		}),
		content: text("content").notNull(),
		embedding: vector("embedding", { dimensions: 768 }).notNull(),
	},
	(table) => ({
		embeddingIndex: index("embeddingIndex").using("hnsw", table.embedding.op("vector_cosine_ops")),
	}),
);
