"use client";

import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import ConversationSidebarContent from "./ConversationSidebarContent";
const SidebarIcon = () => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<title>sidebar icon</title>
		<path
			d="M4 6H20M4 12H20M4 18H20"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M9 3L8 21M16 3L15 21"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);
function SidebarSkeleton() {
	return (
		<div className="mt-4 space-y-2">
			{Array.from({ length: 45 }, (_, i) => i + 1).map((i) => (
				<div key={i} className="mx-4 h-8 rounded bg-stone-200" />
			))}
		</div>
	);
}
const isMobileWidth = () => window.innerWidth < 768;

export default function ConversationsSidebar({ id }: { id: string }) {
	const [sidebarOpen, setSidebarOpen] = useState(() => isMobileWidth());

	useEffect(() => {
		const abortController = new AbortController();
		const handleResize = () => {
			setSidebarOpen(isMobileWidth());
		};
		window.addEventListener("resize", handleResize, { signal: abortController.signal });

		return () => abortController.abort();
	}, []);
	return (
		<>
			<Button
				onClick={() => setSidebarOpen(!sidebarOpen)}
				className="fixed top-4 left-4 z-50 rounded-md border-4 border-stone-800 bg-stone-200 p-2 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] md:hidden"
			>
				<SidebarIcon />
			</Button>

			{/* Sidebar */}
			<AnimatePresence>
				{sidebarOpen && (
					<motion.div
						initial={{ x: "-100%" }}
						animate={{ x: 0 }}
						exit={{ x: "-100%" }}
						transition={{ type: "spring", stiffness: 300, damping: 30 }}
						className="fixed inset-y-0 left-0 z-50 w-64 border-stone-800 border-r-4 bg-white md:relative md:translate-x-0"
					>
						<div className="flex h-16 items-center justify-between border-stone-800 border-b-4 px-4">
							<Link href="/" className="font-bold text-stone-800 text-xl">
								LawyerGPT
							</Link>
							<Button className="md:hidden">
								<X className="h-6 w-6 text-stone-600" />
							</Button>
						</div>
						<Suspense fallback={<SidebarSkeleton />}>
							<ConversationSidebarContent userId="user123" currentConversationId={id} />
						</Suspense>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
