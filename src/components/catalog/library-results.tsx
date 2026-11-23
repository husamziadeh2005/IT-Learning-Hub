import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResourceGrid } from "./resource-card";
import { CatalogUnavailable, EmptyState } from "./states";
import { searchResources } from "@/lib/catalog/queries";
import { filtersToQuery } from "@/lib/catalog/filters";
import type { SearchFilters } from "@/lib/catalog/types";

export async function LibraryResults({ filters, basePath = "/library" }: { filters: SearchFilters; basePath?: string }) {
  const result = await searchResources(filters);
  if (result.unavailable) return <CatalogUnavailable />;
  if (!result.items.length) {
    return (
      <EmptyState
        title={filters.q ? `No resources match “${filters.q}”` : "No resources match these filters"}
        description="Try fewer filters, a broader term, or browse a department instead."
        action={<Button asChild variant="outline"><Link href={basePath}>Clear search</Link></Button>}
      />
    );
  }
  const from = (result.page - 1) * 24 + 1;
  const to = from + result.items.length - 1;

  return (
    <div>
      <h2 className="sr-only">Results</h2>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Showing <strong className="font-medium text-foreground">{from}–{to}</strong> of <strong className="font-medium text-foreground">{result.total}</strong> resources
      </p>
      <ResourceGrid resources={result.items} showDepartment className="mt-4 lg:grid-cols-2 xl:grid-cols-3" />
      {result.pageCount > 1 && (
        <nav aria-label="Pagination" className="mt-10 flex items-center justify-between gap-4">
          {result.page > 1 ? (
            <Button asChild variant="outline"><Link href={`${basePath}${filtersToQuery(filters, { page: result.page - 1 })}`} rel="prev"><ChevronLeftIcon /> Previous</Link></Button>
          ) : <span />}
          <p className="text-sm text-muted-foreground">Page {result.page} of {result.pageCount}</p>
          {result.page < result.pageCount ? (
            <Button asChild variant="outline"><Link href={`${basePath}${filtersToQuery(filters, { page: result.page + 1 })}`} rel="next">Next <ChevronRightIcon /></Link></Button>
          ) : <span />}
        </nav>
      )}
    </div>
  );
}
