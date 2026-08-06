import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer
            id="contact"
            className="w-full bg-slate-900 text-white"
        >
            <div className="mx-auto max-w-7xl px-4 py-16">
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <Image
                            src="/logo.svg"
                            alt="3dposm"
                            width={220}
                            height={60}
                            className="h-auto w-auto"
                        />
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold">Quick Links</h3>

                        <div className="mt-4 flex flex-col gap-3">
                            <Link
                                href="#hero"
                                className="text-slate-400 text-sm transition hover:text-white"
                            >
                                Home
                            </Link>

                            <Link
                                href="#how-it-works"
                                className="text-slate-400 text-sm transition hover:text-white"
                            >
                                how It Works
                            </Link>

                            <Link
                                href="#materials"
                                className="text-slate-400 text-sm transition hover:text-white"
                            >
                                Materials
                            </Link>

                            <Link
                                href="#contact"
                                className="text-slate-400 text-sm transition hover:text-white"
                            >
                                Contact
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold">Services</h3>

                        <div className="mt-4 flex flex-col gap-3">
                            <p className="text-sm text-slate-400">3D Printing</p>
                            <p className="text-sm text-slate-400">3D Viewer</p>
                            <p className="text-sm text-slate-400">Material Customization</p>
                            <p className="text-sm text-slate-400">Order Tracking</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold">Contact</h3>

                        <div className="mt-4 flex flex-col gap-3">
                            <p className="text-sm text-slate-400">support@3dposm.com</p>
                            <p className="text-sm text-slate-400">+6281234567890</p>
                            <p className="text-sm text-slate-400">Margonda Street No.5, Depok</p>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t border-slate-700 pt-6">
                    © 2026 3D POSM. All rights reserved.
                </div>
            </div>

        </footer>
    );
}