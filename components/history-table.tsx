"use client";

import { Edit3, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { dateLabel, formatKg } from "@/lib/utils";
import type { WeightEntry } from "@/types/weight";

type HistoryTableProps = {
  entries: WeightEntry[];
  onEdit: (entry: WeightEntry) => void;
  onDelete: (id: string) => void;
};

function entryTime(entry: WeightEntry) {
  return new Date(entry.createdAt || entry.updatedAt || 0).getTime();
}

function timeLabel(entry: WeightEntry) {
  const value = entry.createdAt || entry.updatedAt;
  if (!value) return "";
  return new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function HistoryTable({ entries, onEdit, onDelete }: HistoryTableProps) {
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filteredEntries = useMemo(() => {
    return [...entries]
      .sort((a, b) => b.date.localeCompare(a.date) || entryTime(b) - entryTime(a))
      .filter((entry) => {
        const matchesSearch =
          !query ||
          entry.date.includes(query.toLowerCase()) ||
          dateLabel(entry.date).toLowerCase().includes(query.toLowerCase()) ||
          entry.note?.toLowerCase().includes(query.toLowerCase());
        const matchesFrom = !fromDate || entry.date >= fromDate;
        const matchesTo = !toDate || entry.date <= toDate;
        return matchesSearch && matchesFrom && matchesTo;
      });
  }, [entries, fromDate, query, toDate]);

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <CardTitle>History</CardTitle>
            <CardDescription>Search, filter, edit, or delete your records. Multiple entries on the same date are allowed.</CardDescription>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:w-[620px]">
            <div className="relative sm:col-span-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search date or note" value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
            <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} aria-label="From date" />
            <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} aria-label="To date" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <EmptyState />
        ) : filteredEntries.length === 0 ? (
          <div className="rounded-3xl border border-dashed bg-muted/30 p-8 text-center">
            <h3 className="text-lg font-bold">No matching records</h3>
            <p className="mt-2 text-sm text-muted-foreground">Try clearing the search or date filters.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border bg-card/50">
            <div className="hidden grid-cols-[1fr_1fr_1.4fr_130px] gap-4 border-b bg-muted/50 px-5 py-3 text-sm font-bold text-muted-foreground md:grid">
              <span>Date</span>
              <span>Weight</span>
              <span>Note</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="divide-y">
              {filteredEntries.map((entry) => (
                <div key={entry.id} className="grid gap-3 px-5 py-4 transition-colors hover:bg-muted/30 md:grid-cols-[1fr_1fr_1.4fr_130px] md:items-center md:gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground md:hidden">Date</p>
                    <p className="font-semibold">{dateLabel(entry.date)}</p>
                    <p className="text-xs text-muted-foreground">Added {timeLabel(entry)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground md:hidden">Weight</p>
                    <p className="text-lg font-black text-primary">{formatKg(entry.weight)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground md:hidden">Note</p>
                    <p className="text-sm text-muted-foreground">{entry.note || "—"}</p>
                  </div>
                  <div className="flex justify-start gap-2 md:justify-end">
                    <Button variant="outline" size="icon" onClick={() => onEdit(entry)} aria-label={`Edit ${dateLabel(entry.date)}`}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => onDelete(entry.id)} aria-label={`Delete ${dateLabel(entry.date)}`}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
