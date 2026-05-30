import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ReportsClient from "@/components/reports/reports-client";
import type { LivestockRow, HealthRow, GrowthRow, HarvestRow } from "@/components/reports/reports-client";

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("name, role").eq("id", user.id).single();
  const userName = profile?.name && profile.name !== "New Staff" ? profile.name : user.user_metadata?.full_name || "Admin";

  // Get farm name (if available)
  let farmName = "MitraTani Farm";
  const { data: farmMember } = await supabase
    .from("farm_members")
    .select("farms(name)")
    .eq("user_id", user.id)
    .limit(1)
    .single();
  if (farmMember && (farmMember as any).farms?.name) {
    farmName = (farmMember as any).farms.name;
  }

  // 1. FETCH: Livestock / Populasi data
  const { data: rawLivestock } = await supabase
    .from("livestocks")
    .select(`
      qr_code, type, gender, age_months, current_weight, initial_weight, status, entry_date,
      cages ( name )
    `)
    .in("status", ["healthy", "sick"])
    .order("entry_date", { ascending: false });

  const livestockData: LivestockRow[] = (rawLivestock || []).map((l: any) => ({
    qr_code: l.qr_code,
    type: l.type,
    gender: l.gender,
    age_months: l.age_months,
    current_weight: l.current_weight,
    status: l.status,
    cage_name: l.cages?.name || '-',
    entry_date: l.entry_date,
  }));

  // 2. FETCH: Health records
  const { data: rawHealth } = await supabase
    .from("health_records")
    .select(`
      date, illness_description, treatment, status,
      livestocks ( qr_code ),
      profiles:recorded_by ( name )
    `)
    .order("date", { ascending: false });

  const healthData: HealthRow[] = (rawHealth || []).map((h: any) => ({
    qr_code: h.livestocks?.qr_code || '-',
    date: h.date,
    illness_description: h.illness_description,
    treatment: h.treatment,
    status: h.status || '-',
    recorded_by_name: h.profiles?.name || '-',
  }));

  // 3. FETCH: Growth / Weighing data (use livestocks with initial vs current weight)
  const { data: rawGrowth } = await supabase
    .from("livestocks")
    .select("qr_code, type, initial_weight, current_weight, age_months, entry_date")
    .in("status", ["healthy", "sick"])
    .order("entry_date", { ascending: false });

  const growthData: GrowthRow[] = (rawGrowth || []).map((g: any) => ({
    qr_code: g.qr_code,
    type: g.type,
    initial_weight: g.initial_weight,
    current_weight: g.current_weight,
    age_months: g.age_months,
    entry_date: g.entry_date,
  }));

  // 4. FETCH: Harvest / Penjualan data
  const { data: rawHarvest } = await supabase
    .from("harvest_records")
    .select(`
      harvest_type, live_weight, carcass_weight, selling_price, customer_name, harvest_date,
      livestocks ( qr_code, type )
    `)
    .eq("status", "completed")
    .order("harvest_date", { ascending: false });

  const harvestData: HarvestRow[] = (rawHarvest || []).map((h: any) => ({
    qr_code: h.livestocks?.qr_code || '-',
    type: h.livestocks?.type || '-',
    harvest_type: h.harvest_type || 'potong',
    live_weight: h.live_weight,
    carcass_weight: h.carcass_weight,
    selling_price: h.selling_price,
    customer_name: h.customer_name,
    harvest_date: h.harvest_date,
  }));

  return (
    <ReportsClient
      livestockData={livestockData}
      healthData={healthData}
      growthData={growthData}
      harvestData={harvestData}
      farmName={farmName}
      userName={userName}
    />
  );
}
