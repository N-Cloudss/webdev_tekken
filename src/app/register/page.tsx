"use client";

import { useState } from "react"
import { Eye, EyeOff, } from "lucide-react";
import { useRouter } from "next/navigation";
import { register } from "@/services/auth";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        setError("");

        if (!name || !email || !password || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            await register(name, email, password);

            router.push("/login");
        } catch (err: any) {
            switch (err.code) {
                case "auth/email-already-in-use":
                    setError("Email is already registered.");
                    break;

                case "auth/invalid-email":
                    setError("Invalid email address.");
                    break;
                
                case "auth/weak-password":
                    setError("Password must be at least 6 characters.");
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
                    Register
                </h1>
                <div>
                    <div className="mt-4">
                        <label htmlFor="name" className="mb-2 block text-sm text-black">
                            Name
                        </label>
                        
                        <input
                            required
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setError("");
                            }}
                            disabled={loading}
                            placeholder="Name"
                            className="w-full rounded-lg border border-black/30 bg-white/10 px-4 py-2 text-black placeholder-gray-400 outline-none"
                        />
                    </div>

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
                                type={showPassword ? "text" : "password"}
                                disabled={loading}
                                placeholder="Password"
                                className="w-full rounded-lg border border-black/30 bg-white/10 px-4 py-2 pr-10 text-black placeholder-gray-400 outline-none"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label htmlFor="confirmPassword" className="mb-2 block text-sm text-black">
                            Confirm password
                        </label>

                        <div className="relative">
                            <input
                                required
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setError("");
                                }}
                                type={showPassword ? "text" : "password"}
                                disabled={loading}
                                placeholder="Confirm password"
                                className="w-full rounded-lg border border-black/30 bg-white/10 px-4 py-2 pr-10 text-black placeholder-gray-400 outline-none"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(prev => !prev)}
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
                        onClick={handleRegister}
                        disabled={loading}
                        className="mt-4 w-full rounded-lg bg-[#4682A9] py-2 font-semibold text-white transition-colors hover:bg-[#3A6D8C] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Creating Account..." : "Register"}
                    </button>

                    <p className="mt-4 text-center text-sm text-gray-700">
                        Already have an account?{" "}
                        <Link className="font-semibold text-[#4682A9] hover:underline" href="/login">Log In</Link>
                    </p>
                </div>
            </div>
        </main>
    )
}