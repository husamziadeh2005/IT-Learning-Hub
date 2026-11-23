import type { Level, Pricing, ResourceType, SourceKind } from "./labels";

export interface TechRef {
  slug: string;
  name: string;
}

export interface ResourceCardData {
  id: number;
  slug: string;
  title: string;
  description: string;
  url: string | null;
  level: Level;
  type: ResourceType;
  publisher: string;
  pricing: Pricing;
  source_kind: SourceKind;
  duration_label: string | null;
  is_featured: boolean;
  published_at: string | null;
  department: { slug: string; name: string; accent: string } | null;
  technologies: TechRef[];
}

export interface DepartmentSummary {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  accent: string;
  resourceCount: number;
  technologyCount: number;
}

export interface TechnologyCardData {
  id: number;
  slug: string;
  name: string;
  short_description: string;
  icon: string;
  is_featured: boolean;
  department: { slug: string; name: string; accent: string } | null;
  resourceCount?: number;
}

export interface RoadmapSummary {
  id: number;
  slug: string;
  title: string;
  summary: string;
  level: Level;
  estimated_duration: string | null;
  icon: string;
  is_featured: boolean;
  department: { slug: string; name: string; accent: string } | null;
  stageCount: number;
  stageTitles: string[];
}

export interface Certification {
  name: string;
  provider: string;
  url: string;
}

export interface StageProject {
  title: string;
  description: string;
}

export interface RoadmapStage {
  id: number;
  position: number;
  title: string;
  summary: string;
  skills: string[];
  projects: StageProject[];
  estimated_duration: string | null;
  technologies: TechRef[];
  resources: (ResourceCardData & { is_optional: boolean; position: number })[];
}

export interface RoadmapDetail extends RoadmapSummary {
  description: string;
  prerequisites: string[];
  outcomes: string[];
  certifications: Certification[];
  stages: RoadmapStage[];
}

export interface SearchFilters {
  q?: string;
  department?: string;
  technology?: string;
  levels?: Level[];
  types?: ResourceType[];
  pricing?: Pricing[];
  sort?: "relevance" | "newest" | "title" | "level";
  page?: number;
}
