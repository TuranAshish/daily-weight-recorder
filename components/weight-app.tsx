"use client";

import { Activity, ArrowDownRight, ArrowUpRight, BarChart3, CheckCircle2, Database, LineChart, LockKeyhole, Scale, Sparkles, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AddWeightForm } from "@/components/add-weight-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressChart } from "@/components/progress-chart";
import { HistoryTable } from "@/components/history-table";
import { StatCard } from "@/components/stat-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { loadWeightEntries, saveWeightEntries } from "@/lib/storage";
import { formatChange, formatKg } from "@/lib/utils";
import type { WeightEntry } from "@/types/weight";

export function WeightApp() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<WeightEntry | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setEntries(loadWeightEntries());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveWeightEntries(entries);
  }, [entries, hydrated]);

  const sortedAsc = useMemo(() => [...entries].sort((a, b) => a.date.localeCompare(b.date)), [entries]);
  const latest = sortedAsc.at(-1) ?? null;
  const first = sortedAsc.at(0) ?? null;
  const highest = entries.length ? Math.max(...entries.map((entry) => entry.weight)) : null;
  const lowest = entries.length ? Math.min(...entries.map((entry) => entry.weight)) : null;
  const change = latest && first ? Number((latest.weight - first.weight).toFixed(1)) : 0;
  const average = entries.length ? entries.reduce((sum, entry) => sum + entry.weight, 0) / entries.length : null;

  function handleSave(entry: Omit<WeightEntry, "createdAt"> & { createdAt?: string }) {
    setEntries((current) => {
      const nextEntry: WeightEntry = {
        ...entry,
        createdAt: entry.createdAt ?? new Date().toISOString()
      };
      const exists = current.some((item) => item.id === nextEntry.id);
      const updated = exists ? current.map((item) => (item.id === nextEntry.id ? nextEntry : item)) : [...current, nextEntry];
      return updated.sort((a, b) => a.date.localeCompare(b.date));
    });
  }

  function handleDelete(id: string) {
    setEntries((current) => current.filter((entry) => entry.id !== id));
    if (editingEntry?.id === id) setEditingEntry(null);
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
              Private, ad-free, browser-based tracker
            </Badge>
            <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-5xl lg:text-7xl">
              Record your weight daily and see your progress clearly.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Daily Weight Recorder helps you save kilogram-based entries, view trends, edit history, and stay consistent without needing an account or backend.
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
              <div className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-primary" /> Local storage</div>
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
                  <div className="flex justify-between"><span>Saved locally</span><strong className="text-foreground">Yes</strong></div>
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

      <section className="section-shell grid gap-6 py-8 lg:grid-cols-[0.85fr_1.15fr]">
        <AddWeightForm entries={entries} editingEntry={editingEntry} onSave={handleSave} onCancelEdit={() => setEditingEntry(null)} />
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
            <span>No backend. No ads. Data saved in your browser.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
