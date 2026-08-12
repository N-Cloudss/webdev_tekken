"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { logout } from "@/services/auth";
import { getUserProfile } from "@/services/user";

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                const userProfile = await getUserProfile(currentUser.uid);
                setProfile(userProfile);
            } else {
                setProfile(null);
            }
        });

        return unsubscribe;
    }, []);

    const navLink = "relative text-lg font-medium tracking-wide text-white transition-colors duration-300 hover:text-[#F6F4EB] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[#F6F4EB] after:transition-all after:duration-300 after:ease-in-out hover:after:w-full";
    
    return (
        <header className="sticky top-0 w-full z-50 h-20 bg-[#4682A9] shadow-lg">
            <div className="mx-auto flex h-full items-center justify-between px-8">
                <Link href="/">
                    <Image
                        src="/logo.svg"
                        alt="3dposm"
                        width={220}
                        height={54}
                    />
                </Link>

                <nav className="hidden items-center gap-15 md:flex">
                    <Link
                        href="#hero"
                        className={navLink}
                    >
                        Home
                    </Link>

                    <Link
                        href="#how-it-works"
                        className={navLink}
                    >
                        How
                    </Link>

                    <Link
                        href="#materials"
                        className={navLink}
                    >
                        Materials
                    </Link>

                    <Link
                        href="#contact"
                        className={navLink}
                    >
                        Contact
                    </Link>
                </nav>

                {user ? (
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setDropdownOpen((prev) => !prev)}
                            className="rounded-full border border-white/30 bg-white px-5 py-2 text-lg font-semibold text-[#4682A9] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F6F4EB] hover:shadow-lg"
                        >
                            {profile?.name || user.email}
                        </button>

                        {dropdownOpen && (
                            <div className="absolute right-0 top-15.5 w-[200px] rounded-[10px] bg-[#263746] py-[15px] shadow-xl">
                                <div className="flex flex-col gap-2 px-[10px]">

                                    <Link 
                                        href="/"
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-2 rounded-md px-[7px] py-2 font-semibold text-[#D9EAFD] transition-all duration-300 hover:translate-x-[1px] hover:-translate-y-[1px] hover:bg-[#4682A9] hover:text-white"
                                    >
                                        {user.email}
                                    </Link>

                                    <Link 
                                        href="/client"
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-2 rounded-md px-[7px] py-2 font-semibold text-[#D9EAFD] transition-all duration-300 hover:translate-x-[1px] hover:-translate-y-[1px] hover:bg-[#4682A9] hover:text-white"
                                    >
                                        Dashboard
                                    </Link>
                                </div>

                                <div className="my-2 border-t-[1.5px] border-[#42434a]" />

                                <div className="px-[10px]">
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            await logout();
                                            setDropdownOpen(false)
                                        }}
                                        className="flex w-full items-center gap-2 rounded-md px-[7px] py-2 font-semibold text-[#48cae4] transition-all duration-300 hover:bg-[#001845]"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (<Link 
                    href="/login"
                    className="rounded-full border border-white/30 bg-white px-5 py-2 text-lg font-semibold text-[#4682A9] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F6F4EB] hover:shadow-lg"
                    >
                    Login
                </Link>
                )}
            </div>
        </header>
    );
}