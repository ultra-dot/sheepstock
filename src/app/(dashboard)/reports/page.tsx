"use client";

import { useState } from 'react';
import { Printer, Settings2, FileText, Calendar, Layout } from 'lucide-react';
import { ReportTemplate } from '@/components/reports/report-template';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function ReportsPage() {
    const [reportType, setReportType] = useState('populasi');
    const [paperSize, setPaperSize] = useState<'a4' | 'f4' | 'letter'>('a4');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    // Mock data for preview
    const mockData = Array.from({ length: 15 }).map((_, i) => {
        if (reportType === 'populasi') {
            return { id: `DOM-${1000 + i}`, gender: i % 2 === 0 ? 'Jantan' : 'Betina', kandang: `Blok ${String.fromCharCode(65 + (i % 3))}`, berat: `${(25 + Math.random() * 15).toFixed(1)} kg`, status: 'Sehat' };
        } else if (reportType === 'kesehatan') {
            return { id: `DOM-${1000 + i}`, tgl: `2026-04-${(i % 30) + 1}`, diag: i % 4 === 0 ? 'Flu' : 'Sehat', tind: i % 4 === 0 ? 'Vaksin' : '-', doc: 'Drh. Budi' };
        } else {
            return { id: `DOM-${1000 + i}`, awal: '25.0 kg', akhir: `${(26 + Math.random() * 5).toFixed(1)} kg`, adg: `${(0.1 + Math.random() * 0.2).toFixed(2)}`, target: i % 5 === 0 ? 'Tidak' : 'Ya' };
        }
    });

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50/50 print:bg-white print:h-auto print:block">
            {/* Header - Hidden on print */}
            <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-emerald-500/10 bg-white/50 backdrop-blur-md print:hidden shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <SidebarTrigger />
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                        <FileText className="w-4 h-4" />
                    </div>
                    <h1 className="font-bold text-slate-900 truncate">Laporan</h1>
                </div>
            </header>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row print:overflow-visible print:block">
                {/* Configuration Sidebar - Hidden on print */}
                <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-emerald-500/10 bg-white p-4 sm:p-6 overflow-y-auto print:hidden shrink-0">
                    <div className="flex items-center gap-2 mb-6">
                        <Settings2 className="w-4 h-4 text-slate-400" />
                        <h2 className="font-semibold text-slate-700">Konfigurasi Laporan</h2>
                    </div>

                    <div className="space-y-6">
                        {/* Report Type */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Jenis Laporan</label>
                            <select 
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                            >
                                <option value="populasi">Inventori & Populasi Ternak</option>
                                <option value="kesehatan">Kesehatan & Rekam Medis</option>
                                <option value="pertumbuhan">Pertumbuhan & ADG</option>
                            </select>
                        </div>

                        {/* Date Range */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Calendar className="w-3 h-3" /> Rentang Waktu
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <span className="text-[10px] text-slate-400 mb-1 block">Mulai</span>
                                    <input 
                                        type="date" 
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 mb-1 block">Sampai</span>
                                    <input 
                                        type="date" 
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>
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
                                <option value="a4">A4 (210 x 297 mm)</option>
                                <option value="f4">F4 / Folio (215 x 330 mm)</option>
                                <option value="letter">Letter (215 x 279 mm)</option>
                            </select>
                            <p className="text-[10px] text-slate-400 mt-2">
                                *Ukuran asli akan disesuaikan saat Anda memilih kertas di dialog Print browser.
                            </p>
                        </div>

                        {/* Print Button */}
                        <div className="pt-4 border-t border-slate-100">
                            <button 
                                onClick={handlePrint}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2"
                            >
                                <Printer className="w-4 h-4" /> Cetak / Save PDF
                            </button>
                        </div>
                    </div>
                </div>

                {/* Preview Area - This is the only thing visible on print */}
                <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-8 bg-slate-200/50 print:p-0 print:bg-white print:overflow-visible print:block">
                    {/* Mobile-friendly scaling wrapper */}
                    <div className="flex justify-center print:block">
                        <div className="origin-top print:transform-none print:w-full print:max-w-none" style={{ transform: 'scale(var(--preview-scale, 1))' }}>
                            <style>{`
                                @media (max-width: 640px) {
                                    :root { --preview-scale: 0.55; }
                                }
                                @media (min-width: 641px) and (max-width: 1023px) {
                                    :root { --preview-scale: 0.75; }
                                }
                                @media (min-width: 1024px) {
                                    :root { --preview-scale: 1; }
                                }
                                @media print {
                                    :root { --preview-scale: 1 !important; }
                                }
                            `}</style>
                            <ReportTemplate 
                                reportType={reportType}
                                dateRange={dateRange}
                                paperSize={paperSize}
                                data={mockData}
                            />
                        </div>
                    </div>

                    {/* Mobile hint */}
                    <p className="text-center text-[10px] text-slate-400 mt-4 lg:hidden print:hidden font-medium">
                        📄 Preview diperkecil agar muat di layar. Hasil cetak akan berukuran penuh.
                    </p>
                </div>
            </div>

            {/* CSS to ensure perfect printing */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: ${paperSize === 'a4' ? 'A4' : paperSize === 'f4' ? '8.5in 13in' : 'Letter'} portrait;
                        margin: 15mm;
                    }
                    body {
                        background: white !important;
                        -webkit-print-color-adjust: exact;
                    }
                    /* Ensure tables do not break in the middle of a row */
                    tr {
                        page-break-inside: avoid;
                    }
                }
            `}</style>
        </div>
    );
}
