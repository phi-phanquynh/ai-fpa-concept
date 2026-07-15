import {
  Activity,
  ArrowRight,
  BrainCircuit,
  ChartNoAxesCombined,
  GitBranch,
  Lightbulb,
  Maximize2,
  MessageSquareText,
  Monitor,
  ScanSearch,
  Search,
  Target,
} from "lucide-react";
import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  aiCapabilities,
  approaches,
  foundationLayers,
  type IconName,
  type PanelId,
  tabs,
} from "./content";

const panelIds = new Set<PanelId>(tabs.map((tab) => tab.id));

const capabilityIcons: Record<IconName, ReactNode> = {
  chart: <ChartNoAxesCombined aria-hidden="true" />,
  scan: <ScanSearch aria-hidden="true" />,
  search: <Search aria-hidden="true" />,
  scenario: <GitBranch aria-hidden="true" />,
  action: <Target aria-hidden="true" />,
  message: <MessageSquareText aria-hidden="true" />,
};

function getPanelFromHash(): PanelId {
  const value = window.location.hash.replace(/^#/, "") as PanelId;
  return panelIds.has(value) ? value : "ai";
}

function PanelHeading({ panel }: { panel: PanelId }) {
  const tab = tabs.find((item) => item.id === panel)!;

  return (
    <header className="concept-heading">
      <h1>{tab.title}</h1>
      <p>{tab.lead}</p>
    </header>
  );
}

function AiPanel() {
  return (
    <div className="panel-frame panel-frame--ai" data-qa="panel-content">
      <PanelHeading panel="ai" />

      <div className="ai-layout">
        <section className="ai-map" aria-label="AIで進化する経営管理機能の全体像">
          <div className="ai-map__grid" aria-hidden="true" />
          <div className="ai-map__phases" aria-hidden="true">
            <span>01　捉える</span>
            <span>02　読み解く</span>
            <span>03　実行する</span>
          </div>

          <svg
            className="ai-map__connectors"
            viewBox="0 0 1000 600"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M500 310 C390 300 305 205 200 140" />
            <path d="M500 310 C380 330 300 435 200 490" />
            <path d="M500 310 C500 255 500 205 500 140" />
            <path d="M500 310 C500 365 500 425 500 490" />
            <path d="M500 310 C610 300 695 205 800 140" />
            <path d="M500 310 C620 330 700 435 800 490" />
          </svg>

          <div className="ai-core" aria-label="AIコア">
            <span className="ai-core__orbit" aria-hidden="true" />
            <span className="ai-core__icon">
              <BrainCircuit aria-hidden="true" />
            </span>
            <strong>AI CORE</strong>
          </div>

          {aiCapabilities.map((capability) => (
            <article
              className={`ai-node ai-node--${capability.className}`}
              key={capability.title}
            >
              <span className="ai-node__icon">{capabilityIcons[capability.icon]}</span>
              <div>
                <h2>{capability.title}</h2>
                <p>{capability.description}</p>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}

function FoundationPanel() {
  const [isTagetikVisible, setIsTagetikVisible] = useState(false);

  return (
    <div className="panel-frame panel-frame--light" data-qa="panel-content">
      <div className="foundation-heading-row">
        <PanelHeading panel="foundation" />
        <button
          className="tagetik-toggle"
          type="button"
          aria-controls="tagetik-scope"
          aria-pressed={isTagetikVisible}
          onClick={() => setIsTagetikVisible((visible) => !visible)}
        >
          {isTagetikVisible
            ? "Tagetikのスコープを非表示"
            : "Tagetikのスコープを表示"}
        </button>
      </div>

      <div className="foundation-layout">
        <section className="pyramid-card" aria-label="5レイヤー統合構造">
          <div className="pyramid-card__topline">
            <span>上位目的</span>
          </div>
          <div className="pyramid">
            <div className="pyramid__spine" aria-hidden="true">
              <span>統合デザイン</span>
            </div>
            {foundationLayers.map((layer) => (
              <div
                className={`pyramid__tier-slot pyramid__tier-slot--${layer.id}`}
                key={layer.id}
              >
                <div className={`pyramid__tier pyramid__tier--${layer.id}`}>
                  <span className="pyramid__number">{layer.number}</span>
                  <div>
                    <strong>{layer.title}</strong>
                  </div>
                </div>
                {layer.id === "cycle" && (
                  <div
                    className={`tagetik-scope${isTagetikVisible ? " is-visible" : ""}`}
                    id="tagetik-scope"
                    aria-hidden={!isTagetikVisible}
                    aria-label="Tagetikの対象範囲：業務サイクルと管理会計データ"
                  >
                    <span className="tagetik-scope__label">Tagetikのスコープ</span>
                    <span className="tagetik-scope__frame" aria-hidden="true" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="pyramid-card__base">
            <span>下位レイヤーが支える</span>
          </div>
        </section>

        <aside className="layer-guide" aria-label="5レイヤーの役割">
          <div className="layer-guide__heading">
            <strong>5層を一つの経営管理システムとして設計する</strong>
          </div>
          <div className="layer-list">
            {foundationLayers.map((layer) => (
              <article
                className={`layer-item layer-item--${layer.id}`}
                key={layer.id}
              >
                <span className="layer-item__number">{layer.number}</span>
                <div className="layer-item__text">
                  <h2>{layer.title}</h2>
                  <p>{layer.description}</p>
                </div>
                <span className="layer-item__line" aria-hidden="true" />
              </article>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

type ApproachId = (typeof approaches)[number]["id"];

function ApproachVisual({ approachId }: { approachId: ApproachId }) {
  if (approachId === "vision") {
    return (
      <svg
        className="approach-card__visual approach-card__visual--vision"
        viewBox="0 0 520 260"
        role="img"
        aria-label="経営判断から業務、データ、AIへ逆算する分岐図"
      >
        <title>経営判断から業務・データ・AIへ逆算する</title>
        <defs>
          <marker
            id="vision-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" />
          </marker>
        </defs>
        <rect className="visual-node visual-node--primary" x="145" y="18" width="230" height="68" rx="16" />
        <text className="visual-label visual-label--primary" x="260" y="61" textAnchor="middle">経営判断</text>
        <text className="visual-caption" x="260" y="120" textAnchor="middle">逆算</text>
        <path className="visual-flow" d="M260 88 V137 H90 V170" markerEnd="url(#vision-arrow)" />
        <path className="visual-flow" d="M260 88 V170" markerEnd="url(#vision-arrow)" />
        <path className="visual-flow" d="M260 88 V137 H430 V170" markerEnd="url(#vision-arrow)" />
        <rect className="visual-node" x="20" y="178" width="140" height="62" rx="14" />
        <rect className="visual-node" x="190" y="178" width="140" height="62" rx="14" />
        <rect className="visual-node" x="360" y="178" width="140" height="62" rx="14" />
        <text className="visual-label" x="90" y="218" textAnchor="middle">業務</text>
        <text className="visual-label" x="260" y="218" textAnchor="middle">データ</text>
        <text className="visual-label" x="430" y="218" textAnchor="middle">AI</text>
      </svg>
    );
  }

  if (approachId === "operation") {
    return (
      <svg
        className="approach-card__visual approach-card__visual--operation"
        viewBox="0 0 520 260"
        role="img"
        aria-label="予算、見込、実績、会議が循環する業務サイクル図"
      >
        <title>予算・見込・実績・会議の業務サイクル</title>
        <defs>
          <marker
            id="operation-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" />
          </marker>
        </defs>
        <circle className="visual-cycle" cx="260" cy="130" r="57" />
        <text className="visual-caption visual-caption--center" x="260" y="137" textAnchor="middle">循環</text>
        <path className="visual-flow" d="M330 47 C383 55 420 75 430 101" markerEnd="url(#operation-arrow)" />
        <path className="visual-flow" d="M430 158 C414 196 378 211 333 214" markerEnd="url(#operation-arrow)" />
        <path className="visual-flow" d="M190 214 C142 209 108 190 91 160" markerEnd="url(#operation-arrow)" />
        <path className="visual-flow" d="M90 101 C106 72 142 53 187 47" markerEnd="url(#operation-arrow)" />
        <rect className="visual-node" x="190" y="18" width="140" height="58" rx="14" />
        <rect className="visual-node" x="360" y="101" width="140" height="58" rx="14" />
        <rect className="visual-node" x="190" y="184" width="140" height="58" rx="14" />
        <rect className="visual-node" x="20" y="101" width="140" height="58" rx="14" />
        <text className="visual-label" x="260" y="55" textAnchor="middle">予算</text>
        <text className="visual-label" x="430" y="138" textAnchor="middle">見込</text>
        <text className="visual-label" x="260" y="221" textAnchor="middle">実績</text>
        <text className="visual-label" x="90" y="138" textAnchor="middle">会議</text>
      </svg>
    );
  }

  return (
    <svg
      className="approach-card__visual approach-card__visual--technology"
      viewBox="0 0 520 260"
      role="img"
      aria-label="DWHからBI、AI、業務適用へ進む基盤拡張図"
    >
      <title>DWH・BI・AIから業務適用へ進む基盤拡張</title>
      <defs>
        <marker
          id="technology-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <path className="visual-growth" d="M25 225 H120 V185 H245 V137 H370 V82 H495" />
      <path className="visual-flow" d="M116 196 L155 169" markerEnd="url(#technology-arrow)" />
      <path className="visual-flow" d="M241 151 L280 121" markerEnd="url(#technology-arrow)" />
      <path className="visual-flow" d="M366 98 L405 68" markerEnd="url(#technology-arrow)" />
      <rect className="visual-node" x="20" y="178" width="100" height="62" rx="14" />
      <rect className="visual-node" x="145" y="137" width="100" height="62" rx="14" />
      <rect className="visual-node" x="270" y="89" width="100" height="62" rx="14" />
      <rect className="visual-node visual-node--primary" x="395" y="34" width="105" height="62" rx="14" />
      <text className="visual-label" x="70" y="218" textAnchor="middle">DWH</text>
      <text className="visual-label" x="195" y="177" textAnchor="middle">BI</text>
      <text className="visual-label" x="320" y="129" textAnchor="middle">AI</text>
      <text className="visual-label visual-label--primary" x="447.5" y="74" textAnchor="middle">業務適用</text>
    </svg>
  );
}

function ApproachPanel() {
  return (
    <div className="panel-frame panel-frame--light" data-qa="panel-content">
      <PanelHeading panel="approach" />

      <div className="approach-layout">
        <div className="approach-grid" aria-label="3つの基盤導入アプローチ">
          {approaches.map((approach) => (
            <article
              className={`approach-card approach-card--${approach.id}`}
              key={approach.id}
            >
              <header className="approach-card__header">
                <h2>{approach.name}</h2>
                <span className="approach-card__icon" aria-hidden="true">
                  {approach.id === "vision" && <Lightbulb />}
                  {approach.id === "operation" && <Activity />}
                  {approach.id === "technology" && <BrainCircuit />}
                </span>
              </header>

              <div className="approach-card__start">
                <span>START</span>
                <strong>{approach.start}</strong>
                <ArrowRight aria-hidden="true" />
              </div>

              <div className="approach-card__visual-wrap">
                <ApproachVisual approachId={approach.id} />
              </div>

              <div className="approach-card__output">
                <span>成果物</span>
                <strong>{approach.output}</strong>
              </div>
            </article>
          ))}
        </div>

        <div className="convergence" aria-label="3つのアプローチの統合先">
          <svg
            className="convergence__lines"
            viewBox="0 0 1200 70"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M190 0 L600 66" />
            <path d="M600 0 L600 66" />
            <path d="M1010 0 L600 66" />
          </svg>
          <div className="convergence__target">
            <span className="convergence__mark">
              <Target aria-hidden="true" />
            </span>
            <div>
              <strong>統合経営管理基盤</strong>
            </div>
            <p>起点は異なっても、5レイヤーを一つの運用へ統合する</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManagementConceptApp() {
  const [activePanel, setActivePanel] = useState<PanelId>(() => getPanelFromHash());
  const [isPresentationGuideOpen, setIsPresentationGuideOpen] = useState(
    () => window.location.protocol === "file:",
  );
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (!panelIds.has(window.location.hash.replace(/^#/, "") as PanelId)) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#ai`);
    }

    const syncHash = () => setActivePanel(getPanelFromHash());
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);
    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
    };
  }, []);

  useEffect(() => {
    if (!isPresentationGuideOpen) return;

    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setIsPresentationGuideOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isPresentationGuideOpen]);

  const activeIndex = useMemo(
    () => tabs.findIndex((tab) => tab.id === activePanel),
    [activePanel],
  );

  const selectPanel = (panel: PanelId) => {
    setActivePanel(panel);
    if (window.location.hash !== `#${panel}`) {
      window.location.hash = panel;
    }
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    let nextIndex = activeIndex;
    if (event.key === "ArrowRight") nextIndex = (activeIndex + 1) % tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (activeIndex - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;

    if (nextIndex !== activeIndex) {
      event.preventDefault();
      const nextPanel = tabs[nextIndex].id;
      selectPanel(nextPanel);
      requestAnimationFrame(() => tabRefs.current[nextIndex]?.focus());
    }
  };

  return (
    <main
      className="management-concept"
      data-qa="management-concept-app"
      data-page="management-concept"
      data-panel={activePanel}
    >
      <header className="concept-chrome">
        <div className="concept-brand" aria-label="AI FP&A Concept">
          <span className="concept-brand__mark" aria-hidden="true">
            <BrainCircuit />
          </span>
          <span>
            <strong>AI FP&amp;A</strong>
          </span>
        </div>

        <div className="concept-tabs" role="tablist" aria-label="コンセプトページ">
          {tabs.map((tab, index) => {
            const selected = tab.id === activePanel;
            return (
              <button
                className="concept-tab"
                id={`tab-${tab.id}`}
                key={tab.id}
                type="button"
                role="tab"
                aria-label={tab.shortLabel}
                aria-selected={selected}
                aria-controls={`panel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                data-tab={tab.id}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                onClick={() => selectPanel(tab.id)}
                onKeyDown={handleTabKeyDown}
              >
                <span>{tab.step}</span>
                <strong>{tab.shortLabel}</strong>
              </button>
            );
          })}
        </div>

        <div className="concept-progress" aria-label={`${activeIndex + 1}ページ目、全3ページ`}>
          <strong>0{activeIndex + 1}</strong>
          <span>/ 03</span>
        </div>
      </header>

      {tabs.map((tab) => {
        const selected = tab.id === activePanel;
        return (
          <section
            className={`concept-panel concept-panel--${tab.id}${selected ? " is-active" : ""}`}
            id={`panel-${tab.id}`}
            key={tab.id}
            role="tabpanel"
            aria-labelledby={`tab-${tab.id}`}
            tabIndex={0}
            hidden={!selected}
            inert={!selected}
            data-panel={tab.id}
          >
            {tab.id === "ai" && <AiPanel />}
            {tab.id === "foundation" && <FoundationPanel />}
            {tab.id === "approach" && <ApproachPanel />}
          </section>
        );
      })}

      {isPresentationGuideOpen && (
        <div className="presentation-guide" data-qa="presentation-guide">
          <section
            className="presentation-guide__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="presentation-guide-title"
            aria-describedby="presentation-guide-description"
          >
            <p className="presentation-guide__eyebrow">PRESENTATION GUIDE</p>
            <h2 id="presentation-guide-title">この資料はブラウザでの閲覧・投影用です</h2>
            <p className="presentation-guide__description" id="presentation-guide-description">
              見やすい表示とスムーズな操作のため、ブラウザで開いてご利用ください。
            </p>

            <div className="presentation-guide__steps">
              <article className="presentation-guide__step">
                <span className="presentation-guide__icon" aria-hidden="true">
                  <Monitor />
                </span>
                <div>
                  <strong>Teamsで開いている場合</strong>
                  <p>「ブラウザで開く」を選択して、表示し直してください。</p>
                </div>
              </article>

              <article className="presentation-guide__step">
                <span className="presentation-guide__icon" aria-hidden="true">
                  <Maximize2 />
                </span>
                <div>
                  <strong>投影時は F11</strong>
                  <p>ブラウザを全画面表示に切り替えられます。</p>
                </div>
              </article>
            </div>

            <button
              className="presentation-guide__close"
              type="button"
              autoFocus
              aria-label="案内を閉じる（資料を表示する）"
              onClick={() => setIsPresentationGuideOpen(false)}
            >
              資料を表示する
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
