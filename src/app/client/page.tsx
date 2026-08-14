"use client";

import Link from "next/link";
import { useState } from "react";

// Contoh Data Dummy Pesanan Client (Nanti diambil dari Supabase / Firebase)
const DUMMY_ORDERS = [
  {
    id: "3D-1001",
    projectName: "Action Figure Batman 15cm",
    material: "Resin UV",
    status: "Menunggu Pengecekan Admin",
    statusBadge: "bg-amber-100 text-amber-700 border-amber-200",
    price: "Menunggu Slicer",
    date: "15 Agu 2026",
  },
  {
    id: "3D-1002",
    projectName: "Casing Keychron K2 Custom",
    material: "PLA+ Black",
    status: "Menunggu Pembayaran",
    statusBadge: "bg-blue-100 text-blue-700 border-blue-200",
    price: "Rp 85.000",
    date: "14 Agu 2026",
  },
  {
    id: "3D-0998",
    projectName: "Bracket GPU Support",
    material: "PETG Grey",
    status: "Selesai",
    statusBadge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    price: "Rp 45.000",
    date: "10 Agu 2026",
  },
];

export default function CustomerDashboard() {
  const [orders] = useState(DUMMY_ORDERS);

  return (
    <main className="min-h-screen bg-[#F6F4EB] text-slate-800 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* WELCOME BANNER */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🖨️</span>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                Dashboard 3D Printing
              </h1>
            </div>
            <p className="text-slate-500 text-sm">
              Pantau status *slicing*, estimasi harga dari admin, dan riwayat cetakan 3D kamu.
            </p>
          </div>

          {/* TOMBOL MENUJU ORDER PAGE */}
          <Link
            href="/client/order"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl shadow-md transition-all hover:scale-[1.02] text-sm"
          >
            <span>+ Cetak File 3D Baru (.STL)</span>
          </Link>
        </div>

        {/* RINGKASAN STATISTIK */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase">Total Pesanan</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{orders.length} Item</h3>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-xs font-semibold text-amber-600 uppercase">Perlu Pengecekan Admin</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {orders.filter((o) => o.status.includes("Admin")).length} Pesanan
            </h3>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-xs font-semibold text-emerald-600 uppercase">Pesanan Selesai</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {orders.filter((o) => o.status === "Selesai").length} Pesanan
            </h3>
          </div>
        </div>

        {/* TABEL DAFTAR PESANAN CLIENT */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Daftar Pesanan Saya</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-medium">
                  <th className="pb-3 px-2">ID Order</th>
                  <th className="pb-3 px-2">Nama Model 3D</th>
                  <th className="pb-3 px-2">Material</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2">Harga Total</th>
                  <th className="pb-3 px-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-2 font-semibold text-slate-700">{item.id}</td>
                    <td className="py-4 px-2 font-bold text-slate-900">{item.projectName}</td>
                    <td className="py-4 px-2 text-slate-500">{item.material}</td>
                    <td className="py-4 px-2">
                      <span className={`inline-block text-xs px-2.5 py-1 rounded-full border font-medium ${item.statusBadge}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-2 font-semibold text-slate-900">{item.price}</td>
                    <td className="py-4 px-2 text-right">
                      {item.status === "Menunggu Pembayaran" ? (
                        <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition-all">
                          Bayar Sekarang
                        </button>
                      ) : (
                        <button className="text-slate-400 hover:text-slate-600 text-xs font-medium">
                          Detail
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}