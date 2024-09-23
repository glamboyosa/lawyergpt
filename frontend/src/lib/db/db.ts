import { drizzle } from "drizzle-orm/neon-http";
import postgres from "postgres";
import { env } from "../env";

if (!env.DATABASE_URL) {
	throw new Error(`DATABASE_URL is not defined ${env}`);
}

const connection = postgres(env.DATABASE_URL, { max: 1 });

export const db = drizzle(connection);
