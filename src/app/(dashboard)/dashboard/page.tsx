import React from "react";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";
import {
  Users, Warehouse, AlertTriangle, TrendingUp, Percent, Box,
  Search, HelpCircle, MoreHorizontal, PlusCircle, Syringe, AlertCircle
} from "lucide-react";
import { HealthChart } from "@/components/dashboard/health-chart";
import { PopulationChart } from "@/components/dashboard/population-chart";
import { PopulationDropdown } from "@/components/dashboard/population-dropdown";
import { UserDropdown } from "@/components/dashboard/user-dropdown";
import { NotificationDropdown } from "@/components/dashboard/notification-dropdown";
import { HelpDropdown } from "@/components/dashboard/help-dropdown";
import { GrowthChart } from "@/components/dashboard/growth-chart";
import { HarvestChart } from "@/components/dashboard/harvest-chart";
import { IllnessChart } from "@/components/dashboard/illness-chart";

export const dynamic = 'force-dynamic'
export const revalidate = 0; // Force no-cache on the entire dashboard route

export default async function Dashboard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  let userName = "Admin";
  let userRole = "staff";
  let avatarUrl: string | null = null; // Remove hardcoded fallback

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("name, role").eq("id", user.id).single();
    if (profile?.role) userRole = profile.role;
    if (profile?.name && profile.name !== "New Staff") userName = profile.name;
    // Fallback to user_metadata in case profile still has the DB default
    else if (user.user_metadata?.full_name) userName = user.user_metadata.full_name;

    if (user.user_metadata?.avatar_url) avatarUrl = user.user_metadata.avatar_url;
  }

  // Fetch recent notifications (top 5 latest audit logs)
  const { data: recentLogs } = await supabase
    .from('audit_logs')
    .select('id, description, created_at, action')
    .order('created_at', { ascending: false })
    .limit(5);

  const notifications = [...(recentLogs || [])];


  // Check if we need a vaccination reminder (Mock condition: random check or at least 1 livestock exists)
  const { count: totalPopulation } = await supabase
    .from("livestocks")
    .select("*", { count: "exact", head: true })
    .in("status", ["healthy", "sick"]);

  if (totalPopulation && totalPopulation > 0) {
    // We add a generic reminder for vaccination checks for the whole farm
    notifications.unshift({
      id: 'vaccine-reminder',
      description: `Jadwal Vaksinasi & Pemeriksaan: Periksa ternak Anda bulan ini untuk menjaga populasi tetap sehat.`,
      created_at: new Date().toISOString(),
      action: 'ALERT_VACCINE'
    });
  }

  const { data: cagesData } = await supabase
    .from("cages")
    .select("name, current_occupancy, livestocks(gender)")
    .order("name");

  const totalCages = cagesData?.length || 0;
  const activeCages = cagesData?.filter(c => c.current_occupancy > 0).length || 0;
  const populationData = cagesData?.map(c => {
    const males = c.livestocks?.filter((l: any) => l.gender === 'male').length || 0;
    const females = c.livestocks?.filter((l: any) => l.gender === 'female').length || 0;
    return {
      cage: c.name,
      occupancy: c.current_occupancy,
      males,
      females
    };
  }) || [];

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
    .select("id, name, current_stock, min_stock_alert");

  const lowStockItems = inventoryItems?.filter(
    (item) => item.current_stock <= item.min_stock_alert
  ) || [];

  lowStockItems.forEach(item => {
    notifications.unshift({
      id: `stock-${item.id}`,
      description: `Peringatan Stok: ${item.name} sisa ${item.current_stock} (Batas min: ${item.min_stock_alert})`,
      created_at: new Date().toISOString(),
      action: 'ALERT_STOCK'
    });
  });

  // Fetch recent health records
  const { data: recentHealth } = await supabase
    .from("health_records")
    .select("illness_description, status, date, livestocks ( qr_code )")
    .order("date", { ascending: false })
    .limit(5);

  // Fetch recent weighing records
  const { data: recentWeighing } = await supabase
    .from("weighing_records")
    .select("weight, recorded_at, livestocks ( qr_code )")
    .order("recorded_at", { ascending: false })
    .limit(3);

  // Build unified activity log
  type Activity = { title: string; desc: string; time: string; color: string; icon: React.ReactNode; ts: number };
  const activities: Activity[] = [];

  // Low stock alerts
  if (lowStockItems.length > 0) {
    activities.push({
      title: "Stok Menipis",
      desc: lowStockItems.map(i => i.name).join(', ') + " di bawah batas",
      time: "Sekarang",
      color: "bg-rose-100 dark:bg-rose-950 text-rose-600",
      icon: <AlertCircle className="w-4 h-4" />,
      ts: Date.now()
    });
  }

  // Health records
  for (const hr of (recentHealth || [])) {
    const statusLabel = hr.status === 'selesai' ? 'Sembuh' : hr.status === 'karantina' ? 'Karantina' : 'Pemulihan';
    activities.push({
      title: `${statusLabel}: ${(hr.livestocks as any)?.qr_code || 'Ternak'}`,
      desc: hr.illness_description,
      time: new Date(hr.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      color: hr.status === 'selesai' ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-600" : "bg-amber-100 dark:bg-amber-950 text-amber-600",
      icon: <Syringe className="w-4 h-4" />,
      ts: new Date(hr.date).getTime()
    });
  }

  // Weighing records
  for (const wr of (recentWeighing || [])) {
    activities.push({
      title: `Timbang: ${(wr.livestocks as any)?.qr_code || 'Ternak'}`,
      desc: `Berat tercatat ${wr.weight} Kg`,
      time: new Date(wr.recorded_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      color: "bg-blue-100 dark:bg-blue-950 text-blue-600",
      icon: <TrendingUp className="w-4 h-4" />,
      ts: new Date(wr.recorded_at).getTime()
    });
  }

  // Sort by time descending, limit to 8
  const recentActivities = activities.sort((a, b) => b.ts - a.ts).slice(0, 8);

  // --- Data for New Charts ---
  // 1. Illness Data
  const { data: allHealth } = await supabase.from("health_records").select("illness_description").in("status", ["karantina", "pemulihan", "selesai"]);
  const illnessCounts: Record<string, number> = {};
  if (allHealth) {
    allHealth.forEach(record => {
      if (record.illness_description) {
        const desc = record.illness_description.trim();
        illnessCounts[desc] = (illnessCounts[desc] || 0) + 1;
      }
    });
  }
  const illnessData = Object.keys(illnessCounts).map(key => ({
    name: key,
    value: illnessCounts[key]
  })).sort((a, b) => b.value - a.value).slice(0, 10);

  // Generate last 6 months keys for padding
  const monthsList: string[] = [];
  const tempDate = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(tempDate.getFullYear(), tempDate.getMonth() - i, 1);
    monthsList.push(d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }));
  }

  // 2. Growth Data
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const { data: allWeighing } = await supabase
    .from("weighing_records")
    .select("weight, recorded_at")
    .gte("recorded_at", sixMonthsAgo.toISOString())
    .order("recorded_at", { ascending: true });

  const growthMap: Record<string, { sum: number, count: number }> = {};
  monthsList.forEach(m => growthMap[m] = { sum: 0, count: 0 });

  if (allWeighing) {
    allWeighing.forEach(record => {
      const date = new Date(record.recorded_at);
      const monthYear = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      if (growthMap[monthYear]) {
        growthMap[monthYear].sum += record.weight;
        growthMap[monthYear].count += 1;
      }
    });
  }
  const growthData = monthsList.map(key => ({
    month: key,
    adg: growthMap[key].count > 0 ? parseFloat((growthMap[key].sum / growthMap[key].count).toFixed(2)) : 0
  }));

  // 3. Harvest Data
  const { data: allHarvests } = await supabase
    .from("harvest_records")
    .select("live_weight, harvest_date")
    .gte("harvest_date", sixMonthsAgo.toISOString())
    .eq("status", "completed")
    .order("harvest_date", { ascending: true });

  const harvestMap: Record<string, number> = {};
  monthsList.forEach(m => harvestMap[m] = 0);

  if (allHarvests) {
    allHarvests.forEach(record => {
      const date = new Date(record.harvest_date);
      const monthYear = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      if (harvestMap[monthYear] !== undefined) {
        harvestMap[monthYear] += record.live_weight;
      }
    });
  }
  const harvestData = monthsList.map(key => ({
    month: key,
    total: parseFloat(harvestMap[key].toFixed(2))
  }));

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
          <NotificationDropdown notifications={notifications} userRole={userRole} />
          <HelpDropdown />
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block"></div>
          <UserDropdown userName={userName} avatarUrl={avatarUrl} showName={true} userRole={userRole} />
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50 dark:bg-slate-950">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Hai, {userName}!</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {(userRole === 'owner' || userRole === 'admin')
                ? <><span className="text-purple-500 font-bold">{userRole === 'owner' ? 'Owner Peternakan' : 'Administrator'}</span> | Ringkasan operasional MitraTani hari ini.</>
                : <><span className="text-emerald-500 font-bold">Staff Peternakan</span> | Jadwal dan status operasional hari ini.</>
              }
            </p>
          </div>
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
            <div className="flex items-center justify-between mb-4 shrink-0 relative z-10">
              <div>
                <h4 className="text-lg font-bold">Populasi per Kandang</h4>
                <p className="text-xs text-slate-500">Distribusi ternak di setiap area</p>
              </div>
              <PopulationDropdown data={populationData} />
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

        {/* Advanced Data Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="glass-card rounded-2xl p-5 shadow-sm flex flex-col">
            <div className="mb-4 shrink-0">
              <h4 className="text-lg font-bold">Tren Pertumbuhan Berat</h4>
              <p className="text-xs text-slate-500">Rata-rata berat 6 bln terakhir</p>
            </div>
            <div className="flex-1 w-full relative min-h-[200px]">
              <div className="absolute inset-0">
                <GrowthChart data={growthData} />
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 shadow-sm flex flex-col">
            <div className="mb-4 shrink-0">
              <h4 className="text-lg font-bold">Produktivitas Panen</h4>
              <p className="text-xs text-slate-500">Total berat 6 bln terakhir</p>
            </div>
            <div className="flex-1 w-full relative min-h-[200px]">
              <div className="absolute inset-0">
                <HarvestChart data={harvestData} />
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 shadow-sm flex flex-col">
            <div className="mb-4 shrink-0">
              <h4 className="text-lg font-bold">Analisis Penyakit</h4>
              <p className="text-xs text-slate-500">Distribusi alasan medis</p>
            </div>
            <div className="flex-1 w-full relative min-h-[200px]">
              <div className="absolute inset-0">
                <IllnessChart data={illnessData} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity/Log */}
        <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-900/50">
            <h4 className="text-base font-bold">Log Aktivitas Terakhir</h4>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentActivities.length === 0 ? (
              <div className="px-5 py-8 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-slate-500">Belum ada aktivitas</p>
                <p className="text-xs text-slate-400 mt-1">Aktivitas akan muncul saat Anda mulai mengelola peternakan.</p>
              </div>
            ) : (
              recentActivities.map((act, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${act.color}`}>
                    {act.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{act.title}</p>
                    <p className="text-[10px] text-slate-500 truncate">{act.desc}</p>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">{act.time}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </>
  );
}
