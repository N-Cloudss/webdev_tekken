"use client";

import { useState } from "react";
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
    const [file, setFile] = useState<File | null>(null);

    const [infill, setInfill] = useState<string>("20");
    const [layerHeight, setLayerHeight] =
        useState<string>("0.20");
    const [wallThickness, setWallThickness] =
        useState<string>("0.8");
    const [filament, setFilament] =
        useState<string>("PLA");

    const [sliceResult, setSliceResult] =
        useState<SliceResult | null>(null);

    const [isSlicing, setIsSlicing] =
        useState<boolean>(false);

    const [isOrdering, setIsOrdering] =
        useState<boolean>(false);

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
        formData.append("layerHeight", layerHeight);
        formData.append("wallThickness", wallThickness);
        formData.append("filament", filament);

        try {
            const response = await fetch("/api/slice", {
                method: "POST",
                body: formData,
            });

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
                data.filamentUsedGrams === undefined ||
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

    const handlePlaceOrder = async (): Promise<void> => {
        if (!file) {
            alert("Please select an STL file.");
            return;
        }

        if (!sliceResult) {
            alert("Please slice the STL first.");
            return;
        }

        const user = auth.currentUser;

        if (!user) {
            alert("Please login first.");
            return;
        }

        setIsOrdering(true);

        try {
            const storageData = await uploadSTL(
                user.uid,
                file
            );

            if (!storageData?.path) {
                throw new Error(
                    "Failed to upload STL."
                );
            }

            const idToken =
                await user.getIdToken();

            const response = await fetch(
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
                        fileName: file.name,
                        storagePath:
                            storageData.path,

                        filament,
                        infill: Number(infill),
                        layerHeight:
                            Number(layerHeight),
                        wallThickness:
                            Number(wallThickness),

                        filamentUsedGrams:
                            sliceResult
                                .filamentUsedGrams,

                        price:
                            sliceResult.pricing
                                .totalPrice,
                    }),
                }
            );

            const data: OrderResponse =
                await response.json();

            if (!response.ok || !data.success) {
                alert(
                    data.error ||
                        "Failed to create order."
                );
                return;
            }

            alert(
                `Order created successfully!\nOrder ID: ${data.orderId}`
            );

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

    return (
        <main className="min-h-screen bg-[#F6F4EB] p-8">
            <h1 className="text-2xl font-semibold text-black">
                Create Order
            </h1>

            {/* STL File */}
            <div className="mt-6">
                <label className="font-medium text-black">
                    STL File
                </label>

                <input
                    type="file"
                    accept=".stl"
                    onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                    ) => {
                        setFile(
                            event.target.files?.[0] ||
                                null
                        );
                        setSliceResult(null);
                    }}
                    className="mt-2 block text-black"
                />

                {file && (
                    <p className="mt-2 text-sm text-gray-600">
                        Selected: {file.name}
                    </p>
                )}
            </div>

            {/* Infill */}
            <div className="mt-4">
                <label className="font-medium text-black">
                    Infill
                </label>

                <select
                    value={infill}
                    onChange={(
                        event: React.ChangeEvent<HTMLSelectElement>
                    ) => {
                        setInfill(event.target.value);
                        setSliceResult(null);
                    }}
                    className="mt-2 block rounded-lg border px-3 py-2 text-black"
                >
                    {Array.from(
                        { length: 18 },
                        (_, index) =>
                            (index + 2) * 5
                    ).map((value: number) => (
                        <option
                            key={value}
                            value={value}
                        >
                            {value}%
                        </option>
                    ))}
                </select>
            </div>

            {/* Layer Height */}
            <div className="mt-4">
                <label className="font-medium text-black">
                    Layer Height
                </label>

                <select
                    value={layerHeight}
                    onChange={(
                        event: React.ChangeEvent<HTMLSelectElement>
                    ) => {
                        setLayerHeight(
                            event.target.value
                        );
                        setSliceResult(null);
                    }}
                    className="mt-2 block rounded-lg border px-3 py-2 text-black"
                >
                    <option value="0.12">
                        0.12 mm
                    </option>
                    <option value="0.16">
                        0.16 mm
                    </option>
                    <option value="0.20">
                        0.20 mm
                    </option>
                    <option value="0.24">
                        0.24 mm
                    </option>
                    <option value="0.28">
                        0.28 mm
                    </option>
                </select>
            </div>

            {/* Wall Thickness */}
            <div className="mt-4">
                <label className="font-medium text-black">
                    Wall Thickness
                </label>

                <select
                    value={wallThickness}
                    onChange={(
                        event: React.ChangeEvent<HTMLSelectElement>
                    ) => {
                        setWallThickness(
                            event.target.value
                        );
                        setSliceResult(null);
                    }}
                    className="mt-2 block rounded-lg border px-3 py-2 text-black"
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

            {/* Filament */}
            <div className="mt-4">
                <label className="font-medium text-black">
                    Filament
                </label>

                <select
                    value={filament}
                    onChange={(
                        event: React.ChangeEvent<HTMLSelectElement>
                    ) => {
                        setFilament(
                            event.target.value
                        );
                        setSliceResult(null);
                    }}
                    className="mt-2 block rounded-lg border px-3 py-2 text-black"
                >
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

            {/* Slice */}
            <button
                type="button"
                onClick={handleSlice}
                disabled={
                    isSlicing ||
                    isOrdering
                }
                className="mt-6 rounded-lg bg-[#4682A9] px-5 py-2 font-semibold text-white disabled:opacity-50"
            >
                {isSlicing
                    ? "Slicing..."
                    : "Slice"}
            </button>

            {/* Slice Result */}
            {sliceResult && (
                <div className="mt-8 rounded-xl border bg-white p-6 text-black">
                    <h2 className="text-lg font-semibold">
                        Slicing Result
                    </h2>

                    <div className="mt-4 space-y-2">
                        <p>
                            Filament Used:{" "}
                            <strong>
                                {
                                    sliceResult
                                        .filamentUsedGrams
                                }{" "}
                                g
                            </strong>
                        </p>

                        <p>
                            Filament Cost:{" "}
                            <strong>
                                Rp{" "}
                                {sliceResult
                                    .pricing
                                    .filamentCost
                                    .toLocaleString(
                                        "id-ID"
                                    )}
                            </strong>
                        </p>

                        <p>
                            Printing Fee:{" "}
                            <strong>
                                Rp{" "}
                                {sliceResult
                                    .pricing
                                    .printingFee
                                    .toLocaleString(
                                        "id-ID"
                                    )}
                            </strong>
                        </p>

                        <p className="text-lg">
                            Total Price:{" "}
                            <strong>
                                Rp{" "}
                                {sliceResult
                                    .pricing
                                    .totalPrice
                                    .toLocaleString(
                                        "id-ID"
                                    )}
                            </strong>
                        </p>
                    </div>

                    {/* Place Order */}
                    <button
                        type="button"
                        onClick={
                            handlePlaceOrder
                        }
                        disabled={isOrdering}
                        className="mt-6 rounded-lg bg-green-600 px-5 py-2 font-semibold text-white disabled:opacity-50"
                    >
                        {isOrdering
                            ? "Creating Order..."
                            : "Place Order"}
                    </button>
                </div>
            )}
        </main>
    );
}