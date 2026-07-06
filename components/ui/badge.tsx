import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-transparent bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground",
        className
      )}
      {...props}
    />
  );
}
