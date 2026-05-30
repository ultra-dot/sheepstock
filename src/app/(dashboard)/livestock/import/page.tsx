"use client"

import React, { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ArrowLeft, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Download, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { importLivestocksBatch } from '@/app/actions/livestock';

type ParsedRow = {
    qr_code: string;
    type: string;
    gender: string;
    age_months: string;
    weight: string;
    cage_name: string;
    // Internal fields
    _isValid: boolean;
    _errors: string[];
    _cage_id?: string;
};

export default function ImportLivestockPage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
    const [cages, setCages] = useState<{ id: string, name: string }[]>([]);
    const [isParsing, setIsParsing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);

    useEffect(() => {
        const fetchCages = async () => {
            const supabase = createClient();
            const { data } = await supabase.from('cages').select('id, name');
            if (data) setCages(data);
        };
        fetchCages();
    }, []);

    const parseCSV = (text: string) => {
        // Simple CSV parser supporting basic comma separation
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) {
            setGlobalError("File CSV kosong atau tidak memiliki data.");
            return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const expectedHeaders = ['qr code', 'jenis', 'kelamin', 'umur', 'berat awal', 'kandang'];
        
        // Basic header validation
        const missingHeaders = expectedHeaders.filter(eh => !headers.some(h => h.includes(eh)));
        if (missingHeaders.length > 0) {
            setGlobalError(`Header tidak sesuai. Gunakan template yang disediakan. Hilang: ${missingHeaders.join(', ')}`);
            return;
        }

        const qrIdx = headers.findIndex(h => h.includes('qr'));
        const typeIdx = headers.findIndex(h => h.includes('jenis'));
        const genderIdx = headers.findIndex(h => h.includes('kelamin'));
        const ageIdx = headers.findIndex(h => h.includes('umur'));
        const weightIdx = headers.findIndex(h => h.includes('berat'));
        const cageIdx = headers.findIndex(h => h.includes('kandang'));

        const results: ParsedRow[] = [];
        const seenQrs = new Set();

        for (let i = 1; i < lines.length; i++) {
            // Regex to handle basic comma split but ignoring commas inside quotes
            const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').trim());
            if (row.length < expectedHeaders.length) continue;

            const qr = row[qrIdx];
            const cageName = row[cageIdx];
            const errors: string[] = [];
            
            if (!qr) errors.push("QR Code kosong");
            if (seenQrs.has(qr)) errors.push("QR Code duplikat di file ini");
            else if(qr) seenQrs.add(qr);

            const matchedCage = cages.find(c => c.name.toLowerCase() === cageName?.toLowerCase());
            if (!matchedCage && cageName) errors.push(`Kandang '${cageName}' tidak ditemukan`);

            const weightVal = parseFloat(row[weightIdx]);
            if (isNaN(weightVal) || weightVal <= 0) errors.push("Berat tidak valid");

            results.push({
                qr_code: qr,
                type: row[typeIdx]?.toLowerCase() === 'kambing' ? 'kambing' : 'domba',
                gender: row[genderIdx]?.toLowerCase() === 'betina' ? 'female' : 'male',
                age_months: row[ageIdx] || '0',
                weight: row[weightIdx] || '0',
                cage_name: cageName,
                _isValid: errors.length === 0,
                _errors: errors,
                _cage_id: matchedCage?.id
            });
        }

        setParsedData(results);
        setGlobalError(null);
    };

    const handleFileUpload = (file: File) => {
        if (!file.name.endsWith('.csv')) {
            setGlobalError("Mohon unggah file berformat .csv");
            return;
        }
        setFile(file);
        setIsParsing(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            parseCSV(text);
            setIsParsing(false);
        };
        reader.onerror = () => {
            setGlobalError("Gagal membaca file.");
            setIsParsing(false);
        };
        reader.readAsText(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async () => {
        const validRows = parsedData.filter(r => r._isValid);
        if (validRows.length === 0) return;

        setIsSubmitting(true);
        setGlobalError(null);
        try {
            await importLivestocksBatch(validRows);
            setGlobalSuccess(`Berhasil mengimport ${validRows.length} ternak.`);
            setTimeout(() => {
                router.push('/livestock');
            }, 2000);
        } catch (error: any) {
            setGlobalError(error.message || "Gagal mengimport data.");
            setIsSubmitting(false);
        }
    };

    const downloadTemplate = () => {
        const headers = "QR Code,Jenis,Kelamin,Umur (Bulan),Berat Awal (Kg),Nama Kandang\n";
        const sample1 = "QR-1001,Domba,Jantan,12,35.5,Kandang A1\n";
        const sample2 = "QR-1002,Kambing,Betina,8,25.0,Kandang B2\n";
        const blob = new Blob([headers + sample1 + sample2], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Template_Import_Ternak.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const invalidCount = parsedData.filter(r => !r._isValid).length;

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <header className="h-20 bg-white/30 dark:bg-slate-950/30 backdrop-blur-md border-b border-emerald-500/10 px-4 md:px-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <SidebarTrigger />
                    <Link href="/livestock" className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-2 sm:gap-3 ml-0 sm:ml-2 min-w-0">
                        <FileSpreadsheet className="text-emerald-500 w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                        <h2 className="text-base sm:text-xl font-bold tracking-tight truncate">Import Ternak Massal</h2>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                <div className="max-w-5xl mx-auto space-y-6">
                    
                    {/* Intro / Template Download */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Upload Data via CSV</h3>
                            <p className="text-sm text-slate-500 max-w-xl">Pindahkan ratusan data ternak dari file Excel (.csv) Anda langsung ke dalam sistem. Pastikan format kolom sesuai dengan template agar tidak terjadi error.</p>
                        </div>
                        <button onClick={downloadTemplate} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-colors">
                            <Download className="w-4 h-4" />
                            Download Template CSV
                        </button>
                    </div>

                    {/* Feedback Messages */}
                    {globalError && (
                        <div className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm rounded-2xl flex items-center gap-3 border border-rose-100 dark:border-rose-900/50">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="font-medium">{globalError}</p>
                        </div>
                    )}

                    {globalSuccess && (
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm rounded-2xl flex items-center gap-3 border border-emerald-100 dark:border-emerald-900/50">
                            <CheckCircle2 className="w-5 h-5 shrink-0" />
                            <p className="font-medium">{globalSuccess} Mengalihkan kembali...</p>
                        </div>
                    )}

                    {/* Upload Area */}
                    {!file && (
                        <div 
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-3xl p-12 text-center transition-colors cursor-pointer flex flex-col items-center justify-center ${isDragging ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                        >
                            <div className={`p-4 rounded-full mb-4 ${isDragging ? 'bg-emerald-100 text-emerald-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                <Upload className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-1">Pilih file atau drag & drop ke sini</h3>
                            <p className="text-sm text-slate-500 mb-6">Mendukung file CSV (comma separated values)</p>
                            
                            <label className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm cursor-pointer shadow-lg shadow-emerald-500/20 transition-all">
                                Cari File CSV
                                <input type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])} />
                            </label>
                        </div>
                    )}

                    {/* Preview Area */}
                    {file && parsedData.length > 0 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Pratinjau Data</h3>
                                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full">
                                        {parsedData.length} baris
                                    </span>
                                </div>
                                <button onClick={() => { setFile(null); setParsedData([]); }} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            {invalidCount > 0 && (
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm rounded-xl flex items-start gap-3 border border-amber-200 dark:border-amber-800/50">
                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold mb-1">Perhatian: Ada {invalidCount} baris data yang bermasalah.</p>
                                        <p>Baris yang merah tidak akan ikut di-import. Silakan perbaiki di Excel dan upload ulang, atau lanjutkan import hanya untuk data yang valid.</p>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                                            <tr>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">QR Code</th>
                                                <th className="px-6 py-4">Jenis</th>
                                                <th className="px-6 py-4">Kelamin</th>
                                                <th className="px-6 py-4">Berat</th>
                                                <th className="px-6 py-4">Kandang</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                            {parsedData.map((row, idx) => (
                                                <tr key={idx} className={row._isValid ? "hover:bg-slate-50 dark:hover:bg-slate-800/30" : "bg-rose-50/50 dark:bg-rose-900/10"}>
                                                    <td className="px-6 py-4">
                                                        {row._isValid ? (
                                                            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                                                                <CheckCircle2 className="w-4 h-4" /> Valid
                                                            </span>
                                                        ) : (
                                                            <div className="flex flex-col gap-1 text-rose-600 dark:text-rose-400 font-medium text-xs">
                                                                {row._errors.map((err, i) => (
                                                                    <span key={i} className="flex items-center gap-1"><XIcon className="w-3 h-3" /> {err}</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 font-mono font-medium">{row.qr_code || '-'}</td>
                                                    <td className="px-6 py-4 capitalize">{row.type}</td>
                                                    <td className="px-6 py-4">{row.gender === 'male' ? 'Jantan' : 'Betina'}</td>
                                                    <td className="px-6 py-4 font-medium">{row.weight} Kg</td>
                                                    <td className="px-6 py-4">{row.cage_name || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || parsedData.filter(r => r._isValid).length === 0}
                                    className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Memproses Import...
                                        </>
                                    ) : (
                                        `Import ${parsedData.filter(r => r._isValid).length} Data Valid`
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function XIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    )
}
