"use client"

import { useState } from "react"
import { Box, ArrowUpRight, ArrowDownRight, Search, Filter, MoreVertical, BoxSelect, Syringe, Bug, Pill, X, PlusCircle, Users, Trash2 } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { updateStock, addInventoryItem, deleteInventoryItem } from "@/app/actions/inventory"

type InventoryItem = any // type this properly later

export function InventoryClient({
    items,
    avatarUrl,
    totalItems,
    lowStockItems,
    totalEstValue
}: {
    items: InventoryItem[],
    avatarUrl: string | null,
    totalItems: number,
    lowStockItems: number,
    totalEstValue: string
}) {
    const [isStockInModalOpen, setIsStockInModalOpen] = useState(false)
    const [isStockOutModalOpen, setIsStockOutModalOpen] = useState(false)
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleStockInSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        const formData = new FormData(e.currentTarget)
        const itemId = formData.get("item_id") as string
        const quantity = parseFloat(formData.get("quantity") as string)
        try {
            await updateStock(itemId, quantity, 'in')
            setIsStockInModalOpen(false)
            alert("Stok berhasil ditambahkan!")
        } catch (error: any) {
            console.error(error)
            alert(error.message || "Gagal menambahkan stok")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleStockOutSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        const formData = new FormData(e.currentTarget)
        const itemId = formData.get("item_id") as string
        const quantity = parseFloat(formData.get("quantity") as string)
        try {
            await updateStock(itemId, quantity, 'out')
            setIsStockOutModalOpen(false)
            alert("Stok berhasil dikurangi!")
        } catch (error: any) {
            console.error(error)
            alert(error.message || "Gagal mengurangi stok")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleAddItemSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await addInventoryItem(new FormData(e.currentTarget))
            setIsAddItemModalOpen(false)
            alert("Barang baru berhasil ditambahkan!")
        } catch (error: any) {
            console.error(error)
            alert(error.message || "Gagal menambahkan barang")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteItem = async (itemId: string, itemName: string) => {
        if (!confirm(`Hapus "${itemName}" dari inventori?`)) return
        try {
            await deleteInventoryItem(itemId)
            alert("Barang berhasil dihapus!")
        } catch (error: any) {
            console.error(error)
            alert(error.message || "Gagal menghapus barang")
        }
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <header className="h-20 sticky top-0 z-30 bg-white/30 dark:bg-slate-950/30 backdrop-blur-md border-b border-emerald-500/10 px-4 md:px-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                    <SidebarTrigger />
                    <div className="flex items-center gap-2 sm:gap-3 ml-0 sm:ml-2 min-w-0">
                        <h2 className="text-base sm:text-xl font-bold tracking-tight truncate">Manajemen Pakan</h2>
                    </div>
                </div>
                <div className="flex gap-2 sm:gap-3 items-center shrink-0">
                    <button onClick={() => setIsStockOutModalOpen(true)} className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white dark:bg-slate-800 border border-emerald-500/20 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-semibold text-sm shadow-sm shrink-0">
                        <ArrowUpRight className="w-5 h-5 shrink-0" />
                        <span className="hidden sm:inline">Stok Keluar</span>
                    </button>
                    <button onClick={() => setIsStockInModalOpen(true)} className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white dark:bg-slate-800 border border-emerald-500/20 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-semibold text-sm shadow-sm shrink-0">
                        <ArrowDownRight className="w-5 h-5 shrink-0" />
                        <span className="hidden sm:inline">Stok Masuk</span>
                    </button>
                    <button onClick={() => setIsAddItemModalOpen(true)} className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all font-semibold text-sm shadow-md shadow-emerald-500/20 shrink-0">
                        <PlusCircle className="w-5 h-5 shrink-0" />
                        <span className="hidden sm:inline">Tambah Item</span>
                    </button>
                    {avatarUrl ? (
                        <div className="h-10 w-10 ml-2 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-emerald-500/20 hidden sm:flex">
                            <img className="w-full h-full object-cover" alt="User avatar" src={avatarUrl} />
                        </div>
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
                                                    <button onClick={() => handleDeleteItem(item.id, item.name)} className="w-8 h-8 rounded-lg inline-flex items-center justify-center hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 transition-all">
                                                        <Trash2 className="w-4 h-4" />
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

            {/* Stok Masuk Modal */}
            {isStockInModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-xl font-bold">Stok Masuk</h3>
                                <p className="text-sm text-slate-500 font-medium mt-1">Tambahkan jumlah stok baru untuk barang yang ada.</p>
                            </div>
                            <button onClick={() => setIsStockInModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-slate-200">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleStockInSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pilih Barang *</label>
                                <select required name="item_id" defaultValue="" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm appearance-none cursor-pointer">
                                    <option value="" disabled>-- Pilih Barang --</option>
                                    {items.map(item => (
                                        <option key={item.id} value={item.id}>
                                            {item.name} (Stok Saat Ini: {item.current_stock} {item.unit})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Jumlah Tambahan *</label>
                                <input required name="quantity" type="number" step="0.1" min="0.1" placeholder="Misal: 50" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                            </div>
                            <div className="pt-4">
                                <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50">
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Stok Masuk'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Stok Keluar Modal */}
            {isStockOutModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-xl font-bold">Stok Keluar</h3>
                                <p className="text-sm text-slate-500 font-medium mt-1">Kurangi jumlah stok untuk barang yang digunakan.</p>
                            </div>
                            <button onClick={() => setIsStockOutModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-slate-200">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleStockOutSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pilih Barang *</label>
                                <select required name="item_id" defaultValue="" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm appearance-none cursor-pointer">
                                    <option value="" disabled>-- Pilih Barang --</option>
                                    {items.filter(item => item.current_stock > 0).map(item => (
                                        <option key={item.id} value={item.id}>
                                            {item.name} (Stok Tersedia: {item.current_stock} {item.unit})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Jumlah Dikurangi *</label>
                                <input required name="quantity" type="number" step="0.1" min="0.1" placeholder="Misal: 10" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                            </div>
                            <div className="pt-4">
                                <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50">
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Stok Keluar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Tambah Item Baru Modal */}
            {isAddItemModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-xl font-bold">Tambah Item Baru</h3>
                                <p className="text-sm text-slate-500 font-medium mt-1">Daftarkan barang inventaris baru ke sistem.</p>
                            </div>
                            <button onClick={() => setIsAddItemModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-slate-200">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleAddItemSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Barang *</label>
                                <input required name="name" type="text" placeholder="Contoh: Rumput Gajah" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kategori *</label>
                                    <select required name="type" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm appearance-none cursor-pointer">
                                        <option value="feed">Pakan</option>
                                        <option value="medicine">Obat</option>
                                        <option value="vaccine">Vaksin</option>
                                        <option value="equipment">Peralatan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Satuan *</label>
                                    <select required name="unit" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm appearance-none cursor-pointer">
                                        <option value="kg">Kg</option>
                                        <option value="liter">Liter</option>
                                        <option value="pcs">Pcs</option>
                                        <option value="botol">Botol</option>
                                        <option value="sachet">Sachet</option>
                                        <option value="karung">Karung</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Stok Awal *</label>
                                    <input required name="current_stock" type="number" step="0.1" min="0" placeholder="Misal: 100" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Batas Minimum *</label>
                                    <input required name="min_stock_alert" type="number" step="0.1" min="0" placeholder="Misal: 10" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3 shrink-0">
                                <button type="button" onClick={() => setIsAddItemModalOpen(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-colors">
                                    Batal
                                </button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50">
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
