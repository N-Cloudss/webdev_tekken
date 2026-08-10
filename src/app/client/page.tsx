import Link from "next/link"

export default function Order() {
    return (
        <main className="min-h-screen bg-[#F6F4EB]">
            <div className="bg-white">
                <Link
                    href="/client/order"
                    className="text-black"
                >
                    order
                </Link>
            </div>
        </main>
    )   
}