"use client";

import { logIn, signUp } from "@/app/(auth)/actions/auth";
import { useActionState, useRef, useState } from "react";
import { SubmitButton } from "../components/AuthFormButton";

export default function AuthForm() {
	const [isLogin, setIsLogin] = useState(true);
	const [loginFormState, loginFormAction] = useActionState(logIn, {
		status: "idle",
	});
	const [signUpFormState, signupFormAction] = useActionState(signUp, {
		status: "idle",
	});
	const ref = useRef<HTMLFormElement | null>(null);
	return (
		<div className="flex h-screen items-center justify-center">
			<div className="w-full max-w-md space-y-8 rounded-lg border-4 border-stone-800 bg-stone-100 p-8 shadow-[8px_8px_0px_0px_rgba(28,25,23,1)]">
				<div>
					<h2 className="mt-6 text-center font-extrabold text-3xl text-stone-800">
						{isLogin ? "Log in" : "Sign up"}
					</h2>
				</div>
				<form
					ref={ref}
					className="mt-8 space-y-6"
					action={(formData) => {
						if (isLogin) {
							loginFormAction(formData);
						} else {
							signupFormAction(formData);
						}
						ref.current?.reset();
					}}
				>
					{!isLogin && (
						<div>
							<label htmlFor="name" className="mb-2 block font-bold text-sm text-stone-700">
								Name
							</label>
							<input
								id="name"
								name="name"
								type="text"
								required
								className="relative block w-full appearance-none rounded-md border-4 border-stone-800 px-3 py-2 text-stone-900 placeholder-stone-500 focus:z-10 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-500 sm:text-sm"
								placeholder="Your name"
							/>
						</div>
					)}
					<div>
						<label htmlFor="email" className="mb-2 block font-bold text-sm text-stone-700">
							Email address
						</label>
						<input
							id="email"
							name="email"
							type="email"
							autoComplete="email"
							required
							className="relative block w-full appearance-none rounded-md border-4 border-stone-800 px-3 py-2 text-stone-900 placeholder-stone-500 focus:z-10 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-500 sm:text-sm"
							placeholder="you@example.com"
						/>
					</div>
					<div>
						<SubmitButton state={isLogin ? loginFormState : signUpFormState} />
					</div>
				</form>
				<div className="text-center">
					<button
						type="button"
						onClick={() => setIsLogin(!isLogin)}
						className="font-bold text-stone-600 underline hover:text-stone-800"
					>
						{isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
					</button>
				</div>
			</div>
		</div>
	);
}
