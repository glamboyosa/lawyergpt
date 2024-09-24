import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
const spaceGrotesk = Space_Grotesk({
	subsets: ["latin"],
	display: "swap",
});
export const metadata: Metadata = {
	title: "LawyerGPT",
	description: "AI-powered legal document processing and querying platform.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={spaceGrotesk.className}>
				{children}
				<Toaster />
			</body>
		</html>
	);
}
