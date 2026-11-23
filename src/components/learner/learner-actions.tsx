"use client";

import { useState } from "react";
import { BookmarkCheckIcon, BookmarkIcon, CheckCircle2Icon, CircleDashedIcon, CircleIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useLearner } from "./learner-provider";
import { cn } from "@/lib/utils";

export function BookmarkButton({ resourceId, title, variant = "icon" }: { resourceId: number; title: string; variant?: "icon" | "full" }) {
  const { bookmarks, toggleBookmark, status } = useLearner();
  const [busy, setBusy] = useState(false);
  const saved = bookmarks.has(resourceId);
  const Icon = busy ? Loader2Icon : saved ? BookmarkCheckIcon : BookmarkIcon;
  const label = saved ? `Remove “${title}” from saved` : `Save “${title}”`;
  const onClick = async () => {
    setBusy(true);
    await toggleBookmark(resourceId);
    setBusy(false);
  };

  if (variant === "full") {
    return (
      <Button variant={saved ? "secondary" : "outline"} onClick={onClick} disabled={busy || status === "loading"} aria-pressed={saved} aria-label={label}>
        <Icon className={cn(busy && "animate-spin", saved && "text-signal-strong")} />
        {saved ? "Saved" : "Save"}
      </Button>
    );
  }
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      disabled={busy || status === "loading"}
      aria-pressed={saved}
      aria-label={label}
      title={saved ? "Saved" : "Save for later"}
      className="relative z-10 -mr-1.5 -mt-1.5 shrink-0"
    >
      <Icon className={cn("size-[1.1rem]", busy && "animate-spin", saved && "fill-signal/20 text-signal-strong")} />
    </Button>
  );
}

const OPTIONS = [
  { value: "none", label: "Not started", Icon: CircleIcon },
  { value: "in_progress", label: "In progress", Icon: CircleDashedIcon },
  { value: "completed", label: "Completed", Icon: CheckCircle2Icon },
] as const;

export function ProgressControl({ resourceId, compact = false }: { resourceId: number; compact?: boolean }) {
  const { progress, updateProgress, status } = useLearner();
  const [busy, setBusy] = useState(false);
  const current = progress.get(resourceId) ?? "none";
  const option = OPTIONS.find((o) => o.value === current) ?? OPTIONS[0];
  const Icon = busy ? Loader2Icon : option.Icon;

  const set = async (value: string) => {
    if (value === current) return;
    setBusy(true);
    await updateProgress(resourceId, value === "none" ? null : (value as "in_progress" | "completed"));
    setBusy(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={current === "completed" ? "secondary" : "outline"}
          size={compact ? "sm" : "default"}
          disabled={busy || status === "loading"}
          aria-label={`Progress: ${option.label}. Change progress`}
          className={cn("relative z-10", current === "completed" && "text-success")}
        >
          <Icon className={cn(busy && "animate-spin")} />
          {option.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuRadioGroup value={current} onValueChange={set}>
          {OPTIONS.map((o) => (
            <DropdownMenuRadioItem key={o.value} value={o.value}>
              <o.Icon /> {o.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Small read-only marker shown on cards once a learner has started a resource. */
export function ProgressMarker({ resourceId }: { resourceId: number }) {
  const { progress } = useLearner();
  const value = progress.get(resourceId);
  if (!value) return null;
  return value === "completed" ? (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-success"><CheckCircle2Icon className="size-3.5" aria-hidden="true" />Completed</span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-signal-strong"><CircleDashedIcon className="size-3.5" aria-hidden="true" />In progress</span>
  );
}
