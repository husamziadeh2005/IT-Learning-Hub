"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, SearchIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { AdminResult } from "@/lib/actions/admin";
import { cn } from "@/lib/utils";

/** Runs an admin Server Action, reports the real outcome, and refreshes the page data. */
export function ActionButton({
  action,
  children,
  confirm,
  variant = "outline",
  size = "sm",
  className,
  ariaLabel,
  redirectTo,
}: {
  action: () => Promise<AdminResult>;
  children: ReactNode;
  confirm?: { title: string; description: string; confirmLabel?: string };
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
  ariaLabel?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const run = () =>
    start(async () => {
      const result = await action();
      if (result.ok) {
        if (result.message) toast.success(result.message);
        if (redirectTo) router.push(redirectTo);
        else router.refresh();
      } else {
        toast.error(result.error);
      }
    });

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={pending}
        aria-label={ariaLabel}
        className={className}
        onClick={() => (confirm ? setOpen(true) : run())}
      >
        {pending && <Loader2Icon className="animate-spin" />}
        {children}
      </Button>
      {confirm && (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{confirm.title}</AlertDialogTitle>
              <AlertDialogDescription>{confirm.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={run}>{confirm.confirmLabel ?? "Delete"}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}

/** Searchable checkbox list that submits selected ids under `name`. */
export function MultiPicker({
  name,
  label,
  options,
  defaultSelected = [],
  height = "h-64",
  extra,
}: {
  name: string;
  label: string;
  options: { id: number; label: string; hint?: string }[];
  defaultSelected?: number[];
  height?: string;
  extra?: (id: number, selected: boolean) => ReactNode;
}) {
  const [selected, setSelected] = useState<number[]>(defaultSelected);
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? options.filter((o) => o.label.toLowerCase().includes(q) || o.hint?.toLowerCase().includes(q)) : options;
    // Selected items first, in selection order.
    return [...list].sort((a, b) => {
      const ia = selected.indexOf(a.id);
      const ib = selected.indexOf(b.id);
      if (ia !== -1 || ib !== -1) return (ia === -1 ? 1e9 : ia) - (ib === -1 ? 1e9 : ib);
      return 0;
    });
  }, [options, query, selected]);
  const toggle = (id: number) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <fieldset className="min-w-0 space-y-2">
      <legend className="text-sm font-medium">{label} <span className="font-normal text-muted-foreground">· {selected.length} selected</span></legend>
      {selected.map((id) => <input key={id} type="hidden" name={name} value={id} />)}
      <div className="rounded-lg border">
        <div className="relative border-b">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Filter ${label.toLowerCase()}…`}
            aria-label={`Filter ${label.toLowerCase()}`}
            className="h-10 w-full rounded-t-lg bg-transparent pl-9 pr-3 text-sm outline-none"
          />
        </div>
        <ul className={cn("overflow-y-auto p-1", height)}>
          {visible.map((o) => {
            const isOn = selected.includes(o.id);
            return (
              <li key={o.id} className={cn("flex items-center gap-2 rounded-md px-2", isOn && "bg-muted")}>
                <label className="flex min-h-9 flex-1 cursor-pointer items-center gap-2.5 text-sm">
                  <input type="checkbox" checked={isOn} onChange={() => toggle(o.id)} className="size-4 accent-[var(--primary)]" />
                  <span className="min-w-0 flex-1 truncate">{o.label}</span>
                  {o.hint && <span className="shrink-0 truncate text-xs text-muted-foreground">{o.hint}</span>}
                </label>
                {extra?.(o.id, isOn)}
              </li>
            );
          })}
          {visible.length === 0 && <li className="px-2 py-6 text-center text-sm text-muted-foreground">No matches</li>}
        </ul>
      </div>
    </fieldset>
  );
}

export function SelectField({
  label,
  name,
  options,
  defaultValue,
  errors,
  required,
  includeEmpty,
  onChange,
}: {
  label: string;
  name: string;
  options: { value: string | number; label: string }[];
  defaultValue?: string | number | null;
  errors?: string[];
  required?: boolean;
  includeEmpty?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={`f-${name}`}>{label}</Label>
      <select
        id={`f-${name}`}
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        onChange={(e) => onChange?.(e.target.value)}
        aria-invalid={errors?.length ? true : undefined}
        className="h-11 w-full min-w-0 max-w-full rounded-lg border border-input bg-card px-3 text-sm aria-invalid:border-destructive"
      >
        {includeEmpty !== undefined && <option value="">{includeEmpty}</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {errors?.length ? <p className="text-xs font-medium text-destructive">{errors[0]}</p> : null}
    </div>
  );
}

export function CheckboxField({ label, name, defaultChecked, hint }: { label: string; name: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex items-start gap-3 rounded-lg border p-3 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 size-4 accent-[var(--primary)]" />
      <span>
        <span className="font-medium">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>}
      </span>
    </label>
  );
}
