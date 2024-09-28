import { Suspense } from "react";
import ConversationSidebarContent from "./ConversationSidebarContent";

function SidebarSkeleton() {
	return (
		<div className="mt-4 space-y-2">
			{Array.from({ length: 45 }, (_, i) => i + 1).map((i) => (
				<div key={i} className="mx-4 h-8 rounded bg-stone-200" />
			))}
		</div>
	);
}

export default function ConversationSidebarWrapper({
	userId,
	currentConversationId,
}: { userId: string; currentConversationId: string }) {
	return (
		<Suspense fallback={<SidebarSkeleton />}>
			<ConversationSidebarContent userId={userId} currentConversationId={currentConversationId} />
		</Suspense>
	);
}
