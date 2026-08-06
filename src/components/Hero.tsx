import Link from "next/link";
import Image from "next/image";

export default function Hero() {
    return (
        <section
            id="hero"
            className="relative flex h-[650px] items-center justify-center scroll-mt-20"
        >
            <Image
                src="/3dp.png"
                alt="3dp"
                fill
                className="object-cover brightness-30"
            />

            <div className="relative z-10 text-center text-white">
                <h1 className="text-5xl font-semibold">
                    3D PRINTING SERVICE
                </h1>

                <p className="mt-5 max-w-xl text-base text-gray-200">
                    Upload your STL files, place custom orders,
                    and track the printing process in one platform.
                </p>

                <div className="mt-8">
                    <Link 
                        href="/login"
                        className="inline-block rounded-full bg-[#4682A9] px-8 py-3 text-lg font-semibold text-white transition hover:bg-[#3A6D8C]"
                    >
                        Start printing
                    </Link>
                </div>
            </div>
        </section>
    );
}