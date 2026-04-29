"use client"

import { useState, useMemo } from "react"
import { Search, Warehouse, Activity, Edit2, ChevronLeft, ChevronRight, BookOpen, QrCode, PlusCircle, Users } from "lucide-react"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { addLivestock, updateLivestock } from "@/app/actions/livestock"

type Livestock = any // Ideally type this properly, but any works for now based on original file

export function LivestockClient({
    livestocks,
    cages,
    avatarUrl,
    stats
}: {
    livestocks: Livestock[],
    cages: any[],
    avatarUrl: string | null,
    stats: { totalAnimals: number, healthyPercentage: number, avgWeight: string, readyToHarvest: number }
}) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [detailLivestock, setDetailLivestock] = useState<Livestock | null>(null)
    const [limit, setLimit] = useState<number | "all">(10)
    const [page, setPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterCage, setFilterCage] = useState("all")
    const [filterStatus, setFilterStatus] = useState("all")

    // Complex search & filter logic
    const filteredLivestocks = useMemo(() => {
        return livestocks.filter(animal => {
            const matchesSearch = !searchQuery ||
                animal.qr_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                animal.cages?.name?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCage = filterCage === "all" || animal.cage_id === filterCage;
            const matchesStatus = filterStatus === "all" || animal.status === filterStatus;

            return matchesSearch && matchesCage && matchesStatus;
        })
    }, [livestocks, searchQuery, filterCage, filterStatus])

    const totalItems = filteredLivestocks.length
    const totalPages = limit === "all" ? 1 : Math.ceil(totalItems / limit)
    const safePage = Math.max(1, Math.min(page, totalPages))

    const paginatedData = limit === "all"
        ? filteredLivestocks
        : filteredLivestocks.slice((safePage - 1) * limit, safePage * limit)

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value
        setLimit(val === "all" ? "all" : parseInt(val))
        setPage(1)
    }

    const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!detailLivestock) return;
        setIsSubmitting(true)
        try {
            await updateLivestock(detailLivestock.id, new FormData(e.currentTarget))
            setDetailLivestock(null)
            alert("Berhasil memperbarui data ternak!")
        } catch (error: any) {
            console.error(error)
            alert(error.message || "Gagal memperbarui data ternak")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await addLivestock(new FormData(e.currentTarget))
            setIsAddModalOpen(false)
            alert("Berhasil menambahkan data ternak!")
        } catch (error: any) {
            console.error(error)
            alert(error.message || "Gagal menambahkan data ternak")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <header className="h-20 bg-white/30 dark:bg-slate-950/30 backdrop-blur-md border-b border-emerald-500/10 px-4 md:px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                    <SidebarTrigger />
                    <div className="flex items-center gap-2 sm:gap-3 ml-0 sm:ml-2 min-w-0">
                        <h2 className="text-base sm:text-xl font-bold tracking-tight truncate">Inventori Ternak</h2>
                    </div>
                </div>
                <div className="flex gap-2 sm:gap-3 items-center shrink-0">
                    <button className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white dark:bg-slate-800 border border-emerald-500/20 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-semibold text-sm shadow-sm shrink-0">
                        <QrCode className="w-5 h-5 shrink-0" />
                        <span className="hidden sm:inline">Scan QR</span>
                    </button>
                    <button onClick={() => setIsAddModalOpen(true)} className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all font-semibold text-sm shadow-md shadow-emerald-500/20 shrink-0">
                        <PlusCircle className="w-5 h-5 shrink-0" />
                        <span className="hidden sm:inline">Tambah Ternak</span>
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

            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-slate-50 dark:bg-slate-950">
                {/* Header Stats Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                        <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Total Ternak</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-none">{stats.totalAnimals}</p>
                    </div>
                    <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                        <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Kondisi Sehat</p>
                        <p className="text-2xl font-black text-emerald-600 leading-none">{stats.healthyPercentage}%</p>
                    </div>
                    <div className="p-4 bg-orange-500/5 rounded-xl border border-orange-500/10">
                        <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Rata-rata Berat</p>
                        <p className="text-2xl font-black text-orange-600 leading-none">{stats.avgWeight} Kg</p>
                    </div>
                    <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                        <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Siap Panen</p>
                        <p className="text-2xl font-black text-blue-600 leading-none">{stats.readyToHarvest}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Search & Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-6 relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-emerald-500/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-sm shadow-sm"
                                placeholder="Cari ID Ternak..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            />
                        </div>
                        <div className="md:col-span-3">
                            <div className="relative">
                                <Warehouse className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <select
                                    className="w-full pl-12 pr-10 py-3 bg-white dark:bg-slate-900 border border-emerald-500/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-sm appearance-none shadow-sm cursor-pointer border-r-8 border-r-transparent"
                                    value={filterCage}
                                    onChange={(e) => { setFilterCage(e.target.value); setPage(1); }}
                                >
                                    <option value="all">Semua Kandang</option>
                                    {cages.map(cage => (
                                        <option key={cage.id} value={cage.id}>{cage.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="md:col-span-3">
                            <div className="relative">
                                <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <select
                                    className="w-full pl-12 pr-10 py-3 bg-white dark:bg-slate-900 border border-emerald-500/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-sm appearance-none shadow-sm cursor-pointer border-r-8 border-r-transparent"
                                    value={filterStatus}
                                    onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="healthy">Sehat</option>
                                    <option value="sick">Sakit (Karantina)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Glassmorphism Table Container */}
                    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/50 dark:border-slate-800/50 rounded-xl shadow-xl overflow-hidden glass-card">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-emerald-500/5 border-b border-emerald-500/10">
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">ID / QR Code</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Kandang</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Jenis</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Gender</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Berat</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-emerald-500/5">
                                    {paginatedData.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-10 text-slate-500 font-medium">Belum ada data ternak.</td>
                                        </tr>
                                    ) : (
                                        paginatedData.map(animal => {
                                            // Determine Gender Styling
                                            const isMale = animal.gender === 'male';
                                            const genderColor = isMale ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" : "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400";

                                            // Determine Status Styling
                                            let statusClass = "bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-900 dark:text-stone-400 dark:border-stone-800";
                                            let statusLabel = animal.status.toUpperCase();

                                            if (animal.status === 'healthy') {
                                                statusClass = "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800";
                                                statusLabel = "Sehat";
                                            } else if (animal.status === 'sick') {
                                                statusClass = "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-400 dark:border-rose-800";
                                                statusLabel = "Sakit";
                                            } else if (animal.status === 'sold') {
                                                statusClass = "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800";
                                                statusLabel = "Dijual";
                                            }

                                            return (
                                                <tr key={animal.id} className="hover:bg-emerald-500/5 transition-colors group">
                                                    <td className="px-6 py-4 font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">{animal.qr_code}</td>
                                                    <td className="px-6 py-4 text-sm font-medium">{animal.cages?.name || '-'}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 capitalize">{animal.type}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${genderColor}`}>
                                                            {isMale ? "Jantan" : "Betina"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-bold">{animal.current_weight} Kg</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${statusClass}`}>
                                                            {statusLabel}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button onClick={() => setDetailLivestock(animal)} className="w-8 h-8 rounded-lg inline-flex items-center justify-center hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-600 transition-all">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between bg-white/50 dark:bg-slate-900/50 gap-4">
                            <div className="flex items-center gap-3">
                                <p className="text-sm text-slate-500">
                                    Menampilkan {limit === "all" ? totalItems : Math.min(paginatedData.length, totalItems)} dari {totalItems} ternak
                                </p>
                                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                    {[10, 20, 50, "all"].map((val) => (
                                        <button
                                            key={val}
                                            onClick={() => {
                                                setLimit(val as any);
                                                setPage(1);
                                            }}
                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${limit === val
                                                ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm"
                                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                                }`}
                                        >
                                            {val === "all" ? "Semua" : val}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {limit !== "all" && totalPages > 1 && (
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={safePage === 1}
                                        className="px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-600 transition-all flex items-center gap-1 text-sm font-semibold disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-600"
                                    >
                                        <ChevronLeft className="w-4 h-4" /> Prev
                                    </button>
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm font-bold w-10 text-center">{safePage} / {totalPages}</span>
                                    </div>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={safePage === totalPages}
                                        className="px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-600 transition-all flex items-center gap-1 text-sm font-semibold disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-600"
                                    >
                                        Next <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Add Livestock Modal */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                                <h3 className="text-xl font-bold">Entry Ternak Baru</h3>
                                <p className="text-sm text-slate-500 font-medium mt-1">Masukkan data lengkap untuk melacak riwayat ternak.</p>
                            </div>
                            <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">QR Code / ID *</label>
                                        <input required name="qr_code" type="text" placeholder="Contoh: DOMBA-001" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-mono" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tipe *</label>
                                        <select required name="type" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm appearance-none cursor-pointer">
                                            <option value="domba">Domba</option>
                                            <option value="kambing">Kambing</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Jenis Kelamin *</label>
                                        <select required name="gender" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm appearance-none cursor-pointer">
                                            <option value="male">Jantan</option>
                                            <option value="female">Betina (Breeding)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Umur (Bulan) *</label>
                                        <input required name="age_months" type="number" min="1" placeholder="Misal: 4" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Berat Masuk (Kg) *</label>
                                        <input required name="weight" type="number" step="0.1" min="1" placeholder="Misal: 15.5" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status *</label>
                                        <select required name="status" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm appearance-none cursor-pointer">
                                            <option value="healthy">Sehat</option>
                                            <option value="sick">Sakit (Karantina)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kandang Penempatan *</label>
                                    <select required name="cage_id" defaultValue="" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm appearance-none cursor-pointer">
                                        <option value="" disabled>-- Pilih Kandang --</option>
                                        {cages.map(cage => (
                                            <option key={cage.id} value={cage.id}>
                                                {cage.name} ({cage.capacity - cage.current_occupancy} slot kosong)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="pt-4 flex gap-3 shrink-0">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-colors">
                                        Batal
                                    </button>
                                    <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50">
                                        {isSubmitting ? 'Menyimpan...' : 'Simpan Ternak'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {detailLivestock && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                                <h3 className="text-xl font-bold">Edit Data Ternak</h3>
                                <p className="text-sm text-slate-500 font-medium mt-1">Ubah data ternak yang dipilih.</p>
                            </div>
                            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">QR Code / ID *</label>
                                        <input required name="qr_code" type="text" defaultValue={detailLivestock.qr_code} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-mono" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tipe *</label>
                                        <select required name="type" defaultValue={detailLivestock.type} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm appearance-none cursor-pointer">
                                            <option value="domba">Domba</option>
                                            <option value="kambing">Kambing</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Jenis Kelamin *</label>
                                        <select required name="gender" defaultValue={detailLivestock.gender} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm appearance-none cursor-pointer">
                                            <option value="male">Jantan</option>
                                            <option value="female">Betina (Breeding)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Umur (Bulan) *</label>
                                        <input required name="age_months" type="number" min="1" defaultValue={detailLivestock.age_months} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Berat Saat Ini (Kg) *</label>
                                        <input required name="weight" type="number" step="0.1" min="1" defaultValue={detailLivestock.current_weight} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status *</label>
                                        <select required name="status" defaultValue={detailLivestock.status} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm appearance-none cursor-pointer">
                                            <option value="healthy">Sehat</option>
                                            <option value="sick">Sakit (Karantina)</option>
                                            <option value="sold">Terjual</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kandang Penempatan *</label>
                                    <select required name="cage_id" defaultValue={detailLivestock.cage_id} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm appearance-none cursor-pointer">
                                        <option value="" disabled>-- Pilih Kandang --</option>
                                        {cages.map(cage => (
                                            <option key={cage.id} value={cage.id}>
                                                {cage.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="pt-4 flex gap-3 shrink-0">
                                    <button type="button" onClick={() => setDetailLivestock(null)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-colors">
                                        Batal
                                    </button>
                                    <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50">
                                        {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
