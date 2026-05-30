import React, { forwardRef } from 'react';
import type { LivestockRow, HealthRow, GrowthRow, HarvestRow } from '@/components/reports/reports-client';

interface ReportTemplateProps {
  reportType: string;
  dateRange: { start: string; end: string };
  paperSize: 'a4' | 'f4' | 'letter';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  summary?: any;
  farmName?: string;
  userName?: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateStr));
};

export const ReportTemplate = forwardRef<HTMLDivElement, ReportTemplateProps>(
  ({ reportType, dateRange, paperSize, data, summary, farmName = 'MitraTani Farm', userName = 'Admin' }, ref) => {

    const currentDate = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date());

    const getTitle = () => {
      switch (reportType) {
        case 'populasi': return 'Laporan Populasi & Inventori Ternak';
        case 'kesehatan': return 'Laporan Rekam Medis & Kesehatan';
        case 'pertumbuhan': return 'Laporan Pertumbuhan (ADG) Ternak';
        case 'penjualan': return 'Laporan Penjualan & Panen';
        default: return 'Laporan';
      }
    };

    const renderSummaryBox = () => {
      if (!summary) return null;

      switch (reportType) {
        case 'populasi':
          return (
            <div className="mb-6 grid grid-cols-3 gap-3 text-xs">
              <div className="border border-slate-300 p-2.5 rounded">
                <span className="text-slate-500 block">Total Ternak</span>
                <span className="font-bold text-lg">{summary.totalActive}</span>
              </div>
              <div className="border border-slate-300 p-2.5 rounded">
                <span className="text-slate-500 block">Jenis</span>
                <span className="font-bold">Domba: {summary.domba} | Kambing: {summary.kambing}</span>
              </div>
              <div className="border border-slate-300 p-2.5 rounded">
                <span className="text-slate-500 block">Gender</span>
                <span className="font-bold">Jantan: {summary.jantan} | Betina: {summary.betina}</span>
              </div>
            </div>
          );
        case 'kesehatan':
          return (
            <div className="mb-6 grid grid-cols-4 gap-3 text-xs">
              <div className="border border-slate-300 p-2.5 rounded">
                <span className="text-slate-500 block">Total Rekam Medis</span>
                <span className="font-bold text-lg">{summary.total}</span>
              </div>
              <div className="border border-slate-300 p-2.5 rounded">
                <span className="text-slate-500 block">Karantina</span>
                <span className="font-bold text-amber-600">{summary.karantina}</span>
              </div>
              <div className="border border-slate-300 p-2.5 rounded">
                <span className="text-slate-500 block">Pemulihan</span>
                <span className="font-bold text-blue-600">{summary.pemulihan}</span>
              </div>
              <div className="border border-slate-300 p-2.5 rounded">
                <span className="text-slate-500 block">Selesai/Sembuh</span>
                <span className="font-bold text-emerald-600">{summary.selesai}</span>
              </div>
            </div>
          );
        case 'pertumbuhan':
          return (
            <div className="mb-6 grid grid-cols-3 gap-3 text-xs">
              <div className="border border-slate-300 p-2.5 rounded">
                <span className="text-slate-500 block">Total Ternak</span>
                <span className="font-bold text-lg">{summary.total}</span>
              </div>
              <div className="border border-slate-300 p-2.5 rounded">
                <span className="text-slate-500 block">Rata-rata ADG</span>
                <span className="font-bold">{summary.avgAdg} kg/hari</span>
              </div>
              <div className="border border-slate-300 p-2.5 rounded">
                <span className="text-slate-500 block">Total Kenaikan Berat</span>
                <span className="font-bold">{summary.totalGain} kg</span>
              </div>
            </div>
          );
        case 'penjualan':
          return (
            <div className="mb-6 grid grid-cols-4 gap-3 text-xs">
              <div className="border border-slate-300 p-2.5 rounded">
                <span className="text-slate-500 block">Total Transaksi</span>
                <span className="font-bold text-lg">{summary.total}</span>
              </div>
              <div className="border border-slate-300 p-2.5 rounded">
                <span className="text-slate-500 block">Total Pendapatan</span>
                <span className="font-bold text-emerald-700">{formatCurrency(summary.totalRevenue)}</span>
              </div>
              <div className="border border-slate-300 p-2.5 rounded">
                <span className="text-slate-500 block">Potong</span>
                <span className="font-bold">{summary.potong} ekor</span>
              </div>
              <div className="border border-slate-300 p-2.5 rounded">
                <span className="text-slate-500 block">Jual Hidup</span>
                <span className="font-bold">{summary.jualHidup} ekor</span>
              </div>
            </div>
          );
        default:
          return null;
      }
    };

    const renderTable = () => {
      switch (reportType) {
        case 'populasi': {
          const rows = data as LivestockRow[];
          return (
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 print:bg-slate-200">
                  <th className="border border-slate-300 p-2 text-left font-bold w-10">No.</th>
                  <th className="border border-slate-300 p-2 text-left font-bold">ID Ternak</th>
                  <th className="border border-slate-300 p-2 text-left font-bold">Jenis</th>
                  <th className="border border-slate-300 p-2 text-left font-bold">Gender</th>
                  <th className="border border-slate-300 p-2 text-left font-bold">Umur</th>
                  <th className="border border-slate-300 p-2 text-left font-bold">Berat (kg)</th>
                  <th className="border border-slate-300 p-2 text-left font-bold">Kandang</th>
                  <th className="border border-slate-300 p-2 text-left font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? rows.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="border border-slate-300 p-2 text-center">{i + 1}</td>
                    <td className="border border-slate-300 p-2 font-mono">{row.qr_code}</td>
                    <td className="border border-slate-300 p-2 capitalize">{row.type}</td>
                    <td className="border border-slate-300 p-2">{row.gender === 'male' ? 'Jantan' : 'Betina'}</td>
                    <td className="border border-slate-300 p-2">{row.age_months} bln</td>
                    <td className="border border-slate-300 p-2">{row.current_weight}</td>
                    <td className="border border-slate-300 p-2">{row.cage_name}</td>
                    <td className="border border-slate-300 p-2 capitalize">{row.status === 'healthy' ? 'Sehat' : 'Sakit'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={8} className="border border-slate-300 p-4 text-center italic text-slate-500">Tidak ada data pada periode ini.</td></tr>
                )}
              </tbody>
            </table>
          );
        }

        case 'kesehatan': {
          const rows = data as HealthRow[];
          return (
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 print:bg-slate-200">
                  <th className="border border-slate-300 p-2 text-left font-bold w-10">No.</th>
                  <th className="border border-slate-300 p-2 text-left font-bold">ID Ternak</th>
                  <th className="border border-slate-300 p-2 text-left font-bold">Tanggal</th>
                  <th className="border border-slate-300 p-2 text-left font-bold">Diagnosa</th>
                  <th className="border border-slate-300 p-2 text-left font-bold">Tindakan</th>
                  <th className="border border-slate-300 p-2 text-left font-bold">Status</th>
                  <th className="border border-slate-300 p-2 text-left font-bold">Petugas</th>
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? rows.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="border border-slate-300 p-2 text-center">{i + 1}</td>
                    <td className="border border-slate-300 p-2 font-mono">{row.qr_code}</td>
                    <td className="border border-slate-300 p-2">{formatDate(row.date)}</td>
                    <td className="border border-slate-300 p-2">{row.illness_description}</td>
                    <td className="border border-slate-300 p-2">{row.treatment}</td>
                    <td className="border border-slate-300 p-2 capitalize">{row.status}</td>
                    <td className="border border-slate-300 p-2">{row.recorded_by_name}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} className="border border-slate-300 p-4 text-center italic text-slate-500">Tidak ada data pada periode ini.</td></tr>
                )}
              </tbody>
            </table>
          );
        }

        case 'pertumbuhan': {
          const rows = data as GrowthRow[];
          return (
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 print:bg-slate-200">
                  <th className="border border-slate-300 p-2 text-left font-bold w-10">No.</th>
                  <th className="border border-slate-300 p-2 text-left font-bold">ID Ternak</th>
                  <th className="border border-slate-300 p-2 text-left font-bold">Jenis</th>
                  <th className="border border-slate-300 p-2 text-left font-bold">Berat Awal (kg)</th>
                  <th className="border border-slate-300 p-2 text-left font-bold">Berat Saat Ini (kg)</th>
                  <th className="border border-slate-300 p-2 text-left font-bold">Kenaikan (kg)</th>
                  <th className="border border-slate-300 p-2 text-left font-bold">ADG (kg/hari)</th>
                  <th className="border border-slate-300 p-2 text-left font-bold">Umur</th>
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? rows.map((row, i) => {
                  const gain = (row.current_weight - row.initial_weight).toFixed(1);
                  const days = Math.max(row.age_months * 30, 1);
                  const adg = ((row.current_weight - row.initial_weight) / days).toFixed(3);
                  return (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="border border-slate-300 p-2 text-center">{i + 1}</td>
                      <td className="border border-slate-300 p-2 font-mono">{row.qr_code}</td>
                      <td className="border border-slate-300 p-2 capitalize">{row.type}</td>
                      <td className="border border-slate-300 p-2">{row.initial_weight}</td>
                      <td className="border border-slate-300 p-2">{row.current_weight}</td>
                      <td className="border border-slate-300 p-2">{gain}</td>
                      <td className="border border-slate-300 p-2">{adg}</td>
                      <td className="border border-slate-300 p-2">{row.age_months} bln</td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={8} className="border border-slate-300 p-4 text-center italic text-slate-500">Tidak ada data pada periode ini.</td></tr>
                )}
              </tbody>
            </table>
          );
        }

        case 'penjualan': {
          const rows = data as HarvestRow[];
          return (
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 print:bg-slate-200">
                  <th className="border border-slate-300 p-2 text-left font-bold w-10">No.</th>
                  <th className="border border-slate-300 p-2 text-left font-bold">ID Ternak</th>
                  <th className="border border-slate-300 p-2 text-left font-bold">Jenis</th>
                  <th className="border border-slate-300 p-2 text-left font-bold">Tipe</th>
                  <th className="border border-slate-300 p-2 text-left font-bold">Berat (kg)</th>
                  <th className="border border-slate-300 p-2 text-left font-bold">Harga Jual</th>
                  <th className="border border-slate-300 p-2 text-left font-bold">Pembeli</th>
                  <th className="border border-slate-300 p-2 text-left font-bold">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? rows.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="border border-slate-300 p-2 text-center">{i + 1}</td>
                    <td className="border border-slate-300 p-2 font-mono">{row.qr_code}</td>
                    <td className="border border-slate-300 p-2 capitalize">{row.type}</td>
                    <td className="border border-slate-300 p-2">{row.harvest_type === 'potong' ? 'Potong' : 'Jual Hidup'}</td>
                    <td className="border border-slate-300 p-2">{row.live_weight}</td>
                    <td className="border border-slate-300 p-2">{formatCurrency(Number(row.selling_price))}</td>
                    <td className="border border-slate-300 p-2">{row.customer_name}</td>
                    <td className="border border-slate-300 p-2">{formatDate(row.harvest_date)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={8} className="border border-slate-300 p-4 text-center italic text-slate-500">Tidak ada data pada periode ini.</td></tr>
                )}
              </tbody>
            </table>
          );
        }

        default:
          return null;
      }
    };

    return (
      <div
        ref={ref}
        className="bg-white text-black p-8 md:p-12 mx-auto shadow-lg print:shadow-none print:p-0 print:w-full print:max-w-none print:min-h-0 border border-slate-200 print:border-none"
        style={{
          width: paperSize === 'a4' ? '210mm' : '215.9mm',
          minHeight: paperSize === 'a4' ? '297mm' : paperSize === 'f4' ? '330.2mm' : '279.4mm',
        }}
      >
        {/* Header Kop Surat */}
        <div className="flex items-center justify-between border-b-4 border-emerald-800 pb-6 mb-8">
          <div className="flex items-center gap-4">
            <img src="/assets/image/logo-sheepstock-green.png" alt="Logo" className="w-16 h-16 object-contain" />
            <div>
              <h1 className="text-3xl font-extrabold text-emerald-900 m-0" style={{ fontFamily: "'Poppins', sans-serif" }}>SheepStock</h1>
              <p className="text-sm font-semibold text-slate-600 m-0">{farmName}</p>
              <p className="text-xs text-slate-500 m-0">Platform Manajemen Peternakan Digital</p>
            </div>
          </div>
        </div>

        {/* Report Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold uppercase underline mb-2">{getTitle()}</h2>
          <p className="text-sm">
            Periode: {dateRange.start ? formatDate(dateRange.start) : 'Semua'} s/d {dateRange.end ? formatDate(dateRange.end) : 'Semua'}
          </p>
        </div>

        {/* Summary Box */}
        {renderSummaryBox()}

        {/* Data Table */}
        <div className="mb-12">
          {renderTable()}
        </div>

        {/* Footer Signature Area */}
        <div className="flex justify-between mt-16 pt-8 print:break-inside-avoid" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
          <div className="text-xs text-slate-500">
            <p>Dicetak pada: {currentDate}</p>
            <p>Total data: {data.length} baris</p>
          </div>
          <div className="text-center w-48">
            <p className="text-sm mb-16">Bogor, {currentDate}</p>
            <p className="text-sm font-bold underline">{userName}</p>
            <p className="text-xs">Penanggung Jawab</p>
          </div>
        </div>
      </div>
    );
  }
);

ReportTemplate.displayName = 'ReportTemplate';
