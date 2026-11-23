"use client";

import Link from "next/link";
import { EyeIcon, EyeOffIcon, PencilIcon, RefreshCwIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionButton } from "./admin-ui";
import { deleteResource, setResourceStatus, verifyResourceUrl } from "@/lib/actions/admin";

export function ResourceRowActions({ id, title, status, hasUrl, canDelete }: { id: number; title: string; status: string; hasUrl: boolean; canDelete: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      {hasUrl && (
        <ActionButton action={() => verifyResourceUrl(id)} variant="ghost" size="icon-sm" ariaLabel={`Re-check link for ${title}`}>
          <RefreshCwIcon />
        </ActionButton>
      )}
      {status === "published" ? (
        <ActionButton action={() => setResourceStatus(id, "draft")} variant="ghost" size="icon-sm" ariaLabel={`Unpublish ${title}`}>
          <EyeOffIcon />
        </ActionButton>
      ) : (
        <ActionButton action={() => setResourceStatus(id, "published")} variant="ghost" size="icon-sm" ariaLabel={`Publish ${title}`}>
          <EyeIcon />
        </ActionButton>
      )}
      <Button asChild variant="ghost" size="icon-sm" aria-label={`Edit ${title}`}>
        <Link href={`/admin/resources/${id}`}><PencilIcon /></Link>
      </Button>
      {canDelete && (
        <ActionButton
          action={() => deleteResource(id)}
          variant="ghost"
          size="icon-sm"
          ariaLabel={`Delete ${title}`}
          className="text-destructive"
          confirm={{ title: `Delete “${title}”?`, description: "This permanently removes the resource, its roadmap placements and every learner's bookmarks and progress for it. Consider unpublishing instead." }}
        >
          <TrashIcon />
        </ActionButton>
      )}
    </div>
  );
}
