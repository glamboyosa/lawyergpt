"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChat } from "ai/react";
import { Send, User } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { generateTitle } from "../actions/conversations";
import { ThinkingAnimation } from "./ThinkingAnimation";
import { MessageType } from "@/lib/db/schema/conversations";

const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

export default function ConversationContent({ conversationId, initialMessages }: { conversationId: string, initialMessages: Array<MessageType> }) {
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const [isFirstMessage, setIsFirstMessage] = useState(true);
	const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
        api: `/api/chat/${conversationId}`,
        initialMessages,
		onFinish: async (message) => {
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
		},
	});


	useEffect(() => {
		if (messages) {
			messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);
	useEffect(() => {
		if (error) {
			toast.error(error.message);
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
						disabled={isLoading}
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
