import { BrainCircuit, Layers3, Workflow } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type PageId = "home" | "foundation" | "approach" | "layers";
export type ConceptPageId = Exclude<PageId, "home">;

export type PageNavigationItem = {
  id: ConceptPageId;
  label: string;
  icon: LucideIcon;
};

export type HomePageLink = PageNavigationItem & {
  step: string;
  points: string[];
};

export const navItems: PageNavigationItem[] = [
  { id: "foundation", label: "統合経営管理基盤", icon: Layers3 },
  { id: "approach", label: "基盤導入アプローチ", icon: Workflow },
  { id: "layers", label: "レイヤー別論点", icon: BrainCircuit },
];

export const homePageLinks: HomePageLink[] = [
  {
    id: "foundation",
    step: "01",
    label: "統合経営管理基盤",
    points: ["全体構造", "データ・AI", "意思決定"],
    icon: Layers3,
  },
  {
    id: "approach",
    step: "02",
    label: "基盤導入アプローチ",
    points: ["構想", "業務", "技術"],
    icon: Workflow,
  },
  {
    id: "layers",
    step: "03",
    label: "レイヤー別論点",
    points: ["論点", "AI活用", "分析"],
    icon: BrainCircuit,
  },
];

export const pageAlias: Record<string, PageId> = {
  top: "home",
  home: "home",
  overview: "foundation",
  foundation: "foundation",
  design: "approach",
  build: "approach",
  approach: "approach",
  ai: "layers",
  traditional: "layers",
  layers: "layers",
};
