"use client";

import { useActionState, useState } from "react";
import { FormField, FormMessage, TextareaField } from "@/components/forms/form-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { CheckboxField, MultiPicker, SelectField } from "./admin-ui";
import { CatalogIcon, ICON_NAMES } from "@/components/catalog/catalog-icon";
import { saveTechnology } from "@/lib/actions/admin";

type Taxonomy = { departments: { id: number; name: string; subcategories: { id: number; name: string }[] }[] };
export type TechnologyDefaults = {
  id?: number;
  slug: string;
  name: string;
  short_description: string;
  description: string;
  department_id: number | null;
  official_url: string | null;
  topics: string[];
  icon: string;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  subcategory_ids: number[];
};

export function TechnologyForm({ defaults, taxonomy }: { defaults: TechnologyDefaults; taxonomy: Taxonomy }) {
  const [state, action] = useActionState(saveTechnology, null);
  const [icon, setIcon] = useState(defaults.icon);
  const e = state?.fieldErrors ?? {};
  const subOptions = taxonomy.departments.flatMap((d) => d.subcategories.map((s) => ({ id: s.id, label: s.name, hint: d.name })));

  return (
    <form action={action} className="space-y-8" noValidate>
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
      <FormMessage state={state} />
      <section className="surface grid grid-cols-1 gap-5 p-5 sm:p-6 md:grid-cols-2">
        <FormField label="Name" name="name" defaultValue={defaults.name} required errors={e.name} />
        <FormField label="Slug" name="slug" defaultValue={defaults.slug} required hint="/technologies/slug" errors={e.slug} />
        <FormField label="Short description" name="short_description" defaultValue={defaults.short_description} className="md:col-span-2" maxLength={200} errors={e.short_description} />
        <TextareaField label="Description" name="description" defaultValue={defaults.description} rows={4} className="md:col-span-2" errors={e.description} />
        <FormField label="Official URL" name="official_url" type="url" defaultValue={defaults.official_url ?? ""} placeholder="https://…" className="md:col-span-2" errors={e.official_url} />
        <TextareaField label="Curriculum topics" name="topics" defaultValue={defaults.topics.join("\n")} rows={8} className="md:col-span-2" hint="One topic per line, in learning order." errors={e.topics} />
      </section>
      <section className="surface grid grid-cols-1 gap-5 p-5 sm:p-6 md:grid-cols-2">
        <SelectField label="Home department" name="department_id" defaultValue={defaults.department_id ?? ""} includeEmpty="Choose a department" required options={taxonomy.departments.map((d) => ({ value: d.id, label: d.name }))} errors={e.department_id} />
        <div>
          <SelectField label="Icon" name="icon" defaultValue={icon} onChange={setIcon} options={ICON_NAMES.map((n) => ({ value: n, label: n }))} errors={e.icon} />
          <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">Preview <CatalogIcon name={icon} className="size-4 text-foreground" /></p>
        </div>
        <FormField label="Sort order" name="sort_order" type="number" min={0} defaultValue={defaults.sort_order} errors={e.sort_order} />
        <div className="grid gap-3">
          <CheckboxField label="Published" name="is_published" defaultChecked={defaults.is_published} />
          <CheckboxField label="Featured" name="is_featured" defaultChecked={defaults.is_featured} hint="Shown under Popular technologies." />
        </div>
        <div className="md:col-span-2">
          <MultiPicker name="subcategory_ids" label="Appears in subcategories" options={subOptions} defaultSelected={defaults.subcategory_ids} height="h-56" />
        </div>
      </section>
      <div className="sticky bottom-0 -mx-4 flex justify-end border-t bg-background/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:border">
        <SubmitButton size="lg" pendingLabel="Saving…">{defaults.id ? "Save changes" : "Create technology"}</SubmitButton>
      </div>
    </form>
  );
}
