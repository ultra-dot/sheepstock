"use client"

import React, { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Users, UserPlus, Mail, Shield, Trash2, MoreVertical, Search, CheckCircle2, Clock } from "lucide-react";

// Mock data for UI/UX demonstration
const mockStaff = [
    {
        id: "1",
        name: "Ahmad Fauzi",
        email: "ahmad.fauzi@example.com",
        role: "Owner",
        status: "active",
        joinedAt: "12 Jan 2024",
        avatar: null
    },
    {
        id: "2",
        name: "Siti Aminah",
        email: "siti.aminah@example.com",
        role: "Staff",
        status: "active",
        joinedAt: "05 Feb 2024",
        avatar: null
    },
    {
        id: "3",
        name: "Budi Santoso",
        email: "budi.s@example.com",
        role: "Staff",
        status: "pending",
        joinedAt: "-",
        avatar: null
    }
];

export default function TeamManagementPage() {
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <header className="h-20 sticky top-0 z-30 bg-white/30 dark:bg-slate-950/30 backdrop-blur-md border-b border-emerald-500/10 px-4 md:px-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <SidebarTrigger />
                    <div className="flex items-center gap-2 sm:gap-3 ml-0 sm:ml-2 min-w-0">
                        <Users className="text-emerald-500 w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                        <h2 className="text-base sm:text-xl font-bold tracking-tight truncate">Manajemen Tim</h2>
                    </div>
                </div>
                
                <button 
                    onClick={() => setIsInviteModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all text-sm"
                >
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Undang Pegawai</span>
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Page Intro */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Anggota Tim Peternakan</h2>
                            <p className="text-sm font-medium text-slate-500 mt-1">Kelola akses pegawai dan kolaborasi tim Anda.</p>
                        </div>
                        
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input 
                                type="text" 
                                placeholder="Cari nama atau email..." 
                                className="pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm font-medium w-full md:w-72 transition-all"
                            />
                        </div>
                    </div>

                    {/* Team List Table */}
                    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-emerald-500/10 rounded-3xl shadow-xl overflow-hidden glass-card">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-emerald-500/5 border-b border-emerald-500/10">
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Anggota</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Peran</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Bergabung</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-emerald-500/5">
                                    {mockStaff.map((member) => (
                                        <tr key={member.id} className="hover:bg-emerald-500/5 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-sm">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-slate-200 leading-tight">{member.name}</p>
                                                        <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-1">
                                                            <Mail className="w-3 h-3" />
                                                            {member.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                    <Shield className={`w-4 h-4 ${member.role === 'Owner' ? 'text-amber-500' : 'text-emerald-500'}`} />
                                                    <span className="text-sm font-bold">{member.role}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                {member.status === 'active' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-full border border-emerald-500/20 uppercase tracking-tighter">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black rounded-full border border-amber-500/20 uppercase tracking-tighter">
                                                        <Clock className="w-3 h-3" />
                                                        Menunggu
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-xs font-bold text-slate-500">{member.joinedAt}</span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="p-2 text-slate-400 hover:text-emerald-500 transition-all rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                    {member.role !== 'Owner' && (
                                                        <button className="p-2 text-slate-400 hover:text-rose-500 transition-all rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invite Staff Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                        onClick={() => setIsInviteModalOpen(false)}
                    />
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[1.25rem] bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <UserPlus className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">Undang Pegawai</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-0.5">Pegawai akan menerima undangan melalui email.</p>
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Alamat Email</label>
                                <input type="email" placeholder="contoh@peternakan.com" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-900 dark:text-white transition-all" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Peran Pegawai</label>
                                <select className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-900 dark:text-white appearance-none cursor-pointer">
                                    <option value="staff">Staff Operasional (Bisa catat data lapangan)</option>
                                    <option value="manager">Manager (Bisa kelola kandang & stok)</option>
                                </select>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button 
                                    onClick={() => setIsInviteModalOpen(false)}
                                    className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm"
                                >
                                    Batal
                                </button>
                                <button className="flex-[2] px-6 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all text-sm">
                                    Kirim Undangan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
