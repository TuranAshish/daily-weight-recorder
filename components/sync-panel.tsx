"use client";

import { FormEvent, useState } from "react";
import { Cloud, CloudOff, LogIn, LogOut, RefreshCcw, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type SyncPanelProps = {
  configured: boolean;
  userEmail: string | null;
  status: string;
  syncing: boolean;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
  onSignOut: () => Promise<void>;
  onSyncNow: () => Promise<void>;
};

export function SyncPanel({ configured, userEmail, status, syncing, onSignIn, onSignUp, onSignOut, onSyncNow }: SyncPanelProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "signin") {
      await onSignIn(email, password);
    } else {
      await onSignUp(email, password);
    }
  }

  if (!configured) {
    return (
      <Card className="glass-card border-amber-500/30 bg-amber-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudOff className="h-5 w-5" /> Local-only mode
          </CardTitle>
          <CardDescription>
            Supabase is not configured yet. Your data is saved only in this browser, so it will not appear on other devices.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (userEmail) {
    return (
      <Card className="glass-card border-primary/25 bg-primary/5">
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-primary" /> Cloud sync enabled
              </CardTitle>
              <CardDescription>
                Signed in as <span className="font-semibold text-foreground">{userEmail}</span>. Use the same login on every device to sync records.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onSyncNow} disabled={syncing}>
                <RefreshCcw className={syncing ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Sync now
              </Button>
              <Button type="button" variant="outline" onClick={onSignOut}>
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="rounded-2xl bg-background/70 px-4 py-3 text-sm font-medium text-muted-foreground">{status}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-primary" /> Sign in to sync across devices
        </CardTitle>
        <CardDescription>
          Create an account or sign in. Your existing local records will be uploaded and synced with your other devices.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <div className="space-y-2">
            <Label htmlFor="sync-email">Email</Label>
            <Input
              id="sync-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sync-password">Password</Label>
            <Input
              id="sync-password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              placeholder="Minimum 6 characters"
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
            <Button type="submit" disabled={syncing}>
              {mode === "signin" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
              {mode === "signin" ? "Need account?" : "Have account?"}
            </Button>
          </div>
        </form>
        <p className="mt-4 rounded-2xl bg-muted/40 px-4 py-3 text-sm text-muted-foreground">{status}</p>
      </CardContent>
    </Card>
  );
}
