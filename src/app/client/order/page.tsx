"use client";

import { useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { uploadSTL } from "@/services/storage";

type Pricing = {
    filamentPricePerGram: number;
    filamentCost: number;
    printingFee: number;
    totalPrice: number;
};

type SliceResult = {
    filamentUsedGrams: number;
    pricing: Pricing;
};

type SliceResponse = {
    success: boolean;
    filamentUsedGrams?: number;
    pricing?: Pricing;
    error?: string;
};

type OrderResponse = {
    success: boolean;
    orderId?: string;
    error?: string;
};

export default function ClientOrder() {
    // =========================
    // ORDER FORM STATE
    // =========================

    const [projectName, setProjectName] =
        useState<string>("");

    const [file, setFile] =
        useState<File | null>(null);

    const [filament, setFilament] =
        useState<string>("PLA");

    const [infill, setInfill] =
        useState<string>("20");

    const [layerHeight, setLayerHeight] =
        useState<string>("0.20");

    const [wallThickness, setWallThickness] =
        useState<string>("0.8");

    const [color, setColor] =
        useState<string>("Hitam");

    const [quantity, setQuantity] =
        useState<number>(1);

    const [notes, setNotes] =
        useState<string>("");

    // =========================
    // SLICING STATE
    // =========================

    const [sliceResult, setSliceResult] =
        useState<SliceResult | null>(null);

    const [isSlicing, setIsSlicing] =
        useState<boolean>(false);

    const [isOrdering, setIsOrdering] =
        useState<boolean>(false);

    const [isSubmitted, setIsSubmitted] =
        useState<boolean>(false);

    // =========================
    // SLICE
    // =========================

    const handleSlice = async (): Promise<void> => {
        if (!file) {
            alert("Please select an STL file.");
            return;
        }

        setIsSlicing(true);
        setSliceResult(null);

        const formData = new FormData();

        formData.append("file", file);
        formData.append("infill", infill);
        formData.append(
            "layerHeight",
            layerHeight
        );
        formData.append(
            "wallThickness",
            wallThickness
        );
        formData.append(
            "filament",
            filament
        );

        try {
            const response = await fetch(
                "/api/slice",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data: SliceResponse =
                await response.json();

            if (!response.ok || !data.success) {
                alert(
                    data.error ||
                        "Failed to slice STL."
                );
                return;
            }

            if (
                data.filamentUsedGrams ===
                    undefined ||
                !data.pricing
            ) {
                alert(
                    "Invalid response from slicing API."
                );
                return;
            }

            setSliceResult({
                filamentUsedGrams:
                    data.filamentUsedGrams,
                pricing: data.pricing,
            });
        } catch (error: unknown) {
            console.error(error);

            alert(
                "Something went wrong while slicing."
            );
        } finally {
            setIsSlicing(false);
        }
    };

    // =========================
    // PLACE ORDER
    // =========================

    const handlePlaceOrder =
        async (): Promise<void> => {
            if (!file) {
                alert(
                    "Please select an STL file."
                );
                return;
            }

            if (!sliceResult) {
                alert(
                    "Please slice the STL first."
                );
                return;
            }

            const user =
                auth.currentUser;

            if (!user) {
                alert(
                    "Please login first."
                );
                return;
            }

            setIsOrdering(true);

            try {
                // Upload STL to Supabase
                const storageData =
                    await uploadSTL(
                        user.uid,
                        file
                    );

                if (!storageData?.path) {
                    throw new Error(
                        "Failed to upload STL."
                    );
                }

                // Get Firebase ID Token
                const idToken =
                    await user.getIdToken();

                // Create order in backend
                const response =
                    await fetch(
                        "/api/orders",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json",
                                Authorization:
                                    `Bearer ${idToken}`,
                            },
                            body: JSON.stringify({
                                fileName:
                                    file.name,

                                storagePath:
                                    storageData.path,

                                filament,

                                infill:
                                    Number(
                                        infill
                                    ),

                                layerHeight:
                                    Number(
                                        layerHeight
                                    ),

                                wallThickness:
                                    Number(
                                        wallThickness
                                    ),

                                filamentUsedGrams:
                                    sliceResult
                                        .filamentUsedGrams,

                                price:
                                    sliceResult
                                        .pricing
                                        .totalPrice,
                            }),
                        }
                    );

                const data: OrderResponse =
                    await response.json();

                if (
                    !response.ok ||
                    !data.success
                ) {
                    alert(
                        data.error ||
                            "Failed to create order."
                    );
                    return;
                }

                setIsSubmitted(true);

                setSliceResult(null);
                setFile(null);
            } catch (error: unknown) {
                console.error(error);

                alert(
                    error instanceof Error
                        ? error.message
                        : "Something went wrong while creating the order."
                );
            } finally {
                setIsOrdering(false);
            }
        };

    // =========================
    // UI
    // =========================

    return (
        <main className="min-h-screen bg-[#F6F4EB] text-slate-800 p-6 md:p-12">
            <div className="max-w-3xl mx-auto">

                {/* BREADCRUMB */}

                <Link
                    href="/client"
                    className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6 font-medium"
                >
                    ← Kembali ke Dashboard
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">

                    {/* HEADER */}

                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">
                            🖨️
                        </span>

                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                            Form Order 3D Printing Service
                        </h1>
                    </div>

                    <p className="text-slate-500 mb-8 text-sm">
                        Kirimkan file 3D dan tentukan
                        spesifikasi cetak. Sistem akan
                        melakukan slicing dan menghitung
                        estimasi berat serta harga.
                    </p>

                    {/* SUCCESS */}

                    {isSubmitted ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-4">

                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                                ✓
                            </div>

                            <h3 className="text-xl font-bold text-emerald-900">
                                Pengajuan Cetak Berhasil Terkirim!
                            </h3>

                            <p className="text-sm text-emerald-700 max-w-md mx-auto">
                                File 3D kamu sudah masuk
                                ke antrean pengecekan
                                admin.
                            </p>

                            <div className="pt-2">
                                <Link
                                    href="/client"
                                    className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-all"
                                >
                                    Cek Status Pesanan
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">

                            {/* PROJECT NAME */}

                            <div>
                                <label className="block text-sm font-semibold mb-2">
                                    Nama Model / Pesanan
                                </label>

                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Casing Keychron K2 / Action Figure Batman"
                                    value={projectName}
                                    onChange={(
                                        event: React.ChangeEvent<HTMLInputElement>
                                    ) =>
                                        setProjectName(
                                            event.target
                                                .value
                                        )
                                    }
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* STL FILE */}

                            <div>
                                <label className="block text-sm font-semibold mb-2">
                                    File 3D (.STL)
                                </label>

                                <input
                                    type="file"
                                    accept=".stl"
                                    onChange={(
                                        event: React.ChangeEvent<HTMLInputElement>
                                    ) => {
                                        setFile(
                                            event.target
                                                .files?.[0] ??
                                                null
                                        );

                                        setSliceResult(
                                            null
                                        );
                                    }}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm"
                                />

                                {file && (
                                    <p className="text-xs text-slate-400 mt-1">
                                        File dipilih:{" "}
                                        {file.name}
                                    </p>
                                )}
                            </div>

                            {/* MATERIAL + INFILL */}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Jenis Material Filament
                                    </label>

                                    <select
                                        value={
                                            filament
                                        }
                                        onChange={(
                                            event: React.ChangeEvent<HTMLSelectElement>
                                        ) => {
                                            setFilament(
                                                event
                                                    .target
                                                    .value
                                            );

                                            setSliceResult(
                                                null
                                            );
                                        }}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="PLA">
                                            PLA+ (Standard,
                                            Bagus & Kuat)
                                        </option>

                                        <option value="PETG">
                                            PETG (Tahan
                                            Panas & Bahan
                                            Kimia)
                                        </option>

                                        <option value="ABS">
                                            ABS (Kuat &
                                            Tahan Benturan)
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Kepadatan (Infill Density)
                                    </label>

                                    <select
                                        value={
                                            infill
                                        }
                                        onChange={(
                                            event: React.ChangeEvent<HTMLSelectElement>
                                        ) => {
                                            setInfill(
                                                event
                                                    .target
                                                    .value
                                            );

                                            setSliceResult(
                                                null
                                            );
                                        }}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="15">
                                            15% (Pajangan /
                                            Ringan)
                                        </option>

                                        <option value="20">
                                            20% (Standard /
                                            Rekomendasi)
                                        </option>

                                        <option value="50">
                                            50% (Kuat /
                                            Komponen
                                            Mekanikal)
                                        </option>

                                        <option value="95">
                                            95% (Sangat
                                            Padat)
                                        </option>
                                    </select>
                                </div>
                            </div>

                            {/* LAYER HEIGHT + COLOR */}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Presisi (Layer Height)
                                    </label>

                                    <select
                                        value={
                                            layerHeight
                                        }
                                        onChange={(
                                            event: React.ChangeEvent<HTMLSelectElement>
                                        ) => {
                                            setLayerHeight(
                                                event
                                                    .target
                                                    .value
                                            );

                                            setSliceResult(
                                                null
                                            );
                                        }}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="0.12">
                                            0.12 mm (Sangat
                                            Halus)
                                        </option>

                                        <option value="0.16">
                                            0.16 mm (Halus)
                                        </option>

                                        <option value="0.20">
                                            0.20 mm (Standard -
                                            Balance)
                                        </option>

                                        <option value="0.24">
                                            0.24 mm
                                        </option>

                                        <option value="0.28">
                                            0.28 mm (Cepat /
                                            Rough)
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Warna Filament
                                    </label>

                                    <select
                                        value={
                                            color
                                        }
                                        onChange={(
                                            event: React.ChangeEvent<HTMLSelectElement>
                                        ) =>
                                            setColor(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="Hitam">
                                            Hitam
                                        </option>

                                        <option value="Putih">
                                            Putih
                                        </option>

                                        <option value="Abu-abu">
                                            Abu-abu
                                        </option>

                                        <option value="Merah">
                                            Merah
                                        </option>

                                        <option value="Biru">
                                            Biru
                                        </option>

                                        <option value="Transparan">
                                            Transparan / Clear
                                        </option>
                                    </select>
                                </div>
                            </div>

                            {/* WALL THICKNESS + QUANTITY */}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Wall Thickness
                                    </label>

                                    <select
                                        value={
                                            wallThickness
                                        }
                                        onChange={(
                                            event: React.ChangeEvent<HTMLSelectElement>
                                        ) => {
                                            setWallThickness(
                                                event
                                                    .target
                                                    .value
                                            );

                                            setSliceResult(
                                                null
                                            );
                                        }}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="0.4">
                                            0.4 mm
                                        </option>

                                        <option value="0.8">
                                            0.8 mm
                                        </option>

                                        <option value="1.2">
                                            1.2 mm
                                        </option>

                                        <option value="1.6">
                                            1.6 mm
                                        </option>

                                        <option value="2.0">
                                            2.0 mm
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Jumlah Cetak (Pcs)
                                    </label>

                                    <input
                                        type="number"
                                        min={1}
                                        value={
                                            quantity
                                        }
                                        onChange={(
                                            event: React.ChangeEvent<HTMLInputElement>
                                        ) =>
                                            setQuantity(
                                                Number(
                                                    event
                                                        .target
                                                        .value
                                                ) || 1
                                            )
                                        }
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* NOTES */}

                            <div>
                                <label className="block text-sm font-semibold mb-2">
                                    Catatan Khusus (Opsional)
                                </label>

                                <textarea
                                    rows={3}
                                    placeholder="Misal: Perlu support khusus, skala dinaikkan 150%, minta penambahan lubang baut, dll..."
                                    value={notes}
                                    onChange={(
                                        event: React.ChangeEvent<HTMLTextAreaElement>
                                    ) =>
                                        setNotes(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* SLICE BUTTON */}

                            <button
                                type="button"
                                onClick={
                                    handleSlice
                                }
                                disabled={
                                    isSlicing ||
                                    isOrdering
                                }
                                className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md text-sm"
                            >
                                {isSlicing
                                    ? "Slicing..."
                                    : "Slice Model"}
                            </button>

                            {/* SLICING RESULT */}

                            {sliceResult && (
                                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-amber-800">
                                            Estimasi Biaya Cetak
                                        </span>

                                        <span className="font-bold text-amber-900 text-sm">
                                            Rp{" "}
                                            {sliceResult
                                                .pricing
                                                .totalPrice
                                                .toLocaleString(
                                                    "id-ID"
                                                )}
                                        </span>
                                    </div>

                                    <div className="mt-2 flex justify-between items-center">
                                        <span className="text-xs text-amber-700">
                                            Estimasi Filament
                                        </span>

                                        <span className="font-semibold text-amber-800 text-xs">
                                            {
                                                sliceResult
                                                    .filamentUsedGrams
                                            }{" "}
                                            g
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* PLACE ORDER */}

                            <button
                                type="button"
                                onClick={
                                    handlePlaceOrder
                                }
                                disabled={
                                    isOrdering ||
                                    !sliceResult
                                }
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md text-sm"
                            >
                                {isOrdering
                                    ? "Mengirim Order..."
                                    : "Place Order"}
                            </button>

                            <p className="text-xs text-slate-400 text-center">
                                File STL akan di-upload
                                ke storage saat kamu
                                melakukan Place Order.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}