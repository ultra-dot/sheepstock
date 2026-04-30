"use client"

import { useState, startTransition } from "react"
import { Activity, Plus, Stethoscope, Search, Calendar, Filter, Download, Pill, Eye, Users, X, Trash2, AlertCircle, ScanLine } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { addHealthRecord, deleteHealthRecord, updateHealthRecord } from "@/app/actions/health"
import { QrScannerModal } from "@/components/qr/qr-scanner-modal"

type HealthRecord = any
type Livestock = { id: string; qr_code: string; type: string; cage_id: string }
type Cage = { id: string; name: string }
type MedicineItem = { id: string; name: string; current_stock: number; unit: string }

export function HealthClient({
    records,
    livestocks,
    cages,
    medicines,
    avatarUrl,
}: {
    records: HealthRecord[]
    livestocks: Livestock[]
    cages: Cage[]
    medicines: MedicineItem[]
    avatarUrl: string | null
}) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [viewRecord, setViewRecord] = useState<HealthRecord | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [filterStatus, setFilterStatus] = useState("")
    const [filterDate, setFilterDate] = useState("")

    // Modal form state
    const [selectedCageId, setSelectedCageId] = useState("")
    const [selectedLivestockId, setSelectedLivestockId] = useState("")
    const [isQrScannerOpen, setIsQrScannerOpen] = useState(false)
    const [selectedKeluhan, setSelectedKeluhan] = useState("")
    const [selectedDiagnosa, setSelectedDiagnosa] = useState("")
    const [selectedStatus, setSelectedStatus] = useState("pemulihan")
    const [editRecord, setEditRecord] = useState<any>(null)

    // Filter livestocks by selected cage
    const filteredLivestocks = selectedCageId
        ? livestocks.filter(l => l.cage_id === selectedCageId)
        : livestocks

    const handleQrScan = (qrCode: string) => {
        setIsQrScannerOpen(false)
        const found = livestocks.find(l => l.qr_code === qrCode)
        if (found) {
            setSelectedCageId(found.cage_id || "")
            setSelectedLivestockId(found.id)
        } else {
            setError(`Ternak dengan QR "${qrCode}" tidak ditemukan.`)
        }
    }

    // Dynamic summary
    const sickCount = records.filter(r => r.status === "karantina" || r.status === "pemulihan").length
    const medicineCounts: Record<string, number> = {}
    records.forEach(r => {
        const name = r.inventory_items?.name
        if (name) medicineCounts[name] = (medicineCounts[name] || 0) + 1
    })
    const topMedicine = Object.entries(medicineCounts).sort((a, b) => b[1] - a[1])[0]

    // Filter
    const filtered = records.filter(r => {
        const matchSearch = !searchQuery || [r.livestocks?.qr_code, r.illness_description, r.treatment, r.inventory_items?.name].some(v => v?.toLowerCase().includes(searchQuery.toLowerCase()))
        const matchStatus = !filterStatus || r.status === filterStatus
        let matchDate = true
        if (filterDate && r.date) {
            const d = new Date(r.date)
            const localDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            matchDate = localDateStr === filterDate
        }
        return matchSearch && matchStatus && matchDate
    })

    const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError("")
        try {
            const formData = new FormData(e.currentTarget)
            // Debug: log form data
            const debugEntries: Record<string, string> = {}
            formData.forEach((v, k) => debugEntries[k] = v as string)
            console.log("[HealthForm] Submitting:", debugEntries)
            
            await addHealthRecord(formData)
            setIsAddModalOpen(false)
            setSelectedCageId("")
            setSelectedLivestockId("")
            setSelectedKeluhan("")
            setSelectedDiagnosa("")
            setSelectedStatus("pemulihan")
        } catch (err: any) {
            console.error("[HealthForm] Error:", err)
            setError(err.message || "Gagal menyimpan. Cek console untuk detail.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!editRecord) return
        setIsSubmitting(true)
        setError("")
        try {
            const formData = new FormData(e.currentTarget)
            await updateHealthRecord(editRecord.id, formData)
            setEditRecord(null)
        } catch (err: any) {
            console.error("[HealthForm] Edit Error:", err)
            setError(err.message || "Gagal menyimpan perubahan")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = (id: string) => {
        if (!confirm("Yakin ingin menghapus catatan ini?")) return
        startTransition(async () => {
            try {
                await deleteHealthRecord(id)
            } catch (err: any) {
                alert(err.message || "Gagal menghapus")
            }
        })
    }

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            selesai: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
            pemulihan: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
            karantina: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",
        }
        const labels: Record<string, string> = { selesai: "Selesai", pemulihan: "Pemulihan", karantina: "Karantina" }
        return (
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${map[status] || "bg-slate-100 text-slate-600"}`}>
                {labels[status] || status}
            </span>
        )
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <header className="h-20 sticky top-0 z-30 bg-white/30 dark:bg-slate-950/30 backdrop-blur-md border-b border-emerald-500/10 px-4 md:px-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <SidebarTrigger />
                    <div className="flex items-center gap-2 sm:gap-3 ml-0 sm:ml-2 min-w-0">
                        <Activity className="text-emerald-500 w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                        <h2 className="text-base sm:text-xl font-bold tracking-tight truncate">Kesehatan Ternak</h2>
                    </div>
                </div>
                <div className="flex gap-2 sm:gap-4 items-center shrink-0">
                    <button onClick={() => { setIsAddModalOpen(true); setError(""); setSelectedCageId(""); setSelectedLivestockId(""); setSelectedKeluhan(""); setSelectedDiagnosa("") }} className="flex items-center gap-2 px-3 sm:px-6 py-2.5 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-all font-bold text-sm shadow-lg shadow-emerald-500/20 cursor-pointer">
                        <Plus className="w-5 h-5 shrink-0" />
                        <span className="hidden sm:inline">Catat Pengobatan</span>
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
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-rose-500/10 flex items-center gap-5 shadow-sm hover:border-rose-500/30 transition-colors">
                        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-900/40 flex items-center justify-center">
                            <Activity className="text-rose-500 dark:text-rose-400 w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Total Kasus</p>
                            <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-1">{records.length} <span className="text-sm font-medium text-slate-400">Catatan</span></h3>
                            {sickCount > 0 && <p className="text-xs text-rose-500 font-bold mt-1">{sickCount} masih dalam perawatan</p>}
                        </div>
                    </div>
                    <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-blue-500/10 flex items-center gap-5 shadow-sm hover:border-blue-500/30 transition-colors">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center">
                            <Stethoscope className="text-blue-500 dark:text-blue-400 w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Obat Terbanyak Dipakai</p>
                            <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-1">
                                {topMedicine ? topMedicine[0] : "—"} {topMedicine && <span className="text-sm font-medium text-slate-400">({topMedicine[1]}x)</span>}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 bg-emerald-500/5 p-3 sm:p-4 rounded-2xl border border-emerald-500/10">
                    <div className="relative flex-1 min-w-[180px] sm:min-w-[300px] group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-emerald-500/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-sm font-medium shadow-sm" placeholder="Cari ID Ternak, Diagnosa atau Obat..." type="text" />
                    </div>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input value={filterDate} onChange={e => setFilterDate(e.target.value)} className="pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-emerald-500/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-sm font-medium shadow-sm" type="date" />
                    </div>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-6 py-3 bg-white dark:bg-slate-900 border border-emerald-500/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm font-medium shadow-sm appearance-none cursor-pointer border-r-8 border-r-transparent">
                        <option value="">Semua Status</option>
                        <option value="selesai">Selesai</option>
                        <option value="pemulihan">Pemulihan</option>
                        <option value="karantina">Karantina</option>
                    </select>
                </div>

                {/* Data Table */}
                <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-emerald-500/10 rounded-3xl shadow-xl overflow-hidden glass-card">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="bg-emerald-500/5 border-b border-emerald-500/10">
                                    <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Tgl Masuk</th>
                                    <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Tgl Keluar</th>
                                    <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">ID Ternak</th>
                                    <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Keluhan</th>
                                    <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Tindakan</th>
                                    <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Obat</th>
                                    <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                                    <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-500/5">
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={8} className="text-center py-10 text-slate-500 font-medium text-sm">Belum ada rekam medis.</td></tr>
                                ) : (
                                    filtered.map((record) => (
                                        <tr key={record.id} className="hover:bg-emerald-500/5 transition-colors group">
                                            <td className="px-3 py-3">
                                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                                    {new Date(record.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' })}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3">
                                                {record.resolved_at ? (
                                                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                                        {new Date(record.resolved_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' })}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-rose-500 font-bold animate-pulse">Aktif</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold rounded text-xs">
                                                    {record.livestocks?.qr_code || '-'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate max-w-[160px]" title={record.illness_description}>
                                                    {record.illness_description}
                                                </p>
                                            </td>
                                            <td className="px-3 py-3">
                                                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate max-w-[160px]" title={record.treatment}>
                                                    {record.treatment}
                                                </p>
                                            </td>
                                            <td className="px-3 py-3">
                                                {record.inventory_items?.name ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-full border border-slate-200 dark:border-slate-700">
                                                        <Pill className="w-3 h-3" />
                                                        {record.inventory_items.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-xs">-</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3">{statusBadge(record.status)}</td>
                                            <td className="px-3 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => setViewRecord(record)} className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer" title="Detail">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => {
                                                        setEditRecord(record)
                                                        setSelectedStatus(record.status || "pemulihan")
                                                        setSelectedKeluhan(record.illness_description)
                                                        setSelectedDiagnosa(record.treatment)
                                                    }} className="text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer" title="Edit">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                                                    </button>
                                                    <button onClick={() => handleDelete(record.id)} className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer" title="Hapus">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-xl font-bold">Catat Pengobatan</h3>
                                <p className="text-sm text-slate-500 font-medium mt-1">Tambahkan catatan kesehatan ternak.</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-slate-200 cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                            {error && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl flex items-center gap-2 border border-red-100">
                                    <AlertCircle className="w-4 h-4 shrink-0" />{error}
                                </div>
                            )}
                            {/* QR Scan Button */}
                            <button type="button" onClick={() => setIsQrScannerOpen(true)} className="w-full py-3 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors cursor-pointer">
                                <ScanLine className="w-5 h-5" />
                                Scan QR Code Ternak
                            </button>

                            <div className="relative flex items-center">
                                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                                <span className="flex-shrink-0 mx-3 text-slate-400 text-[10px] font-bold tracking-wider uppercase">atau pilih manual</span>
                                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kandang</label>
                                    <select value={selectedCageId} onChange={e => { setSelectedCageId(e.target.value); setSelectedLivestockId("") }} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm appearance-none cursor-pointer">
                                        <option value="">Semua Kandang</option>
                                        {cages.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ternak *</label>
                                    <select required name="livestock_id" value={selectedLivestockId} onChange={e => setSelectedLivestockId(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm appearance-none cursor-pointer">
                                        <option value="">Pilih Ternak</option>
                                        {filteredLivestocks.map(l => <option key={l.id} value={l.id}>{l.qr_code} ({l.type})</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tanggal *</label>
                                <input required name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Keluhan / Gejala *</label>
                                <select value={selectedKeluhan} onChange={e => setSelectedKeluhan(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm appearance-none cursor-pointer mb-2">
                                    <option value="">Pilih gejala...</option>
                                    <option value="Tidak mau makan, nafsu makan menurun">Tidak mau makan / nafsu makan menurun</option>
                                    <option value="Lemas, tidak aktif bergerak">Lemas, tidak aktif bergerak</option>
                                    <option value="Demam tinggi, suhu tubuh naik">Demam tinggi</option>
                                    <option value="Diare / mencret">Diare / mencret</option>
                                    <option value="Kembung, perut membesar">Kembung, perut membesar</option>
                                    <option value="Batuk, pilek, bersin">Batuk / pilek / bersin</option>
                                    <option value="Mata berair, bengkak">Mata berair / bengkak</option>
                                    <option value="Luka pada kulit atau kaki">Luka pada kulit / kaki</option>
                                    <option value="Bulu rontok, kulit bersisik">Bulu rontok / kulit bersisik</option>
                                    <option value="Pincang, sulit berjalan">Pincang, sulit berjalan</option>
                                    <option value="Cacingan, terlihat cacing pada feses">Cacingan</option>
                                    <option value="Kutu / parasit eksternal">Kutu / parasit eksternal</option>
                                    <option value="__lainnya__">Lainnya (tulis sendiri)</option>
                                </select>
                                {selectedKeluhan === "__lainnya__" ? (
                                    <textarea required name="illness_description" rows={2} placeholder="Tulis gejala/keluhan di sini..." className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none" />
                                ) : (
                                    <input type="hidden" name="illness_description" value={selectedKeluhan} />
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Diagnosa & Tindakan *</label>
                                <select value={selectedDiagnosa} onChange={e => setSelectedDiagnosa(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm appearance-none cursor-pointer mb-2">
                                    <option value="">Pilih tindakan...</option>
                                    <option value="Pemberian obat cacing (deworming)">Pemberian obat cacing</option>
                                    <option value="Pemberian antibiotik">Pemberian antibiotik</option>
                                    <option value="Pemberian vitamin dan suplemen">Pemberian vitamin & suplemen</option>
                                    <option value="Vaksinasi">Vaksinasi</option>
                                    <option value="Pembersihan dan perawatan luka">Perawatan luka</option>
                                    <option value="Pemberian obat diare / anti mencret">Pemberian obat diare</option>
                                    <option value="Pemandian anti parasit (dipping)">Pemandian anti parasit (dipping)</option>
                                    <option value="Pemotongan kuku / perawatan kaki">Pemotongan kuku / perawatan kaki</option>
                                    <option value="Isolasi / karantina untuk observasi">Isolasi / karantina</option>
                                    <option value="Pemberian cairan infus / rehidrasi">Rehidrasi / infus</option>
                                    <option value="Konsultasi dengan dokter hewan">Konsultasi dokter hewan</option>
                                    <option value="__lainnya__">Lainnya (tulis sendiri)</option>
                                </select>
                                {selectedDiagnosa === "__lainnya__" ? (
                                    <textarea required name="treatment" rows={2} placeholder="Tulis diagnosa & tindakan di sini..." className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none" />
                                ) : (
                                    <input type="hidden" name="treatment" value={selectedDiagnosa} />
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Obat (Opsional)</label>
                                    <select name="medicine_id" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm appearance-none cursor-pointer">
                                        <option value="">Tanpa Obat</option>
                                        {medicines.map(m => <option key={m.id} value={m.id}>{m.name} (Stok: {m.current_stock} {m.unit})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Jumlah Obat</label>
                                    <input name="medicine_qty" type="number" step="0.1" min="0" placeholder="0" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status *</label>
                                <select required name="status" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm appearance-none cursor-pointer">
                                    <option value="pemulihan">Pemulihan</option>
                                    <option value="karantina">Karantina</option>
                                    <option value="selesai">Selesai</option>
                                </select>
                            </div>
                            {selectedStatus === "karantina" && (
                                <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl space-y-2">
                                    <label className="block text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Pindah ke Kandang Karantina? (Opsional)</label>
                                    <select name="quarantine_cage_id" className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-rose-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-sm appearance-none cursor-pointer">
                                        <option value="">Tetap di kandang saat ini</option>
                                        {cages.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <p className="text-[10px] text-rose-400 dark:text-rose-500">Pilih kandang tujuan jika ternak perlu diisolasi.</p>
                                </div>
                            )}
                            <div className="pt-4 flex gap-3 shrink-0">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-colors cursor-pointer">Batal</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer">{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Record Modal */}
            {editRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                            <h3 className="text-xl font-bold">Edit Rekam Medis</h3>
                            <button onClick={() => setEditRecord(null)} className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-slate-200 cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Keluhan / Gejala *</label>
                                <textarea required name="illness_description" value={selectedKeluhan} onChange={e => setSelectedKeluhan(e.target.value)} rows={2} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Diagnosa & Tindakan *</label>
                                <textarea required name="treatment" value={selectedDiagnosa} onChange={e => setSelectedDiagnosa(e.target.value)} rows={2} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status *</label>
                                <select required name="status" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm appearance-none cursor-pointer">
                                    <option value="pemulihan">Pemulihan</option>
                                    <option value="karantina">Karantina</option>
                                    <option value="selesai">Selesai</option>
                                </select>
                            </div>
                            {selectedStatus === "selesai" && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tanggal Selesai (Opsional)</label>
                                    <input type="date" name="resolved_at" defaultValue={editRecord.resolved_at ? new Date(editRecord.resolved_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                                    <p className="text-[10px] text-slate-500 mt-1">Tanggal saat ternak dinyatakan sehat.</p>
                                </div>
                            )}
                            <div className="pt-4 flex gap-3 shrink-0">
                                <button type="button" onClick={() => setEditRecord(null)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-colors cursor-pointer">Batal</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer">{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Detail Modal */}
            {viewRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                            <h3 className="text-xl font-bold">Detail Rekam Medis</h3>
                            <button onClick={() => setViewRecord(null)} className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-slate-200 cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID Ternak</p><p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">{viewRecord.livestocks?.qr_code || '-'}</p></div>
                                <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal</p><p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">{new Date(viewRecord.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
                            </div>
                            <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Keluhan / Gejala</p><p className="text-sm text-slate-600 dark:text-slate-400 mt-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">{viewRecord.illness_description}</p></div>
                            <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Diagnosa & Tindakan</p><p className="text-sm text-slate-600 dark:text-slate-400 mt-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">{viewRecord.treatment}</p></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Obat</p><p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">{viewRecord.inventory_items?.name || '-'}</p></div>
                                <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jumlah Obat</p><p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">{viewRecord.medicine_qty || '-'}</p></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</p><div className="mt-2">{statusBadge(viewRecord.status)}</div></div>
                                {viewRecord.resolved_at && (
                                    <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Selesai</p><p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">{new Date(viewRecord.resolved_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* QR Scanner Modal */}
            <QrScannerModal
                isOpen={isQrScannerOpen}
                onClose={() => setIsQrScannerOpen(false)}
                onScanSuccess={handleQrScan}
                title="Scan QR Ternak"
                description="Arahkan kamera ke QR Code pada ear-tag domba."
            />
        </div>
    )
}
