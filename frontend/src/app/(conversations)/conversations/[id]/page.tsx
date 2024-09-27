import { db } from "@/lib/db";
import { type MessageType, messages as messageTable } from "@/lib/db/schema/conversations";
import { eq } from "drizzle-orm";
import { Suspense } from "react";
import ConversationContent from "../../components/ConversationContent";
import ConversationsSidebar from "../../components/ConversationsSidebar";

export default async function ConversationPage({ params }: { params: { id: string } }) {
	const messages = await db
		.select()
		.from(messageTable)
		.where(eq(messageTable.conversationId, params.id));
	return (
		<div className="flex h-screen bg-stone-100 font-mono">
			{/* Mobile Sidebar Toggle */}
			<ConversationsSidebar id={params.id} />
			{/* Main content */}
			<div className="flex flex-1 flex-col">
				<Suspense fallback={<ConversationSkeleton />}>
					<ConversationContent
						conversationId={params.id}
						initialMessages={messages as Array<MessageType>}
					/>
				</Suspense>
			</div>
		</div>
	);
}

function ConversationSkeleton() {
	return (
		<div className="flex-1 space-y-4 p-4">
			{Array.from({ length: 3 }, (_, i) => i + 1).map((i) => (
				<div key={i} className="flex items-start space-x-2">
					<div className="h-8 w-8 rounded-full bg-stone-200" />
					<div className="h-20 flex-1 rounded bg-stone-200" />
				</div>
			))}
		</div>
	);
}
