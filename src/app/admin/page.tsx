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

    const [selectedOrder, setSelectedOrder] =
        useState<Order | null>(null);

    const [selectedStatus, setSelectedStatus] = useState("");

    const [updatingStatus, setUpdatingStatus] = useState(false);

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

    const handleOpenOrder = (order: Order) => {
        setSelectedOrder(order);
        setSelectedStatus(order.status.toLowerCase());
    };

    const handleCloseOrder = () => {
        if (updatingStatus) return;

        setSelectedOrder(null);
        setSelectedStatus("");
    };

    const handleUpdateStatus = async () => {
        if (!selectedOrder || !selectedStatus) {
            return;
        }

        try {
            setUpdatingStatus(true);
            setError(null);

            const user = auth.currentUser;

            if (!user) {
                throw new Error("You are not authenticated.");
            }

            const idToken = await user.getIdToken();

            const response = await fetch(
                `/api/orders/${selectedOrder.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${idToken}`,
                    },
                    body: JSON.stringify({
                        status: selectedStatus,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.error ||
                        "Failed to update order status."
                );
            }

            // Update orders di React state
            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order.id === selectedOrder.id
                        ? {
                              ...order,
                              status: selectedStatus,
                          }
                        : order
                )
            );

            setSelectedOrder(null);
            setSelectedStatus("");
        } catch (error: unknown) {
            console.error(error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong."
            );
        } finally {
            setUpdatingStatus(false);
        }
    };

    if (authLoading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F6F4EB]">
                <div className="text-center">
                    <RefreshCw
                        size={24}
                        className="mx-auto animate-spin text-[#4682A9]"
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
        (order) =>
            order.status.toLowerCase() === "pending"
    ).length;

    const printingOrders = orders.filter(
        (order) =>
            order.status.toLowerCase() === "printing"
    ).length;

    const completedOrders = orders.filter(
        (order) =>
            order.status.toLowerCase() === "completed"
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

                    {/* Printing */}
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
                            <div className="flex items-center gap-3">
                                <RefreshCw
                                    size={18}
                                    className="animate-spin text-[#4682A9]"
                                />

                                <p className="text-sm text-gray-500">
                                    Loading orders...
                                </p>
                            </div>
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        orders.length === 0 && (
                            <div className="px-6 py-8">
                                <p className="text-sm text-gray-500">
                                    There are no orders yet.
                                </p>
                            </div>
                        )}

                    {!loading &&
                        !error &&
                        orders.length > 0 && (
                            <div className="divide-y">
                                {orders.map((order) => {
                                    const status =
                                        order.status.toLowerCase();

                                    return (
                                        <button
                                            key={order.id}
                                            type="button"
                                            onClick={() =>
                                                handleOpenOrder(
                                                    order
                                                )
                                            }
                                            className="flex w-full flex-col gap-4 px-6 py-5 text-left transition hover:bg-gray-50 md:flex-row md:items-center md:justify-between"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="rounded-lg bg-[#E8F1F6] p-3 text-[#4682A9]">
                                                    <Package
                                                        size={20}
                                                    />
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-[#0F172A]">
                                                        {
                                                            order.fileName
                                                        }
                                                    </p>

                                                    <p className="text-sm text-gray-500">
                                                        {order.name ??
                                                            "Unknown customer"}
                                                    </p>

                                                    <p className="text-sm text-gray-400">
                                                        {
                                                            order.email
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-5">
                                                <div>
                                                    <p className="text-xs text-gray-400">
                                                        Filament
                                                    </p>

                                                    <p className="text-sm font-medium text-gray-700">
                                                        {
                                                            order.filament
                                                        }
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-gray-400">
                                                        Infill
                                                    </p>

                                                    <p className="text-sm font-medium text-gray-700">
                                                        {
                                                            order.infill
                                                        }
                                                        %
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-gray-400">
                                                        Weight
                                                    </p>

                                                    <p className="text-sm font-medium text-gray-700">
                                                        {
                                                            order.filamentUsedGrams
                                                        }{" "}
                                                        g
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
                                                        status ===
                                                        "completed"
                                                            ? "bg-green-100 text-green-700"
                                                            : status ===
                                                              "printing"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                    }`}
                                                >
                                                    {order.status}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                </div>
            </div>

            {selectedOrder && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
                    onClick={handleCloseOrder}
                >
                    <div
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="mb-6">
                            <p className="text-sm text-gray-500">
                                Order Details
                            </p>

                            <h2 className="mt-1 text-xl font-bold text-[#0F172A]">
                                {selectedOrder.fileName}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                {selectedOrder.name ??
                                    "Unknown customer"}
                            </p>

                            <p className="text-sm text-gray-400">
                                {selectedOrder.email}
                            </p>
                        </div>

                        <div className="mb-6 grid grid-cols-2 gap-4">
                            <div className="rounded-lg bg-gray-50 p-4">
                                <p className="text-xs text-gray-400">
                                    Filament
                                </p>

                                <p className="mt-1 font-medium">
                                    {selectedOrder.filament}
                                </p>
                            </div>

                            <div className="rounded-lg bg-gray-50 p-4">
                                <p className="text-xs text-gray-400">
                                    Weight
                                </p>

                                <p className="mt-1 font-medium">
                                    {
                                        selectedOrder.filamentUsedGrams
                                    }{" "}
                                    g
                                </p>
                            </div>

                            <div className="rounded-lg bg-gray-50 p-4">
                                <p className="text-xs text-gray-400">
                                    Infill
                                </p>

                                <p className="mt-1 font-medium">
                                    {selectedOrder.infill}%
                                </p>
                            </div>

                            <div className="rounded-lg bg-gray-50 p-4">
                                <p className="text-xs text-gray-400">
                                    Layer Height
                                </p>

                                <p className="mt-1 font-medium">
                                    {
                                        selectedOrder.layerHeight
                                    }{" "}
                                    mm
                                </p>
                            </div>

                            <div className="rounded-lg bg-gray-50 p-4">
                                <p className="text-xs text-gray-400">
                                    Wall Thickness
                                </p>

                                <p className="mt-1 font-medium">
                                    {
                                        selectedOrder.wallThickness
                                    }{" "}
                                    mm
                                </p>
                            </div>

                            <div className="rounded-lg bg-gray-50 p-4">
                                <p className="text-xs text-gray-400">
                                    Price
                                </p>

                                <p className="mt-1 font-medium">
                                    Rp{" "}
                                    {selectedOrder.price.toLocaleString(
                                        "id-ID"
                                    )}
                                </p>
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="order-status"
                                className="text-sm font-medium text-gray-700"
                            >
                                Order Status
                            </label>

                            <select
                                id="order-status"
                                value={selectedStatus}
                                onChange={(event) =>
                                    setSelectedStatus(
                                        event.target.value
                                    )
                                }
                                disabled={updatingStatus}
                                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#4682A9] focus:ring-2 focus:ring-[#4682A9]/20 disabled:cursor-not-allowed disabled:bg-gray-100"
                            >
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

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={handleCloseOrder}
                                disabled={updatingStatus}
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleUpdateStatus}
                                disabled={
                                    updatingStatus ||
                                    selectedStatus ===
                                        selectedOrder.status.toLowerCase()
                                }
                                className="flex-1 rounded-lg bg-[#4682A9] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#3B7194] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {updatingStatus
                                    ? "Updating..."
                                    : "Update Status"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}