"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Search, PlusCircle, MoreVertical, Plus, Grid2x2, Edit2, Trash2, ArrowRightLeft, Wheat, Users } from "lucide-react"
import { createCage, feedCage, updateCage, deleteCage, moveLivestockBatch } from "@/app/actions/cages"
import { SidebarTrigger } from "@/components/ui/sidebar"

export type CageWithStats = {
    id: string
    name: string
    capacity: number
    current_occupancy: number
    status: string
    temperature: number
    last_cleaned_at: string
    stats: { maleCount: number, femaleCount: number }
    occupants: any[]
    capacityPercentage: number
    ui: { statusDot: string, statusText: string, statusLabel: string, progressColor: string, progressBg: string }
}

export type FeedItem = {
    id: string
    name: string
    current_stock: number
    unit: string
}

export function CagesClient({
    cagesWithStats,
    feedItems,
    avatarUrl
}: {
    cagesWithStats: CageWithStats[],
    feedItems: FeedItem[],
    avatarUrl: string | null
}) {
    const [searchQuery, setSearchQuery] = useState("")
    const [filterStatus, setFilterStatus] = useState<"Semua" | "Tersedia" | "Penuh">("Semua")

    // Modals & Menus
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [feedCageId, setFeedCageId] = useState<string | null>(null)
    const [selectedFeedId, setSelectedFeedId] = useState<string>("")
    const [feedQuantityInput, setFeedQuantityInput] = useState<string>("")

    const [detailCage, setDetailCage] = useState<CageWithStats | null>(null)

    const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
    const [editCageData, setEditCageData] = useState<CageWithStats | null>(null)

    // Move Flock Additions
    const [moveSourceCageId, setMoveSourceCageId] = useState<string | null>(null)
    const [moveTargetCageId, setMoveTargetCageId] = useState<string>("")
    const [selectedLivestockIds, setSelectedLivestockIds] = useState<Set<string>>(new Set())
    const [qrSearch, setQrSearch] = useState<string>("")
    const [moveStep, setMoveStep] = useState<1 | 2>(1)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const ITEMS_PER_PAGE = 5

    const openMoveModal = (cageId: string) => {
        setMoveSourceCageId(cageId);
        setMoveTargetCageId("");
        setSelectedLivestockIds(new Set());
        setQrSearch("");
        setMoveStep(1);
        setCurrentPage(1);
    }

    // Close dropdown menu if clicking outside (simple approach: close on any click outside the menu button)
    useEffect(() => {
        const handleClickOutside = () => setMenuOpenId(null)
        if (menuOpenId) document.addEventListener("click", handleClickOutside)
        return () => document.removeEventListener("click", handleClickOutside)
    }, [menuOpenId])

    // Form states
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Search and Filter logic
    const filteredCages = useMemo(() => {
        return cagesWithStats.filter(cage => {
            const matchesSearch = cage.name.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesFilter = filterStatus === "Semua" ? true : cage.ui.statusLabel === filterStatus

            return matchesSearch && matchesFilter
        })
    }, [cagesWithStats, searchQuery, filterStatus])

    const handleAddCage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await createCage(new FormData(e.currentTarget))
            setIsAddModalOpen(false)
        } catch (error) {
            console.error(error)
            alert("Gagal menambahkan kandang")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleFeed = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await feedCage(new FormData(e.currentTarget))
            setFeedCageId(null)
            setSelectedFeedId("")
            setFeedQuantityInput("")
            alert("Berhasil mencatat pemberian pakan!")
        } catch (error) {
            console.error(error)
            alert("Gagal mencatat pemberian pakan")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handler for Edit
    const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!editCageData) return
        setIsSubmitting(true)
        try {
            await updateCage(editCageData.id, new FormData(e.currentTarget))
            setEditCageData(null)
        } catch (error: any) {
            console.error(error)
            alert(error.message || "Gagal mengupdate kandang")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handler for Delete
    const handleDeleteCage = async (id: string) => {
        const cage = cagesWithStats.find(c => c.id === id);
        if (cage && cage.current_occupancy > 0) {
            alert("Kandang masih berisi ternak. Silakan mutasi/pindahkan ternak terlebih dahulu sebelum menghapus kandang.");
            return;
        }

        if (!confirm(`Yakin ingin menghapus ${cage?.name || 'kandang ini'}? Data tidak bisa dikembalikan.`)) return
        try {
            await deleteCage(id)
        } catch (e: any) {
            alert(e.message || "Gagal menghapus kandang")
        }
    }

    // Handler for Moving Flock
    const sourceOccupants = useMemo(() => {
        if (!moveSourceCageId) return []
        return cagesWithStats.find(c => c.id === moveSourceCageId)?.occupants || []
    }, [cagesWithStats, moveSourceCageId])

    const totalPages = Math.ceil(sourceOccupants.length / ITEMS_PER_PAGE);

    // Calculate visible livestock for the current page
    const visibleOccupants = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return sourceOccupants.slice(start, end);
    }, [sourceOccupants, currentPage]);

    const handleQrScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission
            const code = qrSearch.trim();
            if (!code) return;

            const animal = sourceOccupants.find(a => a.qr_code === code || a.qr_code?.toLowerCase() === code.toLowerCase());
            if (animal) {
                setSelectedLivestockIds(prev => {
                    const newSet = new Set(prev);
                    newSet.add(animal.id);
                    return newSet;
                });
                setQrSearch("");
            } else {
                alert(`QR Code / ID ${code} tidak ditemukan di kandang asal ini.`);
                setQrSearch("");
            }
        }
    }

    const toggleLivestockSelection = (id: string) => {
        setSelectedLivestockIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    }

    const handleMoveSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!moveSourceCageId) return

        if (selectedLivestockIds.size === 0) {
            alert("Pilih minimal 1 ternak untuk dipindahkan.");
            return;
        }

        if (moveStep === 1) {
            setMoveStep(2);
            return;
        }

        if (!moveTargetCageId) return;

        const targetCage = cagesWithStats.find(c => c.id === moveTargetCageId);
        if (!targetCage) return;

        if (targetCage.current_occupancy + selectedLivestockIds.size > targetCage.capacity) {
            alert("Kapasitas kandang tujuan tidak mencukupi untuk jumlah ternak yang dipilih.");
            return;
        }

        setIsSubmitting(true)
        try {
            await moveLivestockBatch(moveTargetCageId, moveSourceCageId, Array.from(selectedLivestockIds))
            setMoveSourceCageId(null)
            alert("Berhasil memindahkan ternak!")
        } catch (error: any) {
            console.error(error)
            alert(error.message || "Gagal memindahkan ternak")
        } finally {
            setIsSubmitting(false)
        }
    }

    const populatedCages = useMemo(() => cagesWithStats.filter(c => c.id !== moveSourceCageId), [cagesWithStats, moveSourceCageId])

    return (
        <div className="flex flex-col h-screen overflow-hidden">

            {/* Header Actions */}
            <header className="sticky top-0 h-20 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md border-b border-emerald-500/10 flex items-center justify-between px-8 shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <SidebarTrigger />
                    <div className="flex items-center gap-4 ml-2">
                        <span className="text-emerald-500 bg-emerald-500/10 p-2 rounded-lg flex items-center justify-center">
                            <Grid2x2 className="w-5 h-5" />
                        </span>
                        <h2 className="text-xl font-bold">Manajemen Kandang</h2>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 w-64 outline-none shadow-sm"
                            placeholder="Cari kandang..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-500/90 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md"
                    >
                        <PlusCircle className="w-5 h-5" />
                        <span>Kandang Baru</span>
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

            {/* Main Content Area passed inside layout */}
            <div className="flex-1 p-4 sm:p-8 space-y-8 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
                {/* Filters */}
                <div className="flex gap-3">
                    {["Semua", "Tersedia", "Penuh"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status as "Semua" | "Tersedia" | "Penuh")}
                            className={`px-6 py-2 rounded-full text-sm font-bold shadow-sm transition-all ${filterStatus === status
                                ? "bg-emerald-500 text-white shadow-md"
                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-emerald-500/5"
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCages.length === 0 ? (
                        <div className="col-span-full text-center py-20 text-slate-500">
                            Tidak ada data kandang yang sesuai pencarian.
                        </div>
                    ) : (
                        filteredCages.map((cage) => (
                            <div key={cage.id} className="glass-card rounded-2xl p-6 flex flex-col gap-6 shadow-xl shadow-emerald-500/5 border border-slate-200/50 dark:border-slate-700/50">

                                {/* Card Header */}
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold">{cage.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className={`flex h-2.5 w-2.5 rounded-full ${cage.ui.statusDot}`}></span>
                                            <span className={`text-xs font-bold uppercase tracking-wide ${cage.ui.statusText}`}>Status: {cage.ui.statusLabel}</span>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === cage.id ? null : cage.id) }}
                                            className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded-md transition-colors cursor-pointer"
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                        {menuOpenId === cage.id && (
                                            <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-1 z-20 overflow-hidden">
                                                <button onClick={() => { setMenuOpenId(null); setEditCageData(cage) }} className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                                    <Edit2 className="w-4 h-4" /> Edit
                                                </button>
                                                <button onClick={() => { setMenuOpenId(null); handleDeleteCage(cage.id) }} className="w-full text-left px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2">
                                                    <Trash2 className="w-4 h-4" /> Hapus
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="space-y-4 flex-1">

                                    {/* Progress Bar */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm font-medium">
                                            <span className="text-slate-500">Kapasitas {cage.current_occupancy}/{cage.capacity}</span>
                                            <span className={`font-bold ${cage.ui.statusText}`}>{cage.capacityPercentage}%</span>
                                        </div>
                                        <div className={`h-2 w-full rounded-full overflow-hidden ${cage.ui.progressBg}`}>
                                            <div className={`h-full rounded-full ${cage.ui.progressColor}`} style={{ width: `${cage.capacityPercentage}%` }}></div>
                                        </div>
                                    </div>

                                    {/* Environment Stats & Distribution */}
                                    {cage.current_occupancy > 0 ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                                                <p className="text-[10px] uppercase font-bold text-slate-400">Suhu</p>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{cage.temperature || '--'}°C</p>
                                            </div>
                                            <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                                                <p className="text-[10px] uppercase font-bold text-slate-400">Kebersihan</p>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
                                                    {cage.last_cleaned_at ? new Date(cage.last_cleaned_at).toLocaleDateString() : 'Belum'}
                                                </p>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                                                <p className="text-[10px] uppercase font-bold text-slate-400">Jantan</p>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{cage.stats.maleCount} Ekor</p>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                                                <p className="text-[10px] uppercase font-bold text-slate-400">Betina</p>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{cage.stats.femaleCount} Ekor</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-6 gap-2 opacity-60">
                                            <Plus className="w-10 h-10 text-emerald-500/50" />
                                            <p className="text-xs text-slate-400 font-medium text-center">Tersedia banyak ruang untuk ternak baru</p>
                                        </div>
                                    )}
                                </div>

                                {/* Card Footer Actions */}
                                <div className="flex gap-3 pt-2 mt-auto">
                                    {cage.current_occupancy > 0 ? (
                                        <>
                                            <button onClick={() => setDetailCage(cage)} className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Detail</button>
                                            <button onClick={() => openMoveModal(cage.id)} className="flex-1 bg-emerald-50 py-2.5 border border-emerald-200 rounded-xl text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition-colors">Mutasi</button>
                                            <button onClick={() => {
                                                setFeedCageId(cage.id);
                                                setSelectedFeedId("");
                                                setFeedQuantityInput("");
                                            }} className="flex-1 bg-amber-500 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-amber-500/20 hover:shadow-xl transition-all">Pakan</button>
                                        </>
                                    ) : (
                                        <button onClick={() => openMoveModal(cage.id)} className="w-full bg-emerald-500 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-all">Tambahkan Ternak</button>
                                    )}
                                </div>

                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Add Cage Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold">Kandang Baru</h3>
                            <p className="text-sm text-slate-500">Buat unit kandang baru untuk peternakan Anda.</p>
                        </div>
                        <form onSubmit={handleAddCage} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Kandang</label>
                                <input required name="name" type="text" placeholder="Contoh: Kandang F" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kapasitas (Ekor)</label>
                                <input required name="capacity" type="number" min="1" placeholder="Contoh: 50" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Suhu Standar (°C)</label>
                                <input required name="temperature" type="number" step="0.1" defaultValue="30.5" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-colors">
                                    Batal
                                </button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50">
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Kandang'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Feed Modal */}
            {feedCageId && (() => {
                const cage = cagesWithStats.find(c => c.id === feedCageId);
                if (!cage) return null;
                const estimatedNeed = (cage.current_occupancy * 1).toFixed(1); // Default 1kg/day/head estimation roughly
                const selectedItem = feedItems.find(i => i.id === selectedFeedId);
                const quantityNum = parseFloat(feedQuantityInput) || 0;
                const remaining = selectedItem ? selectedItem.current_stock - quantityNum : 0;
                const isInsufficient = selectedItem && remaining < 0;

                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                                <div className="flex justify-center mb-4 text-amber-500 bg-amber-500/10 p-4 rounded-full w-16 h-16 mx-auto">
                                    <Wheat className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-center">Beri Pakan</h3>
                                <p className="text-sm font-medium text-slate-500 text-center mt-2">
                                    Kandang: <span className="font-bold text-amber-600 dark:text-amber-500">{cage.name}</span> ({cage.current_occupancy} Ekor)
                                </p>

                                <div className="mt-4 flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800/30">
                                    <div className="text-xs font-bold text-amber-800 dark:text-amber-500 uppercase tracking-wider">Estimasi Pakan (1kg/Ekor)</div>
                                    <div className="text-sm font-black text-amber-900 dark:text-amber-400">~ {estimatedNeed} Kg</div>
                                </div>
                            </div>
                            <form onSubmit={(e) => {
                                if (isInsufficient) {
                                    e.preventDefault();
                                    alert("Stok pakan tidak mencukupi!");
                                    return;
                                }
                                handleFeed(e);
                            }} className="flex-1 overflow-y-auto p-6 space-y-4">
                                <input type="hidden" name="cage_id" value={feedCageId} />

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pilih Pakan dari Gudang</label>
                                    <select
                                        required
                                        name="item_id"
                                        value={selectedFeedId}
                                        onChange={(e) => setSelectedFeedId(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled>-- Pilih Jenis Pakan --</option>
                                        {feedItems.map(item => (
                                            <option key={item.id} value={item.id}>
                                                {item.name} (Stok: {item.current_stock} {item.unit})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between">
                                        <span>Jumlah Diberikan</span>
                                        {selectedItem && (
                                            <button
                                                type="button"
                                                onClick={() => setFeedQuantityInput(estimatedNeed)}
                                                className="text-[10px] text-amber-600 hover:text-amber-700 font-bold underline"
                                            >
                                                Gunakan Estimasi
                                            </button>
                                        )}
                                    </label>
                                    <input
                                        required
                                        name="quantity"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={feedQuantityInput}
                                        onChange={(e) => setFeedQuantityInput(e.target.value)}
                                        placeholder="Misal: 10.5"
                                        className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${isInsufficient ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700 focus:ring-amber-500'} rounded-xl focus:ring-2 outline-none text-sm font-mono`}
                                    />
                                    {selectedItem && (
                                        <div className="mt-2 flex items-center justify-between text-xs font-medium">
                                            <span className="text-slate-500">Sisa Stok Akhir:</span>
                                            <span className={`font-bold ${isInsufficient ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>
                                                {remaining.toFixed(2)} {selectedItem.unit}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 flex gap-3 shrink-0">
                                    <button type="button" onClick={() => setFeedCageId(null)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-colors">
                                        Batal
                                    </button>
                                    <button type="submit" disabled={isSubmitting || !!isInsufficient} className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50">
                                        {isSubmitting ? 'Mencatat...' : 'Beri Pakan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                );
            })()}

            {/* Detail Modal */}
            {detailCage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900 shrink-0">
                            <div>
                                <h3 className="text-xl font-black">{detailCage.name}</h3>
                                <p className="text-sm font-medium text-slate-500 mt-1">Detail populasi dan data ternak di dalam unit kandang ini.</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold bg-white dark:bg-slate-800 border shadow-sm ${detailCage.ui.statusText}`}>
                                    {detailCage.ui.statusLabel}
                                </span>
                                <span className="text-sm font-bold mt-2">
                                    Kapasitas: <span className="text-emerald-600">{detailCage.current_occupancy}</span> / {detailCage.capacity}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-0">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10 shadow-sm">
                                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">ID / QR Code</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Jenis</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Gender</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Berat</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                    {detailCage.occupants.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="text-center py-10 text-slate-500 font-medium">Kandang kosong.</td>
                                        </tr>
                                    ) : (
                                        detailCage.occupants.map(animal => {
                                            const isMale = animal.gender === 'male';
                                            const genderColor = isMale ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" : "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400";
                                            return (
                                                <tr key={animal.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                        {animal.qr_code || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                                                        {animal.type}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${genderColor}`}>
                                                            {isMale ? "Jantan" : "Betina"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-bold text-right text-slate-700 dark:text-slate-300">
                                                        {animal.current_weight ? `${animal.current_weight} Kg` : '-'}
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0 flex justify-end">
                            <button onClick={() => setDetailCage(null)} className="px-6 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-colors">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Edit Cage Modal */}
            {editCageData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold">Edit Kandang</h3>
                            <p className="text-sm text-slate-500">Perbarui informasi kandang ini.</p>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Kandang</label>
                                <input required name="name" type="text" defaultValue={editCageData.name} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kapasitas (Ekor)</label>
                                <input required name="capacity" type="number" min="1" defaultValue={editCageData.capacity} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                                <select required name="status" defaultValue={editCageData.status} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm">
                                    <option value="available">Tersedia</option>
                                    <option value="optimal">Optimal</option>
                                    <option value="full">Penuh</option>
                                    <option value="maintenance">Perbaikan</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Suhu Standar (°C)</label>
                                <input required name="temperature" type="number" step="0.1" defaultValue={editCageData.temperature} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setEditCageData(null)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-colors">
                                    Batal
                                </button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50">
                                    {isSubmitting ? 'Menyimpan...' : 'Update Kandang'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Move Flock Modal */}
            {moveSourceCageId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <div className="flex justify-center mb-4 text-emerald-500 bg-emerald-500/10 p-4 rounded-full w-16 h-16 mx-auto">
                                <ArrowRightLeft className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-center">Pindahkan Ternak</h3>
                            <p className="text-sm text-slate-500 text-center mt-2">
                                {moveStep === 1 ? `Pilih ternak yang ingin dipindahkan dari ${cagesWithStats.find(c => c.id === moveSourceCageId)?.name}.` : `Pilih kandang tujuan untuk ${selectedLivestockIds.size} ternak yang dipilih.`}
                            </p>

                            {/* Step Indicator */}
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <div className="h-1.5 w-8 rounded-full bg-emerald-500"></div>
                                <div className={`h-1.5 w-8 rounded-full transition-colors ${moveStep === 2 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                            </div>
                        </div>

                        <form onSubmit={handleMoveSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                            {moveStep === 1 && (
                                <div className="space-y-4">
                                    {/* Removed redundant select for source cage since it's already selected and indicated in the title */}

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            Scan QR / Cari ID Ternak
                                            <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[10px]">Enter</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Arahkan scanner atau ketik ID..."
                                            value={qrSearch}
                                            onChange={(e) => setQrSearch(e.target.value)}
                                            onKeyDown={handleQrScan}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-emerald-500/50 rounded-xl focus:ring-emerald-500 outline-none text-sm font-mono shadow-sm"
                                        />
                                    </div>

                                    <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-2 bg-slate-50 dark:bg-slate-800/20">
                                        <div className="flex justify-between items-center px-2 py-1 mb-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                                            <span className="text-xs font-bold text-slate-500">
                                                {selectedLivestockIds.size} dipilih dari {sourceOccupants.length} ternak
                                            </span>
                                            <button type="button" onClick={() => {
                                                if (selectedLivestockIds.size === sourceOccupants.length) {
                                                    setSelectedLivestockIds(new Set());
                                                } else {
                                                    setSelectedLivestockIds(new Set(sourceOccupants.map(a => a.id)));
                                                }
                                            }} className="text-xs font-bold text-emerald-600 hover:underline">
                                                {selectedLivestockIds.size === sourceOccupants.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                                            </button>
                                        </div>

                                        <div className="space-y-1 min-h-[200px]">
                                            {visibleOccupants.map(animal => (
                                                <label key={animal.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedLivestockIds.has(animal.id)}
                                                        onChange={() => toggleLivestockSelection(animal.id)}
                                                        className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500 border-slate-300 dark:border-slate-600 dark:bg-slate-800"
                                                    />
                                                    <div className="flex-1 flex justify-between items-center">
                                                        <span className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400 text-left">
                                                            {animal.qr_code || animal.id.substring(0, 8)}
                                                        </span>
                                                        <span className="text-xs font-medium text-slate-500 capitalize bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-md">
                                                            Domba - {animal.gender === 'male' ? 'Jantan' : 'Betina'}
                                                        </span>
                                                    </div>
                                                </label>
                                            ))}
                                            {sourceOccupants.length === 0 && (
                                                <div className="text-center py-10 text-xs text-slate-400">Tidak ada ternak yang bisa dipindahkan.</div>
                                            )}
                                        </div>

                                        {/* Pagination Controls */}
                                        {totalPages > 1 && (
                                            <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700 mt-2 px-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                    className="text-xs font-bold text-slate-500 hover:text-emerald-600 disabled:opacity-50"
                                                >
                                                    &larr; Prev
                                                </button>
                                                <span className="text-xs font-medium text-slate-500">
                                                    Hal {currentPage} / {totalPages}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="text-xs font-bold text-slate-500 hover:text-emerald-600 disabled:opacity-50"
                                                >
                                                    Next &rarr;
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {moveStep === 2 && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pilih Kandang Tujuan</label>
                                    <select
                                        required
                                        name="target_cage_id"
                                        value={moveTargetCageId}
                                        onChange={(e) => setMoveTargetCageId(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled>-- Pilih Kandang Tujuan --</option>
                                        {populatedCages.length === 0 ? (
                                            <option value="" disabled>Tidak ada kandang tersedia</option>
                                        ) : (
                                            populatedCages.map(cage => (
                                                <option key={cage.id} value={cage.id}>
                                                    {cage.name} (Tersisa: {cage.capacity - cage.current_occupancy} ruang)
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (moveStep === 2) setMoveStep(1);
                                        else setMoveSourceCageId(null);
                                    }}
                                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-colors"
                                >
                                    {moveStep === 2 ? 'Kembali' : 'Batal'}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || selectedLivestockIds.size === 0 || (moveStep === 2 && !moveTargetCageId)}
                                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Memindahkan...' : moveStep === 1 ? `Lanjut (${selectedLivestockIds.size})` : 'Pindahkan Sekarang'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
