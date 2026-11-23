"use client";

import { useActionState, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormField, FormMessage, TextareaField } from "@/components/forms/form-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { ActionButton, CheckboxField, SelectField } from "./admin-ui";
import { CatalogIcon, ICON_NAMES } from "@/components/catalog/catalog-icon";
import { deleteDepartment, deleteSubcategory, saveDepartment, saveSubcategory } from "@/lib/actions/admin";
import { accent, ACCENT_NAMES } from "@/lib/catalog/labels";
import type { FormState } from "@/lib/validation/schemas";
import { cn } from "@/lib/utils";

type Department = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  accent: string;
  sort_order: number;
  is_published: boolean;
  subcategories: { id: number; slug: string; name: string; description: string; sort_order: number }[];
};

/** Dialog that closes itself and refreshes data after a successful save. */
function FormDialog({
  trigger,
  title,
  description,
  action,
  children,
}: {
  trigger: ReactNode;
  title: string;
  description?: string;
  action: (state: FormState, form: FormData) => Promise<FormState>;
  children: (state: FormState) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [state, formAction] = useActionState(async (prev: FormState, form: FormData) => {
    const result = await action(prev, form);
    if (result?.ok) {
      toast.success(result.message ?? "Saved");
      setOpen(false);
      router.refresh();
    }
    return result;
  }, null);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form action={formAction} className="space-y-4" noValidate>
          {state && !state.ok && <FormMessage state={state} />}
          {children(state)}
          <div className="flex justify-end pt-2"><SubmitButton pendingLabel="Saving…">Save</SubmitButton></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DepartmentFields({ d, state }: { d?: Department; state: FormState }) {
  const e = state?.fieldErrors ?? {};
  const [icon, setIcon] = useState(d?.icon ?? "book-open");
  return (
    <>
      {d && <input type="hidden" name="id" value={d.id} />}
      <FormField label="Name" name="name" defaultValue={d?.name} required errors={e.name} />
      <FormField label="Slug" name="slug" defaultValue={d?.slug} required hint="Changing it changes the page URL." errors={e.slug} />
      <FormField label="Tagline" name="tagline" defaultValue={d?.tagline} errors={e.tagline} />
      <TextareaField label="Description" name="description" defaultValue={d?.description} rows={4} errors={e.description} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <SelectField label="Icon" name="icon" defaultValue={icon} onChange={setIcon} options={ICON_NAMES.map((n) => ({ value: n, label: n }))} errors={e.icon} />
          <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">Preview <CatalogIcon name={icon} className="size-4 text-foreground" /></p>
        </div>
        <SelectField label="Accent" name="accent" defaultValue={d?.accent ?? "slate"} options={ACCENT_NAMES.map((n) => ({ value: n, label: n }))} errors={e.accent} />
      </div>
      <FormField label="Sort order" name="sort_order" type="number" min={0} defaultValue={d?.sort_order ?? 0} errors={e.sort_order} />
      <CheckboxField label="Published" name="is_published" defaultChecked={d?.is_published ?? true} hint="Unpublished departments are hidden from visitors." />
    </>
  );
}

function SubcategoryFields({ departmentId, s, state }: { departmentId: number; s?: Department["subcategories"][number]; state: FormState }) {
  const e = state?.fieldErrors ?? {};
  return (
    <>
      <input type="hidden" name="department_id" value={departmentId} />
      {s && <input type="hidden" name="id" value={s.id} />}
      <FormField label="Name" name="name" defaultValue={s?.name} required errors={e.name} />
      <FormField label="Slug" name="slug" defaultValue={s?.slug} required errors={e.slug} />
      <TextareaField label="Description" name="description" defaultValue={s?.description} rows={3} errors={e.description} />
      <FormField label="Sort order" name="sort_order" type="number" min={0} defaultValue={s?.sort_order ?? 0} errors={e.sort_order} />
    </>
  );
}

export function NewDepartmentButton() {
  return (
    <FormDialog trigger={<Button><PlusIcon /> New department</Button>} title="New department" action={saveDepartment}>
      {(state) => <DepartmentFields state={state} />}
    </FormDialog>
  );
}

export function DepartmentPanel({ department: d, isAdmin }: { department: Department; isAdmin: boolean }) {
  const a = accent(d.accent);
  return (
    <article className="surface p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", a.soft, a.text)}><CatalogIcon name={d.icon} className="size-5" /></span>
          <div>
            <h2 className="font-semibold">{d.name} {!d.is_published && <span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">Hidden</span>}</h2>
            <p className="text-sm text-muted-foreground">/{d.slug} · {d.tagline}</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <FormDialog trigger={<Button variant="outline" size="sm"><PencilIcon /> Edit</Button>} title={`Edit ${d.name}`} action={saveDepartment}>
            {(state) => <DepartmentFields d={d} state={state} />}
          </FormDialog>
          {isAdmin && (
            <ActionButton
              action={() => deleteDepartment(d.id)}
              variant="ghost"
              ariaLabel={`Delete ${d.name}`}
              className="text-destructive"
              confirm={{ title: `Delete ${d.name}?`, description: "Departments that still have technologies or resources cannot be deleted — move or delete those first." }}
            >
              <TrashIcon />
            </ActionButton>
          )}
        </div>
      </div>
      <div className="mt-5 border-t pt-4">
        <div className="flex items-center justify-between">
          <h3 className="eyebrow">Subcategories · {d.subcategories.length}</h3>
          <FormDialog trigger={<Button variant="ghost" size="sm"><PlusIcon /> Add</Button>} title={`New subcategory in ${d.name}`} action={saveSubcategory}>
            {(state) => <SubcategoryFields departmentId={d.id} state={state} />}
          </FormDialog>
        </div>
        <ul className="mt-2 divide-y">
          {d.subcategories.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{s.name}</p>
                <p className="truncate text-xs text-muted-foreground">{s.description}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <FormDialog trigger={<Button variant="ghost" size="icon-sm" aria-label={`Edit ${s.name}`}><PencilIcon /></Button>} title={`Edit ${s.name}`} action={saveSubcategory}>
                  {(state) => <SubcategoryFields departmentId={d.id} s={s} state={state} />}
                </FormDialog>
                <ActionButton
                  action={() => deleteSubcategory(s.id)}
                  variant="ghost"
                  size="icon-sm"
                  ariaLabel={`Delete ${s.name}`}
                  className="text-destructive"
                  confirm={{ title: `Delete ${s.name}?`, description: "Technologies placed here are kept; resources in this subcategory simply lose the subcategory." }}
                >
                  <TrashIcon />
                </ActionButton>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
