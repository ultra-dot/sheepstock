"use client"

import React, { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CreditCard, Check, Zap, Crown, Building2, AlertCircle, ArrowUpRight } from "lucide-react";

const tiers = [
    {
        name: "Free / Starter",
        price: "Gratis",
        description: "Cocok untuk peternak pemula atau hobi.",
        limits: [
            "Maksimal 20 ekor ternak",
            "Hanya 1 akun (Owner)",
            "Semua fitur pencatatan standar",
            "QR Code & Riwayat Medis"
        ],
        buttonText: "Paket Saat Ini",
        buttonClass: "bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-default",
        icon: <Zap className="w-6 h-6 text-emerald-500" />,
        highlight: false
    },
    {
        name: "Pro Farm",
        price: "Rp 150.000",
        period: "/ bulan",
        description: "Solusi lengkap untuk peternakan profesional.",
        limits: [
            "Maksimal 500 ekor ternak",
            "Hingga 10 akun Pegawai",
            "Laporan analitik mendalam",
            "Prioritas dukungan sistem"
        ],
        buttonText: "Upgrade ke Pro",
        buttonClass: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20",
        icon: <Crown className="w-6 h-6 text-amber-500" />,
        highlight: true
    },
    {
        name: "Enterprise",
        price: "Hubungi Kami",
        description: "Untuk industri peternakan skala besar.",
        limits: [
            "Kapasitas ternak tak terbatas",
            "Pegawai tidak terbatas",
            "Integrasi API & IoT Hardware",
            "Dedicated Account Manager"
        ],
        buttonText: "Tanya Penawaran",
        buttonClass: "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-black dark:hover:bg-white transition-all",
        icon: <Building2 className="w-6 h-6 text-blue-500" />,
        highlight: false
    }
];

export default function SubscriptionPage() {
    const [isEnterpriseModalOpen, setIsEnterpriseModalOpen] = useState(false);

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <header className="h-20 sticky top-0 z-30 bg-white/30 dark:bg-slate-950/30 backdrop-blur-md border-b border-emerald-500/10 px-4 md:px-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <SidebarTrigger />
                    <div className="flex items-center gap-2 sm:gap-3 ml-0 sm:ml-2 min-w-0">
                        <CreditCard className="text-emerald-500 w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                        <h2 className="text-base sm:text-xl font-bold tracking-tight truncate">Paket Langganan</h2>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                <div className="max-w-6xl mx-auto space-y-12">
                    {/* Page Intro */}
                    <div className="text-center max-w-2xl mx-auto space-y-4">
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Kembangkan Peternakan Anda</h2>
                        <p className="text-lg font-medium text-slate-500">Pilih paket yang sesuai dengan skala operasional peternakan Anda saat ini.</p>
                    </div>

                    {/* Current Plan Alert */}
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-5 text-center md:text-left flex-col md:flex-row">
                            <div className="w-16 h-16 rounded-3xl bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                                <Check className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-emerald-800 dark:text-emerald-400">Anda Menggunakan Paket Free</h3>
                                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-500 mt-1">Status: Aktif Selamanya • Sisa Kuota Ternak: 18/20 Ekor</p>
                            </div>
                        </div>
                        <button className="px-6 py-3 bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-black rounded-2xl border border-emerald-100 dark:border-emerald-800 shadow-sm hover:bg-emerald-50 transition-all text-sm">
                            Lihat Detail Penggunaan
                        </button>
                    </div>

                    {/* Tier Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {tiers.map((tier) => (
                            <div 
                                key={tier.name}
                                className={`relative flex flex-col p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border ${tier.highlight ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-slate-200 dark:border-slate-800'} shadow-xl hover:-translate-y-2 transition-all duration-500 overflow-hidden group`}
                            >
                                {tier.highlight && (
                                    <div className="absolute top-0 right-0 p-3 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-bl-3xl">
                                        Paling Populer
                                    </div>
                                )}

                                <div className="mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        {tier.icon}
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">{tier.name}</h3>
                                    <div className="flex items-baseline gap-1 mt-2">
                                        <span className="text-3xl font-black text-slate-900 dark:text-white">{tier.price}</span>
                                        {tier.period && <span className="text-slate-400 font-bold text-sm">{tier.period}</span>}
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium mt-3 leading-relaxed">{tier.description}</p>
                                </div>

                                <div className="space-y-4 mb-10 flex-1">
                                    {tier.limits.map((limit, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                                <Check className="w-3 h-3" />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{limit}</span>
                                        </div>
                                    ))}
                                </div>

                                <button 
                                    onClick={() => tier.name === "Enterprise" && setIsEnterpriseModalOpen(true)}
                                    className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${tier.buttonClass}`}
                                >
                                    {tier.buttonText}
                                    {tier.name !== "Free / Starter" && <ArrowUpRight className="w-4 h-4" />}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Support Banner */}
                    <div className="bg-slate-900 dark:bg-slate-800 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
                        
                        <div className="relative z-10 flex-1 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
                                <AlertCircle className="w-3 h-3" />
                                Butuh Bantuan?
                            </div>
                            <h3 className="text-2xl font-black text-white">Bingung memilih paket yang tepat?</h3>
                            <p className="text-slate-400 mt-2 font-medium">Konsultasikan kebutuhan digitalisasi peternakan Anda dengan tim ahli kami secara gratis.</p>
                        </div>
                        
                        <button className="relative z-10 px-8 py-4 bg-emerald-500 text-white font-black rounded-2xl hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 transition-all text-sm whitespace-nowrap">
                            Hubungi Tim Sales
                        </button>
                    </div>
                </div>
            </div>

            {/* Enterprise Inquiry Modal (Fake Card Rate Placeholder) */}
            {isEnterpriseModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                        onClick={() => setIsEnterpriseModalOpen(false)}
                    />
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="p-10 text-center space-y-6">
                            <div className="w-20 h-20 rounded-[2rem] bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto mb-2">
                                <Building2 className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">SheepStock Enterprise</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Solusi kustom untuk skala industri.</p>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                                {[
                                    "Custom Integration",
                                    "Unlimited Hardware IoT",
                                    "Private Cloud Deployment",
                                    "SLA Guaranteed Support"
                                ].map((feat, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center">
                                            <Check className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{feat}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 space-y-4">
                                <button className="w-full py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black rounded-2xl hover:bg-black dark:hover:bg-white shadow-xl transition-all">
                                    Hubungi Account Manager
                                </button>
                                <button 
                                    onClick={() => setIsEnterpriseModalOpen(false)}
                                    className="w-full py-4 text-slate-500 font-bold hover:text-slate-800 dark:hover:text-slate-300 transition-all"
                                >
                                    Kembali
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
