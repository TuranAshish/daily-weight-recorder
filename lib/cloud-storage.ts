import type { WeightEntry } from "@/types/weight";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type DbWeightEntry = {
  id: string;
  user_id: string;
  date: string;
  weight_kg: number | string;
  note: string | null;
  created_at: string;
  updated_at: string | null;
};

function toAppEntry(row: DbWeightEntry): WeightEntry {
  return {
    id: row.id,
    date: row.date,
    weight: Number(row.weight_kg),
    note: row.note ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at
  };
}

function toDbEntry(entry: WeightEntry, userId: string) {
  return {
    id: entry.id,
    user_id: userId,
    date: entry.date,
    weight_kg: entry.weight,
    note: entry.note?.trim() || null,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt ?? new Date().toISOString()
  };
}

function newerOf(a: WeightEntry, b: WeightEntry) {
  const aTime = new Date(a.updatedAt ?? a.createdAt).getTime();
  const bTime = new Date(b.updatedAt ?? b.createdAt).getTime();
  return bTime >= aTime ? b : a;
}

export function mergeEntries(localEntries: WeightEntry[], cloudEntries: WeightEntry[]) {
  const byDate = new Map<string, WeightEntry>();

  [...localEntries, ...cloudEntries].forEach((entry) => {
    const existing = byDate.get(entry.date);
    byDate.set(entry.date, existing ? newerOf(existing, entry) : entry);
  });

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export async function fetchCloudWeightEntries(userId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("weight_entries")
    .select("id,user_id,date,weight_kg,note,created_at,updated_at")
    .eq("user_id", userId)
    .order("date", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as DbWeightEntry[]).map(toAppEntry);
}

export async function upsertCloudWeightEntry(entry: WeightEntry, userId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase
    .from("weight_entries")
    .upsert(toDbEntry(entry, userId), { onConflict: "id" });

  if (error) throw error;
}

export async function uploadEntriesToCloud(entries: WeightEntry[], userId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase || entries.length === 0) return;

  const { error } = await supabase
    .from("weight_entries")
    .upsert(entries.map((entry) => toDbEntry(entry, userId)), { onConflict: "id" });

  if (error) throw error;
}

export async function deleteCloudWeightEntry(id: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.from("weight_entries").delete().eq("id", id);
  if (error) throw error;
}
