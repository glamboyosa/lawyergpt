import { type ClassValue, clsx } from "clsx";
import { nanoid } from "nanoid";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

const prefixes = {
	user: "user",
	convo: "convo",
	msg: "msg",
	embedding: "embedding",
	resource: "resource",
} as const;

export function newId(prefix: keyof typeof prefixes): string {
	const timestamp = Date.now().toString(36);
	return [prefixes[prefix], timestamp, nanoid(10)].join("_");
}
