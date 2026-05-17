"use client";

import { useState, useRef, useEffect } from 'react';
import { Printer, Settings2, FileText, Calendar, Layout, ChevronDown, ChevronUp } from 'lucide-react';
import { ReportTemplate } from '@/components/reports/report-template';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function ReportsPage() {
    const [reportType, setReportType] = useState('populasi');
    const [paperSize, setPaperSize] = useState<'a4' | 'f4' | 'letter'>('a4');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [configOpen, setConfigOpen] = useState(false);
    const [previewScale, setPreviewScale] = useState(1);
    const previewContainerRef = useRef<HTMLDivElement>(null);

    // Paper dimensions in px (at 96dpi)
    const paperWidths: Record<string, number> = { a4: 794, f4: 816, letter: 816 };
    const paperWidth = paperWidths[paperSize] || 794;

    // Dynamically calculate scale based on container width
    useEffect(() => {
        const calculateScale = () => {
            if (previewContainerRef.current) {
                const containerWidth = previewContainerRef.current.clientWidth - 24; // minus padding
                const scale = Math.min(containerWidth / paperWidth, 1);
                setPreviewScale(scale);
            }
        };
        calculateScale();
        window.addEventListener('resize', calculateScale);
        return () => window.removeEventListener('resize', calculateScale);
    }, [paperWidth]);

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
            <header className="h-20 sticky top-0 z-30 bg-white/30 dark:bg-slate-950/30 backdrop-blur-md border-b border-emerald-500/10 px-4 md:px-8 flex items-center justify-between shrink-0 print:hidden">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <SidebarTrigger />
                    <div className="flex items-center gap-2 sm:gap-3 ml-0 sm:ml-2 min-w-0">
                        <h2 className="text-base sm:text-xl font-bold tracking-tight truncate">Laporan</h2>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row print:overflow-visible print:block">
                {/* Configuration Sidebar - Collapsible on mobile, always visible on desktop */}
                <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-emerald-500/10 bg-white print:hidden shrink-0">
                    {/* Mobile Toggle Button */}
                    <button
                        onClick={() => setConfigOpen(!configOpen)}
                        className="w-full flex items-center justify-between p-4 lg:hidden"
                    >
                        <div className="flex items-center gap-2">
                            <Settings2 className="w-4 h-4 text-slate-400" />
                            <span className="font-semibold text-slate-700 text-sm">Konfigurasi Laporan</span>
                        </div>
                        {configOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>

                    {/* Config Content - Hidden on mobile by default, always shown on desktop */}
                    <div className={`${configOpen ? 'block' : 'hidden'} lg:block px-4 sm:px-6 pb-4 sm:pb-6 lg:pt-6 overflow-y-auto`}>
                        {/* Desktop-only title */}
                        <div className="hidden lg:flex items-center gap-2 mb-6">
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
                                    onChange={(e) => setPaperSize(e.target.value as 'a4' | 'f4' | 'letter')}
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
                </div>

                {/* Preview Area - This is the only thing visible on print */}
                <div ref={previewContainerRef} className="flex-1 overflow-auto p-3 sm:p-4 md:p-8 bg-slate-200/50 print:p-0 print:bg-white print:overflow-visible print:block">
                    {/* Scaling wrapper */}
                    <div className="flex justify-center print:block">
                        <div
                            className="origin-top print:!transform-none print:!w-full"
                            style={{ transform: `scale(${previewScale})`, width: `${paperWidth}px` }}
                        >
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
