"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { Camera, AlertCircle, RefreshCcw, ArrowLeft, Edit2, Eye, ScanLine, Search, Activity, X, Check, Warehouse } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { createClient } from '@/lib/supabase/client';
import { updateLivestock, getLivestockHistory } from '@/app/actions/livestock';

type ViewMode = 'scanner' | 'result' | 'detail' | 'edit' | 'mutasi';

export default function ScanPage() {
    const router = useRouter();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
    const [isClient, setIsClient] = useState(false);
    const [isScanning, setIsScanning] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [scannedData, setScannedData] = useState<any | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('scanner');

    // Detail view state
    const [history, setHistory] = useState<{ healthRecords: any[], weighingRecords: any[] } | null>(null);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [detailTab, setDetailTab] = useState<'info' | 'health'>('info');

    // Edit & Mutasi state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editStatus, setEditStatus] = useState('healthy');
    const [cages, setCages] = useState<any[]>([]);
    const [medicines, setMedicines] = useState<any[]>([]);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [selectedKeluhan, setSelectedKeluhan] = useState('');
    const [selectedDiagnosa, setSelectedDiagnosa] = useState('');
    const [activeHealthRecord, setActiveHealthRecord] = useState<any | null>(null);

    const supabase = createClient();

    useEffect(() => { setIsClient(true); }, []);

    const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
        if (detectedCodes.length > 0 && isScanning && !isFetching) {
            const result = detectedCodes[0].rawValue;
            let parsedId = result;
            try {
                if (result.includes('http')) {
                    const url = new URL(result);
                    const parts = url.pathname.split('/');
                    parsedId = parts[parts.length - 1];
                }
            } catch (e) { /* ignore */ }

            setIsScanning(false);
            setIsFetching(true);
            setErrorMsg(null);

            try {
                let { data, error } = await supabase.from('livestocks').select('*, cages(name)').ilike('qr_code', parsedId).maybeSingle();
                if (!data && !error) {
                    const r2 = await supabase.from('livestocks').select('*, cages(name)').eq('id', parsedId).maybeSingle();
                    data = r2.data; error = r2.error;
                }
                if (error) throw new Error(error.message);
                if (!data) throw new Error(`Ternak "${parsedId}" tidak ditemukan!`);
                setScannedData(data);
                setViewMode('result');
            } catch (error: any) {
                setErrorMsg(error.message);
                setTimeout(() => { setIsScanning(true); setErrorMsg(null); }, 3000);
            } finally {
                setIsFetching(false);
            }
        }
    };

    const handleReset = () => {
        setScannedData(null); setErrorMsg(null); setSuccessMsg(null);
        setIsScanning(true); setIsCameraActive(false);
        setViewMode('scanner'); setHistory(null);
    };

    const openDetail = async () => {
        setViewMode('detail'); setDetailTab('info');
        setIsLoadingHistory(true);
        try {
            const h = await getLivestockHistory(scannedData.id);
            setHistory(h);
        } catch (e) { console.error(e); }
        finally { setIsLoadingHistory(false); }
    };

    const openMutasi = async () => {
        setViewMode('mutasi');
        const { data } = await supabase.from('cages').select('id, name, capacity, current_occupancy').order('name');
        setCages(data || []);
    };

    const openEdit = async () => {
        setViewMode('edit'); 
        setEditStatus(scannedData.status);
        setSelectedKeluhan(''); 
        setSelectedDiagnosa('');
        setActiveHealthRecord(null);

        if (scannedData.status === 'sick') {
            try {
                const history = await getLivestockHistory(scannedData.id);
                const active = history.healthRecords.find((hr: any) => hr.status === 'karantina' || hr.status === 'pemulihan');
                if (active) {
                    setActiveHealthRecord(active);
                    setSelectedKeluhan(active.illness_description || "");
                    setSelectedDiagnosa(active.treatment || "");
                }
            } catch (err) {
                console.error("Failed to load health record", err);
            }
        }

        const { data } = await supabase.from('cages').select('id, name, capacity, current_occupancy').order('name');
        setCages(data || []);
        const { data: meds } = await supabase.from('inventory_items').select('id, name, current_stock, unit').in('type', ['obat', 'medicine', 'vaksin', 'vaccine']).order('name');
        setMedicines(meds || []);
    };

    const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const fd = new FormData(e.currentTarget);
            await updateLivestock(scannedData.id, fd);
            // Re-fetch updated data
            const { data } = await supabase.from('livestocks').select('*, cages(name)').eq('id', scannedData.id).maybeSingle();
            if (data) setScannedData(data);
            setSuccessMsg('Data ternak berhasil diperbarui!');
            setViewMode('result');
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (error: any) {
            setErrorMsg(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isClient) return <div className="p-8 text-center text-slate-500">Memuat scanner...</div>;

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950">
            <header className="h-20 sticky top-0 z-30 bg-white/30 dark:bg-slate-950/30 backdrop-blur-md border-b border-emerald-500/10 px-4 md:px-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <SidebarTrigger />
                    <h2 className="text-base sm:text-xl font-bold tracking-tight truncate ml-2">Fast Scan QR</h2>
                </div>
                {viewMode === 'scanner' && (
                    <button onClick={() => setFacingMode(p => p === "environment" ? "user" : "environment")} className="h-10 px-4 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-bold gap-2 flex items-center">
                        <RefreshCcw className="w-4 h-4" /><span className="hidden sm:inline">Flip</span>
                    </button>
                )}
            </header>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
                {/* SUCCESS TOAST */}
                {successMsg && (
                    <div className="w-full max-w-md mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm font-bold flex items-center gap-2">
                        <Check className="w-4 h-4" /> {successMsg}
                    </div>
                )}

                {/* ========== SCANNER VIEW ========== */}
                {viewMode === 'scanner' && (
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="p-6 text-center border-b border-slate-100 dark:border-slate-800 bg-emerald-50 dark:bg-emerald-950/20">
                            <div className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-3"><Camera className="w-8 h-8" /></div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-1">Arahkan Kamera</h3>
                            <p className="text-sm text-slate-500 font-medium">Pindai QR Code pada ear-tag ternak.</p>
                        </div>
                        <div className="relative bg-black aspect-square overflow-hidden">
                            {!isCameraActive ? (
                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center space-y-4">
                                    <Camera className="w-10 h-10 text-emerald-400" />
                                    <button onClick={() => setIsCameraActive(true)} className="px-6 py-3 bg-emerald-600 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/30">Mulai Kamera</button>
                                </div>
                            ) : errorMsg ? (
                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 text-white p-6 text-center space-y-3">
                                    <AlertCircle className="w-10 h-10 text-rose-500" />
                                    <p className="text-sm">{errorMsg}</p>
                                </div>
                            ) : isFetching ? (
                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 text-white space-y-3">
                                    <Search className="w-10 h-10 text-emerald-500 animate-pulse" />
                                    <p className="text-sm animate-pulse">Mencari data...</p>
                                </div>
                            ) : isScanning ? (
                                <Scanner onScan={handleScan} onError={(err) => {
                                    const e = err as unknown as Error;
                                    if (e?.name === 'NotAllowedError') setErrorMsg("Izin kamera ditolak.");
                                    else if (e?.name === 'NotFoundError') setErrorMsg("Kamera tidak ditemukan.");
                                }} constraints={{ facingMode }} styles={{ container: { width: '100%', height: '100%' } }} />
                            ) : null}
                            <div className="absolute inset-0 border-[50px] border-black/50 pointer-events-none z-10 flex items-center justify-center">
                                <div className="w-full h-full border-4 border-emerald-500/80 rounded-[2rem]"></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========== RESULT VIEW ========== */}
                {viewMode === 'result' && scannedData && (
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-emerald-500/20 overflow-hidden">
                        <div className="p-6 text-center border-b border-emerald-100 dark:border-emerald-500/10 bg-emerald-50 dark:bg-emerald-950/30">
                            <div className="w-16 h-16 mx-auto bg-emerald-500 text-white rounded-full flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/30"><ScanLine className="w-8 h-8" /></div>
                            <h3 className="font-bold text-2xl text-slate-900 dark:text-slate-100 mb-1">{scannedData.qr_code}</h3>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold capitalize">{scannedData.type} • {scannedData.gender === 'male' ? 'Jantan' : 'Betina'}</div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Kandang', value: scannedData.cages?.name || '-' },
                                    { label: 'Berat', value: `${scannedData.current_weight} kg` },
                                    { label: 'Status', value: scannedData.status === 'healthy' ? 'Sehat' : scannedData.status === 'sick' ? 'Sakit' : scannedData.status },
                                    { label: 'Umur', value: `${scannedData.age_months} bln` },
                                ].map(item => (
                                    <div key={item.label} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">{item.label}</p>
                                        <p className="font-bold text-slate-800 dark:text-slate-200 capitalize">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button onClick={openEdit} className="flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-500/20"><Edit2 className="w-4 h-4" /> Edit Data</button>
                                <button onClick={openDetail} className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl font-bold text-sm transition-colors"><Eye className="w-4 h-4" /> Profil Lengkap</button>
                            </div>
                            <button onClick={openMutasi} className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-emerald-500/20"><Warehouse className="w-4 h-4" /> Mutasi Kandang</button>
                            <button onClick={handleReset} className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700"><RefreshCcw className="w-4 h-4" /> Scan Ternak Lain</button>
                        </div>
                    </div>
                )}

                {/* ========== DETAIL VIEW ========== */}
                {viewMode === 'detail' && scannedData && (
                    <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-blue-500/5 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setViewMode('result')} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 text-slate-500 rounded-full hover:bg-slate-100 shadow-sm shrink-0"><ArrowLeft className="w-4 h-4" /></button>
                                <div><h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Detail Ternak</h3><p className="text-sm font-mono text-slate-500">{scannedData.qr_code}</p></div>
                            </div>
                        </div>
                        <div className="flex border-b border-slate-100 dark:border-slate-800 px-5 pt-3 gap-6">
                            <button onClick={() => setDetailTab('info')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${detailTab === 'info' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500'}`}>Informasi</button>
                            <button onClick={() => setDetailTab('health')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${detailTab === 'health' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500'}`}>Riwayat Kesehatan</button>
                        </div>
                        <div className="p-5 bg-slate-50 dark:bg-slate-950 max-h-[60vh] overflow-y-auto">
                            {detailTab === 'info' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {[
                                            { l: 'Kandang', v: scannedData.cages?.name || '-' },
                                            { l: 'Jenis', v: scannedData.type },
                                            { l: 'Gender', v: scannedData.gender === 'male' ? 'Jantan' : 'Betina' },
                                            { l: 'Umur', v: `${scannedData.age_months} Bulan` },
                                            { l: 'Berat', v: `${scannedData.current_weight} Kg` },
                                            { l: 'Status', v: scannedData.status === 'healthy' ? 'Sehat' : scannedData.status === 'sick' ? 'Sakit' : 'Terjual' },
                                        ].map(i => (
                                            <div key={i.l} className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">{i.l}</p>
                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 capitalize">{i.v}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                                        <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50"><h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Riwayat Penimbangan</h4></div>
                                        <div className="p-3">
                                            {isLoadingHistory ? <p className="text-center text-slate-500 py-4 text-sm animate-pulse">Memuat...</p>
                                            : !history?.weighingRecords?.length ? <p className="text-center text-slate-500 py-4 text-sm">Belum ada riwayat.</p>
                                            : <div className="space-y-2">{history.weighingRecords.map((wr: any) => (
                                                <div key={wr.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                                    <div><p className="text-sm font-bold text-slate-800 dark:text-slate-200">{wr.weight} Kg</p><p className="text-xs text-slate-500">{new Date(wr.recorded_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>
                                                </div>
                                            ))}</div>}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {detailTab === 'health' && (
                                <div className="space-y-3">
                                    {isLoadingHistory ? <p className="text-center text-slate-500 py-6 animate-pulse">Memuat rekam medis...</p>
                                    : !history?.healthRecords?.length ? (
                                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 text-center">
                                            <Activity className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-2" />
                                            <p className="text-slate-500 font-medium text-sm">Belum ada rekam medis.</p>
                                        </div>
                                    ) : history.healthRecords.map((hr: any) => (
                                        <div key={hr.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 relative overflow-hidden">
                                            <div className={`absolute top-0 left-0 w-1.5 h-full ${hr.status === 'selesai' ? 'bg-emerald-500' : hr.status === 'pemulihan' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                                            <div className="flex justify-between items-start mb-2">
                                                <div><h4 className="font-bold text-slate-800 dark:text-slate-100">{hr.illness_description}</h4><p className="text-xs text-slate-500">{new Date(hr.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${hr.status === 'selesai' ? 'bg-emerald-100 text-emerald-700' : hr.status === 'pemulihan' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>{hr.status}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-sm">
                                                <div><p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Tindakan</p><p className="text-slate-700 dark:text-slate-300">{hr.treatment}</p></div>
                                                <div><p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Obat</p><p className="text-slate-700 dark:text-slate-300">{hr.inventory_items?.name || '-'}</p></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ========== EDIT VIEW ========== */}
                {viewMode === 'edit' && scannedData && (
                    <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                            <button onClick={() => { setViewMode('result'); setErrorMsg(null); }} className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-slate-200 shadow-sm shrink-0"><ArrowLeft className="w-4 h-4" /></button>
                            <div><h3 className="text-lg font-bold">Edit Data Ternak</h3><p className="text-sm text-slate-500 font-mono">{scannedData.qr_code}</p></div>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                            {errorMsg && <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 text-sm font-bold flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {errorMsg}</div>}
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">QR Code *</label><input required name="qr_code" defaultValue={scannedData.qr_code} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tipe *</label><select required name="type" defaultValue={scannedData.type} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none"><option value="domba">Domba</option><option value="kambing">Kambing</option></select></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Gender *</label><select required name="gender" defaultValue={scannedData.gender} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none"><option value="male">Jantan</option><option value="female">Betina</option></select></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Umur (bln) *</label><input required name="age_months" type="number" min="1" defaultValue={scannedData.age_months} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Berat (Kg) *</label><input required name="weight" type="number" step="0.1" min="1" defaultValue={scannedData.current_weight} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none" /></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Status *</label><select required name="status" value={editStatus} onChange={e => setEditStatus(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none"><option value="healthy">Sehat</option><option value="sick">Sakit (Karantina)</option><option value="sold">Terjual</option></select></div>
                            </div>

                            {editStatus === 'sick' && (
                                <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-4 space-y-4">
                                    <h4 className="text-sm font-bold text-rose-600 flex items-center gap-2"><Activity className="w-4 h-4" /> Data Rekam Medis (One-Stop Update)</h4>

                                    {/* Show existing active health record as info banner */}
                                    {activeHealthRecord && (
                                        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-rose-200 dark:border-rose-800 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Tiket Aktif Saat Ini</p>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${activeHealthRecord.status === 'karantina' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{activeHealthRecord.status}</span>
                                            </div>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{activeHealthRecord.illness_description}</p>
                                            <p className="text-xs text-slate-500">Tindakan: {activeHealthRecord.treatment}</p>
                                            {activeHealthRecord.inventory_items?.name && (
                                                <p className="text-xs text-slate-500">Obat: {activeHealthRecord.inventory_items.name}</p>
                                            )}
                                            <p className="text-[10px] text-slate-400">Sejak {new Date(activeHealthRecord.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                    )}

                                    <div className="relative flex items-center">
                                        <div className="flex-grow border-t border-rose-200 dark:border-rose-800"></div>
                                        <span className="flex-shrink-0 mx-3 text-rose-400 text-[10px] font-bold tracking-wider uppercase">{activeHealthRecord ? 'Tambah Tiket Baru' : 'Isi Rekam Medis'}</span>
                                        <div className="flex-grow border-t border-rose-200 dark:border-rose-800"></div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Keluhan / Gejala *</label>
                                        <select required value={selectedKeluhan} onChange={e => setSelectedKeluhan(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none mb-2">
                                            <option value="">Pilih gejala...</option>
                                            <option value="Tidak mau makan, nafsu makan menurun">Tidak mau makan</option>
                                            <option value="Lemas, tidak aktif bergerak">Lemas, tidak aktif</option>
                                            <option value="Demam tinggi, suhu tubuh naik">Demam tinggi</option>
                                            <option value="Diare / mencret">Diare / mencret</option>
                                            <option value="Kembung, perut membesar">Kembung</option>
                                            <option value="Batuk, pilek, bersin">Batuk / pilek</option>
                                            <option value="Luka pada kulit atau kaki">Luka pada kulit / kaki</option>
                                            <option value="Pincang, sulit berjalan">Pincang</option>
                                            <option value="Cacingan, terlihat cacing pada feses">Cacingan</option>
                                            <option value="Kutu / parasit eksternal">Kutu / parasit</option>
                                            <option value="__lainnya__">Lainnya (tulis sendiri)</option>
                                        </select>
                                        {selectedKeluhan === '__lainnya__' ? (
                                            <textarea required name="illness_description" rows={2} placeholder="Tulis gejala..." className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none resize-none" />
                                        ) : (
                                            <input type="hidden" name="illness_description" value={selectedKeluhan} />
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Diagnosa & Tindakan *</label>
                                        <select required value={selectedDiagnosa} onChange={e => setSelectedDiagnosa(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none mb-2">
                                            <option value="">Pilih tindakan...</option>
                                            <option value="Pemberian obat cacing (deworming)">Obat cacing</option>
                                            <option value="Pemberian antibiotik">Antibiotik</option>
                                            <option value="Pemberian vitamin dan suplemen">Vitamin & suplemen</option>
                                            <option value="Vaksinasi">Vaksinasi</option>
                                            <option value="Pembersihan dan perawatan luka">Perawatan luka</option>
                                            <option value="Pemberian obat diare / anti mencret">Obat diare</option>
                                            <option value="Pemandian anti parasit (dipping)">Dipping</option>
                                            <option value="Isolasi / karantina untuk observasi">Isolasi / karantina</option>
                                            <option value="Konsultasi dengan dokter hewan">Konsultasi drh</option>
                                            <option value="__lainnya__">Lainnya (tulis sendiri)</option>
                                        </select>
                                        {selectedDiagnosa === '__lainnya__' ? (
                                            <textarea required name="treatment" rows={2} placeholder="Tulis tindakan..." className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none resize-none" />
                                        ) : (
                                            <input type="hidden" name="treatment" value={selectedDiagnosa} />
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Obat (Opsional)</label>
                                            <select name="medicine_id" defaultValue="" className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none">
                                                <option value="">-- Tanpa Obat --</option>
                                                {medicines.map((m: any) => <option key={m.id} value={m.id}>{m.name} ({m.current_stock} {m.unit})</option>)}
                                            </select>
                                        </div>
                                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Dosis</label><input name="medicine_qty" type="number" step="0.1" min="0" placeholder="0" className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none" /></div>
                                    </div>
                                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Fase Perawatan *</label>
                                        <select name="health_status" defaultValue="karantina" className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none">
                                            <option value="karantina">Karantina (Isolasi Penuh)</option>
                                            <option value="pemulihan">Pemulihan (Masa Observasi)</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Kandang *</label>
                                <select required name="cage_id" defaultValue={scannedData.cage_id} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none">
                                    {cages.map(c => <option key={c.id} value={c.id}>{c.name} ({c.capacity - c.current_occupancy} slot)</option>)}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button type="button" onClick={() => { setViewMode('result'); setErrorMsg(null); }} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm">Batal</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50">{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ========== MUTASI VIEW ========== */}
                {viewMode === 'mutasi' && scannedData && (
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                            <button onClick={() => { setViewMode('result'); setErrorMsg(null); }} className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-slate-200 shadow-sm shrink-0"><ArrowLeft className="w-4 h-4" /></button>
                            <div><h3 className="text-lg font-bold">Mutasi Kandang</h3><p className="text-sm text-slate-500 font-mono">{scannedData.qr_code}</p></div>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
                            {errorMsg && <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 text-sm font-bold flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {errorMsg}</div>}
                            
                            {/* Hidden fields to preserve existing data */}
                            <input type="hidden" name="qr_code" value={scannedData.qr_code} />
                            <input type="hidden" name="type" value={scannedData.type} />
                            <input type="hidden" name="gender" value={scannedData.gender} />
                            <input type="hidden" name="age_months" value={scannedData.age_months} />
                            <input type="hidden" name="weight" value={scannedData.current_weight} />
                            <input type="hidden" name="status" value={scannedData.status} />
                            
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl mb-4">
                                <p className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 mb-1">Kandang Saat Ini</p>
                                <p className="font-bold text-slate-800 dark:text-slate-100">{scannedData.cages?.name || 'Tidak ada'}</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Pindah Ke Kandang *</label>
                                <select required name="cage_id" defaultValue={scannedData.cage_id} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                                    {cages.filter(c => c.id !== scannedData.cage_id).map(c => (
                                        <option key={c.id} value={c.id} disabled={c.capacity - c.current_occupancy <= 0}>
                                            {c.name} ({c.capacity - c.current_occupancy} slot kosong)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button type="button" onClick={() => { setViewMode('result'); setErrorMsg(null); }} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm">Batal</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50">{isSubmitting ? 'Memindahkan...' : 'Konfirmasi Pindah'}</button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
