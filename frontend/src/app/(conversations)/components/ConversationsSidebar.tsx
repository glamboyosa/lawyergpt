"use client";

import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/lib/store/sidebar";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { type PropsWithChildren, useCallback, useEffect } from "react";
const SidebarIcon = () => (
	<svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
		<title>Hamburger</title>
		<path
			d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1 7.5C1 7.22386 1.22386 7 1.5 7H13.5C13.7761 7 14 7.22386 14 7.5C14 7.77614 13.7761 8 13.5 8H1.5C1.22386 8 1 7.77614 1 7.5ZM1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z"
			fill="currentColor"
			fill-rule="evenodd"
			clip-rule="evenodd"
		/>
	</svg>
);

export default function ConversationsSidebar({
	id,
	userId,
	children,
}: PropsWithChildren<{ userId: string; id: string }>) {
	const sidebarOpen = useSidebarStore((state) => state.sidebarOpen);
	const setSidebarOpen = useSidebarStore((state) => state.setSidebarOpen);

	const isMobileWidth = useCallback(() => {
		if (typeof window !== "undefined") {
			return window.innerWidth < 768;
		}
		return false;
	}, []);

	const updateSidebarState = useCallback(() => {
		setSidebarOpen(!isMobileWidth());
	}, [isMobileWidth, setSidebarOpen]);

	useEffect(() => {
		const abortController = new AbortController();

		updateSidebarState();

		window.addEventListener("resize", updateSidebarState, { signal: abortController.signal });

		return () => abortController.abort();
	}, [updateSidebarState]);
	return (
		<>
			<Button
				onClick={() => setSidebarOpen(!sidebarOpen)}
				className="fixed top-4 left-4 z-50 rounded-md border-4 border-stone-800 bg-stone-200 p-2 text-black/60 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] hover:text-white"
			>
				<SidebarIcon />
			</Button>

			{/* Sidebar */}
			<AnimatePresence initial={false}>
				{sidebarOpen ? (
					<motion.div
						initial={{ x: "-100%" }}
						animate={{ x: 0 }}
						exit={{ x: "-100%" }}
						transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.3 }}
						className="fixed inset-y-0 left-0 z-50 w-64 border-stone-800 border-r-4 bg-white md:relative md:translate-x-0"
					>
						<div className="flex h-16 items-center justify-between border-stone-800 border-b-4 px-4">
							<Link href="/" className="font-bold text-stone-800 text-xl">
								LawyerGPT
							</Link>
							<Button
								disabled={window && window.innerWidth > 768}
								onClick={() => setSidebarOpen(false)}
								className="inline-flex items-center rounded-md border-2 border-stone-400 bg-stone-200 px-4 py-2 font-bold text-sm text-stone-800 shadow-[4px_4px_0px_0px_rgba(120,113,108,1)] transition-colors duration-200 hover:bg-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
							>
								Close
							</Button>
						</div>

						{children}
					</motion.div>
				) : null}
			</AnimatePresence>
		</>
	);
}
