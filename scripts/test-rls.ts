/**
 * Row Level Security test suite — runs against the LOCAL Supabase stack.
 *
 *   npm run db:start && npm run db:reset && npm run test:rls
 *
 * Creates throwaway users through the Auth admin API, then exercises every
 * access rule as anon, two students, an editor and an admin. Refuses to run
 * against anything other than localhost.
 */
import { execFileSync } from "node:child_process";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type Status = { API_URL: string; PUBLISHABLE_KEY: string; SECRET_KEY: string };
const status = JSON.parse(execFileSync("npx", ["supabase", "status", "-o", "json"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })) as Status;
const url = status.API_URL;
if (!/^http:\/\/(127\.0\.0\.1|localhost)/.test(url)) throw new Error(`Refusing to run RLS tests against ${url}`);

const anon = createClient(url, status.PUBLISHABLE_KEY, { auth: { persistSession: false } });
const service = createClient(url, status.SECRET_KEY, { auth: { persistSession: false } });

let passed = 0;
let failed = 0;
async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    failed++;
    console.log(`  ✗ ${name}\n      ${error instanceof Error ? error.message : String(error)}`);
  }
}
function expect(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const stamp = Date.now();
async function makeUser(label: string): Promise<{ id: string; client: SupabaseClient }> {
  const email = `rls-${label}-${stamp}@example.test`;
  const password = `Passw0rd-${stamp}`;
  const { data, error } = await service.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { display_name: label } });
  if (error || !data.user) throw new Error(`createUser ${label}: ${error?.message}`);
  const client = createClient(url, status.PUBLISHABLE_KEY, { auth: { persistSession: false } });
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw new Error(`signIn ${label}: ${signInError.message}`);
  return { id: data.user.id, client };
}

