"use client";

import { useState, useMemo } from 'react';
import { QrCode, Printer, ChevronLeft, Filter, Layout } from 'lucide-react';
import Link from 'next/link';
import { QrStickerGrid } from '@/components/qr/qr-sticker-grid';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function QrTagsClient({ livestocks }: { livestocks: any[] }) {
    const [paperSize, setPaperSize] = useState<'a4' | 'f4' | 'letter'>('a4');
    const [selectedCage, setSelectedCage] = useState<string>('all');
    
    // Extract unique cages for the filter dropdown
    const uniqueCages = useMemo(() => {
        const cagesMap = new Map();
        livestocks.forEach(l => {
            if (l.cage_id && l.cages?.name) {
                cagesMap.set(l.cage_id, l.cages.name);
            }
        });
        return Array.from(cagesMap.entries());
    }, [livestocks]);

    // Filter livestocks based on selected cage
    const filteredLivestocks = useMemo(() => {
        if (selectedCage === 'all') return livestocks;
        return livestocks.filter(l => l.cage_id === selectedCage);
    }, [livestocks, selectedCage]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50/50 print:bg-white print:h-auto print:block">
            {/* Header - Hidden on print */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-emerald-500/10 bg-white/50 print:hidden shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/livestock" className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                            <QrCode className="w-4 h-4" />
                        </div>
                        <h1 className="font-bold text-slate-900">Cetak Label QR</h1>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row print:overflow-visible print:block">
                {/* Configuration Sidebar - Hidden on print */}
                <div className="w-full lg:w-80 border-r border-emerald-500/10 bg-white p-6 overflow-y-auto print:hidden shrink-0">
                    <div className="flex items-center gap-2 mb-6">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <h2 className="font-semibold text-slate-700">Filter Cetak</h2>
                    </div>

                    <div className="space-y-6">
                        {/* Cage Filter */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pilih Kandang</label>
                            <select 
                                value={selectedCage}
                                onChange={(e) => setSelectedCage(e.target.value)}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                            >
                                <option value="all">Semua Kandang ({livestocks.length} Ekor)</option>
                                {uniqueCages.map(([id, name]) => {
                                    const count = livestocks.filter(l => l.cage_id === id).length;
                                    return (
                                        <option key={id} value={id}>
                                            {name as React.ReactNode} ({count} Ekor)
                                        </option>
                                    );
                                })}
                            </select>
                            <p className="text-[10px] text-slate-400 mt-2">
                                *Sistem otomatis menyusun grid stiker sesuai jumlah domba yang dipilih.
                            </p>
                        </div>

                        {/* Paper Size */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Layout className="w-3 h-3" /> Ukuran Kertas
                            </label>
                            <select 
                                value={paperSize}
                                onChange={(e) => setPaperSize(e.target.value as 'a4'|'f4'|'letter')}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                            >
                                <option value="a4">A4 Stiker (3x7 grid)</option>
                                <option value="f4">F4 / Folio Stiker</option>
                                <option value="letter">Letter Stiker</option>
                            </select>
                        </div>

                        {/* Print Button */}
                        <div className="pt-4 border-t border-slate-100">
                            <button 
                                onClick={handlePrint}
                                disabled={filteredLivestocks.length === 0}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2"
                            >
                                <Printer className="w-4 h-4" /> Cetak {filteredLivestocks.length} Label
                            </button>
                        </div>
                    </div>
                </div>

                {/* Preview Area - This is the only thing visible on print */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-slate-200/50 print:p-0 print:bg-white print:overflow-visible print:block">
                    <div className="print:w-full print:max-w-none">
                        <QrStickerGrid 
                            livestocks={filteredLivestocks} 
                            paperSize={paperSize} 
                        />
                    </div>
                </div>
            </div>

            {/* Global CSS for Print */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: ${paperSize === 'a4' ? 'A4' : paperSize === 'f4' ? '8.5in 13in' : 'Letter'} portrait;
                        margin: 10mm;
                    }
                    body {
                        background: white !important;
                        -webkit-print-color-adjust: exact;
                    }
                }
            `}</style>
        </div>
    );
}
