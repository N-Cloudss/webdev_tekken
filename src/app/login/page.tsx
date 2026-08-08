"use client";

import { useState } from "react"
import { Eye, EyeOff, } from "lucide-react";
import { login } from "@/services/auth"
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
            setError("");
    
            if (!email || !password) {
                setError("Please fill in all fields.");
                return;
            }
    
            try {
                setLoading(true);
                setError("");
    
                await login(email, password);
    
                router.push("/");
            } catch (err: any) {
                switch (err.code) {
                    case "auth/invalid-credential":
                        setError("Invalid email or password.");
                        break;
    
                    case "auth/user-not-found":
                        setError("Invalid email or password.");
                        break;
                    
                    case "auth/wrong-password":
                        setError("Invalid email or password.");
                        break;
                    
                    case "auth/invalid-email":
                        setError("Invalid email address.");
                        break;

                    default:
                        setError("Something went wrong.");
                }
            } finally {
                setLoading(false);
            }
        };

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#F6F4EB]">
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
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError("");
                            }}
                            disabled={loading}
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
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError("");
                                }}
                                disabled={loading}
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                className="w-full rounded-lg border border-black/30 bg-white/10 px-4 py-2 pr-10 text-black placeholder-gray-400 outline-none"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                disabled={loading}
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
                        type="button"
                        onClick={handleLogin}
                        disabled={loading}
                        className="mt-4 w-full rounded-lg bg-[#4682A9] py-2 font-semibold text-white transition-colors hover:bg-[#3A6D8C] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Logging in..." : "Log In"}
                    </button>

                    <p className="mt-4 text-center text-sm text-gray-700">
                        Don't have an account?{" "}
                        <Link className="font-semibold text-[#4682A9] hover:underline" href="/register">Sign Up</Link>
                    </p>
                </div>
            </div>
        </main>
    )
}