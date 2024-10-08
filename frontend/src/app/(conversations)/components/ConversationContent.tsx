"use client";

import { Button } from "@/components/ui/button";
import type { MessageType } from "@/lib/db/schema/conversations";
import { useSidebarStore } from "@/lib/store/sidebar";
import { cn } from "@/lib/utils";
import { useChat } from "ai/react";
import Avatar from "boring-avatars";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { generateTitle } from "../actions/conversations";
import { ThinkingAnimation } from "./ThinkingAnimation";
interface LimitStatus {
	success: boolean;
	remaining?: number;
	error?: string;
}
const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

async function fetchLimitStatus(): Promise<{
	success: boolean;
	remaining?: number;
	error?: string;
}> {
	try {
		const response = await fetch("/api/limit", {
			method: "GET",
			credentials: "include", // This ensures cookies are sent with the request
		});

		if (!response.ok) {
			throw new Error("Network response was not ok");
		}

		const data = await response.json();

		if (!data.success) {
			// Handle rate limiting
			if (data.remaining !== undefined) {
				console.log(`Rate limit remaining: ${data.remaining}`);
			}
			throw new Error(data.error || "An error occurred");
		}

		return data;
	} catch (error) {
		console.error("Error fetching limit status:", error);
		throw error;
	}
}
export default function ConversationContent({
	conversationId,
	name,
	initialMessages,
}: { conversationId: string; initialMessages: Array<MessageType>; name: string }) {
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const [isFirstMessage, setIsFirstMessage] = useState(true);
	const {
		data,
		error: remainingError,
		isLoading: loading,
		mutate,
	} = useSWR<LimitStatus>("/api/limit", fetchLimitStatus, {
		refreshInterval: 30000,
		revalidateOnFocus: false,
	});
	const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
		api: `/api/chat/${conversationId}`,
		initialMessages,
		onFinish: async (message) => {
			console.log("FINISH");
			try {
				if (isFirstMessage) {
					console.log("first message", message);
					console.log(messages);
					const result = await generateTitle(conversationId, `${message.content}`);
					if (typeof result === "string") {
						toast.error(result);
						return;
					}
					await mutate();
					setIsFirstMessage(false);
					console.log("ALL DOWN");
				}
			} catch (error) {
				console.log(error);
				toast.error("An error occurred");
			}
		},
	});
	const sidebarOpen = useSidebarStore((state) => state.sidebarOpen);

	useEffect(() => {
		if (messages) {
			messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);
	useEffect(() => {
		if (error) {
			toast.error(error.message || "Something went wrong");
		}
	}, [error]);
	console.log(data);
	console.log("is the sidebar open?", sidebarOpen);
	return (
		<>
			{/* Chat messages */}
			<div className="h-[85vh] space-y-4 overflow-x-clip overflow-y-auto p-4">
				{messages.map((message) => (
					<div
						key={message.id}
						className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
					>
						<div
							className={cn(
								"flex items-start space-x-2",
								message.role === "user" && "flex-row-reverse space-x-reverse",
							)}
						>
							<div className="size-8 flex-shrink-0 overflow-hidden rounded-full border-2 border-stone-800">
								{message.role === "user" ? (
									<Avatar variant="beam" name={name} className=" text-stone-600" />
								) : (
									<Avatar variant="ring" name="LawyerGPT" />
								)}
							</div>
							<div
								className={cn(
									"min-w-44 max-w-xs rounded-lg p-3 sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl",
									message.role === "user"
										? "bg-stone-300 text-stone-800"
										: "border-4 border-stone-800 bg-white text-stone-800",
								)}
							>
								{message.content.length > 0 ? (
									<ReactMarkdown className="whitespace-pre-wrap">{message.content}</ReactMarkdown>
								) : (
									<ThinkingAnimation />
								)}
							</div>
						</div>
					</div>
				))}
				<div ref={messagesEndRef} />
			</div>

			{/* Input form */}
			<motion.div layout>
				<form
					onSubmit={handleSubmit}
					className="flex flex-col border-stone-800 border-t-4 bg-white p-4"
				>
					{
						<p className="mb-2">
							{data?.remaining === 0 ? 0 : data?.remaining || "Unlimited"} messages left
						</p>
					}
					<div className="flex items-center space-x-2">
						<textarea
							name="prompt"
							value={input}
							onChange={handleInputChange}
							placeholder="Type your message..."
							className="max-h-[calc(41h+2*var(--padding))] min-h-[calc(21h+2*var(--padding))] w-full rounded-md border-4 border-stone-800 p-[var(--padding)] px-[calc(var(--padding)+(1lh-1ex)/2)] [--padding] [field-sizing:content] focus:outline-none focus:ring-2 focus:ring-stone-500"
						/>
						<Button
							disabled={isLoading || data?.remaining === 0}
							type="submit"
							className="rounded-md border-4 border-stone-800 bg-stone-200 p-2 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] hover:bg-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-500"
						>
							<Send className="h-5 w-5 text-stone-600" />
						</Button>
					</div>
				</form>
			</motion.div>
		</>
	);
}
