import { google } from "@ai-sdk/google";
import { embed } from "ai";
import { cosineDistance, desc, gt, sql } from "drizzle-orm";
import { db } from "../db";
import { embeddings } from "../db/schema/embeddings";

export const generateEmbedding = async (value: string): Promise<number[]> => {
	const input = value.replaceAll("\\n", " ");
	const { embedding } = await embed({
		model: google.textEmbeddingModel("text-embedding-004", {
			outputDimensionality: 768,
		}),
		value: input,
	});
	return embedding;
};

export const findRelevantContent = async (userQuery: string) => {
	const userQueryEmbedded = await generateEmbedding(userQuery);
	const similarity = sql<number>`1 - (${cosineDistance(embeddings.embedding, userQueryEmbedded)})`;
	const similarGuides = await db
		.select({ name: embeddings.content, similarity })
		.from(embeddings)
		.where(gt(similarity, 0.25))
		.orderBy((t) => desc(t.similarity))
		.limit(8);
	return similarGuides;
};
