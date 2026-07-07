"use client";

import { FormEvent, useEffect, useState } from "react";
import { CalendarDays, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WeightEntry } from "@/types/weight";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

type AddWeightFormProps = {
  editingEntry: WeightEntry | null;
  onSave: (entry: Omit<WeightEntry, "createdAt"> & { createdAt?: string }) => void;
  onCancelEdit: () => void;
};

export function AddWeightForm({ editingEntry, onSave, onCancelEdit }: AddWeightFormProps) {
  const [date, setDate] = useState(todayISO());
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingEntry) {
      setDate(editingEntry.date);
      setWeight(String(editingEntry.weight));
      setNote(editingEntry.note ?? "");
      setError("");
    }
  }, [editingEntry]);


  function resetForm() {
    setDate(todayISO());
    setWeight("");
    setNote("");
    setError("");
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedWeight = Number(weight);

    if (!date) {
      setError("Please choose a date.");
      return;
    }

    if (!weight || Number.isNaN(parsedWeight) || parsedWeight < 1 || parsedWeight > 1000) {
      setError("Enter a valid weight between 1 kg and 1000 kg.");
      return;
    }


    onSave({
      id: editingEntry?.id ?? crypto.randomUUID(),
      date,
      weight: Number(parsedWeight.toFixed(1)),
      note: note.trim(),
      createdAt: editingEntry?.createdAt ?? new Date().toISOString()
    });

    resetForm();
    onCancelEdit();
  }

  return (
    <Card id="add-weight" className="glass-card scroll-mt-24">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{editingEntry ? "Edit weight record" : "Add daily weight"}</CardTitle>
            <CardDescription>Record one or many weight checks for the same date in kilograms.</CardDescription>
          </div>
          <div className="rounded-2xl bg-accent p-3 text-accent-foreground">
            <CalendarDays className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={submitForm} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight in kg</Label>
              <Input
                id="weight"
                inputMode="decimal"
                type="number"
                step="0.1"
                min="1"
                max="1000"
                placeholder="Example: 83.5"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Note optional</Label>
            <Input
              id="note"
              placeholder="Example: morning, evening, after walk"
              value={note}
              maxLength={80}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
          {error ? <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{error}</p> : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" className="sm:flex-1">
              <Save className="h-4 w-4" />
              {editingEntry ? "Save changes" : "Save weight"}
            </Button>
            {editingEntry ? (
              <Button type="button" variant="outline" onClick={() => { resetForm(); onCancelEdit(); }}>
                <X className="h-4 w-4" />
                Cancel edit
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
