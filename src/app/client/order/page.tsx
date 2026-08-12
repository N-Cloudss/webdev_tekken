"use client";

import { useState } from "react";

export default function ClientOrder() {
    const [file, setFile] = useState<File | null>(null);

    const [infill, setInfill] = useState("20");
    const [layerHeight, setLayerHeight] = useState("0.20");
    const [wallThickness, setWallThickness] = useState("0.8");
    const [filament, setFilament] = useState("PLA");

    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleSlice = async () => {
        if (!file) {
            alert("Please select an STL file.");
            return;
        }

        setLoading(true);
        setResult(null);

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

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || "Failed to slice STL.");
                return;
            }

            setResult(data);
        } catch (error) {
            console.error(error);
            alert("Something went wrong.");
        } finally {
            setLoading(false);
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
                    onChange={(e) => {
                        setFile(e.target.files?.[0] || null);
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
                    onChange={(e) => setInfill(e.target.value)}
                    className="mt-2 block rounded-lg border px-3 py-2 text-black"
                >
                    {Array.from(
                        { length: 18 },
                        (_, index) => (index + 2) * 5
                    ).map((value) => (
                        <option key={value} value={value}>
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
                    onChange={(e) => setLayerHeight(e.target.value)}
                    className="mt-2 block rounded-lg border px-3 py-2 text-black"
                >
                    <option value="0.12">0.12 mm</option>
                    <option value="0.16">0.16 mm</option>
                    <option value="0.20">0.20 mm</option>
                    <option value="0.24">0.24 mm</option>
                    <option value="0.28">0.28 mm</option>
                </select>
            </div>

            {/* Wall Thickness */}
            <div className="mt-4">
                <label className="font-medium text-black">
                    Wall Thickness
                </label>

                <select
                    value={wallThickness}
                    onChange={(e) => setWallThickness(e.target.value)}
                    className="mt-2 block rounded-lg border px-3 py-2 text-black"
                >
                    <option value="0.4">0.4 mm</option>
                    <option value="0.8">0.8 mm</option>
                    <option value="1.2">1.2 mm</option>
                    <option value="1.6">1.6 mm</option>
                    <option value="2.0">2.0 mm</option>
                </select>
            </div>

            {/* Filament */}
            <div className="mt-4">
                <label className="font-medium text-black">
                    Filament
                </label>

                <select
                    value={filament}
                    onChange={(e) => setFilament(e.target.value)}
                    className="mt-2 block rounded-lg border px-3 py-2 text-black"
                >
                    <option value="PLA">PLA</option>
                    <option value="PETG">PETG</option>
                    <option value="ABS">ABS</option>
                </select>
            </div>

            {/* Slice */}
            <button
                type="button"
                onClick={handleSlice}
                disabled={loading}
                className="mt-6 rounded-lg bg-[#4682A9] px-5 py-2 font-semibold text-white disabled:opacity-50"
            >
                {loading ? "Slicing..." : "Slice"}
            </button>

            {/* Result */}
            {result && (
                <div className="mt-8 max-w-md rounded-xl bg-white p-6 text-black shadow">
                    <h2 className="text-xl font-semibold">
                        Slicing Result
                    </h2>

                    <div className="mt-4 space-y-2">
                        <p>
                            <strong>File:</strong>{" "}
                            {result.fileName}
                        </p>

                        <p>
                            <strong>Filament:</strong>{" "}
                            {result.configuration.filament}
                        </p>

                        <p>
                            <strong>Infill:</strong>{" "}
                            {result.configuration.infill}%
                        </p>

                        <p>
                            <strong>Layer Height:</strong>{" "}
                            {result.configuration.layerHeight} mm
                        </p>

                        <p>
                            <strong>Wall Thickness:</strong>{" "}
                            {result.configuration.wallThickness} mm
                        </p>

                        <p>
                            <strong>Filament Used:</strong>{" "}
                            {result.filamentUsedGrams} g
                        </p>
                    </div>

                    <div className="mt-6 border-t pt-4">
                        <h3 className="font-semibold">
                            Price Breakdown
                        </h3>

                        <div className="mt-2 space-y-2">
                            <p>
                                Filament: Rp{" "}
                                {result.pricing.filamentCost.toLocaleString(
                                    "id-ID"
                                )}
                            </p>

                            <p>
                                Printing Fee: Rp{" "}
                                {result.pricing.printingFee.toLocaleString(
                                    "id-ID"
                                )}
                            </p>

                            <p className="text-lg font-bold">
                                Total: Rp{" "}
                                {result.pricing.totalPrice.toLocaleString(
                                    "id-ID"
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}