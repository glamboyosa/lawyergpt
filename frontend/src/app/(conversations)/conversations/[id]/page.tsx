import { db } from "@/lib/db";
import { type MessageType, messages as messageTable } from "@/lib/db/schema/conversations";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { Suspense } from "react";
import ConversationContent from "../../components/ConversationContent";
import ConversationSidebarWrapper from "../../components/ConversationSidebarWrapper";
import ConversationsSidebar from "../../components/ConversationsSidebar";
import { ConversationClientWrapper } from "../../components/Wrapper";
function SidebarSkeleton() {
	return (
		<div className="mt-4 space-y-2">
			{Array.from({ length: 45 }, (_, i) => i + 1).map((i) => (
				<div key={i} className="mx-4 h-8 rounded bg-stone-200" />
			))}
		</div>
	);
}
export default async function ConversationPage({ params }: { params: { id: string } }) {
	const user = cookies().get("userId")?.value;
	const name = cookies().get("name")?.value;
	const messages = await db
		.select()
		.from(messageTable)
		.where(eq(messageTable.conversationId, params.id));
	return (
		<ConversationClientWrapper>
			{/* Mobile Sidebar Toggle */}
			<ConversationsSidebar userId={user as string} id={params.id}>
				<ConversationSidebarWrapper userId={user as string} currentConversationId={params.id} />
			</ConversationsSidebar>
			{/* Main content */}
			<div className="flex flex-1 flex-col">
				<Suspense fallback={<ConversationSkeleton />}>
					<ConversationContent
						name={name as string}
						conversationId={params.id}
						initialMessages={messages as Array<MessageType>}
					/>
				</Suspense>
			</div>
		</ConversationClientWrapper>
	);
}
function ConversationSkeleton() {
	return (
		<div className="flex-1 space-y-4 p-4">
			<div className="h-8 w-28 animate-pulse justify-end rounded-full bg-stone-200" />
			<div className="h-20 w-28 flex-1 animate-pulse justify-start rounded bg-stone-200" />
		</div>
	);
}
