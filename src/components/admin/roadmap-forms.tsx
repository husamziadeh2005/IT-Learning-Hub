"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownIcon, ArrowUpIcon, PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField, FormMessage, TextareaField } from "@/components/forms/form-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { ActionButton, CheckboxField, MultiPicker, SelectField } from "./admin-ui";
import { ICON_NAMES } from "@/components/catalog/catalog-icon";
import { deleteStage, moveStage, saveRoadmap, saveStage } from "@/lib/actions/admin";
import { CONTENT_STATUSES, LEVELS, statusLabel } from "@/lib/catalog/labels";

export type RoadmapDefaults = {
  id?: number;
  slug: string;
  title: string;
  summary: string;
  description: string;
  department_id: number | null;
  level: string;
  estimated_duration: string | null;
  prerequisites: string[];
  outcomes: string[];
  certifications: { name: string; provider: string; url: string }[];
  icon: string;
  is_featured: boolean;
  status: string;
  sort_order: number;
};

export function RoadmapForm({ defaults, departments }: { defaults: RoadmapDefaults; departments: { id: number; name: string }[] }) {
  const [state, action] = useActionState(saveRoadmap, null);
  const e = state?.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-6" noValidate>
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
      <FormMessage state={state} />
      <section className="surface grid grid-cols-1 gap-5 p-5 sm:p-6 md:grid-cols-2">
        <FormField label="Title" name="title" defaultValue={defaults.title} required errors={e.title} />
        <FormField label="Slug" name="slug" defaultValue={defaults.slug} required hint="/roadmaps/slug" errors={e.slug} />
        <FormField label="Summary" name="summary" defaultValue={defaults.summary} className="md:col-span-2" maxLength={300} errors={e.summary} />
        <TextareaField label="Description" name="description" defaultValue={defaults.description} rows={4} className="md:col-span-2" errors={e.description} />
        <TextareaField label="Prerequisites" name="prerequisites" defaultValue={defaults.prerequisites.join("\n")} rows={3} hint="One per line." errors={e.prerequisites} />
        <TextareaField label="Outcomes" name="outcomes" defaultValue={defaults.outcomes.join("\n")} rows={3} hint="One per line." errors={e.outcomes} />
        <TextareaField
          label="Optional certifications"
          name="certifications"
          defaultValue={defaults.certifications.map((c) => `${c.name} | ${c.provider} | ${c.url}`).join("\n")}
          rows={4}
          className="md:col-span-2"
          hint="One per line: Name | Provider | https://official-url"
          errors={e.certifications}
        />
      </section>
      <section className="surface grid grid-cols-1 gap-5 p-5 sm:p-6 md:grid-cols-3">
        <SelectField label="Department" name="department_id" defaultValue={defaults.department_id ?? ""} includeEmpty="None (cross-department)" options={departments.map((d) => ({ value: d.id, label: d.name }))} errors={e.department_id} />
        <SelectField label="Entry level" name="level" defaultValue={defaults.level} options={LEVELS.map((l) => ({ value: l.value, label: l.label }))} errors={e.level} />
        <FormField label="Estimated duration" name="estimated_duration" defaultValue={defaults.estimated_duration ?? ""} placeholder="e.g. 6–9 months" errors={e.estimated_duration} />
        <SelectField label="Icon" name="icon" defaultValue={defaults.icon} options={ICON_NAMES.map((n) => ({ value: n, label: n }))} errors={e.icon} />
        <SelectField label="Status" name="status" defaultValue={defaults.status} options={CONTENT_STATUSES.map((s) => ({ value: s.value, label: s.label }))} errors={e.status} />
        <FormField label="Sort order" name="sort_order" type="number" min={0} defaultValue={defaults.sort_order} errors={e.sort_order} />
        <CheckboxField label="Featured" name="is_featured" defaultChecked={defaults.is_featured} hint="Shown on the home page." />
      </section>
      <div className="flex justify-end"><SubmitButton size="lg" pendingLabel="Saving…">{defaults.id ? "Save roadmap" : "Create roadmap"}</SubmitButton></div>
    </form>
  );
}

type Stage = {
  id: number;
  position: number;
  title: string;
  summary: string;
  skills: string[];
  projects: { title: string; description: string }[];
  estimated_duration: string | null;
  technology_ids: number[];
  resources: { resource_id: number; position: number; is_optional: boolean }[];
};
type Options = {
  technologies: { id: number; name: string }[];
  resources: { id: number; title: string; publisher: string; status: string }[];
};

