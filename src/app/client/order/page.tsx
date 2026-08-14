"use client";

import { useState } from "react";
import Link from "next/link";

export default function Order3DPrintPage() {
  const [formData, setFormData] = useState({
    projectName: "",
    fileUrl: "", // Link Google Drive / Dropbox file .STL / .OBJ
    material: "PLA",
    infill: "20%",
    layerHeight: "0.2mm (Standard)",
    color: "Hitam",
    quantity: 1,
    notes: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Data Pengajuan 3D Print:", formData);
    setIsSubmitted(true);
  };

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
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🖨️</span>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Form Order 3D Printing Service
            </h1>
          </div>
          <p className="text-slate-500 mb-8 text-sm">
            Kirimkan file 3D (`.stl`, `.obj`, `.3mf`) dan tentukan spesifikasi cetak. Admin akan menghitung gramasi filament/resin dan memberikan penawaran harga.
          </p>

          {isSubmitted ? (
            /* TAMPILAN SETELAH SUBMIT */
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                ✓
              </div>
              <h3 className="text-xl font-bold text-emerald-900">
                Pengajuan Cetak Berhasil Terkirim!
              </h3>
              <p className="text-sm text-emerald-700 max-w-md mx-auto">
                File 3D kamu sedang masuk antrean <span className="font-bold">"Pengecekan Admin (Slicing Process)"</span>. Admin akan menghitung estimasi berat & waktu cetak.
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
            /* FORM PARAMETER 3D PRINTING */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* 1. NAMA MODEL / NAMA PESANAN */}
              <div>
                <label className="block text-sm font-semibold mb-2">Nama Model / Pesanan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Casing Keychron K2 / Action Figure Batman"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 2. LINK FILE 3D (.STL / .OBJ) */}
              <div>
                <label className="block text-sm font-semibold mb-2">Link File 3D (.STL / .OBJ / .3MF)</label>
                <input
                  type="url"
                  required
                  placeholder="Paste link Google Drive / OneDrive / Thingiverse"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-400 mt-1">Pastikan akses link cloud milikmu sudah di-set Public / Anyone with link.</p>
              </div>

              {/* 3. PARAMETER BAHAN & INFILL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Jenis Material Filament / Resin</label>
                  <select
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="PLA">PLA+ (Standard, Bagus & Kuat)</option>
                    <option value="PETG">PETG (Tahan Panas & Bahan Kimia)</option>
                    <option value="ABS">ABS (Sangat Kuat & Tahan Benturan)</option>
                    <option value="TPU">TPU (Karet / Lentur / Flexible)</option>
                    <option value="Resin">Resin UV (Detail Sangat Tinggi / Miniature)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Kepadatan (Infill Density)</label>
                  <select
                    value={formData.infill}
                    onChange={(e) => setFormData({ ...formData, infill: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="15%">15% (Pajangan / Ringan)</option>
                    <option value="20%">20% (Standard / Rekomendasi)</option>
                    <option value="50%">50% (Kuat / Komponen Mekanikal)</option>
                    <option value="100%">100% (Padat Padat Total)</option>
                  </select>
                </div>
              </div>

              {/* 4. LAYER HEIGHT & WARNA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Presisi (Layer Height)</label>
                  <select
                    value={formData.layerHeight}
                    onChange={(e) => setFormData({ ...formData, layerHeight: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="0.12mm">0.12 mm (Sangat Halus)</option>
                    <option value="0.2mm (Standard)">0.20 mm (Standard - Balance)</option>
                    <option value="0.28mm">0.28 mm (Cepat / Rough)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Warna Filament</label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Hitam">Hitam</option>
                    <option value="Putih">Putih</option>
                    <option value="Abu-abu">Abu-abu</option>
                    <option value="Merah">Merah</option>
                    <option value="Biru">Biru</option>
                    <option value="Transparan">Transparan / Clear</option>
                  </select>
                </div>
              </div>

              {/* 5. JUMLAH PCS */}
              <div>
                <label className="block text-sm font-semibold mb-2">Jumlah Cetak (Pcs)</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 6. CATATAN TAMBAHAN */}
              <div>
                <label className="block text-sm font-semibold mb-2">Catatan Khusus (Opsional)</label>
                <textarea
                  rows={3}
                  placeholder="Misal: Perlu support khusus, skala dinaikkan 150%, minta penambahan lubang baut, dll..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              {/* INFO HARGA */}
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-800 flex justify-between items-center">
                <span>Estimasi Biaya Cetak:</span>
                <span className="font-bold text-amber-900 text-sm">Menunggu Perhitungan Slicer Admin</span>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md text-sm"
              >
                Kirim File & Minta Penawaran Harga
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}