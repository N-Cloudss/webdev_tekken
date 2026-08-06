import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
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

                <Link 
                    href="/login"
                    className="rounded-full border border-white/30 bg-white px-5 py-2 text-lg font-semibold text-[#4682A9] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F6F4EB] hover:shadow-lg"
                    >
                    Login
                </Link>
            </div>
        </header>
    );
}