"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    User,
    Settings,
    LogOut,
    Plus,
    Clock3,
    CheckCircle2,
    Printer,
} from "lucide-react";

import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
    collection,
    getDocs,
    query,
    where,
} from "firebase/firestore";

type Order = {
    id: string;
    fileName: string;
    filament: string;
    infill: number;
    layerHeight: number;
    wallThickness: number;
    filamentUsedGrams: number;
    price: number;
    status: string;
    createdAt?: {
        toMillis?: () => number;
    };
};

export default function ClientDashboard() {
    const router = useRouter();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push("/login");
                return;
            }

            try {
                setLoading(true);
                setError("");

                const ordersRef = collection(db, "orders");

                const ordersQuery = query(
                    ordersRef,
                    where("uid", "==", user.uid)
                );

                const snapshot = await getDocs(ordersQuery);

                const fetchedOrders: Order[] = snapshot.docs.map((doc) => {
                    const data = doc.data();

                    return {
                        id: doc.id,
                        fileName: data.fileName ?? "",
                        filament: data.filament ?? "",
                        infill: data.infill ?? 0,
                        layerHeight: data.layerHeight ?? 0,
                        wallThickness: data.wallThickness ?? 0,
                        filamentUsedGrams: data.filamentUsedGrams ?? 0,
                        price: data.price ?? 0,
                        status: data.status ?? "pending",
                        createdAt: data.createdAt,
                    };
                });

                fetchedOrders.sort((a, b) => {
                    const timeA = a.createdAt?.toMillis
                        ? a.createdAt.toMillis()
                        : 0;

                    const timeB = b.createdAt?.toMillis
                        ? b.createdAt.toMillis()
                        : 0;

                    return timeB - timeA;
                });

                setOrders(fetchedOrders);
            } catch (err) {
                console.error("GET ORDERS ERROR:", err);
                setError("Failed to load orders.");
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    const totalOrders = orders.length;

    const pendingOrders = orders.filter(
        (order) => order.status.toLowerCase() === "pending"
    ).length;

    const printingOrders = orders.filter(
        (order) => order.status.toLowerCase() === "printing"
    ).length;

    const completedOrders = orders.filter(
        (order) => order.status.toLowerCase() === "completed"
    ).length;

    const handleLogout = async () => {
        try {
            await auth.signOut();
            router.push("/login");
        } catch (err) {
            console.error("LOGOUT ERROR:", err);
        }
    };

    return (
        <main className="min-h-screen bg-[#F6F4EB] text-[#111827]">
            <div className="flex min-h-screen">

                {/* SIDEBAR */}
                <aside className="hidden w-64 flex-col bg-[#0F172A] text-white md:flex">

                    {/* Logo */}
                    <div className="border-b border-white/10 px-6 py-6">
                        <h1 className="text-xl font-bold">
                            3D POSM
                        </h1>

                        <p className="mt-1 text-xs text-gray-400">
                            3D Printing Service
                        </p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6">

                        <Link
                            href="/client"
                            className="mb-2 flex items-center gap-3 rounded-lg bg-[#4682A9] px-4 py-3 text-sm font-medium"
                        >
                            <LayoutDashboard size={18} />
                            Dashboard
                        </Link>

                        <Link
                            href="/client/order"
                            className="mb-2 flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
                        >
                            <Package size={18} />
                            Create Order
                        </Link>

                        <button
                            type="button"
                            className="mb-2 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
                        >
                            <User size={18} />
                            Profile
                        </button>

                        <button
                            type="button"
                            className="mb-2 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
                        >
                            <Settings size={18} />
                            Settings
                        </button>

                    </nav>

                    {/* Logout */}
                    <div className="border-t border-white/10 p-4">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <section className="flex-1">

                    {/* TOP BAR */}
                    <header className="flex items-center justify-between border-b bg-white px-6 py-5 md:px-10">

                        <div>
                            <p className="text-sm text-gray-500">
                                Customer Dashboard
                            </p>

                            <h2 className="text-2xl font-bold text-[#0F172A]">
                                Welcome back! 👋
                            </h2>
                        </div>

                        <Link
                            href="/client/order"
                            className="flex items-center gap-2 rounded-lg bg-[#4682A9] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                            <Plus size={18} />
                            New Order
                        </Link>

                    </header>

                    {/* CONTENT */}
                    <div className="p-6 md:p-10">

                        {/* SUMMARY CARDS */}
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

                            {/* Total Orders */}
                            <div className="rounded-xl bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Total Orders
                                        </p>

                                        <p className="mt-2 text-3xl font-bold text-[#0F172A]">
                                            {loading ? "..." : totalOrders}
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-[#E8F1F6] p-3 text-[#4682A9]">
                                        <Package size={22} />
                                    </div>
                                </div>
                            </div>

                            {/* Pending */}
                            <div className="rounded-xl bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Pending
                                        </p>

                                        <p className="mt-2 text-3xl font-bold text-[#0F172A]">
                                            {loading ? "..." : pendingOrders}
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-yellow-50 p-3 text-yellow-600">
                                        <Clock3 size={22} />
                                    </div>
                                </div>
                            </div>

                            {/* Printing */}
                            <div className="rounded-xl bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Printing
                                        </p>

                                        <p className="mt-2 text-3xl font-bold text-[#0F172A]">
                                            {loading ? "..." : printingOrders}
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                                        <Printer size={22} />
                                    </div>
                                </div>
                            </div>

                            {/* Completed */}
                            <div className="rounded-xl bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Completed
                                        </p>

                                        <p className="mt-2 text-3xl font-bold text-[#0F172A]">
                                            {loading ? "..." : completedOrders}
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-green-50 p-3 text-green-600">
                                        <CheckCircle2 size={22} />
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* RECENT ORDERS */}
                        <div className="mt-8 rounded-xl bg-white shadow-sm">

                            <div className="flex items-center justify-between border-b px-6 py-5">

                                <div>
                                    <h3 className="text-lg font-semibold text-[#0F172A]">
                                        Recent Orders
                                    </h3>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Your latest 3D printing orders
                                    </p>
                                </div>

                                <Link
                                    href="/client/order"
                                    className="text-sm font-medium text-[#4682A9] hover:underline"
                                >
                                    Create new order
                                </Link>

                            </div>

                            {/* Error */}
                            {error && (
                                <div className="px-6 py-5 text-sm text-red-500">
                                    {error}
                                </div>
                            )}

                            {/* Loading */}
                            {loading && !error && (
                                <div className="px-6 py-8 text-center text-sm text-gray-500">
                                    Loading orders...
                                </div>
                            )}

                            {/* Empty */}
                            {!loading && !error && orders.length === 0 && (
                                <div className="px-6 py-8 text-center text-sm text-gray-500">
                                    You don't have any orders yet.
                                </div>
                            )}

                            {/* Orders */}
                            {!loading && !error && orders.length > 0 && (
                                <div className="divide-y">

                                    {orders.slice(0, 5).map((order) => {

                                        const status = order.status.toLowerCase();

                                        const displayStatus =
                                            status.charAt(0).toUpperCase() +
                                            status.slice(1);

                                        return (
                                            <div
                                                key={order.id}
                                                className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                                            >

                                                <div className="flex items-center gap-4">

                                                    <div className="rounded-lg bg-[#E8F1F6] p-3 text-[#4682A9]">
                                                        <Package size={20} />
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-[#0F172A]">
                                                            ORD-{order.id.slice(0, 6).toUpperCase()}
                                                        </p>

                                                        <p className="text-sm text-gray-500">
                                                            {order.fileName} · {order.filament}
                                                        </p>
                                                    </div>

                                                </div>

                                                <div className="flex items-center gap-6">

                                                    <p className="font-medium text-gray-700">
                                                        Rp {order.price.toLocaleString("id-ID")}
                                                    </p>

                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                            status === "completed"
                                                                ? "bg-green-100 text-green-700"
                                                                : status === "printing"
                                                                ? "bg-blue-100 text-blue-700"
                                                                : "bg-yellow-100 text-yellow-700"
                                                        }`}
                                                    >
                                                        {displayStatus}
                                                    </span>

                                                </div>

                                            </div>
                                        );
                                    })}

                                </div>
                            )}

                        </div>

                    </div>
                </section>
            </div>
        </main>
    );
}