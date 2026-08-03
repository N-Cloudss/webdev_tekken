"use client";

import { useState } from "react"
import { Eye, EyeOff, } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#D9EAFD]">
            <div className="w-[420px] rounded-3xl border border-black/30 bg-white/10 p-8 backdrop-blur-xl">
                <h1 className="text-center text-[30px] text-black font-semibold">
                    Login
                </h1>
                <div>
                    <div className="mt-4">
                        <label htmlFor="email" className="mb-2 block text-sm text-black">
                            Email
                        </label>
                        
                        <input
                            required
                            id="email"
                            type="email"
                            placeholder="Email"
                            className="w-full rounded-lg border border-black/30 bg-white/10 px-4 py-2 text-black placeholder-gray-400 outline-none"
                        />
                    </div>

                    <div className="mt-4">
                        <label htmlFor="password" className="mb-2 block text-sm text-black">
                            Password
                        </label>

                        <div className="relative">
                            <input
                                required
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                className="w-full rounded-lg border border-black/30 bg-white/10 px-4 py-2 pr-10 text-black placeholder-gray-400 outline-none"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="mt-2 text-sm text-red-500">
                            {error}
                        </p>
                    )}
                    <button
                        type="submit"
                        className="mt-4 w-full rounded-lg bg-[#4682A9] py-2 font-semibold text-white transition-colors hover:bg-[#3A6D8C]"
                    >
                        Login
                    </button>

                    <p className="mt-4 text-center text-sm text-gray-700">
                        Don't have an account?{" "}
                        <Link className="font-semibold text-[#4682A9] hover:underline" href="/register">Sign In</Link>
                    </p>
                </div>
            </div>
        </main>
    )
}