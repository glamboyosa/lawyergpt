"use client";

import { Button } from "@/components/ui/button";
import type { MessageType } from "@/lib/db/schema/conversations";
import { cn } from "@/lib/utils";
import { useChat } from "ai/react";
import { Send, User } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { generateTitle } from "../actions/conversations";
import { ThinkingAnimation } from "./ThinkingAnimation";
import useSWR from 'swr'
interface LimitStatus {
	success: boolean
	remaining?: number
	error?: string
  }
const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });
async function fetchLimitStatus(): Promise<{ success: boolean; remaining?: number; error?: string }> {
	try {
	  const response = await fetch('/api/limit', {
		method: 'GET',
		credentials: 'include', // This ensures cookies are sent with the request
	  });
  
	  if (!response.ok) {
		throw new Error('Network response was not ok');
	  }
  
	  const data = await response.json();
  
	  if (!data.success) {
		// Handle rate limiting
		if (data.remaining !== undefined) {
		  console.log(`Rate limit remaining: ${data.remaining}`);
		}
		throw new Error(data.error || 'An error occurred');
	  }
  
	  return data;
	} catch (error) {
	  console.error('Error fetching limit status:', error);
	  throw error;
	}
  }
export default function ConversationContent({
	conversationId,
	initialMessages,
}: { conversationId: string; initialMessages: Array<MessageType> }) {
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const [isFirstMessage, setIsFirstMessage] = useState(true);
	const { data, error: remainingError, isLoading: loading, mutate } = useSWR<LimitStatus>('/api/limit', fetchLimitStatus, {
		refreshInterval: 60000,
		revalidateOnFocus: false,
	  })
	const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
		maxSteps: 3,
		api: `/api/chat/${conversationId}`,
		initialMessages,
		onFinish: async (message) => {
			try {
				if (isFirstMessage) {
					const result = await generateTitle(
						conversationId,
						`${messages[0].content} ${message.content}`,
					);
					if (typeof result === "string") {
						toast.error(result);
						return;
					}
					setIsFirstMessage(false);
				}
				
			} catch (error) {
				
			}
		},
	});

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
	return (
		<>
			{/* Chat messages */}
			<div className="flex-1 space-y-4 overflow-y-auto p-4">
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
									<User className="h-full w-full p-1 text-stone-600" />
								) : (
									<Image
										src="/placeholder.svg?height=32&width=32"
										alt="AI Avatar"
										width={32}
										height={32}
									/>
								)}
							</div>
							<div
								className={cn(
									"max-w-xs rounded-lg p-3 sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl",
									message.role === "user"
										? "bg-stone-300 text-stone-800"
										: "border-4 border-stone-800 bg-white text-stone-800",
								)}
							>
								{message.content.length > 0 ? (
									<ReactMarkdown>{message.content}</ReactMarkdown>
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
			<form onSubmit={handleSubmit} className="border-stone-800 border-t-4 bg-white p-4">
				<div className="flex items-center space-x-2">
					<input
						type="text"
						name="prompt"
						value={input}
						onChange={handleInputChange}
						placeholder="Type your message..."
						className="flex-1 rounded-md border-4 border-stone-800 p-2 focus:outline-none focus:ring-2 focus:ring-stone-500"
					/>
					<Button
						disabled={isLoading || data && data?.remaining === 0}
						type="submit"
						className="rounded-md border-4 border-stone-800 bg-stone-200 p-2 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] hover:bg-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-500"
					>
						<Send className="h-5 w-5 text-stone-600" />
					</Button>
				</div>
			</form>
		</>
	);
}
