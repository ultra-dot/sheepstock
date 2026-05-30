"use client";

import { useState, useRef, useEffect } from 'react';
import { Printer, Settings2, Calendar, Layout, ChevronDown, ChevronUp } from 'lucide-react';
import { ReportTemplate } from '@/components/reports/report-template';
import { SidebarTrigger } from '@/components/ui/sidebar';

export interface LivestockRow {
  qr_code: string;
  type: string;
  gender: string;
  age_months: number;
  current_weight: number;
  status: string;
  cage_name: string;
  entry_date: string;
}

export interface HealthRow {
  qr_code: string;
  date: string;
  illness_description: string;
  treatment: string;
  status: string;
  recorded_by_name: string;
}

export interface GrowthRow {
  qr_code: string;
  type: string;
  initial_weight: number;
  current_weight: number;
  age_months: number;
  entry_date: string;
}

export interface HarvestRow {
  qr_code: string;
  type: string;
  harvest_type: string;
  live_weight: number;
  carcass_weight: number | null;
  selling_price: number;
  customer_name: string;
  harvest_date: string;
}

interface ReportsClientProps {
  livestockData: LivestockRow[];
  healthData: HealthRow[];
  growthData: GrowthRow[];
  harvestData: HarvestRow[];
  farmName: string;
  userName: string;
}

