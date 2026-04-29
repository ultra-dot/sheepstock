import { SidebarTrigger } from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/server"
import { Activity, Plus, Stethoscope, Search, Calendar, Filter, Download, Pill, Eye } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function HealthPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser();
    let avatarUrl = "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100&h=100"; // fallback

    if (user && user.user_metadata?.avatar_url) {
        avatarUrl = user.user_metadata.avatar_url;
    }

    // Fetch health records joined with livestock and items
    const { data: records, error } = await supabase
        .from("health_records")
        .select(`
      *,
      livestocks ( qr_code, type, gender ),
      inventory_items ( name )
    `)
        .order('date', { ascending: false })

    if (error || !records) {
        return <div className="p-6">Gagal memuat rekam medis.</div>
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <header className="h-20 sticky top-0 z-30 bg-white/30 dark:bg-slate-950/30 backdrop-blur-md border-b border-emerald-500/10 px-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <SidebarTrigger />
                    <div className="flex items-center gap-3 ml-2">
                        <Activity className="text-emerald-500 w-6 h-6" />
                        <h2 className="text-xl font-bold tracking-tight">Kesehatan Ternak</h2>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-all font-bold text-sm shadow-lg shadow-emerald-500/20">
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">Catat Pengobatan</span>
                    </button>
                    <div className="h-10 w-10 ml-1 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-emerald-500/20 hidden sm:flex">
                        <img className="w-full h-full object-cover" alt="User avatar" src={avatarUrl} />
                    </div>
                </div>
            </header >

            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Card 1: Kasus Sakit */}
                    <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-rose-500/10 flex items-center gap-5 shadow-sm hover:border-rose-500/30 transition-colors">
                        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-900/40 flex items-center justify-center">
                            <Activity className="text-rose-500 dark:text-rose-400 w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Kasus Sakit Bulan Ini</p>
                            <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-1">{records.length} <span className="text-sm font-medium text-slate-400">Kasus</span></h3>
                        </div>
                    </div>

                    {/* Card 2: Obat Paling Sering */}
                    <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-blue-500/10 flex items-center gap-5 shadow-sm hover:border-blue-500/30 transition-colors">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center">
                            <Stethoscope className="text-blue-500 dark:text-blue-400 w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Obat Terbanyak Dipakai</p>
                            <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-1">Vit B-Complex <span className="text-sm font-medium text-slate-400">(Estimasi)</span></h3>
                        </div>
                    </div>
                </div>

                {/* Search & Filters (Matching Emerald Theme) */}
                <div className="flex flex-wrap items-center gap-4 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                    <div className="relative flex-1 min-w-[300px] group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                        <input className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-emerald-500/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-sm font-medium shadow-sm" placeholder="Cari ID Ternak, Diagnosa atau Obat..." type="text" />
                    </div>

                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input className="pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-emerald-500/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-sm font-medium shadow-sm" type="date" />
                    </div>

                    <select className="px-6 py-3 bg-white dark:bg-slate-900 border border-emerald-500/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm font-medium shadow-sm appearance-none cursor-pointer border-r-8 border-r-transparent">
                        <option value="">Semua Status</option>
                        <option value="selesai">Selesai</option>
                        <option value="pemulihan">Pemulihan</option>
                        <option value="karantina">Karantina</option>
                    </select>

                    <button className="px-5 py-3 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 rounded-xl flex items-center gap-2 hover:bg-slate-700 dark:hover:bg-slate-300 transition-all font-bold text-sm shadow-sm">
                        <Download className="w-5 h-5" />
                        Export
                    </button>
                </div>

                {/* Data Table */}
                <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-emerald-500/10 rounded-3xl shadow-xl overflow-hidden glass-card">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-emerald-500/5 border-b border-emerald-500/10">
                                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500">Tanggal</th>
                                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500">ID Ternak</th>
                                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500">Keluhan</th>
                                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500">Diagnosa & Tindakan</th>
                                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500">Obat</th>
                                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-500/5">
                                {records.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-10 text-slate-500 font-medium">Belum ada rekam medis.</td>
                                    </tr>
                                ) : (
                                    records.map((record) => (
                                        <tr key={record.id} className="hover:bg-emerald-500/5 transition-colors group">
                                            <td className="px-6 py-5">
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    {new Date(record.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-extrabold rounded-lg text-sm tracking-wide">
                                                    {record.livestocks?.qr_code || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium truncate max-w-[200px]" title={record.illness_description}>
                                                    {record.illness_description}
                                                </p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium truncate max-w-[250px]">
                                                    {record.treatment}
                                                </p>
                                            </td>
                                            <td className="px-6 py-5">
                                                {record.inventory_items?.name ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-full border border-slate-200 dark:border-slate-700 uppercase">
                                                        <Pill className="w-3.5 h-3.5" />
                                                        {record.inventory_items.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <button className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div >
    )
}
