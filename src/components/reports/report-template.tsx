import React, { forwardRef } from 'react';

interface ReportTemplateProps {
    reportType: string;
    dateRange: { start: string; end: string };
    paperSize: 'a4' | 'f4' | 'letter';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[]; 
}

export const ReportTemplate = forwardRef<HTMLDivElement, ReportTemplateProps>(
    ({ reportType, dateRange, paperSize, data }, ref) => {
        // Mock data columns based on report type
        const getColumns = () => {
            switch (reportType) {
                case 'populasi':
                    return ['ID Ternak', 'Jenis Kelamin', 'Kandang', 'Berat Terakhir', 'Status'];
                case 'kesehatan':
                    return ['ID Ternak', 'Tanggal Periksa', 'Diagnosa', 'Tindakan', 'Dokter/Petugas'];
                case 'pertumbuhan':
                    return ['ID Ternak', 'Berat Awal', 'Berat Akhir', 'ADG (kg/hari)', 'Target Tercapai'];
                default:
                    return ['ID', 'Keterangan', 'Tanggal', 'Status'];
            }
        };

        const columns = getColumns();
        const currentDate = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date());

        // Basic styling to look like a document paper. 
        // Note: For print, it's best to keep backgrounds white and text black.
        return (
            <div 
                ref={ref} 
                className="bg-white text-black p-8 md:p-12 mx-auto shadow-lg print:shadow-none print:p-0 print:w-full print:max-w-none print:min-h-0 border border-slate-200 print:border-none"
                style={{
                    // Fixed dimensions for accurate screen preview (print relies on @page size)
                    width: paperSize === 'a4' ? '210mm' : paperSize === 'f4' ? '215.9mm' : '215.9mm',
                    minHeight: paperSize === 'a4' ? '297mm' : paperSize === 'f4' ? '330.2mm' : '279.4mm',
                }}
            >
                {/* Header Kop Surat */}
                <div className="flex items-center justify-between border-b-4 border-emerald-800 pb-6 mb-8">
                    <div className="flex items-center gap-4">
                        <img src="/assets/image/logo-sheepstock-green.png" alt="Logo" className="w-16 h-16 object-contain" />
                        <div>
                            <h1 className="text-3xl font-extrabold text-emerald-900 m-0" style={{ fontFamily: "'Poppins', sans-serif" }}>SheepStock</h1>
                            <p className="text-sm font-semibold text-slate-600 m-0">Platform Manajemen Peternakan Digital</p>
                            <p className="text-xs text-slate-500 m-0">Jl. Raya Dramaga, Kab. Bogor, Jawa Barat | info@sheepstock.cloud</p>
                        </div>
                    </div>
                </div>

                {/* Report Title */}
                <div className="text-center mb-8">
                    <h2 className="text-xl font-bold uppercase underline mb-2">
                        {reportType === 'populasi' ? 'Laporan Populasi & Inventori Ternak' : 
                         reportType === 'kesehatan' ? 'Laporan Rekam Medis & Kesehatan' : 
                         'Laporan Pertumbuhan (ADG) Ternak'}
                    </h2>
                    <p className="text-sm">
                        Periode: {dateRange.start ? dateRange.start : '-'} s/d {dateRange.end ? dateRange.end : '-'}
                    </p>
                </div>

                {/* Data Table */}
                <div className="mb-12">
                    <table className="w-full border-collapse border border-slate-300 text-sm">
                        <thead>
                            <tr className="bg-slate-100 print:bg-slate-200">
                                <th className="border border-slate-300 p-2.5 text-left font-bold w-12">No.</th>
                                {columns.map((col, idx) => (
                                    <th key={idx} className="border border-slate-300 p-2.5 text-left font-bold">{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? (
                                data.map((row, index) => (
                                    <tr key={index} className="hover:bg-slate-50">
                                        <td className="border border-slate-300 p-2 text-center">{index + 1}</td>
                                        {columns.map((_, colIdx) => (
                                            <td key={colIdx} className="border border-slate-300 p-2">
                                                {/* Rendering mock object values conditionally for simplicity */}
                                                {Object.values(row)[colIdx] as string || '-'}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length + 1} className="border border-slate-300 p-4 text-center italic text-slate-500">
                                        Tidak ada data pada periode ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Signature Area */}
                <div className="flex justify-end mt-16 pt-8 print:break-inside-avoid" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <div className="text-center w-48">
                        <p className="text-sm mb-16">Bogor, {currentDate}</p>
                        <p className="text-sm font-bold underline">Manajer Operasional</p>
                        <p className="text-xs">NIP: ...........................</p>
                    </div>
                </div>
            </div>
        );
    }
);

ReportTemplate.displayName = 'ReportTemplate';
