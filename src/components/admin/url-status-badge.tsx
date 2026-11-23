import { urlStatus } from "@/lib/catalog/labels";
import { cn } from "@/lib/utils";

export function UrlStatusBadge({ status, httpStatus, checkedAt }: { status: string; httpStatus?: number | null; checkedAt?: string | null }) {
  const s = urlStatus(status);
  const when = checkedAt ? new Date(checkedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : null;
  return (
    <span
      title={[httpStatus ? `HTTP ${httpStatus}` : null, when ? `checked ${when}` : null].filter(Boolean).join(" · ") || undefined}
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-[0.7rem] font-semibold",
        s.tone === "ok" && "bg-success/12 text-success",
        s.tone === "warn" && "bg-warning/15 text-foreground",
        s.tone === "bad" && "bg-destructive/12 text-destructive",
        s.tone === "idle" && "bg-muted text-muted-foreground",
      )}
    >
      <span className={cn("size-1.5 rounded-full", s.tone === "ok" ? "bg-success" : s.tone === "warn" ? "bg-warning" : s.tone === "bad" ? "bg-destructive" : "bg-muted-foreground")} aria-hidden="true" />
      {s.label}
    </span>
  );
}
