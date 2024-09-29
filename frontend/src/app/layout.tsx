import { Analytics } from "@vercel/analytics/react";
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
	twitter: {
		images: ["/home.jpg"],
		card: "summary_large_image",
		description: "AI-powered legal document processing and querying platform.",
		title: "LawyerGPT",
	},
	description: "AI-powered legal document processing and querying platform.",
	openGraph: {
		type: "website",
		images: ["/home.jpg"],
		url: "https://lawyergpt.glamboyosa.xyz",
		title: "LawyerGPT",
	},
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
				<Analytics />
			</body>
		</html>
	);
}
