import type { ResourceSeed } from "../types.ts";

export type ResourceInput = Omit<ResourceSeed, "department">;

/** Attach a department slug to a list of resources. */
export function inDepartment(department: string, items: ResourceInput[]): ResourceSeed[] {
  return items.map((item) => ({ ...item, department }));
}
