import Link from "next/link";

import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema/conversations";
import { cn } from "@/lib/utils";
import { desc, eq } from "drizzle-orm";

async function getConversations(userId: string) {
	const userConversations = await db
		.select()
		.from(conversations)
		.where(eq(conversations.userId, userId))
		.orderBy(desc(conversations.updatedAt))
		.limit(10);

	return userConversations;
}

export default async function ConversationSidebarContent({
	userId,
	currentConversationId,
}: { userId: string; currentConversationId: string }) {
	const userConversations = await getConversations(userId);

	return (
		<nav className="mt-4">
			{userConversations.map((conv) => (
				<Link
					key={conv.id}
					href={`/conversations/${conv.id}`}
					className={cn(
						"block px-4 py-2 text-stone-800 hover:bg-stone-200",
						currentConversationId === conv.id.toString() && "bg-stone-200 font-bold",
					)}
				>
					{conv.title || "Untitled Conversation"}
				</Link>
			))}
		</nav>
	);
}