function StageDialog({ roadmapId, stage, options, open, onOpenChange }: { roadmapId: number; stage?: Stage; options: Options; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [state, action] = useActionState(saveStage, null);
  const router = useRouter();
  const ordered = [...(stage?.resources ?? [])].sort((a, b) => a.position - b.position);
  const [optional, setOptional] = useState<Set<number>>(new Set(ordered.filter((r) => r.is_optional).map((r) => r.resource_id)));
  useEffect(() => {
    if (state?.ok) {
      toast.success(state.message ?? "Saved");
      onOpenChange(false);
      router.refresh();
    }
  }, [state, router, onOpenChange]);
  const e = state?.fieldErrors ?? {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{stage ? `Edit stage ${stage.position}` : "New stage"}</DialogTitle>
          <DialogDescription>Resources are shown in the order you select them.</DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-4" noValidate>
          <input type="hidden" name="roadmap_id" value={roadmapId} />
          {stage && <input type="hidden" name="id" value={stage.id} />}
          {[...optional].map((id) => <input key={id} type="hidden" name="optional_resource_ids" value={id} />)}
          {state && !state.ok && <FormMessage state={state} />}
          <FormField label="Title" name="title" defaultValue={stage?.title} required errors={e.title} />
          <TextareaField label="Summary" name="summary" defaultValue={stage?.summary} rows={2} errors={e.summary} />
          <FormField label="Duration" name="estimated_duration" defaultValue={stage?.estimated_duration ?? ""} placeholder="e.g. 3–4 weeks" />
          <TextareaField label="Skills" name="skills" defaultValue={stage?.skills.join("\n")} rows={4} hint="One per line." />
          <TextareaField label="Practical projects" name="projects" defaultValue={stage?.projects.map((p) => `${p.title} | ${p.description}`).join("\n")} rows={3} hint="One per line: Project title | What to build" />
          <MultiPicker name="technology_ids" label="Technologies" options={options.technologies.map((t) => ({ id: t.id, label: t.name }))} defaultSelected={stage?.technology_ids ?? []} height="h-44" />
          <MultiPicker
            name="resource_ids"
            label="Resources"
            options={options.resources.map((r) => ({ id: r.id, label: r.title, hint: r.status === "published" ? r.publisher : `${statusLabel(r.status)} · ${r.publisher}` }))}
            defaultSelected={ordered.map((r) => r.resource_id)}
            height="h-64"
            extra={(id, selected) =>
              selected ? (
                <label className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={optional.has(id)}
                    onChange={() => setOptional((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; })}
                    className="size-3.5 accent-[var(--primary)]"
                  />
                  optional
                </label>
              ) : null
            }
          />
          <div className="flex justify-end"><SubmitButton pendingLabel="Saving…">Save stage</SubmitButton></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function StagesManager({ roadmapId, stages, options }: { roadmapId: number; stages: Stage[]; options: Options }) {
  const [editing, setEditing] = useState<Stage | "new" | null>(null);
  const title = new Map(options.resources.map((r) => [r.id, r.title]));
  return (
    <section className="space-y-4" aria-labelledby="stages-heading">
      <div className="flex items-center justify-between">
        <h2 id="stages-heading" className="text-lg font-semibold tracking-tight">Stages · {stages.length}</h2>
        <Button onClick={() => setEditing("new")}><PlusIcon /> Add stage</Button>
      </div>
      <ol className="space-y-3">
        {stages.map((s, i) => (
          <li key={s.id} className="surface p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <span className="grid size-8 shrink-0 place-items-center rounded-full border font-mono text-sm">{s.position}</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{s.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{s.summary}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {s.technology_ids.length} technologies · {s.resources.length} resources · {s.projects.length} project{s.projects.length === 1 ? "" : "s"}
                </p>
                {s.resources.length > 0 && (
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{[...s.resources].sort((a, b) => a.position - b.position).map((r) => title.get(r.resource_id)).join(" · ")}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                {i > 0 && <ActionButton action={() => moveStage(s.id, "up")} variant="ghost" size="icon-sm" ariaLabel={`Move ${s.title} up`}><ArrowUpIcon /></ActionButton>}
                {i < stages.length - 1 && <ActionButton action={() => moveStage(s.id, "down")} variant="ghost" size="icon-sm" ariaLabel={`Move ${s.title} down`}><ArrowDownIcon /></ActionButton>}
                <Button variant="ghost" size="icon-sm" aria-label={`Edit ${s.title}`} onClick={() => setEditing(s)}><PencilIcon /></Button>
                <ActionButton action={() => deleteStage(s.id, roadmapId)} variant="ghost" size="icon-sm" className="text-destructive" ariaLabel={`Delete ${s.title}`} confirm={{ title: `Delete stage “${s.title}”?`, description: "Learners who completed this stage will lose that milestone." }}>
                  <TrashIcon />
                </ActionButton>
              </div>
            </div>
          </li>
        ))}
      </ol>
      {editing && (
        <StageDialog
          key={editing === "new" ? "new" : editing.id}
          roadmapId={roadmapId}
          stage={editing === "new" ? undefined : editing}
          options={options}
          open
          onOpenChange={(o) => !o && setEditing(null)}
        />
      )}
    </section>
  );
}
