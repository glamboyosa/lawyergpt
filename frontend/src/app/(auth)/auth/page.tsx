"use client"

import { useActionState, useState } from "react"
import { signUp, logIn } from '@/app/actions/auth'
import { SubmitButton } from "../components/AuthFormButton"

export default function AuthForm() {
    const [isLogin, setIsLogin] = useState(true)
    const [loginFormState, loginFormAction] = useActionState(logIn, { status: "idle" });
    const [signUpFormState, signupFormAction] = useActionState(signUp, {status: "idle"});
    return (
      <div className="max-w-md w-full space-y-8 bg-stone-100 p-8 border-4 border-stone-800 rounded-lg shadow-[8px_8px_0px_0px_rgba(28,25,23,1)]">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-stone-800">
            {isLogin ? 'Log in' : 'Sign up'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" action={isLogin ? loginFormAction : signupFormAction}>
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-stone-700 mb-2">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border-4 border-stone-800 placeholder-stone-500 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-500 focus:z-10 sm:text-sm"
                placeholder="Your name"
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-stone-700 mb-2">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border-4 border-stone-800 placeholder-stone-500 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-500 focus:z-10 sm:text-sm"
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
            className="font-bold text-stone-600 hover:text-stone-800 underline"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Log in'}
          </button>
        </div>
      </div>
    )
  }