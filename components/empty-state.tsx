import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState() {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed bg-muted/30 p-8 text-center">
      <div className="rounded-3xl bg-accent p-4 text-accent-foreground">
        <Scale className="h-8 w-8" />
      </div>
      <h3 className="mt-5 text-xl font-bold">Start your first record</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Add today’s weight in kilograms and your dashboard will instantly show trends, history, and progress.
      </p>
      <Button asChild className="mt-5">
        <a href="#add-weight">Add today’s weight</a>
      </Button>
    </div>
  );
}
