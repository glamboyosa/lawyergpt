"use client";

import { LogOut } from "lucide-react";
import { logOut } from "../actions/auth";

export function SignOutButton() {
	return (
		<button
			onClick={async () => {
				await logOut();
			}}
			type="submit"
			className="inline-flex items-center rounded-md border-2 border-stone-400 bg-stone-200 px-4 py-2 font-bold text-sm text-stone-800 shadow-[4px_4px_0px_0px_rgba(120,113,108,1)] transition-colors duration-200 hover:bg-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
		>
			<LogOut className="mr-2 h-4 w-4" />
			Sign Out
		</button>
	);
}
