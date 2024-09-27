import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
import "dotenv/config";

export const env = createEnv({
	server: {
		NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
		DATABASE_URL: z.string().min(1),
		GEMINI_API_KEY: z.string().min(10),
		UNKEY_ROOT_KEY: z.string().min(10),
	},
	client: {
		NEXT_PUBLIC_UPLOADER_URL: z.string().url(),
	},
	// If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
	runtimeEnv: {
		NEXT_PUBLIC_UPLOADER_URL: process.env.NEXT_PUBLIC_UPLOADER_URL,
		UNKEY_ROOT_KEY: process.env.UNKEY_ROOT_KEY,
		NODE_ENV: process.env.NODE_ENV,
		DATABASE_URL: process.env.DATABASE_URL,
		GEMINI_API_KEY: process.env.GEMINI_API_KEY,
	},
});
