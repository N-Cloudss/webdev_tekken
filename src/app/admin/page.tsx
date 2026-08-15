"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    Printer,
    User,
    Settings,
    LogOut,
    Clock3,
    CheckCircle2,
    Search,
    RefreshCw,
    FileText,
    Download,
    X,
    AlertCircle,
} from "lucide-react";

import { auth } from "@/lib/firebase";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

type Order = {
    id: string;
    uid?: string;

    name: string;
    email: string;

    fileName: string;
    storagePath?: string;

    filament: string;
    infill: number;
    layerHeight: number;
    wallThickness: number;

    filamentUsedGrams: number;
    price: number;

    status: string;
    createdAt: string;

    verifiedFilamentGrams?: number | null;
    verifiedPrice?: number | null;

    adminNotes?: string;
};

type OrdersResponse = {
    success: boolean;
    orders?: Order[];
    error?: string;
};

const ADMIN_EMAIL = "admin123@gmail.com";

export default function AdminDashboard() {
    const router = useRouter();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [filamentFilter, setFilamentFilter] = useState("all");

    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const [adminNotes, setAdminNotes] = useState("");
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const [downloading, setDownloading] = useState(false);

    const [toast, setToast] = useState<{
        message: string;
        type: "success" | "error";
    } | null>(null);

    /*
     * ==========================================
     * TOAST
     * ==========================================
     */

    const showToast = (
        message: string,
        type: "success" | "error" = "success"
    ) => {
        setToast({
            message,
            type,
        });

        setTimeout(() => {
            setToast(null);
        }, 3000);
    };

    /*
     * ==========================================
     * ADMIN AUTH CHECK
     * ==========================================
     */

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (!user) {
                router.replace("/login");
                return;
            }

            if (user.email !== ADMIN_EMAIL) {
                router.replace("/client");
                return;
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    /*
     * ==========================================
     * FETCH ORDERS
     * ==========================================
     */

    const fetchOrders = async () => {
        try {
            setLoading(true);

            const user = auth.currentUser;

            if (!user) {
                router.replace("/login");
                return;
            }

            if (user.email !== ADMIN_EMAIL) {
                router.replace("/client");
                return;
            }

            const idToken = await user.getIdToken();

            const params = new URLSearchParams();

            if (statusFilter !== "all") {
                params.append("status", statusFilter);
            }

            if (filamentFilter !== "all") {
                params.append("filament", filamentFilter);
            }

            if (searchTerm.trim()) {
                params.append("search", searchTerm.trim());
            }

            const response = await fetch(
                `/api/orders?${params.toString()}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                }
            );

            const data: OrdersResponse =
                await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.error ||
                        "Failed to fetch orders."
                );
            }

            setOrders(data.orders ?? []);
        } catch (error) {
            console.error(
                "FETCH ORDERS ERROR:",
                error
            );

            showToast(
                error instanceof Error
                    ? error.message
                    : "Gagal mengambil data order.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchOrders();
        }, 300);

        return () => clearTimeout(timeout);
    }, [
        searchTerm,
        statusFilter,
        filamentFilter,
    ]);

    /*
     * ==========================================
     * LOGOUT
     * ==========================================
     */

    const handleLogout = async () => {
        try {
            await auth.signOut();
            router.replace("/login");
        } catch (error) {
            console.error(
                "LOGOUT ERROR:",
                error
            );
        }
    };

    /*
     * ==========================================
     * OPEN ORDER DETAIL
     * ==========================================
     */

    const openOrder = (order: Order) => {
        setSelectedOrder(order);
        setAdminNotes(order.adminNotes ?? "");
        setModalOpen(true);
    };

    /*
     * ==========================================
     * DOWNLOAD STL
     * ==========================================
     */

    const handleDownloadFile = async () => {
        if (!selectedOrder) return;

        if (!selectedOrder.storagePath) {
            showToast(
                "Storage path file tidak tersedia.",
                "error"
            );

            return;
        }

        try {
            setDownloading(true);

            const storage = getStorage();

            const storageRef = ref(
                storage,
                selectedOrder.storagePath
            );

            const downloadUrl =
                await getDownloadURL(
                    storageRef
                );

            const response = await fetch(
                downloadUrl
            );

            if (!response.ok) {
                throw new Error(
                    "Gagal mengambil file."
                );
            }

            const blob =
                await response.blob();

            const blobUrl =
                window.URL.createObjectURL(
                    blob
                );

            const link =
                document.createElement("a");

            link.href = blobUrl;
            link.download =
                selectedOrder.fileName;

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(
                blobUrl
            );

            showToast(
                "File STL berhasil diunduh."
            );
        } catch (error) {
            console.error(
                "DOWNLOAD ERROR:",
                error
            );

            showToast(
                error instanceof Error
                    ? error.message
                    : "Gagal mengunduh file STL.",
                "error"
            );
        } finally {
            setDownloading(false);
        }
    };

    /*
     * ==========================================
     * UPDATE ORDER STATUS
     * ==========================================
     */

    const updateOrderStatus = async (
        newStatus: string
    ) => {
        if (!selectedOrder) return;

        try {
            setUpdatingStatus(true);

            const user = auth.currentUser;

            if (!user) {
                router.replace("/login");
                return;
            }

            if (user.email !== ADMIN_EMAIL) {
                router.replace("/client");
                return;
            }

            const idToken =
                await user.getIdToken();

            const response = await fetch(
                "/api/orders",
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization: `Bearer ${idToken}`,
                    },
                    body: JSON.stringify({
                        orderId:
                            selectedOrder.id,
                        status: newStatus,
                        adminNotes:
                            adminNotes.trim(),
                    }),
                }
            );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.error ||
                        "Gagal memperbarui status."
                );
            }

            showToast(
                `Status berhasil diubah menjadi ${newStatus}.`
            );

            setSelectedOrder((previous) =>
                previous
                    ? {
                          ...previous,
                          status: newStatus,
                          adminNotes:
                              adminNotes.trim(),
                      }
                    : null
            );

            await fetchOrders();
        } catch (error) {
            console.error(
                "UPDATE STATUS ERROR:",
                error
            );

            showToast(
                error instanceof Error
                    ? error.message
                    : "Gagal memperbarui status.",
                "error"
            );
        } finally {
            setUpdatingStatus(false);
        }
    };

    /*
     * ==========================================
     * METRICS
     * ==========================================
     */

    const totalOrders =
        orders.length;

    const pendingOrders =
        orders.filter(
            (order) =>
                order.status.toLowerCase() ===
                "pending"
        ).length;

    const printingOrders =
        orders.filter(
            (order) =>
                order.status.toLowerCase() ===
                "printing"
        ).length;

    const completedOrders =
        orders.filter(
            (order) =>
                order.status.toLowerCase() ===
                "completed"
        ).length;

    /*
     * ==========================================
     * STATUS BADGE
     * ==========================================
     */

    const renderStatusBadge = (
        status: string
    ) => {
        switch (
            status.toLowerCase()
        ) {
            case "completed":
                return (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        Completed
                    </span>
                );

            case "printing":
                return (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                        Printing
                    </span>
                );

            case "verified":
                return (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                        Verified
                    </span>
                );

            case "rejected":
                return (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                        Rejected
                    </span>
                );

            default:
                return (
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                        Pending
                    </span>
                );
        }
    };

    /*
     * ==========================================
     * LOADING ADMIN AUTH
     * ==========================================
     */

    if (loading && !auth.currentUser) {
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

    /*
     * ==========================================
     * PAGE
     * ==========================================
     */

    return (
        <main className="min-h-screen bg-[#F6F4EB] text-[#111827]">
            <div className="flex min-h-screen">

                {/* SIDEBAR */}

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
                            href="/admin"
                            className="mb-2 flex items-center gap-3 rounded-lg bg-[#4682A9] px-4 py-3 text-sm font-medium"
                        >
                            <LayoutDashboard
                                size={18}
                            />
                            Admin Dashboard
                        </Link>

                        <Link
                            href="/client"
                            className="mb-2 flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
                        >
                            <Package
                                size={18}
                            />
                            Customer Dashboard
                        </Link>

                        <button
                            type="button"
                            className="mb-2 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
                        >
                            <User
                                size={18}
                            />
                            Profile
                        </button>

                        <button
                            type="button"
                            className="mb-2 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
                        >
                            <Settings
                                size={18}
                            />
                            Settings
                        </button>

                    </nav>

                    <div className="border-t border-white/10 p-4">

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
                        >
                            <LogOut
                                size={18}
                            />
                            Logout
                        </button>

                    </div>
                </aside>

                {/* MAIN */}

                <section className="flex-1 overflow-x-hidden">

                    {/* HEADER */}

                    <header className="flex flex-col gap-4 border-b bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between md:px-10">

                        <div>
                            <p className="text-sm text-gray-500">
                                Administrator Portal
                            </p>

                            <h2 className="text-2xl font-bold text-[#0F172A]">
                                Order Management
                            </h2>
                        </div>

                        <div className="flex items-center gap-3">

                            <span className="rounded-lg bg-[#E8F1F6] px-3 py-2 text-xs font-medium text-[#4682A9]">
                                {ADMIN_EMAIL}
                            </span>

                            <button
                                type="button"
                                onClick={fetchOrders}
                                disabled={loading}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50"
                            >
                                <RefreshCw
                                    size={16}
                                    className={
                                        loading
                                            ? "animate-spin text-[#4682A9]"
                                            : ""
                                    }
                                />
                            </button>

                        </div>
                    </header>

                    {/* TOAST */}

                    {toast && (
                        <div
                            className={`fixed right-6 top-6 z-[100] flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
                                toast.type ===
                                "success"
                                    ? "bg-[#0F172A]"
                                    : "bg-red-600"
                            }`}
                        >
                            {toast.type ===
                            "success" ? (
                                <CheckCircle2
                                    size={18}
                                />
                            ) : (
                                <AlertCircle
                                    size={18}
                                />
                            )}

                            {toast.message}
                        </div>
                    )}

                    <div className="p-6 md:p-10">

                        {/* METRICS */}

                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

                            <MetricCard
                                title="Total Orders"
                                value={totalOrders}
                                icon={
                                    <Package
                                        size={22}
                                    />
                                }
                            />

                            <MetricCard
                                title="Pending"
                                value={pendingOrders}
                                icon={
                                    <Clock3
                                        size={22}
                                    />
                                }
                            />

                            <MetricCard
                                title="Printing"
                                value={printingOrders}
                                icon={
                                    <Printer
                                        size={22}
                                    />
                                }
                            />

                            <MetricCard
                                title="Completed"
                                value={
                                    completedOrders
                                }
                                icon={
                                    <CheckCircle2
                                        size={22}
                                    />
                                }
                            />

                        </div>

                        {/* ORDER TABLE */}

                        <div className="mt-8 rounded-xl bg-white shadow-sm">

                            {/* HEADER */}

                            <div className="flex flex-col gap-4 border-b px-6 py-5 lg:flex-row lg:items-center lg:justify-between">

                                <div>
                                    <h3 className="text-lg font-semibold text-[#0F172A]">
                                        Daftar Pesanan
                                    </h3>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Kelola pesanan customer dan
                                        download file STL.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3">

                                    {/* SEARCH */}

                                    <div className="relative min-w-[220px]">

                                        <Search
                                            size={16}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        />

                                        <input
                                            type="text"
                                            placeholder="Cari order, file, nama..."
                                            value={
                                                searchTerm
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setSearchTerm(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-xs outline-none focus:border-[#4682A9] focus:bg-white"
                                        />

                                    </div>

                                    {/* STATUS */}

                                    <select
                                        value={
                                            statusFilter
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setStatusFilter(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-[#4682A9]"
                                    >
                                        <option value="all">
                                            Semua Status
                                        </option>

                                        <option value="pending">
                                            Pending
                                        </option>

                                        <option value="verified">
                                            Verified
                                        </option>

                                        <option value="printing">
                                            Printing
                                        </option>

                                        <option value="completed">
                                            Completed
                                        </option>

                                        <option value="rejected">
                                            Rejected
                                        </option>
                                    </select>

                                    {/* FILAMENT */}

                                    <select
                                        value={
                                            filamentFilter
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setFilamentFilter(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-[#4682A9]"
                                    >
                                        <option value="all">
                                            Semua Material
                                        </option>

                                        <option value="PLA">
                                            PLA
                                        </option>

                                        <option value="PETG">
                                            PETG
                                        </option>

                                        <option value="ABS">
                                            ABS
                                        </option>
                                    </select>

                                </div>
                            </div>

                            {/* LOADING */}

                            {loading && (
                                <div className="px-6 py-12 text-center text-sm text-gray-500">
                                    <RefreshCw
                                        size={20}
                                        className="mx-auto mb-2 animate-spin text-[#4682A9]"
                                    />

                                    Memuat pesanan...
                                </div>
                            )}

                            {/* EMPTY */}

                            {!loading &&
                                orders.length ===
                                    0 && (
                                    <div className="px-6 py-12 text-center text-sm text-gray-500">
                                        Tidak ada pesanan.
                                    </div>
                                )}

                            {/* TABLE */}

                            {!loading &&
                                orders.length >
                                    0 && (
                                    <div className="overflow-x-auto">

                                        <table className="w-full text-left text-xs">

                                            <thead className="border-b bg-gray-50 font-semibold text-gray-600">

                                                <tr>

                                                    <th className="px-6 py-3.5">
                                                        Order
                                                    </th>

                                                    <th className="px-4 py-3.5">
                                                        Customer
                                                    </th>

                                                    <th className="px-4 py-3.5">
                                                        File
                                                    </th>

                                                    <th className="px-4 py-3.5">
                                                        Parameter
                                                    </th>

                                                    <th className="px-4 py-3.5">
                                                        Harga
                                                    </th>

                                                    <th className="px-4 py-3.5">
                                                        Status
                                                    </th>

                                                    <th className="px-6 py-3.5 text-right">
                                                        Aksi
                                                    </th>

                                                </tr>

                                            </thead>

                                            <tbody className="divide-y divide-gray-100">

                                                {orders.map(
                                                    (
                                                        order
                                                    ) => (
                                                        <tr
                                                            key={
                                                                order.id
                                                            }
                                                            className="transition hover:bg-gray-50"
                                                        >

                                                            {/* ORDER */}

                                                            <td className="px-6 py-4">

                                                                <p className="font-semibold text-[#0F172A]">
                                                                    ORD-
                                                                    {order.id
                                                                        .slice(
                                                                            0,
                                                                            6
                                                                        )
                                                                        .toUpperCase()}
                                                                </p>

                                                                <p className="mt-1 text-[11px] text-gray-400">
                                                                    {new Date(
                                                                        order.createdAt
                                                                    ).toLocaleDateString(
                                                                        "id-ID"
                                                                    )}
                                                                </p>

                                                            </td>

                                                            {/* CUSTOMER */}

                                                            <td className="px-4 py-4">

                                                                <p className="font-medium text-gray-900">
                                                                    {order.name ||
                                                                        "Customer"}
                                                                </p>

                                                                <p className="max-w-[150px] truncate text-[11px] text-gray-500">
                                                                    {
                                                                        order.email
                                                                    }
                                                                </p>

                                                            </td>

                                                            {/* FILE */}

                                                            <td className="px-4 py-4">

                                                                <div className="flex items-center gap-2">

                                                                    <div className="rounded bg-gray-100 p-2 text-gray-500">
                                                                        <FileText
                                                                            size={
                                                                                15
                                                                            }
                                                                        />
                                                                    </div>

                                                                    <span
                                                                        className="max-w-[160px] truncate font-medium text-gray-800"
                                                                        title={
                                                                            order.fileName
                                                                        }
                                                                    >
                                                                        {
                                                                            order.fileName
                                                                        }
                                                                    </span>

                                                                </div>

                                                            </td>

                                                            {/* PARAMETERS */}

                                                            <td className="px-4 py-4">

                                                                <p className="font-semibold text-gray-800">
                                                                    {
                                                                        order.filament
                                                                    }{" "}
                                                                    ·{" "}
                                                                    {
                                                                        order.infill
                                                                    }
                                                                    %
                                                                </p>

                                                                <p className="text-[11px] text-gray-500">
                                                                    Layer{" "}
                                                                    {
                                                                        order.layerHeight
                                                                    }
                                                                    mm · Wall{" "}
                                                                    {
                                                                        order.wallThickness
                                                                    }
                                                                    mm
                                                                </p>

                                                            </td>

                                                            {/* PRICE */}

                                                            <td className="px-4 py-4">

                                                                <p className="font-semibold text-gray-900">
                                                                    Rp{" "}
                                                                    {order.price.toLocaleString(
                                                                        "id-ID"
                                                                    )}
                                                                </p>

                                                                <p className="text-[11px] text-gray-500">
                                                                    {
                                                                        order.filamentUsedGrams
                                                                    }{" "}
                                                                    gram
                                                                </p>

                                                            </td>

                                                            {/* STATUS */}

                                                            <td className="px-4 py-4">
                                                                {renderStatusBadge(
                                                                    order.status
                                                                )}
                                                            </td>

                                                            {/* ACTION */}

                                                            <td className="px-6 py-4 text-right">

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openOrder(
                                                                            order
                                                                        )
                                                                    }
                                                                    className="rounded-lg bg-[#4682A9] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#3A6D8C]"
                                                                >
                                                                    Detail
                                                                </button>

                                                            </td>

                                                        </tr>
                                                    )
                                                )}

                                            </tbody>

                                        </table>

                                    </div>
                                )}

                        </div>
                    </div>
                </section>
            </div>

            {/* DETAIL MODAL */}

            {modalOpen &&
                selectedOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">

                        <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

                            {/* MODAL HEADER */}

                            <div className="flex items-center justify-between border-b bg-gray-50 px-6 py-4">

                                <div>
                                    <h3 className="font-bold text-[#0F172A]">
                                        Detail Pesanan
                                    </h3>

                                    <p className="mt-1 text-xs text-gray-500">
                                        ORD-
                                        {selectedOrder.id
                                            .slice(
                                                0,
                                                8
                                            )
                                            .toUpperCase()}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setModalOpen(
                                            false
                                        )
                                    }
                                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
                                >
                                    <X
                                        size={20}
                                    />
                                </button>

                            </div>

                            {/* BODY */}

                            <div className="max-h-[70vh] overflow-y-auto p-6">

                                <div className="space-y-5">

                                    {/* CUSTOMER */}

                                    <div className="rounded-xl border border-gray-200 p-4">

                                        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                                            Customer
                                        </h4>

                                        <div className="grid grid-cols-2 gap-4">

                                            <div>
                                                <p className="text-[11px] text-gray-500">
                                                    Nama
                                                </p>

                                                <p className="mt-1 text-sm font-medium">
                                                    {
                                                        selectedOrder.name
                                                    }
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-[11px] text-gray-500">
                                                    Email
                                                </p>

                                                <p className="mt-1 break-all text-sm font-medium">
                                                    {
                                                        selectedOrder.email
                                                    }
                                                </p>
                                            </div>

                                        </div>

                                    </div>

                                    {/* FILE */}

                                    <div className="rounded-xl border border-gray-200 p-4">

                                        <div className="flex items-center justify-between gap-4">

                                            <div className="flex min-w-0 items-center gap-3">

                                                <div className="rounded-lg bg-[#E8F1F6] p-3 text-[#4682A9]">
                                                    <FileText
                                                        size={
                                                            22
                                                        }
                                                    />
                                                </div>

                                                <div className="min-w-0">

                                                    <p className="text-xs text-gray-500">
                                                        File STL
                                                    </p>

                                                    <p className="truncate text-sm font-semibold text-gray-900">
                                                        {
                                                            selectedOrder.fileName
                                                        }
                                                    </p>

                                                </div>

                                            </div>

                                            <button
                                                type="button"
                                                onClick={
                                                    handleDownloadFile
                                                }
                                                disabled={
                                                    downloading ||
                                                    !selectedOrder.storagePath
                                                }
                                                className="flex shrink-0 items-center gap-2 rounded-lg bg-[#4682A9] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#3A6D8C] disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <Download
                                                    size={
                                                        15
                                                    }
                                                />

                                                {downloading
                                                    ? "Downloading..."
                                                    : "Download"}
                                            </button>

                                        </div>

                                    </div>

                                    {/* PRINT PARAMETERS */}

                                    <div className="rounded-xl border border-gray-200 p-4">

                                        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                                            Parameter Printing
                                        </h4>

                                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">

                                            <InfoItem
                                                label="Filament"
                                                value={
                                                    selectedOrder.filament
                                                }
                                            />

                                            <InfoItem
                                                label="Infill"
                                                value={`${selectedOrder.infill}%`}
                                            />

                                            <InfoItem
                                                label="Layer Height"
                                                value={`${selectedOrder.layerHeight} mm`}
                                            />

                                            <InfoItem
                                                label="Wall"
                                                value={`${selectedOrder.wallThickness} mm`}
                                            />

                                        </div>

                                    </div>

                                    {/* PRICE */}

                                    <div className="rounded-xl border border-gray-200 p-4">

                                        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                                            Estimasi Pesanan
                                        </h4>

                                        <div className="grid grid-cols-2 gap-4">

                                            <InfoItem
                                                label="Filament"
                                                value={`${selectedOrder.filamentUsedGrams} gram`}
                                            />

                                            <InfoItem
                                                label="Harga"
                                                value={`Rp ${selectedOrder.price.toLocaleString(
                                                    "id-ID"
                                                )}`}
                                            />

                                            {selectedOrder.verifiedFilamentGrams !=
                                                null && (
                                                <InfoItem
                                                    label="Verified Filament"
                                                    value={`${selectedOrder.verifiedFilamentGrams} gram`}
                                                />
                                            )}

                                            {selectedOrder.verifiedPrice !=
                                                null && (
                                                <InfoItem
                                                    label="Verified Price"
                                                    value={`Rp ${selectedOrder.verifiedPrice.toLocaleString(
                                                        "id-ID"
                                                    )}`}
                                                />
                                            )}

                                        </div>

                                    </div>

                                    {/* NOTES */}

                                    <div>

                                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                                            Catatan Admin
                                        </label>

                                        <textarea
                                            value={
                                                adminNotes
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setAdminNotes(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            rows={3}
                                            placeholder="Tambahkan catatan untuk pesanan ini..."
                                            className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-[#4682A9]"
                                        />

                                    </div>

                                    {/* STATUS */}

                                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                                        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                                            Update Status
                                        </p>

                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

                                            <button
                                                type="button"
                                                disabled={
                                                    updatingStatus
                                                }
                                                onClick={() =>
                                                    updateOrderStatus(
                                                        "verified"
                                                    )
                                                }
                                                className="rounded-lg bg-emerald-600 px-3 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                                            >
                                                Verified
                                            </button>

                                            <button
                                                type="button"
                                                disabled={
                                                    updatingStatus
                                                }
                                                onClick={() =>
                                                    updateOrderStatus(
                                                        "printing"
                                                    )
                                                }
                                                className="rounded-lg bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                Printing
                                            </button>

                                            <button
                                                type="button"
                                                disabled={
                                                    updatingStatus
                                                }
                                                onClick={() =>
                                                    updateOrderStatus(
                                                        "completed"
                                                    )
                                                }
                                                className="rounded-lg bg-purple-600 px-3 py-2.5 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                                            >
                                                Completed
                                            </button>

                                            <button
                                                type="button"
                                                disabled={
                                                    updatingStatus
                                                }
                                                onClick={() =>
                                                    updateOrderStatus(
                                                        "rejected"
                                                    )
                                                }
                                                className="rounded-lg bg-red-600 px-3 py-2.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                                            >
                                                Rejected
                                            </button>

                                        </div>

                                    </div>

                                </div>
                            </div>

                            {/* FOOTER */}

                            <div className="flex justify-end border-t bg-gray-50 px-6 py-3">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setModalOpen(
                                            false
                                        )
                                    }
                                    className="rounded-lg bg-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-300"
                                >
                                    Tutup
                                </button>

                            </div>

                        </div>
                    </div>
                )}
        </main>
    );
}

/*
 * ==========================================
 * SMALL COMPONENTS
 * ==========================================
 */

function MetricCard({
    title,
    value,
    icon,
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

                <div>
                    <p className="text-sm text-gray-500">
                        {title}
                    </p>

                    <p className="mt-2 text-3xl font-bold text-[#0F172A]">
                        {value}
                    </p>
                </div>

                <div className="rounded-lg bg-[#E8F1F6] p-3 text-[#4682A9]">
                    {icon}
                </div>

            </div>
        </div>
    );
}

function InfoItem({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div>
            <p className="text-[11px] text-gray-500">
                {label}
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-900">
                {value}
            </p>
        </div>
    );
}