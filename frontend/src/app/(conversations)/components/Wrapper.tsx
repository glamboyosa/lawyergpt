"use client";

import { useSidebarStore } from "@/lib/store/sidebar";
import type { PropsWithChildren } from "react";

export default function ClientWrapper({
	children,
	className,
}: PropsWithChildren<{ className?: string }>) {
	return <div className={className}>{children}</div>;
}
export function ConversationClientWrapper({ children }: PropsWithChildren) {
	const sidebarOpen = useSidebarStore((state) => state.sidebarOpen);
	return (
		<div
			className={`grid h-screen ${sidebarOpen ? "grid-cols-[16rem,1fr]" : "grid-cols-1"} transition-all duration-300`}
		>
			{children}
		</div>
	);
}
