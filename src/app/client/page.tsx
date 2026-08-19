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
import Fuse from "fuse.js";
import { Search, SlidersHorizontal } from "lucide-react";

type Order = {
    id: string;
    fileName: string;
    storagePath: string;
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
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user) {
                router.replace("/login");
                return;
            }

            setIsAuthenticated(true);

            try {
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

    const fuse = new Fuse(orders, {
        keys: [
            "fileName",
            "filament",
            "status",
        ],
        threshold: 0.3,
    });

    const searchedOrders = search
        ? fuse.search(search).map((result) => result.item)
        : orders;

    const filteredOrders = searchedOrders.filter((order) => {
        if (statusFilter === "all") {
            return true;
        }

        return order.status.toLowerCase() === statusFilter;
    });

    const recentOrders = [...filteredOrders].sort((a, b) => {
        if (sortBy === "newest") {
            return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );
        }

        if (sortBy === "oldest") {
            return (
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            );
        }

        if (sortBy === "price-high") {
            return b.price - a.price;
        }

        if (sortBy === "price-low") {
            return a.price - b.price;
        }

        return 0;
    });

    const handleLogout = async () => {
        try {
            await logout();
            router.push("/");
        } catch (error) {
            console.error("LOGOUT ERROR:", error);
        }
    };

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F6F4EB]">
                <p className="text-sm text-gray-500">
                    Loading...
                </p>
            </main>
        );
    };

    if (!isAuthenticated) {
        return null;
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

                            <div className="border-b px-6 py-4">
                                <div className="flex flex-col gap-3 md:flex-row">
                                    {/* SEARCH */}
                                    <div className="relative flex-1">
                                        <Search
                                            size={18}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        />

                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(e.target.value)
                                            }
                                            placeholder="Search orders..."
                                            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#4682A9] focus:ring-2 focus:ring-[#4682A9]/20"
                                        />
                                    </div>

                                    {/* STATUS FILTER */}
                                    <div className="flex items-center gap-2">
                                        <SlidersHorizontal
                                            size={18}
                                            className="text-gray-400"
                                        />

                                        <select
                                            value={statusFilter}
                                            onChange={(e) =>
                                                setStatusFilter(e.target.value)
                                            }
                                            className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4682A9]"
                                        >
                                            <option value="all">
                                                All Status
                                            </option>

                                            <option value="pending">
                                                Pending
                                            </option>

                                            <option value="printing">
                                                Printing
                                            </option>

                                            <option value="completed">
                                                Completed
                                            </option>
                                        </select>
                                    </div>

                                    {/* SORT */}
                                    <select
                                        value={sortBy}
                                        onChange={(e) =>
                                            setSortBy(e.target.value)
                                        }
                                        className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4682A9]"
                                    >
                                        <option value="newest">
                                            Newest
                                        </option>

                                        <option value="oldest">
                                            Oldest
                                        </option>

                                        <option value="price-high">
                                            Price: High → Low
                                        </option>

                                        <option value="price-low">
                                            Price: Low → High
                                        </option>
                                    </select>
                                </div>
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
                                        <Link
                                            key={order.id}
                                            href={`/client/${order.id}`}
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
                                        </Link>
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