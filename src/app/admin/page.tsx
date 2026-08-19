"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Package,
    Clock3,
    Printer,
    CheckCircle2,
    RefreshCw,
} from "lucide-react";

import { auth } from "@/lib/firebase";

const ADMIN_EMAIL = "admin123@gmail.com";

type Order = {
    id: string;
    uid: string;
    email: string;
    name: string | null;
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

export default function AdminDashboard() {
    const router = useRouter();

    const [authLoading, setAuthLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user) {
                router.replace("/login");
                return;
            }

            if (user.email !== ADMIN_EMAIL) {
                router.replace("/client");
                return;
            }

            setIsAdmin(true);

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
                setAuthLoading(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    if (authLoading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F6F4EB]">
                <div className="text-center">
                    <RefreshCw
                        size={24}
                        className="mx-auto text-[#4682A9]"
                    />

                    <p className="mt-3 text-sm text-gray-500">
                        Checking admin access...
                    </p>
                </div>
            </main>
        );
    }

    if (!isAdmin) {
        return null;
    }

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

    return (
        <main className="min-h-screen bg-[#F6F4EB] text-[#111827]">
            <header className="border-b bg-white px-6 py-5 md:px-10">
                <p className="text-sm text-gray-500">
                    Admin Dashboard
                </p>

                <h1 className="mt-1 text-2xl font-bold text-[#0F172A]">
                    Order Management
                </h1>
            </header>

            <div className="p-6 md:p-10">
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
                    <div className="border-b px-6 py-5">
                        <h2 className="text-lg font-semibold text-[#0F172A]">
                            All Orders
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            All 3D printing orders from customers
                        </p>
                    </div>

                    {loading && (
                        <div className="px-6 py-8">
                            <p className="text-sm text-gray-500">
                                Loading orders...
                            </p>
                        </div>
                    )}

                    {!loading && !error && orders.length === 0 && (
                        <div className="px-6 py-8">
                            <p className="text-sm text-gray-500">
                                There are no orders yet.
                            </p>
                        </div>
                    )}

                    {!loading && !error && orders.length > 0 && (
                        <div className="divide-y">
                            {orders.map((order) => {
                                const status =
                                    order.status.toLowerCase();

                                return (
                                    <div
                                        key={order.id}
                                        className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between"
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
                                                    {order.name ?? "Unknown customer"}
                                                </p>

                                                <p className="text-sm text-gray-400">
                                                    {order.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-5">
                                            <div>
                                                <p className="text-xs text-gray-400">
                                                    Filament
                                                </p>

                                                <p className="text-sm font-medium text-gray-700">
                                                    {order.filament}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-400">
                                                    Infill
                                                </p>

                                                <p className="text-sm font-medium text-gray-700">
                                                    {order.infill}%
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-400">
                                                    Weight
                                                </p>

                                                <p className="text-sm font-medium text-gray-700">
                                                    {order.filamentUsedGrams} g
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-400">
                                                    Price
                                                </p>

                                                <p className="text-sm font-medium text-gray-700">
                                                    Rp{" "}
                                                    {order.price.toLocaleString(
                                                        "id-ID"
                                                    )}
                                                </p>
                                            </div>

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
                    )}
                </div>
            </div>
        </main>
    );
}