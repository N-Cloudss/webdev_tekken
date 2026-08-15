"use client";

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
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { logout } from "@/services/auth";

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
    createdAt: string;
};

type OrdersResponse = {
    success: boolean;
    orders?: Order[];
    error?: string;
};

export default function ClientDashboard() {
    const router = useRouter();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const user = auth.currentUser;

                if (!user) {
                    setError("You are not logged in.");
                    return;
                }

                const idToken = await user.getIdToken();

                const response = await fetch("/api/orders", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                });

                const data: OrdersResponse = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.error || "Failed to fetch orders."
                    );
                }

                setOrders(data.orders ?? []);
            } catch (error: unknown) {
                console.error(error);

                setError(
                    error instanceof Error
                        ? error.message
                        : "Something went wrong."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

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

    const recentOrders = [...orders].slice(0, 3);

    const handleLogout = async () => {
        try {
            await logout();
            router.push("/");
        } catch (error) {
            console.error("LOGOUT ERROR:", error);
        }
    };

    return (
        <main className="min-h-screen bg-[#F6F4EB] text-[#111827]">
            <div className="flex min-h-screen">
                <aside className="hidden w-64 flex-col bg-[#0F172A] text-white md:flex">
                    <div className="border-b border-white/10 px-6 py-6">
                        <h1 className="text-xl font-bold">
                            3D POSM
                        </h1>

                        <p className="mt-1 text-xs text-gray-400">
                            3D Printing Service
                        </p>
                    </div>

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

                <section className="flex-1">
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

                    <div className="p-6 md:p-10">
                        {loading && (
                            <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
                                <p className="text-sm text-gray-500">
                                    Loading orders...
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 rounded-xl bg-red-50 p-5">
                                <p className="text-sm text-red-600">
                                    {error}
                                </p>
                            </div>
                        )}

                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Total Orders
                                        </p>

                                        <p className="mt-2 text-3xl font-bold text-[#0F172A]">
                                            {totalOrders}
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-[#E8F1F6] p-3 text-[#4682A9]">
                                        <Package size={22} />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Pending
                                        </p>

                                        <p className="mt-2 text-3xl font-bold text-[#0F172A]">
                                            {pendingOrders}
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-yellow-50 p-3 text-yellow-600">
                                        <Clock3 size={22} />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Printing
                                        </p>

                                        <p className="mt-2 text-3xl font-bold text-[#0F172A]">
                                            {printingOrders}
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                                        <Printer size={22} />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Completed
                                        </p>

                                        <p className="mt-2 text-3xl font-bold text-[#0F172A]">
                                            {completedOrders}
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-green-50 p-3 text-green-600">
                                        <CheckCircle2 size={22} />
                                    </div>
                                </div>
                            </div>
                        </div>

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

                            <div className="divide-y">
                                {!loading &&
                                    !error &&
                                    recentOrders.length === 0 && (
                                        <div className="px-6 py-8">
                                            <p className="text-sm text-gray-500">
                                                You don't have any orders yet.
                                            </p>
                                        </div>
                                    )}

                                {recentOrders.map((order) => {
                                    const status =
                                        order.status.toLowerCase();

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
                                                        {order.fileName}
                                                    </p>

                                                    <p className="text-sm text-gray-500">
                                                        {order.filament} ·{" "}
                                                        {order.infill}% infill
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <p className="font-medium text-gray-700">
                                                    Rp{" "}
                                                    {order.price.toLocaleString(
                                                        "id-ID"
                                                    )}
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
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}