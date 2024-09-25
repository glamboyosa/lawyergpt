import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema/conversations";
import { eq } from "drizzle-orm";
import { ArrowRight, MessageSquarePlus } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { Suspense, use } from "react";

async function fetchConversations() {
	// const userId = cookies().get('userId')!.value
	//  await db.select().from(conversations).where(eq(conversations.userId, userId))
	await new Promise((resolve) => setTimeout(resolve, 2000));
	return [
		{
			id: 1,
			title: "Legal Advice on Contract Dispute",
			lastMessage: "Thank you for the clarification. Based on the information...",
			timestamp: "2 hours ago",
		},
		{
			id: 2,
			title: "Intellectual Property Rights",
			lastMessage: "The process for registering a trademark involves several steps...",
			timestamp: "1 day ago",
		},
		{
			id: 3,
			title: "Employment Law Consultation",
			lastMessage: "Regarding your question about overtime pay, the Fair Labor Standards Act...",
			timestamp: "3 days ago",
		},
		{
			id: 4,
			title: "Real Estate Transaction Review",
			lastMessage: `I've reviewed the purchase agreement you sent. There are a few points we should discuss...`,
			timestamp: "1 week ago",
		},
	];
}

function ConversationsListContent() {
	const conversations = use(fetchConversations());

	if (conversations.length === 0) {
		return (
			<div className="text-center">
				<MessageSquarePlus className="mx-auto h-12 w-12 text-stone-400" />
				<h3 className="mt-2 font-semibold text-sm text-stone-900">No conversations</h3>
				<p className="mt-1 text-sm text-stone-500">Get started by creating a new conversation.</p>
				<div className="mt-6">
					<Link
						href="/conversations/new"
						className="inline-flex items-center rounded-md border-2 border-stone-400 bg-stone-200 px-4 py-2 font-bold text-sm text-stone-800 shadow-[4px_4px_0px_0px_rgba(120,113,108,1)] transition-colors duration-200 hover:bg-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
					>
						<MessageSquarePlus className="mr-2 h-5 w-5" aria-hidden="true" />
						New Conversation
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full max-w-4xl">
			<div className="mb-6 flex items-center justify-between">
				<h3 className="font-bold text-stone-800 text-xl">Your Conversations</h3>
				<Link
					href="/conversations/new"
					className="inline-flex items-center rounded-md border-2 border-stone-400 bg-stone-200 px-4 py-2 font-bold text-sm text-stone-800 shadow-[4px_4px_0px_0px_rgba(120,113,108,1)] transition-colors duration-200 hover:bg-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
				>
					Start Conversation
					<ArrowRight className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
				</Link>
			</div>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				{conversations.map((conversation) => (
					<Link key={conversation.id} href={`/conversations/${conversation.id}`}>
						<div className="rounded-lg border-4 border-stone-400 bg-white p-6 transition-shadow duration-200 hover:shadow-[8px_8px_0px_0px_rgba(120,113,108,1)]">
							<div className="flex items-start justify-between">
								<h4 className="font-bold text-lg text-stone-800">{conversation.title}</h4>
								<span className="inline-flex whitespace-nowrap rounded-full border-2 border-stone-400 bg-stone-200 px-2 py-1 font-semibold text-stone-800 text-xs leading-5">
									{conversation.timestamp}
								</span>
							</div>
							<p className="mt-2 line-clamp-2 text-sm text-stone-600">{conversation.lastMessage}</p>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}

function ConversationsListSkeleton() {
	return (
		<div className="w-full max-w-4xl">
			<div className="mb-6 flex items-center justify-between">
				<div className="h-6 w-48 rounded bg-stone-200" />
				<div className="h-10 w-40 rounded bg-stone-200" />
			</div>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				{Array.from({ length: 4 }, (_, i) => i + 1).map((i) => (
					<div key={i} className="rounded-lg border-4 border-stone-400 bg-white p-6">
						<div className="flex items-start justify-between">
							<div className="h-6 w-3/4 rounded bg-stone-200" />
							<div className="h-5 w-20 rounded-full bg-stone-200" />
						</div>
						<div className="mt-2 h-4 w-full rounded bg-stone-200" />
						<div className="mt-1 h-4 w-2/3 rounded bg-stone-200" />
					</div>
				))}
			</div>
		</div>
	);
}

export default function ConversationsList() {
	return (
		<Suspense fallback={<ConversationsListSkeleton />}>
			<ConversationsListContent />
		</Suspense>
	);
}
