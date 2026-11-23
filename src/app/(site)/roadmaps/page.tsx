import type { Metadata } from "next";
import { RoadmapCard } from "@/components/catalog/cards";
import { CatalogUnavailable, SectionHeading } from "@/components/catalog/states";
import { getRoadmaps } from "@/lib/catalog/queries";

export const metadata: Metadata = {
  title: "Learning roadmaps",
  description: "Step-by-step career roadmaps for developers, cloud and DevOps engineers, AI and ML engineers, mobile developers, data engineers and DBAs.",
};

const GROUPS = [
  { title: "Software development", slugs: ["software-engineer", "python-developer", "java-developer", "cpp-developer"] },
  { title: "Web", slugs: ["frontend-developer", "backend-developer", "full-stack-developer"] },
  { title: "Cloud & DevOps", slugs: ["cloud-engineer", "azure-cloud-engineer", "aws-cloud-engineer", "devops-engineer"] },
  { title: "AI & data", slugs: ["ai-engineer", "machine-learning-engineer", "data-engineer", "database-administrator"] },
  { title: "Mobile", slugs: ["android-developer", "ios-developer", "flutter-developer", "react-native-developer"] },
];

export default async function RoadmapsPage() {
  const roadmaps = await getRoadmaps();
  if (!roadmaps.length) return <div className="container-page py-16"><CatalogUnavailable /></div>;
  const grouped = new Set(GROUPS.flatMap((g) => g.slugs));
  const other = roadmaps.filter((r) => !grouped.has(r.slug));
  const groups = [...GROUPS.map((g) => ({ title: g.title, items: roadmaps.filter((r) => g.slugs.includes(r.slug)) })), { title: "More paths", items: other }].filter((g) => g.items.length);

  return (
    <div className="container-page py-12 sm:py-16">
      <SectionHeading
        as="h1"
        eyebrow="Roadmaps"
        title="Learning roadmaps"
        description={`${roadmaps.length} structured paths. Every stage lists prerequisites, skills, technologies, hand-picked resources and a practical project — so you always know what to learn next.`}
      />
      <div className="mt-12 space-y-14">
        {groups.map((group) => (
          <section key={group.title} aria-labelledby={`group-${group.title}`}>
            <h2 id={`group-${group.title}`} className="flex items-center gap-3 text-lg font-semibold tracking-tight">
              {group.title}
              <span className="h-px flex-1 bg-border" aria-hidden="true" />
            </h2>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {group.items.map((r) => <li key={r.id}><RoadmapCard roadmap={r} /></li>)}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
