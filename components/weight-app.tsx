"use client";

import { Activity, ArrowDownRight, ArrowUpRight, BarChart3, CheckCircle2, Cloud, Database, LineChart, Scale, Sparkles, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AddWeightForm } from "@/components/add-weight-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressChart } from "@/components/progress-chart";
import { HistoryTable } from "@/components/history-table";
import { StatCard } from "@/components/stat-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { SyncPanel } from "@/components/sync-panel";
import { fetchCloudWeightEntries, deleteCloudWeightEntry, mergeEntries, uploadEntriesToCloud, upsertCloudWeightEntry } from "@/lib/cloud-storage";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import { loadWeightEntries, saveWeightEntries } from "@/lib/storage";
import { formatChange, formatKg } from "@/lib/utils";
import type { WeightEntry } from "@/types/weight";
import type { User } from "@supabase/supabase-js";

function entryCreatedTime(entry: WeightEntry) {
  return new Date(entry.createdAt || entry.updatedAt || 0).getTime();
}

function sortEntriesByDateAndTime(a: WeightEntry, b: WeightEntry) {
  const dateCompare = a.date.localeCompare(b.date);
  if (dateCompare !== 0) return dateCompare;
  return entryCreatedTime(a) - entryCreatedTime(b);
}

export function WeightApp() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<WeightEntry | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [syncConfigured, setSyncConfigured] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("Local mode: records are saved only on this device until cloud sync is configured and you sign in.");

  useEffect(() => {
    setEntries(loadWeightEntries());
    setHydrated(true);

    const configured = isSupabaseConfigured();
    setSyncConfigured(configured);

    if (!configured) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (hydrated) saveWeightEntries(entries);
  }, [entries, hydrated]);

  useEffect(() => {
    if (!user || !hydrated) return;
    void syncWithCloud();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, hydrated]);

  const sortedAsc = useMemo(() => [...entries].sort(sortEntriesByDateAndTime), [entries]);
  const latest = sortedAsc.at(-1) ?? null;
  const first = sortedAsc.at(0) ?? null;
  const highest = entries.length ? Math.max(...entries.map((entry) => entry.weight)) : null;
  const lowest = entries.length ? Math.min(...entries.map((entry) => entry.weight)) : null;
  const change = latest && first ? Number((latest.weight - first.weight).toFixed(1)) : 0;
  const average = entries.length ? entries.reduce((sum, entry) => sum + entry.weight, 0) / entries.length : null;

  async function syncWithCloud() {
    if (!user) return;

    try {
      setSyncing(true);
      setSyncStatus("Syncing your local and cloud records…");
      const localEntries = loadWeightEntries();
      const cloudEntries = await fetchCloudWeightEntries(user.id);
      const merged = mergeEntries(localEntries, cloudEntries);
      await uploadEntriesToCloud(merged, user.id);
      setEntries(merged);
      saveWeightEntries(merged);
      setSyncStatus(`Synced ${merged.length} record${merged.length === 1 ? "" : "s"} to your account.`);
    } catch (error) {
      setSyncStatus(error instanceof Error ? error.message : "Cloud sync failed. Please check Supabase setup.");
    } finally {
      setSyncing(false);
    }
  }

  async function handleSignIn(email: string, password: string) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    try {
      setSyncing(true);
      setSyncStatus("Signing in…");
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setSyncStatus("Signed in. Sync will start automatically.");
    } catch (error) {
      setSyncStatus(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setSyncing(false);
    }
  }

  async function handleSignUp(email: string, password: string) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    try {
      setSyncing(true);
      setSyncStatus("Creating your account…");
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setSyncStatus("Account created. Check your email if Supabase asks for confirmation, then sign in.");
    } catch (error) {
      setSyncStatus(error instanceof Error ? error.message : "Could not create account.");
    } finally {
      setSyncing(false);
    }
  }

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    await supabase.auth.signOut();
    setUser(null);
    setSyncStatus("Signed out. Records saved on this device will stay local.");
  }

  function handleSave(entry: Omit<WeightEntry, "createdAt"> & { createdAt?: string }) {
    const now = new Date().toISOString();
    const nextEntry: WeightEntry = {
      ...entry,
      createdAt: entry.createdAt ?? now,
      updatedAt: now
    };

    setEntries((current) => {
      const exists = current.some((item) => item.id === nextEntry.id);
      const updated = exists ? current.map((item) => (item.id === nextEntry.id ? nextEntry : item)) : [...current, nextEntry];
      return updated.sort(sortEntriesByDateAndTime);
    });

    if (user) {
      setSyncStatus("Saving to cloud…");
      void upsertCloudWeightEntry(nextEntry, user.id)
        .then(() => setSyncStatus("Saved and synced to your account."))
        .catch((error: unknown) => setSyncStatus(error instanceof Error ? error.message : "Could not sync this record."));
    }
  }

  function handleDelete(id: string) {
    setEntries((current) => current.filter((entry) => entry.id !== id));
    if (editingEntry?.id === id) setEditingEntry(null);

    if (user) {
      setSyncStatus("Deleting from cloud…");
      void deleteCloudWeightEntry(id)
        .then(() => setSyncStatus("Deleted from this device and your account."))
        .catch((error: unknown) => setSyncStatus(error instanceof Error ? error.message : "Could not delete this record from cloud."));
    }
  }

  function handleEdit(entry: WeightEntry) {
    setEditingEntry(entry);
    document.getElementById("add-weight")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.20),transparent_34%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.16),transparent_28%),hsl(var(--background))]">
      <header className="sticky top-0 z-40 border-b bg-background/75 backdrop-blur-xl">
        <div className="section-shell flex h-20 items-center justify-between gap-4">
          <a href="#top" className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-teal-500/30">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight">Daily Weight</p>
              <p className="text-xs font-medium text-muted-foreground">Recorder</p>
            </div>
          </a>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-muted-foreground md:flex">
            <a className="transition hover:text-foreground" href="#dashboard">Dashboard</a>
            <a className="transition hover:text-foreground" href="#add-weight">Add Weight</a>
            <a className="transition hover:text-foreground" href="#history">History</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild className="hidden sm:inline-flex">
              <a href="#add-weight">Record now</a>
            </Button>
          </div>
        </div>
      </header>

      <section id="top" className="section-shell relative py-16 sm:py-20 lg:py-24">
        <div className="absolute left-1/2 top-12 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="animate-fadeUp">
            <Badge className="mb-5 gap-2 border-primary/20 bg-primary/10 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Private, ad-free tracker with optional cloud sync
            </Badge>
            <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-5xl lg:text-7xl">
              Record your weight daily and see your progress clearly.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Daily Weight Recorder helps you save kilogram-based entries, view trends, edit history, and sync securely across devices when Supabase cloud sync is connected.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href="#add-weight">Start recording</a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#dashboard">View dashboard</a>
              </Button>
            </div>
            <div className="mt-8 grid gap-3 text-sm font-medium text-muted-foreground sm:grid-cols-3">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> No ads</div>
              <div className="flex items-center gap-2"><Cloud className="h-4 w-4 text-primary" /> Cloud sync ready</div>
              <div className="flex items-center gap-2"><LineChart className="h-4 w-4 text-primary" /> Progress chart</div>
            </div>
          </div>

          <div className="animate-float rounded-[2rem] border bg-card/65 p-4 shadow-glow backdrop-blur-xl">
            <div className="premium-grid rounded-[1.5rem] border bg-background/80 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today’s weight</p>
                  <p className="mt-2 text-5xl font-black tracking-tight">{formatKg(latest?.weight)}</p>
                </div>
                <div className="rounded-3xl bg-primary p-4 text-primary-foreground">
                  <Activity className="h-8 w-8" />
                </div>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border bg-card/80 p-4">
                  <p className="text-xs font-semibold text-muted-foreground">Change</p>
                  <p className="mt-2 text-2xl font-black">{formatChange(change)}</p>
                </div>
                <div className="rounded-2xl border bg-card/80 p-4">
                  <p className="text-xs font-semibold text-muted-foreground">Lowest</p>
                  <p className="mt-2 text-2xl font-black">{formatKg(lowest)}</p>
                </div>
                <div className="rounded-2xl border bg-card/80 p-4">
                  <p className="text-xs font-semibold text-muted-foreground">Entries</p>
                  <p className="mt-2 text-2xl font-black">{entries.length}</p>
                </div>
              </div>
              <div className="mt-5 rounded-3xl border bg-card/80 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-bold">Quick insights</p>
                  <Badge>{entries.length ? "Active" : "New"}</Badge>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex justify-between"><span>Average weight</span><strong className="text-foreground">{formatKg(average)}</strong></div>
                  <div className="flex justify-between"><span>Highest record</span><strong className="text-foreground">{formatKg(highest)}</strong></div>
                  <div className="flex justify-between"><span>Sync mode</span><strong className="text-foreground">{user ? "Cloud" : "Local"}</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="dashboard" className="section-shell scroll-mt-24 pb-8">
        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary">Dashboard</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Your weight overview</h2>
          </div>
          <p className="max-w-xl text-sm text-muted-foreground">Stats update automatically as you add, edit, or delete records.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Latest weight" value={formatKg(latest?.weight)} helper={latest ? `Recorded on ${latest.date}` : "No record yet"} icon={Scale} />
          <StatCard title="Total change" value={formatChange(change)} helper="Compared with your first record" icon={change <= 0 ? ArrowDownRight : ArrowUpRight} trend={change <= 0 ? "good" : "warning"} />
          <StatCard title="Lowest weight" value={formatKg(lowest)} helper="Best low point in your history" icon={Trophy} trend="good" />
          <StatCard title="Highest weight" value={formatKg(highest)} helper="Highest saved record" icon={BarChart3} />
        </div>
      </section>

      <section className="section-shell py-8">
        <SyncPanel
          configured={syncConfigured}
          userEmail={user?.email ?? null}
          status={syncStatus}
          syncing={syncing}
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          onSignOut={handleSignOut}
          onSyncNow={syncWithCloud}
        />
      </section>

      <section className="section-shell grid gap-6 py-8 lg:grid-cols-[0.85fr_1.15fr]">
        <AddWeightForm editingEntry={editingEntry} onSave={handleSave} onCancelEdit={() => setEditingEntry(null)} />
        <ProgressChart entries={entries} />
      </section>

      <section id="history" className="section-shell scroll-mt-24 py-8 pb-16">
        <HistoryTable entries={entries} onEdit={handleEdit} onDelete={handleDelete} />
      </section>

      <footer className="border-t bg-background/60 py-8 backdrop-blur-xl">
        <div className="section-shell flex flex-col justify-between gap-4 text-sm text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Daily Weight Recorder. Built for private daily tracking.</p>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span>No ads. Local-first with optional Supabase cloud sync.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
