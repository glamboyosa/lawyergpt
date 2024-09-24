import ConversationsList from "@/app/(app)/components/ConversationsList";
import FileUploadClient from "@/app/(app)/components/FileUpload";
import { LogOut } from "lucide-react";
import { cookies } from "next/headers";

export default function Home() {
	const currentHour = new Date().getHours();
	let greeting = "Good morning";
	if (currentHour >= 12 && currentHour < 18) {
		greeting = "Good afternoon";
	} else if (currentHour >= 18) {
		greeting = "Good evening";
	}
	const user = cookies().get("name")?.value ?? "Stranger";
	return (
		<div className="min-h-screen bg-stone-50 font-mono">
			<header className="bg-white shadow-[0px_2px_0px_0px_rgba(120,113,108,1)]">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
					<h1 className="font-bold text-2xl text-stone-800">LawyerGPT</h1>
					<form action="/api/logout" method="POST">
						<button
							type="submit"
							className="inline-flex items-center rounded-md border-2 border-stone-400 bg-stone-200 px-4 py-2 font-bold text-sm text-stone-800 shadow-[4px_4px_0px_0px_rgba(120,113,108,1)] transition-colors duration-200 hover:bg-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
						>
							<LogOut className="mr-2 h-4 w-4" />
							Sign Out
						</button>
					</form>
				</div>
			</header>

			<main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
				<div className="flex flex-col items-center space-y-8">
					<h2 className="font-bold text-3xl text-stone-800">
						{greeting}, {user}
					</h2>

					<div className="mx-auto w-full max-w-md">
						<FileUploadClient />
					</div>

					<ConversationsList />
				</div>
			</main>
		</div>
	);
}
