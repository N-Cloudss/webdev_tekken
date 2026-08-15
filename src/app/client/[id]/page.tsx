"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { supabase } from "@/lib/supabase";

import STLViewer from "@/components/STLViewer";

import { auth } from "@/lib/firebase";

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

type OrderResponse = {
    success: boolean;
    order?: Order;
    error?: string;
};

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();

    const orderId = params.id as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const user = auth.currentUser;

                if (!user) {
                    router.push("/login");
                    return;
                }

                const idToken = await user.getIdToken();

                const response = await fetch(
                    `/api/orders/${orderId}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${idToken}`,
                        },
                    }
                );

                const data: OrderResponse = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.error || "Failed to fetch order."
                    );
                }

                setOrder(data.order ?? null);
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

        if (orderId) {
            fetchOrder();
        }
    }, [orderId, router]);

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F6F4EB]">
                <p className="text-sm text-gray-500">
                    Loading order...
                </p>
            </main>
        );
    }

    if (error || !order) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center bg-[#F6F4EB]">
                <p className="text-sm text-red-500">
                    {error || "Order not found."}
                </p>

                <Link
                    href="/client"
                    className="mt-4 text-sm font-medium text-[#4682A9] hover:underline"
                >
                    Back to dashboard
                </Link>
            </main>
        );
    }

    const status = order.status.toLowerCase();

    const { data: storageData } = supabase.storage
        .from("3d-posm")
        .getPublicUrl(order.storagePath);
    
    const stlUrl = storageData.publicUrl;

    console.log("storagePath:", order.storagePath);
    console.log("STL URL:", stlUrl);

    return (
        <main className="min-h-screen bg-[#F6F4EB] text-[#111827]">
            <header className="flex items-center justify-between border-b bg-white px-6 py-5 md:px-10">
                <div>
                    <p className="text-sm text-gray-500">
                        Order Detail
                    </p>

                    <h1 className="text-2xl font-bold text-[#0F172A]">
                        {order.fileName}
                    </h1>
                </div>

                <Link
                    href="/client"
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                    <ArrowLeft size={18} />
                    Back
                </Link>
            </header>

            <div className="p-6 md:p-10">
                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="flex min-h-[500px] items-center justify-center rounded-xl bg-[#0F172A]">
                        <STLViewer
                            url={stlUrl}
                            grid
                            axes
                            wireframe={false}
                            autoRotate={false}
                        />
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-[#0F172A]">
                                Order Status
                            </h2>

                            <span
                                className={`mt-4 inline-block rounded-full px-4 py-2 text-sm font-medium ${
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

                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-[#0F172A]">
                                Order Details
                            </h2>

                            <div className="mt-5 space-y-4">
                                <div className="flex justify-between gap-4">
                                    <span className="text-sm text-gray-500">
                                        File
                                    </span>

                                    <span className="text-right text-sm font-medium">
                                        {order.fileName}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="text-sm text-gray-500">
                                        Filament
                                    </span>

                                    <span className="text-sm font-medium">
                                        {order.filament}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="text-sm text-gray-500">
                                        Infill
                                    </span>

                                    <span className="text-sm font-medium">
                                        {order.infill}%
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="text-sm text-gray-500">
                                        Layer Height
                                    </span>

                                    <span className="text-sm font-medium">
                                        {order.layerHeight} mm
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="text-sm text-gray-500">
                                        Wall Thickness
                                    </span>

                                    <span className="text-sm font-medium">
                                        {order.wallThickness} mm
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="text-sm text-gray-500">
                                        Filament Used
                                    </span>

                                    <span className="text-sm font-medium">
                                        {order.filamentUsedGrams} g
                                    </span>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex justify-between gap-4">
                                        <span className="font-medium text-gray-600">
                                            Total Price
                                        </span>

                                        <span className="text-lg font-bold text-[#0F172A]">
                                            Rp{" "}
                                            {order.price.toLocaleString(
                                                "id-ID"
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}