export default function ReportsClient({
  livestockData,
  healthData,
  growthData,
  harvestData,
  farmName,
  userName,
}: ReportsClientProps) {
  const [reportType, setReportType] = useState('populasi');
  const [paperSize, setPaperSize] = useState<'a4' | 'f4' | 'letter'>('a4');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [datePreset, setDatePreset] = useState('semua');
  const [configOpen, setConfigOpen] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Paper dimensions in px (at 96dpi)
  const paperWidths: Record<string, number> = { a4: 794, f4: 816, letter: 816 };
  const paperWidth = paperWidths[paperSize] || 794;

  useEffect(() => {
    const calculateScale = () => {
      if (previewContainerRef.current) {
        const containerWidth = previewContainerRef.current.clientWidth - 24;
        const scale = Math.min(containerWidth / paperWidth, 1);
        setPreviewScale(scale);
      }
    };
    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [paperWidth]);

  // Filter data by date range
  const filterByDate = <T extends Record<string, any>>(data: T[], dateField: string): T[] => {
    if (!dateRange.start && !dateRange.end) return data;
    return data.filter(row => {
      const rowDate = new Date(row[dateField]).getTime();
      const startOk = !dateRange.start || rowDate >= new Date(dateRange.start).getTime();
      const endOk = !dateRange.end || rowDate <= new Date(dateRange.end + 'T23:59:59').getTime();
      return startOk && endOk;
    });
  };

  // Get the real data based on report type
  const getReportData = () => {
    switch (reportType) {
      case 'populasi':
        return filterByDate(livestockData, 'entry_date');
      case 'kesehatan':
        return filterByDate(healthData, 'date');
      case 'pertumbuhan':
        return filterByDate(growthData, 'entry_date');
      case 'penjualan':
        return filterByDate(harvestData, 'harvest_date');
      default:
        return [];
    }
  };

  const reportData = getReportData();

  // Summary stats
  const getSummary = () => {
    switch (reportType) {
      case 'populasi': {
        const d = reportData as LivestockRow[];
        const totalActive = d.filter(l => l.status === 'healthy' || l.status === 'sick').length;
        const jantan = d.filter(l => l.gender === 'male').length;
        const betina = d.filter(l => l.gender === 'female').length;
        const domba = d.filter(l => l.type === 'domba').length;
        const kambing = d.filter(l => l.type === 'kambing').length;
        const avgWeight = d.length > 0 ? (d.reduce((s, l) => s + l.current_weight, 0) / d.length).toFixed(1) : '0';
        return { totalActive, jantan, betina, domba, kambing, avgWeight, total: d.length };
      }
      case 'kesehatan': {
        const d = reportData as HealthRow[];
        const karantina = d.filter(h => h.status === 'karantina').length;
        const pemulihan = d.filter(h => h.status === 'pemulihan').length;
        const selesai = d.filter(h => h.status === 'selesai').length;
        return { total: d.length, karantina, pemulihan, selesai };
      }
      case 'pertumbuhan': {
        const d = reportData as GrowthRow[];
        const avgAdg = d.length > 0
          ? (d.reduce((s, g) => {
            const days = Math.max(g.age_months * 30, 1);
            return s + ((g.current_weight - g.initial_weight) / days);
          }, 0) / d.length).toFixed(3)
          : '0';
        const totalGain = d.reduce((s, g) => s + (g.current_weight - g.initial_weight), 0).toFixed(1);
        return { total: d.length, avgAdg, totalGain };
      }
      case 'penjualan': {
        const d = reportData as HarvestRow[];
        const totalRevenue = d.reduce((s, h) => s + Number(h.selling_price), 0);
        const potong = d.filter(h => h.harvest_type === 'potong').length;
        const jualHidup = d.filter(h => h.harvest_type === 'jual_hidup').length;
        return { total: d.length, totalRevenue, potong, jualHidup };
      }
      default:
        return { total: 0 };
    }
  };

  const summary = getSummary();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 print:bg-white print:h-auto print:block">
      {/* Header */}
      <header className="h-20 sticky top-0 z-30 bg-white/30 dark:bg-slate-950/30 backdrop-blur-md border-b border-emerald-500/10 px-4 md:px-8 flex items-center justify-between shrink-0 print:hidden">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <SidebarTrigger />
          <div className="flex items-center gap-2 sm:gap-3 ml-0 sm:ml-2 min-w-0">
            <h2 className="text-base sm:text-xl font-bold tracking-tight truncate">Laporan</h2>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row print:overflow-visible print:block">
        {/* Configuration Sidebar */}
        <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-emerald-500/10 bg-white print:hidden shrink-0">
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

          <div className={`${configOpen ? 'block' : 'hidden'} lg:block px-4 sm:px-6 pb-4 sm:pb-6 lg:pt-6 overflow-y-auto`}>
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
                  <option value="penjualan">Penjualan & Panen</option>
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Rentang Waktu
                </label>
                <select
                  value={datePreset}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDatePreset(val);
                    const today = new Date();
                    const fmt = (d: Date) => d.toISOString().split('T')[0];

                    if (val === 'semua') {
                      setDateRange({ start: '', end: '' });
                    } else if (val === 'hari_ini') {
                      const d = fmt(today);
                      setDateRange({ start: d, end: d });
                    } else if (val === '7_hari') {
                      const start = new Date(today);
                      start.setDate(start.getDate() - 6);
                      setDateRange({ start: fmt(start), end: fmt(today) });
                    } else if (val === 'bulan_ini') {
                      const start = new Date(today.getFullYear(), today.getMonth(), 1);
                      setDateRange({ start: fmt(start), end: fmt(today) });
                    } else if (val === 'tahun_ini') {
                      const start = new Date(today.getFullYear(), 0, 1);
                      setDateRange({ start: fmt(start), end: fmt(today) });
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500 mb-2"
                >
                  <option value="semua">Semua Waktu</option>
                  <option value="hari_ini">Hari Ini</option>
                  <option value="7_hari">7 Hari Terakhir</option>
                  <option value="bulan_ini">Bulan Ini</option>
                  <option value="tahun_ini">Tahun Ini</option>
                  <option value="kustom">Kustom...</option>
                </select>
                {datePreset === 'kustom' && (
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
                )}
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

              {/* Data count */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <p className="text-xs font-bold text-emerald-700 mb-1">Data Ditemukan</p>
                <p className="text-2xl font-black text-emerald-600">{reportData.length} <span className="text-sm font-medium">baris</span></p>
              </div>

              {/* Print Button */}
              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={handlePrint}
                  disabled={reportData.length === 0}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Cetak / Save PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div ref={previewContainerRef} className="flex-1 overflow-auto p-3 sm:p-4 md:p-8 bg-slate-200/50 print:p-0 print:bg-white print:overflow-visible print:block">
          <div className="flex justify-center print:block">
            <div
              className="origin-top print:!transform-none print:!w-full"
              style={{ transform: `scale(${previewScale})`, width: `${paperWidth}px` }}
            >
              <ReportTemplate
                reportType={reportType}
                dateRange={dateRange}
                paperSize={paperSize}
                data={reportData}
                summary={summary}
                farmName={farmName}
                userName={userName}
              />
            </div>
          </div>

          <p className="text-center text-[10px] text-slate-400 mt-4 lg:hidden print:hidden font-medium">
            📄 Preview diperkecil agar muat di layar. Hasil cetak akan berukuran penuh.
          </p>
        </div>
      </div>

      {/* Print CSS */}
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
          tr {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
