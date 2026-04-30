import { SidebarTrigger } from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";
import {
  Users, Warehouse, AlertTriangle, TrendingUp, Percent, Box,
  Search, Bell, HelpCircle, MoreHorizontal, PlusCircle, Syringe, AlertCircle
} from "lucide-react";
import { HealthChart } from "@/components/dashboard/health-chart";
import { PopulationChart } from "@/components/dashboard/population-chart";

export const dynamic = 'force-dynamic'
export const revalidate = 0; // Force no-cache on the entire dashboard route

export default async function Dashboard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  let userName = "Admin";
  let avatarUrl: string | null = null; // Remove hardcoded fallback

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("name").eq("id", user.id).single();
    if (profile?.name && profile.name !== "New Staff") userName = profile.name;
    // Fallback to user_metadata in case profile still has the DB default
    else if (user.user_metadata?.full_name) userName = user.user_metadata.full_name;
    
    if (user.user_metadata?.avatar_url) avatarUrl = user.user_metadata.avatar_url;
  }

  const { count: totalPopulation } = await supabase
    .from("livestocks")
    .select("*", { count: "exact", head: true })
    .in("status", ["healthy", "sick"]);

  const { data: cagesData } = await supabase
    .from("cages")
    .select("name, current_occupancy")
    .order("name");

  const totalCages = cagesData?.length || 0;
  const activeCages = cagesData?.filter(c => c.current_occupancy > 0).length || 0;
  const populationData = cagesData?.map(c => ({ cage: c.name, occupancy: c.current_occupancy })) || [];

  const { count: healthyCount } = await supabase
    .from("livestocks")
    .select("*", { count: "exact", head: true })
    .eq("status", "healthy");

  const safeTotal = totalPopulation || 0;
  const safeHealthy = healthyCount || 0;
  const sickCount = Math.max(0, safeTotal - safeHealthy);
  const healthPercentage = safeTotal ? Math.round((safeHealthy / safeTotal) * 100) : 0;

  const { data: inventoryItems } = await supabase
    .from("inventory_items")
    .select("name, current_stock, min_stock_alert");

  const lowStockItems = inventoryItems?.filter(
    (item) => item.current_stock <= item.min_stock_alert
  ) || [];

  return (
    <>
      {/* Header */}
      <header className="h-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 z-10 shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-xl min-w-0">
          <SidebarTrigger />
          <div className="relative group w-full hidden sm:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors w-5 h-5" />
            <input
              className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm outline-none"
              placeholder="Cari ternak/scan QR..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button className="relative w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="hidden sm:flex w-10 h-10 items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block"></div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none mb-1">{userName}</p>
              <span className="inline-block px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full">ONLINE</span>
            </div>
            {avatarUrl ? (
              <img
                className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                alt="Profile"
                src={avatarUrl}
              />
            ) : (
              <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400">
                <Users className="w-5 h-5" />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50 dark:bg-slate-950">
        {/* Welcome Section */}
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Hai, {userName}!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Berikut adalah ringkasan performa peternakan <span className="text-emerald-500 font-bold">MitraTani</span> hari ini.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-emerald-500/5 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Users className="w-12 h-12 text-emerald-500" />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Populasi</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{safeTotal} <span className="text-base font-bold text-slate-400">Ekor</span></h3>
            {safeTotal > 0 && (
              <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 dark:bg-emerald-950/30 w-fit px-2 py-0.5 rounded-lg">
                <TrendingUp className="w-4 h-4" />
                <span>Data tersedia</span>
              </div>
            )}
          </div>

          <div className="glass-card p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-emerald-500/5 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Warehouse className="w-12 h-12 text-emerald-500" />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Kandang Terisi</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{activeCages}/{totalCages} <span className="text-base font-bold text-slate-400">Penuh</span></h3>
            <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs bg-emerald-50 dark:bg-emerald-950/30 w-fit px-2 py-0.5 rounded-lg">
              <Percent className="w-4 h-4" />
              <span>{totalCages > 0 ? Math.round((activeCages / totalCages) * 100) : 0}% Kapasitas</span>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl shadow-sm border-rose-100 dark:border-rose-900/30 relative overflow-hidden group hover:shadow-xl transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform text-rose-500">
              <AlertTriangle className="w-12 h-12" />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Stok Pakan Menipis</p>
            <h3 className="text-3xl font-black text-rose-600 mb-2">{lowStockItems.length} <span className="text-base font-bold text-rose-300">Jenis</span></h3>
            <div className="flex items-center gap-1 text-rose-600 font-bold text-xs bg-rose-50 dark:bg-rose-950/30 w-fit gap-x-2 px-2 py-0.5 rounded-lg">
              <Box className="w-4 h-4" />
              <span className="truncate max-w-[120px]">
                {lowStockItems.length > 0 ? lowStockItems.map(i => i.name).join(', ') : 'Aman'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Charts Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Bar Chart Section */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-5 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div>
                <h4 className="text-lg font-bold">Populasi per Kandang</h4>
                <p className="text-xs text-slate-500">Distribusi ternak di setiap area</p>
              </div>
              <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 w-full relative min-h-[160px]">
              <div className="absolute inset-0">
                <PopulationChart data={populationData} />
              </div>
            </div>
          </div>

          {/* Donut Chart Section */}
          <div className="glass-card rounded-2xl p-5 shadow-sm flex flex-col">
            <div className="mb-4 shrink-0">
              <h4 className="text-lg font-bold">Rasio Kesehatan</h4>
              <p className="text-xs text-slate-500">Kondisi ternak saat ini</p>
            </div>

            {/* Real Chart */}
            <div className="flex-1 w-full relative min-h-[140px] flex items-center justify-center">
              <div className="absolute inset-0">
                <HealthChart healthy={safeHealthy} sick={sickCount} />
              </div>
              {/* Center overlay label — only show when there's data */}
              {safeTotal > 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{healthPercentage}%</p>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase">Optimal</p>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2 shrink-0">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-semibold">Sehat</span>
                </div>
                <span className="text-xs font-bold">{safeHealthy} Ekor</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <span className="text-xs font-semibold">Sakit/Isolasi</span>
                </div>
                <span className="text-xs font-bold">{sickCount} Ekor</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity/Log */}
        <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-900/50">
            <h4 className="text-base font-bold">Log Aktivitas Terakhir</h4>
            <button className="text-emerald-500 text-xs font-bold hover:underline">Lihat Semua</button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {lowStockItems.length > 0 ? (
              <div className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="w-8 h-8 shrink-0 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Peringatan Stok Menipis</p>
                  <p className="text-[10px] text-rose-500">{lowStockItems.map(i => i.name).join(', ')} kurang dari batas</p>
                </div>
                <span className="text-xs font-bold text-rose-500">CRITICAL</span>
              </div>
            ) : (
              <div className="px-5 py-8 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-slate-500">Belum ada aktivitas</p>
                <p className="text-xs text-slate-400 mt-1">Aktivitas akan muncul saat Anda mulai mengelola peternakan.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
