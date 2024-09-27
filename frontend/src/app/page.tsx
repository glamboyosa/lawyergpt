import ConversationsList from "@/app/(app)/components/ConversationsList";
import FileUploadClient from "@/app/(app)/components/FileUpload";
import ToastWrapper from "@/components/ToastWrapper";
import { cookies } from "next/headers";
import { SignOutButton } from "./(auth)/components/SignOutButton";

export default function Home({
	searchParams,
}: {
	searchParams: { error?: string };
}) {
	const error = searchParams.error ? decodeURIComponent(searchParams.error) : null;
	console.log("Error query param", error);
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

					<SignOutButton />
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
					<ToastWrapper error={error} />
				</div>
			</main>
		</div>
	);
}
