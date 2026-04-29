import { SidebarTrigger } from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/server"
import { Box, ArrowUpRight, ArrowDownRight, PackagePlus, AlertTriangle, CircleDollarSign, Search, Filter, MoreVertical, BoxSelect, Syringe, Bug, Pill, Users } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function InventoryPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser();
    let avatarUrl: string | null = null;

    if (user && user.user_metadata?.avatar_url) {
        avatarUrl = user.user_metadata.avatar_url;
    }

    const { data: items, error } = await supabase
        .from("inventory_items")
        .select("*")
        .order('type')

    if (error || !items) {
        return <div className="p-6">Gagal memuat data inventori gudang.</div>
    }

    const totalItems = items.length;
    const lowStockItems = items.filter(i => i.current_stock <= i.min_stock_alert).length;
    // Estimated valuation based on total price logic (if we had price, fallback to string)
    const totalEstValue = "Rp 12.4M"; // Placeholder based on original design

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <header className="h-20 sticky top-0 z-30 bg-white/30 dark:bg-slate-950/30 backdrop-blur-md border-b border-emerald-500/10 px-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <SidebarTrigger />
                    <div className="flex items-center gap-3 ml-2">
                        <Box className="text-emerald-500 w-6 h-6" />
                        <h2 className="text-xl font-bold tracking-tight">Manajemen Pakan</h2>
                    </div>
                </div>
                <div className="flex gap-3 items-center">
                    <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-emerald-500/20 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-semibold text-sm shadow-sm">
                        <ArrowUpRight className="w-5 h-5" />
                        Stok Keluar
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all font-semibold text-sm shadow-md shadow-emerald-500/20">
                        <ArrowDownRight className="w-5 h-5" />
                        <span className="hidden sm:inline">Stok Masuk</span>
                    </button>
                    {avatarUrl ? (
                        <img className="w-10 h-10 rounded-full border border-slate-200 object-cover" alt="Profile" src={avatarUrl} />
                    ) : (
                        <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400">
                            <Users className="w-5 h-5" />
                        </div>
                    )}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                        <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Total Item</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-none">{totalItems} <span className="text-sm font-normal text-emerald-600 ml-1">Jenis</span></p>
                    </div>

                    <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/10">
                        <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Barang Menipis</p>
                        <p className="text-2xl font-black text-amber-600 leading-none">{lowStockItems} <span className="text-sm font-normal text-amber-600 ml-1">SKU</span></p>
                    </div>

                    <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                        <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Total Estimasi Aset</p>
                        <p className="text-2xl font-black text-emerald-600 leading-none">{totalEstValue}</p>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-6 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                        <input className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-emerald-500/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-sm shadow-sm" placeholder="Cari nama barang atau kategori..." type="text" />
                    </div>
                    <div className="md:col-span-6 flex gap-4">
                        <select className="w-full rounded-xl border border-emerald-500/10 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm min-w-[140px] px-4 py-3 appearance-none shadow-sm cursor-pointer border-r-8 border-r-transparent">
                            <option>Semua Kategori</option>
                            <option>Pakan</option>
                            <option>Obat</option>
                            <option>Vaksin</option>
                        </select>
                        <button className="px-4 rounded-xl border border-emerald-500/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-emerald-500/5 hover:text-emerald-600 flex items-center justify-center shadow-sm transition-colors">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Inventory Table */}
                <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-emerald-500/10 rounded-xl shadow-xl overflow-hidden glass-card">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-emerald-500/5 border-b border-emerald-500/10">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Nama Barang</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Kategori</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Stok Tersedia</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Batas Minimum</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-500/5">
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-10 text-slate-500 font-medium">Gudang kosong.</td>
                                    </tr>
                                ) : (
                                    items.map((item) => {
                                        const isLow = item.current_stock <= item.min_stock_alert;
                                        const isOut = item.current_stock === 0;

                                        // Icon per type mapping
                                        let TypeIcon = BoxSelect;
                                        let iconColorClass = "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400";

                                        if (item.type?.toLowerCase() === 'feed') {
                                            TypeIcon = BoxSelect;
                                            iconColorClass = "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400";
                                        } else if (item.type?.toLowerCase() === 'medicine') {
                                            TypeIcon = Pill;
                                            iconColorClass = "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400";
                                        } else if (item.type?.toLowerCase() === 'vaccine') {
                                            TypeIcon = Syringe;
                                            iconColorClass = "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400";
                                        } else if (item.type?.toLowerCase() === 'equipment') {
                                            TypeIcon = Bug;
                                            iconColorClass = "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400";
                                        }

                                        return (
                                            <tr key={item.id} className="hover:bg-emerald-500/5 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColorClass}`}>
                                                            <TypeIcon className="w-4 h-4" />
                                                        </div>
                                                        <span className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 capitalize">
                                                    {item.type}
                                                </td>
                                                <td className={`px-6 py-4 text-right ${isOut ? 'text-rose-600 font-bold' : isLow ? 'text-amber-600 font-bold' : 'text-slate-700 dark:text-slate-300 font-bold'}`}>
                                                    {item.current_stock} <span className="text-xs font-normal text-slate-400 ml-1">{item.unit}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-slate-500 font-medium">
                                                    {item.min_stock_alert} <span className="text-xs ml-1 font-normal">{item.unit}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center">
                                                        {isOut ? (
                                                            <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 shadow-sm border border-rose-200 dark:border-rose-800">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                                                Habis
                                                            </span>
                                                        ) : isLow ? (
                                                            <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5 shadow-sm border border-amber-200 dark:border-amber-800">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                                Menipis
                                                            </span>
                                                        ) : (
                                                            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5 shadow-sm border border-emerald-200 dark:border-emerald-800">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                                Aman
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button className="w-8 h-8 rounded-lg inline-flex items-center justify-center hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-600 transition-all">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    )
}
