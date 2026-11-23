import Form from "next/form";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Progressive-enhancement search: a plain GET form that works without JavaScript. */
export function HeroSearch({ className, defaultValue, size = "lg" }: { className?: string; defaultValue?: string; size?: "lg" | "md" }) {
  return (
    <Form action="/search" role="search" className={cn("relative flex w-full items-center", className)}>
      <label htmlFor={`hero-search-${size}`} className="sr-only">Search the learning library</label>
      <SearchIcon className="pointer-events-none absolute left-4 size-5 text-muted-foreground" aria-hidden="true" />
      <input
        id={`hero-search-${size}`}
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="Try “Kubernetes”, “SwiftUI” or “RAG”"
        enterKeyHint="search"
        autoComplete="off"
        className={cn(
          "w-full rounded-xl border bg-card pl-12 pr-28 shadow-[var(--shadow-card)] outline-none transition-shadow placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15",
          size === "lg" ? "h-14 text-base" : "h-12 text-[0.95rem]",
        )}
      />
      <Button type="submit" className={cn("absolute right-2", size === "lg" ? "h-10" : "h-9")}>Search</Button>
    </Form>
  );
}
