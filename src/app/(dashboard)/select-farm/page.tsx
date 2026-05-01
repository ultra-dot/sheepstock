"use client"

import React, { useState } from "react";
import { Plus, Warehouse, MapPin, Users, ArrowRight, LogOut, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { logout } from "@/app/actions/auth";

// Mock data for UI/UX demonstration
const mockFarms = [
    {
        id: "1",
        name: "MitraTani Farm Utama",
        location: "Bogor, Jawa Barat",
        livestockCount: 156,
        staffCount: 4,
        role: "Owner",
        image: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: "2",
        name: "Cabang Sukabumi",
        location: "Sukabumi, Jawa Barat",
        livestockCount: 42,
        staffCount: 1,
        role: "Owner",
        image: "https://images.unsplash.com/photo-1484557918186-7b4e59ad7335?q=80&w=800&auto=format&fit=crop"
    }
];

export default function SelectFarmPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Background Ornaments */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-5xl w-full z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <Warehouse className="text-white w-7 h-7" />
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">SheepStock</h1>
                        </div>
                        <h2 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 leading-tight">Selamat Datang Kembali!</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">Pilih peternakan yang ingin Anda kelola hari ini.</p>
                    </div>
                    
                    <button 
                        onClick={() => logout()}
                        className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm shadow-sm self-start md:self-auto"
                    >
                        <LogOut className="w-4 h-4" />
                        Keluar Akun
                    </button>
                </div>

                {/* Farm Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockFarms.map((farm) => (
                        <Link 
                            key={farm.id}
                            href="/dashboard" 
                            className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 transition-all duration-500"
                        >
                            {/* Image Overlay */}
                            <div className="h-48 w-full relative overflow-hidden">
                                <img src={farm.image} alt={farm.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                
                                <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                                    {farm.role}
                                </div>
                                
                                <div className="absolute bottom-4 left-6 right-6">
                                    <h3 className="text-xl font-black text-white truncate">{farm.name}</h3>
                                    <div className="flex items-center gap-1.5 text-white/70 text-xs mt-1 font-medium">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {farm.location}
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 flex flex-col flex-1">
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-700/50">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Populasi</p>
                                        <p className="text-xl font-black text-slate-900 dark:text-white">{farm.livestockCount} <span className="text-xs font-bold text-slate-400">Ekor</span></p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-700/50">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Tim</p>
                                        <p className="text-xl font-black text-slate-900 dark:text-white">{farm.staffCount} <span className="text-xs font-bold text-slate-400">Orang</span></p>
                                    </div>
                                </div>

                                <div className="mt-auto flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-black group-hover:gap-3 transition-all">
                                        Masuk Dashboard
                                        <ArrowRight className="w-4 h-4" />
                                    </span>
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {/* Add New Farm Card */}
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="group flex flex-col items-center justify-center p-12 bg-emerald-50/50 dark:bg-emerald-900/10 border-2 border-dashed border-emerald-200 dark:border-emerald-800 rounded-[2.5rem] hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-300 min-h-[400px]"
                    >
                        <div className="w-16 h-16 rounded-[2rem] bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 group-hover:rotate-90 transition-all duration-500 mb-6">
                            <Plus className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">Daftar Peternakan</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-center text-sm font-medium px-4">Ingin mengelola lokasi baru? Daftarkan peternakan Anda di sini.</p>
                    </button>
                </div>
            </div>

            {/* Create Farm Modal Placeholder */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                        onClick={() => setIsCreateModalOpen(false)}
                    />
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Daftarkan Peternakan Baru</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Lengkapi data dasar peternakan Anda.</p>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Nama Peternakan</label>
                                <input type="text" placeholder="Contoh: MitraTani Farm Cabang Bandung" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-900 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Lokasi (Kota/Kabupaten)</label>
                                <input type="text" placeholder="Contoh: Bandung, Jawa Barat" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-900 dark:text-white" />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button 
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    Batal
                                </button>
                                <button className="flex-[2] px-6 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all">
                                    Simpan & Lanjutkan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