async function main() {
  console.log(`RLS tests against ${url}\n`);
  const a = await makeUser("student-a");
  const b = await makeUser("student-b");
  const editor = await makeUser("editor");
  const admin = await makeUser("admin");
  await service.from("user_roles").insert([
    { user_id: admin.id, role: "admin" },
    { user_id: editor.id, role: "editor" },
  ]);

  const { data: published } = await anon.from("resources").select("id").eq("status", "published").limit(2);
  const resourceId = published![0].id;
  const otherResourceId = published![1].id;
  const { data: stage } = await anon.from("roadmap_stages").select("id").limit(1).single();

  console.log("Catalog");
  await test("anon reads published resources", async () => {
    const { count, error } = await anon.from("resources").select("*", { count: "exact", head: true });
    expect(!error && (count ?? 0) > 300, `expected >300 rows, got ${count} (${error?.message})`);
  });
  await test("anon cannot see pending resources", async () => {
    const { data } = await anon.from("resources").select("id").eq("status", "pending");
    expect(data?.length === 0, `anon saw ${data?.length} pending resources`);
  });
  await test("students cannot see pending resources", async () => {
    const { data } = await a.client.from("resources").select("id").eq("status", "pending");
    expect(data?.length === 0, `student saw ${data?.length} pending resources`);
  });
  await test("staff can see pending resources", async () => {
    const { data } = await editor.client.from("resources").select("id").eq("status", "pending");
    expect((data?.length ?? 0) >= 1, "editor could not see the pending Nexavena resource");
  });
  await test("anon cannot insert resources", async () => {
    const { error } = await anon.from("resources").insert({ slug: `x-${stamp}`, title: "Nope", description: "Should be rejected", url: `https://example.com/${stamp}`, department_id: 1, level: "beginner", type: "article", publisher: "x", source_kind: "community" });
    expect(error, "anon insert succeeded");
  });
  await test("students cannot insert resources", async () => {
    const { error } = await a.client.from("resources").insert({ slug: `y-${stamp}`, title: "Nope", description: "Should be rejected", url: `https://example.com/y${stamp}`, department_id: 1, level: "beginner", type: "article", publisher: "x", source_kind: "community" });
    expect(error, "student insert succeeded");
  });
  await test("students cannot update resources (0 rows affected)", async () => {
    const { data } = await a.client.from("resources").update({ title: "Hacked" }).eq("id", resourceId).select();
    expect((data?.length ?? 0) === 0, "student update affected rows");
  });
  await test("editors can update resources", async () => {
    const { data: before } = await service.from("resources").select("title").eq("id", resourceId).single();
    const { data, error } = await editor.client.from("resources").update({ title: `${before!.title} ` }).eq("id", resourceId).select();
    expect(!error && data?.length === 1, `editor update failed: ${error?.message}`);
    await service.from("resources").update({ title: before!.title }).eq("id", resourceId);
  });
  await test("editors cannot delete resources (admin only)", async () => {
    const { data } = await editor.client.from("resources").delete().eq("id", resourceId).select();
    expect((data?.length ?? 0) === 0, "editor deleted a resource");
  });
  await test("admins can create and delete resources", async () => {
    const { data, error } = await admin.client
      .from("resources")
      .insert({ slug: `admin-${stamp}`, title: "Admin test", description: "Created by the RLS test suite", url: `https://example.com/admin-${stamp}`, department_id: 1, level: "beginner", type: "article", publisher: "Test", source_kind: "community", status: "draft" })
      .select("id")
      .single();
    expect(!error && data, `admin insert failed: ${error?.message}`);
    const { data: deleted } = await admin.client.from("resources").delete().eq("id", data!.id).select();
    expect(deleted?.length === 1, "admin delete failed");
  });
  await test("search_resources RPC works for anon and hides pending", async () => {
    const { data, error } = await anon.rpc("search_resources", { q: "cloud", p_limit: 60 });
    expect(!error && (data?.length ?? 0) > 0, `rpc failed: ${error?.message}`);
    expect(!data!.some((r: { slug: string }) => r.slug === "nexavena-cloud-computing-tutorial"), "pending resource leaked through search");
  });

  console.log("\nLearner data");
  await test("student A can bookmark", async () => {
    const { error } = await a.client.from("bookmarks").insert({ user_id: a.id, resource_id: resourceId });
    expect(!error, `bookmark failed: ${error?.message}`);
  });
  await test("student B cannot read A's bookmarks", async () => {
    const { data } = await b.client.from("bookmarks").select("*").eq("user_id", a.id);
    expect(data?.length === 0, "B read A's bookmarks");
  });
  await test("anon cannot read bookmarks", async () => {
    const { data, error } = await anon.from("bookmarks").select("*");
    expect(error || data?.length === 0, "anon read bookmarks");
  });
  await test("student B cannot create a bookmark for A", async () => {
    const { error } = await b.client.from("bookmarks").insert({ user_id: a.id, resource_id: otherResourceId });
    expect(error, "B inserted a bookmark owned by A");
  });
  await test("student B cannot delete A's bookmark", async () => {
    await b.client.from("bookmarks").delete().eq("user_id", a.id);
    const { count } = await service.from("bookmarks").select("*", { count: "exact", head: true }).eq("user_id", a.id);
    expect(count === 1, "A's bookmark disappeared");
  });
  await test("student A records progress; completed_at must match status", async () => {
    const { error } = await a.client.from("user_progress").insert({ user_id: a.id, resource_id: resourceId, status: "completed", completed_at: new Date().toISOString() });
    expect(!error, `progress insert failed: ${error?.message}`);
    const { error: bad } = await a.client.from("user_progress").insert({ user_id: a.id, resource_id: otherResourceId, status: "completed" });
    expect(bad, "inconsistent progress row was accepted");
  });
  await test("student B cannot update A's progress", async () => {
    const { data } = await b.client.from("user_progress").update({ status: "in_progress", completed_at: null }).eq("user_id", a.id).select();
    expect((data?.length ?? 0) === 0, "B updated A's progress");
  });
  await test("student A cannot reassign own progress to B (WITH CHECK)", async () => {
    const { error } = await a.client.from("user_progress").update({ user_id: b.id }).eq("user_id", a.id).eq("resource_id", resourceId);
    expect(error, "A reassigned a progress row to B");
  });
  await test("enrollments and milestones are private", async () => {
    await a.client.from("user_roadmaps").insert({ user_id: a.id, roadmap_id: 1 });
    await a.client.from("learning_milestones").insert({ user_id: a.id, stage_id: stage!.id });
    const { data: r } = await b.client.from("user_roadmaps").select("*").eq("user_id", a.id);
    const { data: m } = await b.client.from("learning_milestones").select("*").eq("user_id", a.id);
    expect(r?.length === 0 && m?.length === 0, "B saw A's enrollment or milestones");
  });

  console.log("\nProfiles and roles");
  await test("a profile row is created automatically on sign-up", async () => {
    const { data } = await a.client.from("profiles").select("display_name").eq("id", a.id).single();
    expect(data?.display_name === "student-a", `unexpected profile ${JSON.stringify(data)}`);
  });
  await test("student B cannot read A's profile", async () => {
    const { data } = await b.client.from("profiles").select("*").eq("id", a.id);
    expect(data?.length === 0, "B read A's profile");
  });
  await test("student B cannot update A's profile", async () => {
    const { data } = await b.client.from("profiles").update({ display_name: "pwned" }).eq("id", a.id).select();
    expect((data?.length ?? 0) === 0, "B updated A's profile");
  });
  await test("admins can read all profiles", async () => {
    const { data } = await admin.client.from("profiles").select("id").in("id", [a.id, b.id]);
    expect(data?.length === 2, "admin could not read profiles");
  });
  await test("students cannot grant themselves a role", async () => {
    const { error } = await a.client.from("user_roles").insert({ user_id: a.id, role: "admin" });
    expect(error, "student self-promoted to admin");
  });
  await test("editors cannot grant roles", async () => {
    const { error } = await editor.client.from("user_roles").insert({ user_id: b.id, role: "editor" });
    expect(error, "editor granted a role");
  });
  await test("admins can grant and revoke roles", async () => {
    const { error } = await admin.client.from("user_roles").insert({ user_id: b.id, role: "editor" });
    expect(!error, `grant failed: ${error?.message}`);
    const { data } = await admin.client.from("user_roles").delete().eq("user_id", b.id).eq("role", "editor").select();
    expect(data?.length === 1, "revoke failed");
  });
  await test("the last admin cannot be removed", async () => {
    // Remove every other admin left over from earlier runs so this one is last.
    const { data: others } = await service.from("user_roles").select("user_id").eq("role", "admin").neq("user_id", admin.id);
    for (const o of others ?? []) await service.auth.admin.deleteUser(o.user_id);
    const { error } = await admin.client.from("user_roles").delete().eq("user_id", admin.id).eq("role", "admin");
    expect(error && /last administrator/i.test(error.message), `expected last-admin protection, got ${error?.message ?? "success"}`);
  });

  console.log("\nStorage");
  await test("users upload avatars into their own folder", async () => {
    const { error } = await a.client.storage.from("avatars").upload(`${a.id}/avatar.png`, new Blob([new Uint8Array([137, 80, 78, 71])], { type: "image/png" }), { upsert: true });
    expect(!error, `upload failed: ${error?.message}`);
  });
  await test("users cannot upload into someone else's folder", async () => {
    const { error } = await b.client.storage.from("avatars").upload(`${a.id}/evil.png`, new Blob([new Uint8Array([1])], { type: "image/png" }));
    expect(error, "B uploaded into A's folder");
  });

  // Clean up throwaway users (cascades to their rows).
  for (const u of [a, b, editor]) await service.auth.admin.deleteUser(u.id);
  await service.storage.from("avatars").remove([`${a.id}/avatar.png`]);

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed) process.exitCode = 1;
}

await main();
