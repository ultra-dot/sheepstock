"use client"

import { useState, useRef, useMemo, useEffect } from "react"
import { Scissors, Search, AlertCircle, TrendingUp, CheckCircle2, X, Calendar, Camera, Image, Eye, History, Truck, QrCode, Settings, CheckSquare, Square } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { processHarvest } from "@/app/actions/harvest"
import { UserDropdown } from "@/components/dashboard/user-dropdown"
import dynamic from "next/dynamic"

const QrScannerModal = dynamic(
    () => import("@/components/qr/qr-scanner-modal").then(mod => mod.QrScannerModal),
    { ssr: false }
)

type Livestock = any
type HarvestRecord = any

export function HarvestClient({
    allActiveLivestock,
    harvestHistory,
    avatarUrl,
    userName,
}: {
    allActiveLivestock: Livestock[]
    harvestHistory: HarvestRecord[]
    avatarUrl: string | null
    userName: string
}) {
    const [activeTab, setActiveTab] = useState<'rekomendasi' | 'riwayat_potong' | 'riwayat_jual'>('rekomendasi')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
    
    // Potong Criteria State
    const [minWeightCriteria, setMinWeightCriteria] = useState<number>(25)
    const [tempMinWeight, setTempMinWeight] = useState<string>("25")

    // Multi-select state
    const [selectedForSale, setSelectedForSale] = useState<string[]>([])
    
    // Core selection for modal
    const [selectedLivestocks, setSelectedLivestocks] = useState<Livestock[]>([])
    
    // QR Scanner states
    const [isScannerOpen, setIsScannerOpen] = useState(false)
    const [scannedLivestock, setScannedLivestock] = useState<Livestock | null>(null)

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [filterDate, setFilterDate] = useState("")
    const [photoPreview, setPhotoPreview] = useState<{ url: string; title: string } | null>(null)

    // Form inputs state
    const [harvestType, setHarvestType] = useState<'potong' | 'jual_hidup'>('potong')
    const [weighingMethod, setWeighingMethod] = useState<'borongan' | 'satuan'>('borongan')
    
    // Global inputs (Borongan / Single)
    const [customerName, setCustomerName] = useState("")
    const [sellingPrice, setSellingPrice] = useState("")
    const [liveWeight, setLiveWeight] = useState("")
    const [carcassWeight, setCarcassWeight] = useState("")
    
    // Individual inputs (Satuan)
    const [individualData, setIndividualData] = useState<Record<string, { price: string, weight: string }>>({})

    // File names state for upload confirmation
    const [liveFileName, setLiveFileName] = useState("")
    const [carcassFileName, setCarcassFileName] = useState("")

    // Refs for hidden file inputs
    const liveCameraInputRef = useRef<HTMLInputElement>(null)
    const liveGalleryInputRef = useRef<HTMLInputElement>(null)
    const carcassCameraInputRef = useRef<HTMLInputElement>(null)
    const carcassGalleryInputRef = useRef<HTMLInputElement>(null)

    // Load criteria from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('sheepstock_min_harvest_weight');
        if (saved && !isNaN(Number(saved))) {
            setMinWeightCriteria(Number(saved));
            setTempMinWeight(saved);
        }
    }, [])

    const handleSaveCriteria = () => {
        const num = parseFloat(tempMinWeight);
        if (!isNaN(num) && num > 0) {
            setMinWeightCriteria(num);
            localStorage.setItem('sheepstock_min_harvest_weight', num.toString());
            setIsSettingsModalOpen(false);
        } else {
            alert("Masukkan angka yang valid!");
        }
    }

    // Compute ready to harvest strictly based on dynamic criteria
    const readyToHarvest = useMemo(() => {
        return allActiveLivestock.filter(l => l.status === 'healthy' && l.current_weight >= minWeightCriteria);
    }, [allActiveLivestock, minWeightCriteria])

    // Price thousand separator dot formatting helper
    const formatThousand = (val: string) => {
        if (!val) return "";
        const clean = val.replace(/\D/g, "");
        return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    // Weight decimal comma formatting helper
    const formatDecimalWeight = (val: string) => {
        if (!val) return "";
        let clean = val.replace(/\./g, ",");
        clean = clean.replace(/[^0-9,]/g, "");
        const parts = clean.split(",");
        if (parts.length > 2) {
            clean = parts[0] + "," + parts.slice(1).join("");
        }
        return clean;
    }

    // Status Translator
    const displayStatus = (status: string) => {
        if (status === 'healthy') return 'sehat';
        if (status === 'sick') return 'sakit';
        return status;
    }

    // Weight display helper
    const displayWeight = (w: number | null | undefined) => {
        if (!w) return "-";
        const kg = w > 1000 ? w / 1000 : w;
        return `${kg.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} kg`;
    }

    // Filters
    const filteredRekomendasi = readyToHarvest.filter(l => {
        const matchSearch = !searchQuery || 
            l.qr_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.cages?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.type?.toLowerCase().includes(searchQuery.toLowerCase())
        return matchSearch
    })

    const filteredSemuaDomba = allActiveLivestock.filter(l => {
        const matchSearch = !searchQuery || 
            l.qr_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.cages?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.type?.toLowerCase().includes(searchQuery.toLowerCase())
        return matchSearch
    })

    const filteredRiwayat = harvestHistory.filter(r => {
        const matchSearch = !searchQuery || 
            r.livestocks?.qr_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
        
        let matchDate = true
        if (filterDate && r.harvest_date) {
            const d = new Date(r.harvest_date)
            const localDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            matchDate = localDateStr === filterDate
        }

        const isPotongTab = activeTab === 'riwayat_potong';
        const isJualTab = activeTab === 'riwayat_jual';
        
        let matchTab = true;
        if (isPotongTab) matchTab = r.harvest_type === 'potong' || !r.harvest_type;
        if (isJualTab) matchTab = r.harvest_type === 'jual_hidup';

        return matchSearch && matchDate && matchTab
    })

    const toggleSelectLivestock = (id: string) => {
        if (selectedForSale.includes(id)) {
            setSelectedForSale(selectedForSale.filter(item => item !== id))
        } else {
            setSelectedForSale([...selectedForSale, id])
        }
    }

    const selectAllLivestock = () => {
        if (selectedForSale.length === filteredSemuaDomba.length && filteredSemuaDomba.length > 0) {
            setSelectedForSale([])
        } else {
            setSelectedForSale(filteredSemuaDomba.map(l => l.id))
        }
    }

    const openModalForLivestock = (livestocks: Livestock[], type: 'potong' | 'jual_hidup') => {
        setSelectedLivestocks(livestocks)
        setHarvestType(type)
        setWeighingMethod('borongan') // default
        
        // Reset inputs
        setCustomerName("")
        setSellingPrice("")
        setCarcassWeight("")
        setLiveFileName("")
        setCarcassFileName("")
        setError("")
        
        // Prep individual data if it's bulk
        if (livestocks.length > 1) {
            setLiveWeight("") // Total starts empty
            const initData: any = {}
            livestocks.forEach(lv => {
                initData[lv.id] = {
                    price: "",
                    weight: lv.current_weight ? lv.current_weight.toString().replace(".", ",") : ""
                }
            })
            setIndividualData(initData)
        } else {
            // Single livestock
            const lv = livestocks[0]
            if (lv.current_weight) {
                setLiveWeight(lv.current_weight.toString().replace(".", ","))
            } else {
                setLiveWeight("")
            }
        }
        
        setScannedLivestock(null)
        setIsAddModalOpen(true)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'live' | 'carcass') => {
        const file = e.target.files?.[0]
        if (file) {
            if (type === 'live') {
                setLiveFileName(file.name)
                if (e.target === liveCameraInputRef.current && liveGalleryInputRef.current) liveGalleryInputRef.current.value = ""
                else if (e.target === liveGalleryInputRef.current && liveCameraInputRef.current) liveCameraInputRef.current.value = ""
            } else {
                setCarcassFileName(file.name)
                if (e.target === carcassCameraInputRef.current && carcassGalleryInputRef.current) carcassGalleryInputRef.current.value = ""
                else if (e.target === carcassGalleryInputRef.current && carcassCameraInputRef.current) carcassCameraInputRef.current.value = ""
            }
        }
    }

    const updateIndividualData = (id: string, field: 'price' | 'weight', value: string) => {
        setIndividualData(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value
            }
        }))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError("")
        try {
            const formData = new FormData(e.currentTarget)
            
            // Reconstruct livestock_data array payload
            const dataPayload = selectedLivestocks.map(lv => {
                let finalPrice = 0;
                let finalWeight = 0;
                
                if (harvestType === 'potong' || weighingMethod === 'borongan' || selectedLivestocks.length === 1) {
                    const totalP = parseFloat(sellingPrice.replace(/\./g, "")) || 0;
                    const totalW = parseFloat(liveWeight.replace(/,/g, ".")) || 0;
                    finalPrice = totalP / selectedLivestocks.length;
                    finalWeight = totalW / selectedLivestocks.length;
                } else {
                    const pStr = individualData[lv.id]?.price || "0";
                    const wStr = individualData[lv.id]?.weight || "0";
                    finalPrice = parseFloat(pStr.replace(/\./g, "")) || 0;
                    finalWeight = parseFloat(wStr.replace(/,/g, ".")) || 0;
                }
                
                return {
                    id: lv.id,
                    price: finalPrice,
                    weight: finalWeight
                }
            });

            formData.append('livestock_data', JSON.stringify(dataPayload));
            formData.append('harvest_type', harvestType);
            formData.append('customer_name', customerName);
            
            // Leave raw carcass_weight so server handles it for Potong
            if (harvestType === 'potong') {
                formData.append('carcass_weight', carcassWeight);
            }

            await processHarvest(formData)
            setIsAddModalOpen(false)
            setSelectedLivestocks([])
            setSelectedForSale([]) // clear bulk selection
            setActiveTab(harvestType === 'potong' ? 'riwayat_potong' : 'riwayat_jual')
        } catch (err: any) {
            console.error("[HarvestForm] Error:", err)
            setError(err.message || "Gagal memproses transaksi. Cek koneksi atau coba lagi.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleScan = (scannedCode: string) => {
        const cleanedCode = scannedCode.trim()
        if (!cleanedCode) return

        setIsScannerOpen(false)
        const found = allActiveLivestock.find(l => l.qr_code.toLowerCase() === cleanedCode.toLowerCase())
        if (found) {
            setScannedLivestock(found)
        } else {
            alert(`Domba dengan ID ${cleanedCode} tidak ditemukan, mati, atau sudah terjual.`)
        }
    }

    const totalReady = readyToHarvest.length
    const totalHarvested = harvestHistory.length

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <header className="h-20 sticky top-0 z-30 bg-white/30 dark:bg-slate-950/30 backdrop-blur-md border-b border-emerald-500/10 px-4 md:px-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <SidebarTrigger />
                    <div className="flex items-center gap-2 sm:gap-3 ml-0 sm:ml-2 min-w-0">
                        <h2 className="text-base sm:text-xl font-bold tracking-tight truncate">Panen & Potong</h2>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsScannerOpen(true)} className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all font-semibold text-sm shadow-sm shrink-0">
                        <QrCode className="w-4 h-4" />
                        <span className="hidden sm:inline">Scan QR Tag</span>
                    </button>
                    <UserDropdown avatarUrl={avatarUrl} userName={userName} />
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 relative">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-emerald-500/10 flex items-center gap-3 sm:gap-5 shadow-sm hover:border-emerald-500/30 transition-colors">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                            <Scissors className="text-emerald-500 dark:text-emerald-400 w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wide">Siap Transaksi</p>
                            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 mt-1">
                                {totalReady} <span className="text-xs sm:text-sm font-medium text-slate-400">Ekor</span>
                            </h3>
                            {totalReady > 0 && <p className="text-[10px] sm:text-xs text-emerald-600 font-bold mt-1 truncate">Sehat &amp; bobot ≥ {minWeightCriteria}kg</p>}
                        </div>
                    </div>
                    <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-indigo-500/10 flex items-center gap-3 sm:gap-5 shadow-sm hover:border-indigo-500/30 transition-colors">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
                            <History className="text-indigo-500 dark:text-indigo-400 w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wide">Total Penjualan Selesai</p>
                            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 mt-1">
                                {totalHarvested} <span className="text-xs sm:text-sm font-medium text-slate-400">Transaksi</span>
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Bulk Sell Floating Banner */}
                {selectedForSale.length > 0 && activeTab === 'rekomendasi' && (
                    <div className="sticky top-0 z-20 mx-auto max-w-2xl w-full bg-sky-500 text-white rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 animate-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-base sm:text-lg shrink-0">
                                {selectedForSale.length}
                            </div>
                            <div>
                                <p className="font-bold text-sm sm:text-base">Domba Terpilih</p>
                                <p className="text-[10px] sm:text-xs text-sky-100">Siap untuk dijual hidup</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button onClick={() => setSelectedForSale([])} className="flex-1 sm:flex-none px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded-xl text-xs sm:text-sm font-bold transition-colors">
                                Batal
                            </button>
                            <button 
                                onClick={() => openModalForLivestock(filteredSemuaDomba.filter(l => selectedForSale.includes(l.id)), 'jual_hidup')}
                                className="flex-1 sm:flex-none px-4 py-2 bg-white text-sky-600 hover:bg-sky-50 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <Truck className="w-4 h-4" /> Jual Massal
                            </button>
                        </div>
                    </div>
                )}

                {/* Search & Filters Banner */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-emerald-500/5 p-3 sm:p-4 rounded-2xl border border-emerald-500/10">
                    <div className="flex items-center gap-2 sm:gap-4 flex-wrap flex-1 min-w-0">
                        {/* Tab Switcher */}
                        <div className="flex flex-wrap bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-emerald-500/10 shadow-sm gap-1">
                            <button
                                onClick={() => setActiveTab('rekomendasi')}
                                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${activeTab === 'rekomendasi' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                Jual & Potong
                            </button>
                            <button
                                onClick={() => setActiveTab('riwayat_potong')}
                                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${activeTab === 'riwayat_potong' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                Riwayat Potong
                            </button>
                            <button
                                onClick={() => setActiveTab('riwayat_jual')}
                                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${activeTab === 'riwayat_jual' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                Riwayat Jual Hidup
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="relative flex-1 min-w-[180px] sm:min-w-[260px] group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-emerald-500 transition-colors" />
                            <input 
                                value={searchQuery} 
                                onChange={e => setSearchQuery(e.target.value)} 
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-emerald-500/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-xs sm:text-sm font-medium shadow-sm" 
                                placeholder={activeTab === 'rekomendasi' ? "Cari ID atau lokasi..." : "Cari ID atau nama pembeli..."} 
                                type="text" 
                            />
                        </div>
                    </div>

                    {/* Date filter only for History */}
                    {(activeTab === 'riwayat_potong' || activeTab === 'riwayat_jual') && (
                        <div className="relative shrink-0">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input 
                                value={filterDate} 
                                onChange={e => setFilterDate(e.target.value)} 
                                className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-emerald-500/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-xs sm:text-sm font-medium shadow-sm" 
                                type="date" 
                            />
                        </div>
                    )}
                </div>

                {/* Data Tables Stacked or Single */}
                {activeTab === 'rekomendasi' ? (
                    <div className="space-y-8 pb-10">
                        {/* Table 1: Rekomendasi Potong */}
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-2">
                                <h3 className="text-[11px] sm:text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <Scissors className="w-4 h-4 text-emerald-500 shrink-0"/> <span className="truncate">Siap Potong (Sehat &amp; ≥ {minWeightCriteria}kg)</span>
                                </h3>
                                <button onClick={() => setIsSettingsModalOpen(true)} className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors bg-white dark:bg-slate-900 px-2.5 sm:px-3 py-1.5 rounded-lg border border-emerald-500/10 shadow-sm shrink-0">
                                    <Settings className="w-3.5 h-3.5" /> Kriteria
                                </button>
                            </div>
                            <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-emerald-500/10 rounded-3xl shadow-xl overflow-hidden glass-card">
                                {/* Mobile Card View */}
                                <div className="md:hidden divide-y divide-emerald-500/5 max-h-[400px] overflow-y-auto">
                                    {filteredRekomendasi.length === 0 ? (
                                        <div className="text-center py-10 text-slate-500 font-medium text-sm">Tidak ada domba yang memenuhi kriteria.</div>
                                    ) : filteredRekomendasi.map((lv) => (
                                        <div key={lv.id} className="p-4 space-y-3 hover:bg-emerald-500/5 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{lv.qr_code}</span>
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800">
                                                    <CheckCircle2 className="w-3 h-3" /> {displayStatus(lv.status)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                                <span className="capitalize">{lv.type} - {lv.gender}</span>
                                                <span>•</span>
                                                <span>{lv.cages?.name || '-'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
                                                    <TrendingUp className="w-3.5 h-3.5" /> {displayWeight(lv.current_weight)}
                                                </div>
                                                <button onClick={() => openModalForLivestock([lv], 'potong')} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 transition-all cursor-pointer">
                                                    <Scissors className="w-3.5 h-3.5" /> Potong
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Desktop Table View */}
                                <div className="hidden md:block overflow-x-auto max-h-[350px]">
                                    <table className="w-full text-left border-collapse min-w-[800px]">
                                        <thead className="sticky top-0 z-10 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur">
                                            <tr className="border-b border-emerald-500/10">
                                                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">ID Ternak</th>
                                                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Jenis &amp; Gender</th>
                                                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Lokasi Kandang</th>
                                                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Bobot Terakhir</th>
                                                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                                                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-emerald-500/5">
                                            {filteredRekomendasi.length === 0 ? (
                                                <tr><td colSpan={6} className="text-center py-10 text-slate-500 font-medium text-sm">Tidak ada domba yang memenuhi kriteria panen saat ini.</td></tr>
                                            ) : filteredRekomendasi.map((lv) => (
                                                <tr key={lv.id} className="hover:bg-emerald-500/5 transition-colors group">
                                                    <td className="px-5 py-4"><span className="text-xs font-bold text-slate-700 dark:text-slate-300">{lv.qr_code}</span></td>
                                                    <td className="px-5 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400 capitalize">{lv.type} - {lv.gender}</td>
                                                    <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-400 font-semibold">{lv.cages?.name || '-'}</td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full w-fit">
                                                            <TrendingUp className="w-3.5 h-3.5" />{displayWeight(lv.current_weight)}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800">
                                                            <CheckCircle2 className="w-3 h-3 shrink-0" /> {displayStatus(lv.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        <button onClick={() => openModalForLivestock([lv], 'potong')} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 transition-all cursor-pointer">
                                                            <Scissors className="w-3.5 h-3.5" /> Proses Potong
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Table 2: Bebas Jual Hidup */}
                        <div className="space-y-4">
                            <h3 className="text-[11px] sm:text-sm font-bold text-slate-500 uppercase tracking-wider px-2 flex items-center gap-2">
                                <Truck className="w-4 h-4 text-sky-500 shrink-0"/> <span className="truncate">Katalog Semua Domba (Jual Hidup)</span>
                            </h3>
                            <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-sky-500/10 rounded-3xl shadow-xl overflow-hidden glass-card">
                                {/* Mobile: Select All Header */}
                                <div className="md:hidden flex items-center justify-between p-3 border-b border-sky-500/10 bg-slate-50/50 dark:bg-slate-900/50">
                                    <button onClick={selectAllLivestock} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-sky-500 transition-colors">
                                        {selectedForSale.length === filteredSemuaDomba.length && filteredSemuaDomba.length > 0
                                            ? <CheckSquare className="w-4 h-4 text-sky-500" />
                                            : <Square className="w-4 h-4" />
                                        }
                                        Pilih Semua
                                    </button>
                                    <span className="text-[10px] text-slate-400 font-bold">{filteredSemuaDomba.length} domba</span>
                                </div>
                                {/* Mobile Card View */}
                                <div className="md:hidden divide-y divide-sky-500/5 max-h-[400px] overflow-y-auto">
                                    {filteredSemuaDomba.length === 0 ? (
                                        <div className="text-center py-10 text-slate-500 font-medium text-sm">Tidak ada domba tersedia.</div>
                                    ) : filteredSemuaDomba.map((lv) => (
                                        <div key={lv.id} className={`p-4 space-y-3 transition-colors cursor-pointer ${selectedForSale.includes(lv.id) ? 'bg-sky-50/50 dark:bg-sky-900/20' : 'hover:bg-sky-500/5'}`} onClick={(e) => {
                                            if ((e.target as HTMLElement).closest('button')) return;
                                            toggleSelectLivestock(lv.id)
                                        }}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    {selectedForSale.includes(lv.id) ? <CheckSquare className="w-4 h-4 text-sky-500 shrink-0" /> : <Square className="w-4 h-4 text-slate-400 shrink-0" />}
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{lv.qr_code}</span>
                                                </div>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                                    lv.status === 'healthy' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800' :
                                                    lv.status === 'sick' ? 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-400 dark:border-rose-800' :
                                                    'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                                }`}>{displayStatus(lv.status)}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium pl-6">
                                                <span className="capitalize">{lv.type} - {lv.gender}</span><span>•</span><span>{lv.cages?.name || '-'}</span>
                                            </div>
                                            <div className="flex items-center justify-between pl-6">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-2.5 py-1 rounded-full">
                                                    <TrendingUp className="w-3.5 h-3.5" /> {displayWeight(lv.current_weight)}
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); openModalForLivestock([lv], 'jual_hidup'); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer">
                                                    <Truck className="w-3.5 h-3.5" /> Jual
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Desktop Table View */}
                                <div className="hidden md:block overflow-x-auto max-h-[350px]">
                                    <table className="w-full text-left border-collapse min-w-[800px]">
                                        <thead className="sticky top-0 z-10 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur">
                                            <tr className="border-b border-sky-500/10">
                                                <th className="px-5 py-4 w-12">
                                                    <button onClick={selectAllLivestock} className="text-slate-400 hover:text-sky-500 transition-colors">
                                                        {selectedForSale.length === filteredSemuaDomba.length && filteredSemuaDomba.length > 0 
                                                            ? <CheckSquare className="w-5 h-5 text-sky-500" />
                                                            : <Square className="w-5 h-5" />
                                                        }
                                                    </button>
                                                </th>
                                                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">ID Ternak</th>
                                                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Jenis &amp; Gender</th>
                                                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Lokasi Kandang</th>
                                                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Bobot Terakhir</th>
                                                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                                                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-sky-500/5">
                                            {filteredSemuaDomba.length === 0 ? (
                                                <tr><td colSpan={7} className="text-center py-10 text-slate-500 font-medium text-sm">Tidak ada domba yang tersedia di peternakan.</td></tr>
                                            ) : filteredSemuaDomba.map((lv) => (
                                                <tr key={lv.id} className={`transition-colors group cursor-pointer ${selectedForSale.includes(lv.id) ? 'bg-sky-50/50 dark:bg-sky-900/20' : 'hover:bg-sky-500/5'}`} onClick={(e) => {
                                                    if ((e.target as HTMLElement).closest('button')) return;
                                                    toggleSelectLivestock(lv.id)
                                                }}>
                                                    <td className="px-5 py-4">
                                                        <div className="text-slate-400">
                                                            {selectedForSale.includes(lv.id) ? <CheckSquare className="w-5 h-5 text-sky-500" /> : <Square className="w-5 h-5" />}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4"><span className="text-xs font-bold text-slate-700 dark:text-slate-300">{lv.qr_code}</span></td>
                                                    <td className="px-5 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400 capitalize">{lv.type} - {lv.gender}</td>
                                                    <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-400 font-semibold">{lv.cages?.name || '-'}</td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-2.5 py-1 rounded-full w-fit">
                                                            <TrendingUp className="w-3.5 h-3.5" />{displayWeight(lv.current_weight)}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                            lv.status === 'healthy' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800' :
                                                            lv.status === 'sick' ? 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-400 dark:border-rose-800' :
                                                            'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                                        }`}>{displayStatus(lv.status)}</span>
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        <button onClick={(e) => { e.stopPropagation(); openModalForLivestock([lv], 'jual_hidup'); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/20 transition-all cursor-pointer">
                                                            <Truck className="w-3.5 h-3.5" /> Jual Tunggal
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-emerald-500/10 rounded-3xl shadow-xl overflow-hidden glass-card">
                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-emerald-500/5 max-h-[500px] overflow-y-auto">
                            {filteredRiwayat.length === 0 ? (
                                <div className="text-center py-10 text-slate-500 font-medium text-sm">Belum ada riwayat transaksi.</div>
                            ) : filteredRiwayat.map((r) => {
                                const d = new Date(r.harvest_date)
                                const isJualHidup = r.harvest_type === 'jual_hidup';
                                return (
                                    <div key={r.id} className="p-4 space-y-3 hover:bg-emerald-500/5 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{r.livestocks?.qr_code || '-'}</span>
                                                <span className="text-[10px] text-slate-400 ml-2">{d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800">Selesai</span>
                                        </div>
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                            Pembeli: <span className="text-slate-700 dark:text-slate-300 font-semibold">{r.customer_name}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <div className={`text-xs font-bold ${isJualHidup ? 'text-sky-600 dark:text-sky-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                    {isJualHidup ? '' : 'H: '}{displayWeight(r.live_weight)}
                                                </div>
                                                {!isJualHidup && <div className="text-xs font-bold text-rose-600 dark:text-rose-400">K: {displayWeight(r.carcass_weight)}</div>}
                                            </div>
                                            <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">Rp {r.selling_price.toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {r.live_photo_url && (
                                                <button onClick={() => setPhotoPreview({ url: r.live_photo_url, title: `Bukti Hidup - ${r.livestocks?.qr_code}` })} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold cursor-pointer border border-emerald-500/10"><Eye className="w-3 h-3" /> Hidup</button>
                                            )}
                                            {!isJualHidup && r.carcass_photo_url && (
                                                <button onClick={() => setPhotoPreview({ url: r.carcass_photo_url, title: `Bukti Karkas - ${r.livestocks?.qr_code}` })} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-50 dark:bg-rose-950/40 text-[10px] text-rose-700 dark:text-rose-400 font-bold cursor-pointer border border-rose-500/10"><Eye className="w-3 h-3" /> Karkas</button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-emerald-500/5 border-b border-emerald-500/10">
                                        <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Tanggal</th>
                                        <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">ID Ternak</th>
                                        <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Pembeli</th>
                                        <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">{activeTab === 'riwayat_potong' ? 'Berat (H / K)' : 'Berat Hidup'}</th>
                                        <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Harga Jual</th>
                                        <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center">Status</th>
                                        <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center">Foto Bukti</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-emerald-500/5">
                                    {filteredRiwayat.length === 0 ? (
                                        <tr><td colSpan={7} className="text-center py-10 text-slate-500 font-medium text-sm">Belum ada riwayat transaksi untuk kategori ini.</td></tr>
                                    ) : filteredRiwayat.map((r) => {
                                        const d = new Date(r.harvest_date)
                                        const isJualHidup = r.harvest_type === 'jual_hidup';
                                        return (
                                            <tr key={r.id} className="hover:bg-emerald-500/5 transition-colors group">
                                                <td className="px-5 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">{d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                                <td className="px-5 py-4"><span className="text-xs font-bold text-slate-700 dark:text-slate-300">{r.livestocks?.qr_code || '-'}</span></td>
                                                <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-400 font-semibold">{r.customer_name}</td>
                                                <td className="px-5 py-4 space-y-1">
                                                    <div className={`text-xs font-bold ${isJualHidup ? 'text-sky-600 dark:text-sky-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{isJualHidup ? '' : 'H: '} {displayWeight(r.live_weight)}</div>
                                                    {!isJualHidup && <div className="text-xs font-bold text-rose-600 dark:text-rose-400">K: {displayWeight(r.carcass_weight)}</div>}
                                                </td>
                                                <td className="px-5 py-4 font-mono font-bold text-xs text-slate-700 dark:text-slate-300">Rp {r.selling_price.toLocaleString('id-ID')}</td>
                                                <td className="px-5 py-4 text-center">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800">Selesai</span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {r.live_photo_url ? (
                                                            <button onClick={() => setPhotoPreview({ url: r.live_photo_url, title: `Bukti Hidup - ${r.livestocks?.qr_code}` })} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold hover:underline cursor-pointer border border-emerald-500/10"><Eye className="w-3 h-3" /> Hidup</button>
                                                        ) : <span className="text-xs text-slate-300">-</span>}
                                                        {!isJualHidup && r.carcass_photo_url ? (
                                                            <button onClick={() => setPhotoPreview({ url: r.carcass_photo_url, title: `Bukti Karkas - ${r.livestocks?.qr_code}` })} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-50 dark:bg-rose-950/40 text-[10px] text-rose-700 dark:text-rose-400 font-bold hover:underline cursor-pointer border border-rose-500/10"><Eye className="w-3 h-3" /> Karkas</button>
                                                        ) : !isJualHidup && <span className="text-xs text-slate-300">-</span>}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Criteria Settings Modal */}
            {isSettingsModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200 border border-emerald-500/10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-emerald-500" /> Kriteria Panen
                            </h3>
                            <button onClick={() => setIsSettingsModalOpen(false)} className="text-slate-400 hover:text-rose-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Batas Bobot Minimal (kg)</label>
                                <input 
                                    type="number" 
                                    value={tempMinWeight}
                                    onChange={(e) => setTempMinWeight(e.target.value)}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-emerald-500 transition-all font-bold"
                                />
                            </div>
                            <button onClick={handleSaveCriteria} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20 transition-all">
                                Simpan Kriteria
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* QR Scan Action Prompt */}
            {scannedLivestock && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200 border border-emerald-500/10">
                        <div className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                            <QrCode className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Domba Ditemukan!</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            ID: <span className="font-bold text-slate-700 dark:text-slate-300">{scannedLivestock.qr_code}</span> • 
                            Berat: <span className="font-bold text-slate-700 dark:text-slate-300">{displayWeight(scannedLivestock.current_weight)}</span> • 
                            Status: <span className={`font-bold capitalize ${scannedLivestock.status === 'healthy' ? 'text-emerald-500' : 'text-amber-500'}`}>{displayStatus(scannedLivestock.status)}</span>
                        </p>
                        
                        <div className="space-y-3">
                            <button
                                onClick={() => openModalForLivestock([scannedLivestock], 'potong')}
                                className="w-full py-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                            >
                                <Scissors className="w-5 h-5" /> Lanjut Proses Potong
                            </button>
                            <button
                                onClick={() => openModalForLivestock([scannedLivestock], 'jual_hidup')}
                                className="w-full py-3 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                            >
                                <Truck className="w-5 h-5" /> Lanjut Jual Hidup
                            </button>
                            <button
                                onClick={() => setScannedLivestock(null)}
                                className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold transition-all"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Proses Transaksi (Single & Bulk) */}
            {isAddModalOpen && selectedLivestocks.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-xl w-full max-w-lg sm:my-8 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 border border-emerald-500/10">
                        <div className="p-4 sm:p-6 border-b border-emerald-500/10 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 rounded-t-3xl z-10">
                            <div>
                                <h3 className={`text-lg font-bold ${harvestType === 'potong' ? 'text-rose-600 dark:text-rose-400' : 'text-sky-600 dark:text-sky-400'} flex items-center gap-2`}>
                                    {harvestType === 'potong' ? <><Scissors className="w-5 h-5"/> Proses Pemotongan</> : <><Truck className="w-5 h-5"/> Proses Jual Hidup {selectedLivestocks.length > 1 ? `(${selectedLivestocks.length} Domba)` : ''}</>}
                                </h3>
                                {selectedLivestocks.length === 1 && (
                                    <p className="text-xs text-slate-500 mt-1">ID Ternak: <span className="font-bold text-slate-700 dark:text-slate-300">{selectedLivestocks[0].qr_code}</span></p>
                                )}
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors p-2 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                            {error && (
                                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-500/10 text-rose-600 dark:text-rose-400 text-xs sm:text-sm rounded-xl flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <p className="font-medium">{error}</p>
                                </div>
                            )}

                            {/* Timbangan Method Toggle for Bulk Jual Hidup */}
                            {harvestType === 'jual_hidup' && selectedLivestocks.length > 1 && (
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Metode Timbang & Harga</label>
                                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <button
                                            type="button"
                                            onClick={() => setWeighingMethod('borongan')}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${weighingMethod === 'borongan' ? 'bg-white text-sky-600 shadow-sm dark:bg-slate-700 dark:text-sky-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                        >
                                            Borongan (Satu Harga Total)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setWeighingMethod('satuan')}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${weighingMethod === 'satuan' ? 'bg-white text-sky-600 shadow-sm dark:bg-slate-700 dark:text-sky-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                        >
                                            Satuan (Per Domba)
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Global Customer Name */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Pembeli</label>
                                <input value={customerName} onChange={e => setCustomerName(e.target.value)} required type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-semibold" placeholder="Misal: H. Lulung" />
                            </div>

                            {/* Borongan / Single Pricing */}
                            {(harvestType === 'potong' || weighingMethod === 'borongan' || selectedLivestocks.length === 1) && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                            {selectedLivestocks.length > 1 ? 'TOTAL HARGA JUAL KESELURUHAN (RP)' : 'Harga Jual (Rp)'}
                                        </label>
                                        <input 
                                            required 
                                            type="text" 
                                            value={sellingPrice}
                                            onChange={(e) => setSellingPrice(formatThousand(e.target.value))}
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-semibold text-right" 
                                            placeholder="Misal: 3.500.000" 
                                        />
                                    </div>
                                    <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl">
                                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            {selectedLivestocks.length > 1 ? 'TOTAL BERAT HIDUP KESELURUHAN (KG)' : 'Berat Hidup (kg)'}
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={liveWeight}
                                            onChange={(e) => setLiveWeight(formatDecimalWeight(e.target.value))}
                                            className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-750 dark:text-slate-300 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-right"
                                            placeholder="Misal: 27,3"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Satuan Pricing (Bulk only) */}
                            {harvestType === 'jual_hidup' && selectedLivestocks.length > 1 && weighingMethod === 'satuan' && (
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Input Spesifik Per Domba</label>
                                    {selectedLivestocks.map((lv, idx) => (
                                        <div key={lv.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{idx+1}. ID: {lv.qr_code}</span>
                                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Rekam: {displayWeight(lv.current_weight)}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Harga (Rp)</label>
                                                    <input 
                                                        required 
                                                        type="text" 
                                                        value={formatThousand(individualData[lv.id]?.price || "")}
                                                        onChange={(e) => updateIndividualData(lv.id, 'price', e.target.value.replace(/\D/g, ""))}
                                                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-sky-500 transition-all font-semibold text-right" 
                                                        placeholder="Misal: 3000000" 
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Berat Hidup (kg)</label>
                                                    <input 
                                                        required 
                                                        type="text" 
                                                        value={individualData[lv.id]?.weight || ""}
                                                        onChange={(e) => updateIndividualData(lv.id, 'weight', formatDecimalWeight(e.target.value))}
                                                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-sky-500 transition-all font-semibold text-right" 
                                                        placeholder="Misal: 25,5" 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Global Live Photo */}
                            <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl">
                                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    FOTO BUKTI HIDUP {selectedLivestocks.length > 1 ? '(GLOBAL)' : '+ TIMBANGAN'}
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => liveCameraInputRef.current?.click()}
                                        className="flex-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <Camera className="w-3.5 h-3.5" /> Kamera
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => liveGalleryInputRef.current?.click()}
                                        className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <Image className="w-3.5 h-3.5" /> Galeri
                                    </button>
                                </div>
                                <input type="file" accept="image/*" capture="environment" ref={liveCameraInputRef} onChange={(e) => handleFileChange(e, 'live')} className="hidden" name="live_photo_camera" />
                                <input type="file" accept="image/*" ref={liveGalleryInputRef} onChange={(e) => handleFileChange(e, 'live')} className="hidden" name="live_photo_gallery" />
                                {liveFileName && <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold truncate max-w-full">✓ {liveFileName}</p>}
                            </div>

                            {/* Carcass Form (Only Potong, which is only single) */}
                            {harvestType === 'potong' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                            Foto Karkas + Timbangan
                                        </label>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => carcassCameraInputRef.current?.click()} className="flex-1 py-2 px-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs font-bold rounded-xl border border-rose-500/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                                                <Camera className="w-3.5 h-3.5" /> Kamera
                                            </button>
                                            <button type="button" onClick={() => carcassGalleryInputRef.current?.click()} className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                                                <Image className="w-3.5 h-3.5" /> Galeri
                                            </button>
                                        </div>
                                        <input type="file" accept="image/*" capture="environment" ref={carcassCameraInputRef} onChange={(e) => handleFileChange(e, 'carcass')} className="hidden" name="carcass_photo_camera" />
                                        <input type="file" accept="image/*" ref={carcassGalleryInputRef} onChange={(e) => handleFileChange(e, 'carcass')} className="hidden" name="carcass_photo_gallery" />
                                        {carcassFileName && <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold truncate max-w-full">✓ {carcassFileName}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Berat Karkas (kg)
                                        </label>
                                        <input
                                            required={harvestType === 'potong'}
                                            type="text"
                                            value={carcassWeight}
                                            onChange={(e) => setCarcassWeight(formatDecimalWeight(e.target.value))}
                                            className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-750 dark:text-slate-300 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all text-right"
                                            placeholder="Misal: 15,5"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold transition-all">Batal</button>
                                <button type="submit" disabled={isSubmitting} className={`flex-[2] px-4 py-3 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg transition-all cursor-pointer ${harvestType === 'potong' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 'bg-sky-500 hover:bg-sky-600 shadow-sky-500/20'}`}>
                                    {isSubmitting ? "Memproses..." : "Simpan Data Transaksi"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Photo Preview Modal */}
            {photoPreview && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm" onClick={() => setPhotoPreview(null)}>
                    <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
                        <button onClick={() => setPhotoPreview(null)} className="absolute -top-12 right-0 text-white hover:text-rose-400 cursor-pointer">
                            <X className="w-8 h-8" />
                        </button>
                        <img src={photoPreview.url} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-3xl border border-emerald-500/10 shadow-2xl" />
                        <p className="text-white font-bold mt-4 text-sm sm:text-base">{photoPreview.title}</p>
                    </div>
                </div>
            )}

            {/* QR Scanner Modal component */}
            <QrScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScanSuccess={handleScan}
            />
        </div>
    )
}
