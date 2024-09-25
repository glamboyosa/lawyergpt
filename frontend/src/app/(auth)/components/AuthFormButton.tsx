"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Spinner } from "./Spinner";
const buttonCopy = {
	idle: "Submit",
	pending: <Spinner size={20} color="#fff" />,
	success: "Successful!",
};
export function SubmitButton({ state }: { state: { status: string } }) {
	const { pending } = useFormStatus();
	const router = useRouter();
	const buttonState =
		state.status === "success"
			? "success"
			: pending
				? "pending"
				: (state.status as "idle" | "pending" | "success");
	console.log(buttonState, pending, state.status);
	if (buttonState === "success") {
		setTimeout(() => {
			router.push("/");
		}, 1000);
	}
	useEffect(() => {
		if (state.status === "error") {
			toast.error("An error occurred");
		}
	}, [state]);
	return (
		<motion.button
			type="submit"
			className="w-full rounded-md border-4 border-stone-800 bg-stone-200 px-4 py-2 font-bold text-lg text-stone-800 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] hover:bg-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
			disabled={state.status === "error" || buttonState !== "idle"}
		>
			<AnimatePresence mode="popLayout" initial={false}>
				<motion.span
					className="flex w-full items-center justify-center text-white"
					transition={{ type: "spring", duration: 0.3, bounce: 0 }}
					initial={{ opacity: 0, y: -25 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 25 }}
					key={buttonState}
				>
					{buttonCopy[buttonState]}
				</motion.span>
			</AnimatePresence>
		</motion.button>
	);
}
