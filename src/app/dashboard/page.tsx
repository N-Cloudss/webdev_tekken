import Link from "next/link"

export default function Order() {
    return (
        <div className="bg-white">
            <Link
                href="/dashboard/order"
                className="text-black"
            >
                order
            </Link>
        </div>

    )   
}