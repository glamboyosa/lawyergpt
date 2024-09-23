import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { customAlphabet, nanoid } from "nanoid";

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
