export type PanelId = "ai" | "foundation" | "approach";

export type IconName =
  | "chart"
  | "scan"
  | "search"
  | "scenario"
  | "action"
  | "message";

export interface TabDefinition {
  id: PanelId;
  shortLabel: string;
  step: string;
  title: string;
  lead: string;
}

export const tabs: TabDefinition[] = [
  {
    id: "ai",
    shortLabel: "AIで変わる経営管理",
    step: "01",
    title: "AIによって進化する経営管理",
    lead: "予測・分析から、意思決定と実行へ。",
  },
  {
    id: "foundation",
    shortLabel: "5レイヤーの統合",
    step: "02",
    title:
      "AIを活用した経営管理基盤は5つのレイヤーを統合して初めて成立する",
    lead: "5つのレイヤーを、一つの経営管理システムとしてつなぐ。",
  },
  {
    id: "approach",
    shortLabel: "導入アプローチ",
    step: "03",
    title:
      "基盤導入アプローチに定石はなく、自社のスタイルに合わせて定める必要がある",
    lead: "自社の現在地に合う入口から、統合を目指す。",
  },
];

export const aiCapabilities: Array<{
  icon: IconName;
  className: string;
  title: string;
  description: string;
}> = [
  {
    icon: "chart",
    className: "forecast",
    title: "予測",
    description: "売上・利益を先読みする",
  },
  {
    icon: "scan",
    className: "anomaly",
    title: "異常検知",
    description: "変化を捉え、論点を絞る",
  },
  {
    icon: "search",
    className: "factor",
    title: "要因分析",
    description: "変化の背景を分解する",
  },
  {
    icon: "scenario",
    className: "scenario",
    title: "シナリオ分析",
    description: "打ち手と影響を比較する",
  },
  {
    icon: "action",
    className: "action",
    title: "アクション提案",
    description: "分析を実行案へ変える",
  },
  {
    icon: "message",
    className: "meeting",
    title: "経営会議コメント",
    description: "数値を会議の論点へ変える",
  },
];

export const foundationLayers = [
  {
    id: "action",
    number: "01",
    title: "経営アクション",
    description: "何を決め、誰が動くか",
  },
  {
    id: "insight",
    number: "02",
    title: "判断インサイト",
    description: "予測・要因・シナリオを判断へ",
  },
  {
    id: "cycle",
    number: "03",
    title: "業務サイクル",
    description: "予算・見込・実績・会議を回す",
  },
  {
    id: "data",
    number: "04",
    title: "管理会計データ",
    description: "KPI・科目・組織の定義をそろえる",
  },
  {
    id: "platform",
    number: "05",
    title: "データ・AI基盤",
    description: "連携・権限・AI運用を支える",
  },
] as const;

export const approaches = [
  {
    id: "vision",
    name: "構想主導型",
    start: "経営会議・意思決定",
    process: "判断とアクションを定め、必要な業務・データ・AIを逆算する",
    output: "統合構想図",
  },
  {
    id: "operation",
    name: "業務基軸型",
    start: "予算・見込・実績管理",
    process: "中核業務を整え、判断と基盤へ対象を広げる",
    output: "統合運用設計",
  },
  {
    id: "technology",
    name: "技術先行型",
    start: "DWH・BI・AI基盤",
    process: "共通基盤を整え、優先テーマから業務へ実装する",
    output: "活用ロードマップ",
  },
] as const;
