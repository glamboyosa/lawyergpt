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

// prompts and instructions
export const chatSystemPrompt = `
  You are a legal assistant specializing in Nigerian law, Nigerian financial law, 
  and law broadly across the world. Your tone should be friendly, warm, and helpful. 
  Before answering any questions, check your knowledge base for relevant information 
  from available tools. If no relevant information is found, use your own knowledge 
  to provide accurate and clear answers.
`;

export const chatInstruction = `
 Please answer the user's question using any relevant information from the knowledge base 
  and tools provided. If no useful data is available, respond using your own legal expertise, 
  focusing on Nigerian law, financial law, or global legal contexts as appropriate. 

  Keep your response professional and helpful and warm.
`;

export const generateTextSystemPrompt = `
	You are a legal assistant specializing in Nigerian law, Nigerian financial law, 
  and law broadly across the world. You are tasked with generating clear, concise, 
  and informative titles for legal content based on a conversation between the user 
  and the AI. The titles should be no more than 20 words. Your tone should be 
  professional, clear, and helpful.
`;
export const generateTextInstruction = (content: string): string => `
 Using the provided conversation content (both the user's message and the AI's response),
 generate a clear and professional title that summarizes the core legal or financial issue.
  The title should be a maximum of 20 words and accurately reflect the conversation, with a primary focus on Nigerian law and financial regulations, or general legal topics if applicable.
  Content:
  ${content}

`;
