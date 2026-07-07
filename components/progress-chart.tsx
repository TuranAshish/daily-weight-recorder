"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { dateLabel, formatKg } from "@/lib/utils";
import type { WeightEntry } from "@/types/weight";

type ProgressChartProps = {
  entries: WeightEntry[];
};

function entryTime(entry: WeightEntry) {
  return new Date(entry.createdAt || entry.updatedAt || 0).getTime();
}

function createdTimeLabel(entry: WeightEntry) {
  const value = entry.createdAt || entry.updatedAt;
  if (!value) return "";
  return new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function ProgressChart({ entries }: ProgressChartProps) {
  const chartData = [...entries]
    .sort((a, b) => a.date.localeCompare(b.date) || entryTime(a) - entryTime(b))
    .map((entry, index) => ({
      xKey: `${entry.date}-${entry.id}-${index}`,
      date: entry.date,
      label: `${dateLabel(entry.date)}${createdTimeLabel(entry) ? ` • ${createdTimeLabel(entry)}` : ""}`,
      weight: entry.weight
    }));

  const minWeight = Math.min(...chartData.map((entry) => entry.weight), 0);
  const maxWeight = Math.max(...chartData.map((entry) => entry.weight), 0);
  const padding = chartData.length ? Math.max((maxWeight - minWeight) * 0.2, 2) : 2;

  return (
    <Card className="glass-card h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Weight progress</CardTitle>
            <CardDescription>Track every saved weight check, including multiple entries on the same date.</CardDescription>
          </div>
          <div className="rounded-2xl bg-accent p-3 text-accent-foreground">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length < 2 ? (
          <EmptyState />
        ) : (
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 12, right: 14, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="xKey"
                  tickFormatter={(_value, index) => {
                    const item = chartData[index];
                    return item ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(new Date(`${item.date}T00:00:00`)) : "";
                  }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                />
                <YAxis
                  domain={[Math.max(0, minWeight - padding), maxWeight + padding]}
                  tickFormatter={(value) => `${value}kg`}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                />
                <Tooltip
                  cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1 }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const item = payload[0].payload as { label: string; weight: number };
                    return (
                      <div className="rounded-2xl border bg-card p-4 shadow-soft">
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="mt-1 text-2xl font-black text-primary">{formatKg(item.weight)}</p>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  fill="url(#weightGradient)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: "hsl(var(--primary))" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
