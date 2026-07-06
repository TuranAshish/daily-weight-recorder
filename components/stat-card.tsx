import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  trend?: "good" | "neutral" | "warning";
};

export function StatCard({ title, value, helper, icon: Icon, trend = "neutral" }: StatCardProps) {
  return (
    <Card className="glass-card overflow-hidden transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-3 text-3xl font-black tracking-tight">{value}</p>
          </div>
          <div
            className={cn(
              "rounded-2xl p-3",
              trend === "good" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
              trend === "warning" && "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
              trend === "neutral" && "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
