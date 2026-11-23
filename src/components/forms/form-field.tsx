"use client";

import { useId, useState, type ComponentProps, type ReactNode } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type FieldProps = {
  label: string;
  name: string;
  errors?: string[];
  hint?: ReactNode;
  className?: string;
  labelAction?: ReactNode;
};

export function FormField({ label, name, errors, hint, className, labelAction, ...input }: FieldProps & Omit<ComponentProps<"input">, "name">) {
  const id = useId();
  const describedBy = [hint ? `${id}-hint` : null, errors?.length ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {labelAction}
      </div>
      <Input id={id} name={name} aria-invalid={errors?.length ? true : undefined} aria-describedby={describedBy} className="h-11" {...input} />
      {hint && !errors?.length && <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p>}
      {errors?.length ? <p id={`${id}-error`} className="text-xs font-medium text-destructive">{errors[0]}</p> : null}
    </div>
  );
}

export function PasswordField(props: FieldProps & Omit<ComponentProps<"input">, "name" | "type">) {
  const [visible, setVisible] = useState(false);
  const id = useId();
  const { label, name, errors, hint, className, labelAction, ...input } = props;
  const describedBy = [hint ? `${id}-hint` : null, errors?.length ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {labelAction}
      </div>
      <div className="relative">
        <Input id={id} name={name} type={visible ? "text" : "password"} aria-invalid={errors?.length ? true : undefined} aria-describedby={describedBy} className="h-11 pr-11" {...input} />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
        </button>
      </div>
      {hint && !errors?.length && <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p>}
      {errors?.length ? <p id={`${id}-error`} className="text-xs font-medium text-destructive">{errors[0]}</p> : null}
    </div>
  );
}

export function TextareaField({ label, name, errors, hint, className, ...input }: FieldProps & Omit<ComponentProps<"textarea">, "name">) {
  const id = useId();
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Textarea id={id} name={name} aria-invalid={errors?.length ? true : undefined} aria-describedby={errors?.length ? `${id}-error` : hint ? `${id}-hint` : undefined} {...input} />
      {hint && !errors?.length && <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p>}
      {errors?.length ? <p id={`${id}-error`} className="text-xs font-medium text-destructive">{errors[0]}</p> : null}
    </div>
  );
}

export function FormMessage({ state }: { state: { ok: boolean; message?: string } | null }) {
  if (!state?.message) return null;
  return (
    <div
      role={state.ok ? "status" : "alert"}
      className={cn(
        "rounded-lg border px-4 py-3 text-sm leading-6",
        state.ok ? "border-success/30 bg-success/8 text-foreground" : "border-destructive/30 bg-destructive/8 text-destructive",
      )}
    >
      {state.message}
    </div>
  );
}
