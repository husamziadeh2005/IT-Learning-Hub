"use client";

import { useActionState, useState } from "react";
import { FormField, FormMessage, TextareaField } from "@/components/forms/form-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { CheckboxField, MultiPicker, SelectField } from "./admin-ui";
import { saveResource } from "@/lib/actions/admin";
import { CONTENT_STATUSES, LEVELS, PRICING, RESOURCE_TYPES, SOURCE_KINDS } from "@/lib/catalog/labels";

type Taxonomy = {
  departments: { id: number; name: string; subcategories: { id: number; name: string }[] }[];
  technologies: { id: number; name: string; department_id: number }[];
};

export type ResourceDefaults = {
  id?: number;
  slug: string;
  title: string;
  description: string;
  url: string | null;
  department_id: number | null;
  subcategory_id: number | null;
  level: string;
  type: string;
  publisher: string;
  pricing: string;
  source_kind: string;
  language: string;
  duration_label: string | null;
  status: string;
  is_featured: boolean;
  curator_note: string | null;
  technology_ids: number[];
};

const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 96);

export function ResourceForm({ defaults, taxonomy }: { defaults: ResourceDefaults; taxonomy: Taxonomy }) {
  const [state, action] = useActionState(saveResource, null);
  const [departmentId, setDepartmentId] = useState(String(defaults.department_id ?? ""));
  const [slug, setSlug] = useState(defaults.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(defaults.id));
  const department = taxonomy.departments.find((d) => String(d.id) === departmentId);
  const e = state?.fieldErrors ?? {};
  const deptName = new Map(taxonomy.departments.map((d) => [d.id, d.name]));

  return (
    <form action={action} className="space-y-8" noValidate>
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
      <FormMessage state={state} />

      <section className="surface grid grid-cols-1 gap-5 p-5 sm:p-6 md:grid-cols-2">
        <h2 className="font-semibold md:col-span-2">Content</h2>
        <FormField
          label="Title"
          name="title"
          defaultValue={defaults.title}
          required
          className="md:col-span-2"
          errors={e.title}
          onChange={(ev) => !slugTouched && setSlug(slugify(ev.target.value))}
        />
        <FormField label="Slug" name="slug" value={slug} onChange={(ev) => { setSlugTouched(true); setSlug(ev.target.value); }} required hint="Used in the URL: /resources/slug" errors={e.slug} />
        <FormField label="Publisher or creator" name="publisher" defaultValue={defaults.publisher} required errors={e.publisher} />
        <FormField label="URL" name="url" type="url" defaultValue={defaults.url ?? ""} className="md:col-span-2" placeholder="https://…" hint="Required to publish. Leave empty and save as Pending while waiting for a link. Links are checked automatically on save." errors={e.url} />
        <TextareaField label="Description" name="description" defaultValue={defaults.description} rows={4} className="md:col-span-2" hint="What it covers and who it is for — write it yourself; don't copy the publisher's text." errors={e.description} />
      </section>

      <section className="surface grid grid-cols-1 gap-5 p-5 sm:p-6 md:grid-cols-2">
        <h2 className="font-semibold md:col-span-2">Classification</h2>
        <SelectField label="Department" name="department_id" defaultValue={departmentId} onChange={setDepartmentId} required includeEmpty="Choose a department" options={taxonomy.departments.map((d) => ({ value: d.id, label: d.name }))} errors={e.department_id} />
        <SelectField
          key={departmentId}
          label="Subcategory"
          name="subcategory_id"
          defaultValue={department?.subcategories.some((s) => s.id === defaults.subcategory_id) ? defaults.subcategory_id : ""}
          includeEmpty="None"
          options={(department?.subcategories ?? []).map((s) => ({ value: s.id, label: s.name }))}
          errors={e.subcategory_id}
        />
        <SelectField label="Difficulty" name="level" defaultValue={defaults.level} options={LEVELS.map((l) => ({ value: l.value, label: l.label }))} errors={e.level} />
        <SelectField label="Type" name="type" defaultValue={defaults.type} options={RESOURCE_TYPES.map((t) => ({ value: t.value, label: t.label }))} errors={e.type} />
        <SelectField label="Price" name="pricing" defaultValue={defaults.pricing} options={PRICING.map((p) => ({ value: p.value, label: p.label }))} errors={e.pricing} />
        <SelectField label="Source" name="source_kind" defaultValue={defaults.source_kind} options={SOURCE_KINDS.map((s) => ({ value: s.value, label: s.value === "official" ? "Official (maintainers / vendor)" : "Community / independent" }))} errors={e.source_kind} />
        <FormField label="Language" name="language" defaultValue={defaults.language} errors={e.language} />
        <FormField label="Duration (optional)" name="duration_label" defaultValue={defaults.duration_label ?? ""} placeholder="e.g. ≈ 4 hours, 12 weeks" errors={e.duration_label} />
        <div className="md:col-span-2">
          <MultiPicker
            name="technology_ids"
            label="Technologies"
            defaultSelected={defaults.technology_ids}
            options={taxonomy.technologies.map((t) => ({ id: t.id, label: t.name, hint: deptName.get(t.department_id) }))}
          />
        </div>
      </section>

      <section className="surface grid grid-cols-1 gap-5 p-5 sm:p-6 md:grid-cols-2">
        <h2 className="font-semibold md:col-span-2">Publishing</h2>
        <SelectField label="Status" name="status" defaultValue={defaults.status} options={CONTENT_STATUSES.map((s) => ({ value: s.value, label: s.label }))} errors={e.status} />
        <CheckboxField label="Featured" name="is_featured" defaultChecked={defaults.is_featured} hint="Shown in Editor's picks and first in lists." />
        <TextareaField label="Curator note (internal)" name="curator_note" defaultValue={defaults.curator_note ?? ""} rows={3} className="md:col-span-2" hint="Only visible to staff — e.g. what is needed before publishing." errors={e.curator_note} />
      </section>

      <div className="sticky bottom-0 -mx-4 flex justify-end gap-3 border-t bg-background/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:border">
        <SubmitButton size="lg" pendingLabel="Saving and checking link…">{defaults.id ? "Save changes" : "Create resource"}</SubmitButton>
      </div>
    </form>
  );
}
