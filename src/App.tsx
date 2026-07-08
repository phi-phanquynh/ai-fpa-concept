import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  ChevronRight,
  Cpu,
  FileText,
  LineChart,
  Menu,
  Radar,
  Sparkles,
  X,
} from "lucide-react";
import { HomePage } from "./components/HomePage";
import { navItems, pageAlias } from "./siteContent";
import type { PageId } from "./siteContent";

function getPageFromHash(): PageId {
  const hash = decodeURIComponent(window.location.hash.replace("#", ""));
  return pageAlias[hash] ?? "home";
}

const structureLayers = [
  {
    title: "経営アクション",
    outcome: "意思決定を実行に変える",
    body: "経営判断を、資源配分、収益改善、リスク対応、次の打ち手へ接続する。",
    support:
      "判断インサイトが、論点、選択肢、打ち手を具体化するため、経営判断を実行に移せます。",
    items: ["意思決定", "資源配分", "改善施策", "実行責任"],
  },
  {
    title: "判断インサイト",
    outcome: "AIと分析で論点を出す",
    body: "予測、異常検知、要因分析、シナリオを使い、会議で扱う論点と打ち手を示す。",
    support:
      "業務サイクルが、予算、見込、実績の変化を継続的に集めるため、AIと分析が判断に使える論点を出せます。",
    items: ["予測", "論点", "要因", "シナリオ", "打ち手"],
  },
  {
    title: "業務サイクル",
    outcome: "予算・見込・実績を回す",
    body: "予算、見込、実績、差異分析、会議体、アクション管理を継続的な流れにする。",
    support:
      "管理会計データで数字の意味と粒度がそろうため、予算、見込、実績を同じ基準で回せます。",
    items: ["予算", "見込", "実績", "会議体", "アクション"],
  },
  {
    title: "管理会計データ",
    outcome: "数字の意味と粒度をそろえる",
    body: "経営判断に使うKPI、管理会計科目、組織、事業、商品、顧客、時間粒度をそろえる。",
    support:
      "データ・AI基盤が、連携、権限、監査を運用可能にするため、管理会計データを継続して使えます。",
    items: ["KPI", "科目", "組織", "事業", "商品", "顧客"],
  },
  {
    title: "データ・AI基盤",
    outcome: "データとAIを使い続ける",
    body: "データ連携、BI、AIモデル、ナレッジ検索、権限、監査を運用可能な形にする。",
    support:
      "すべての上位レイヤーが、同じデータとAIを安全に使い続けるための土台です。",
    items: ["DWH", "BI", "AI", "RAG", "権限", "監査"],
  },
];

const aiUseCases = [
  {
    label: "予測",
    copy: "売上、費用、利益、KPIの先行きを早期に捉え、見込管理を前倒しする。",
    icon: LineChart,
  },
  {
    label: "異常検知",
    copy: "通常と異なる動きを検知し、差異分析や早期是正の入口を作る。",
    icon: Activity,
  },
  {
    label: "要因分析",
    copy: "悪化や改善の背景を、KPI、組織、商品、顧客などの軸で分解する。",
    icon: Radar,
  },
  {
    label: "シナリオ分析",
    copy: "価格、数量、為替、原価、人員などの変化を複数ケースで比較する。",
    icon: Cpu,
  },
  {
    label: "アクション提案",
    copy: "分析結果を施策候補、担当、確認観点へ変換し、会議後の実行につなげる。",
    icon: Sparkles,
  },
  {
    label: "経営会議コメント",
    copy: "数値変化の説明、論点、リスク、次アクションを会議体向けに整理する。",
    icon: FileText,
  },
];

const analyticsItems = [
  "予実分析",
  "見込分析",
  "KPI分析",
  "収益性分析",
  "部門・事業・商品別分析",
  "ダッシュボード",
];

const integrationLoopNodes = [
  {
    title: "経営アクション",
    copy: "判断が資源配分、改善施策、実行責任まで接続されている。",
  },
  {
    title: "判断インサイト",
    copy: "AIと分析が、経営会議で扱う論点と選択肢に変換されている。",
  },
  {
    title: "業務サイクル",
    copy: "予算、見込、実績、差異、アクションが同じリズムで回っている。",
  },
  {
    title: "管理会計データ",
    copy: "KPI、科目、組織、事業、商品、時間粒度の意味がそろっている。",
  },
  {
    title: "データ・AI基盤",
    copy: "連携、権限、監査、モデル運用が継続利用できる状態になっている。",
  },
];

const brokenLoopRisks = [
  {
    title: "KPI不一致",
    copy: "部門ごとに数字の意味が違い、会議で同じ前提に立てない。",
  },
  {
    title: "会議で説明不能",
    copy: "差異の理由と打ち手がつながらず、報告が確認作業で終わる。",
  },
  {
    title: "AIが業務に入らない",
    copy: "予測や要因分析が業務サイクルに入らず、実行判断に使われない。",
  },
  {
    title: "データ基盤が使われない",
    copy: "基盤はあるのに管理会計データと権限設計が追いつかず、利用が広がらない。",
  },
];

const approachRoutes = [
  {
    pattern: "パターン①",
    title: "構想主導型",
    steps: ["判断インサイト＆経営アクション", "業務サイクル＆管理会計データ", "データ・AI基盤"],
    fit: "経営会議や意思決定の変革を先に描ける場合に向いています。",
    caution: "業務とデータの実装条件を後追いにせず、構想段階から前提として置きます。",
    detail:
      "経営が何を判断し、どの打ち手へ接続したいかを先に定義します。そのうえで、会議体、予算・見込・実績の回し方、必要なデータとAI基盤を逆算します。",
    points: ["経営会議で扱う論点を決める", "判断から実行責任までの流れを描く", "必要な業務サイクルとデータ条件を逆算する"],
    output: "意思決定テーマ、経営アクション、必要データ、AI活用テーマが一枚につながった構想図。",
    visual: "backcast",
  },
  {
    pattern: "パターン②",
    title: "業務基軸型",
    steps: ["業務サイクル＆管理会計データ", "データ・AI基盤", "判断インサイト＆経営アクション"],
    fit: "予算、見込、実績管理の再設計が起点になる場合に向いています。",
    caution: "業務改善で止めず、AI活用と経営アクションへ接続します。",
    detail:
      "既に動いている経営管理業務を起点に、予算・見込・実績・差異分析の流れと管理会計データを整えます。そこからAI活用と経営アクションへ接続します。",
    points: ["業務サイクルの詰まりを特定する", "KPI、科目、組織、粒度をそろえる", "AIで強化する判断ポイントを埋め込む"],
    output: "予算・見込・実績の業務フロー、管理会計データ定義、AI活用ポイントを統合した運用設計。",
    visual: "cycle",
  },
  {
    pattern: "パターン③",
    title: "技術先行型",
    steps: ["データ・AI基盤", "判断インサイト＆経営アクション", "業務サイクル＆管理会計データ"],
    fit: "データ基盤やAI基盤の整備が先行している場合に向いています。",
    caution: "技術実装だけで終わらせず、判断と業務に戻します。",
    detail:
      "先行しているDWH、BI、AI基盤を、経営判断と業務サイクルに結び直します。使える技術から始めつつ、最後は会議体と管理会計データの設計へ戻します。",
    points: ["既存基盤で使えるデータとAI機能を棚卸しする", "経営判断に使えるユースケースへ翻訳する", "業務サイクルと管理会計データへ戻して定着させる"],
    output: "技術資産を経営判断、業務サイクル、管理会計データへ接続する活用ロードマップ。",
    visual: "platform",
  },
];

const foundationSectionNav = [
  { id: "overview", label: "全体構造" },
  { id: "integrated-state", label: "統合状態" },
  { id: "broken-loop", label: "分断リスク" },
];

const globalMenuItems: Array<{ id: PageId; label: string; sublabel: string }> = [
  { id: "home", label: "トップ", sublabel: "Top" },
  { id: "foundation", label: "統合経営管理基盤", sublabel: "Foundation" },
  { id: "approach", label: "基盤導入アプローチ", sublabel: "Approach" },
  { id: "layers", label: "レイヤー別論点", sublabel: "Issues" },
];

function Header({
  activePage,
  onNavigate,
}: {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.body.classList.add("menu-is-open");
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.classList.remove("menu-is-open");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const navigateFromMenu = (page: PageId) => {
    onNavigate(page);
    setOpen(false);
  };

  return (
    <>
      <header className={open ? "site-header site-header--menu-open" : "site-header"}>
        <button className="brand" type="button" onClick={() => navigateFromMenu("home")}>
          <span className="brand-mark">AI</span>
          <span>Management Intelligence</span>
        </button>
        <nav className="nav" aria-label="主要ページ">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={activePage === item.id ? "is-active" : ""}
                onClick={() => navigateFromMenu(item.id)}
              >
                <Icon size={15} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <button
          className="menu-button"
          type="button"
          aria-label={open ? "メニューを閉じる" : "メニューを開く"}
          aria-controls="global-menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>
      <div className={open ? "global-menu global-menu--open" : "global-menu"} id="global-menu" aria-hidden={!open}>
        <div className="global-menu__background" aria-hidden="true" />
        <nav className="global-menu__panel" aria-label="全画面メニュー">
          <span className="global-menu__eyebrow">Global navigation</span>
          <div className="global-menu__links">
            {globalMenuItems.map((item, index) => (
              <button
                className={activePage === item.id ? "is-active" : ""}
                key={item.id}
                type="button"
                data-menu-page={item.id}
                style={{ transitionDelay: open ? `${120 + index * 55}ms` : "0ms" }}
                onClick={() => navigateFromMenu(item.id)}
              >
                <span>{item.sublabel}</span>
                <strong>{item.label}</strong>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}

function SectionTrackerNav({ items }: { items: typeof foundationSectionNav }) {
  const [activeSection, setActiveSection] = useState(items[0]?.id ?? "");

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    let frame = 0;

    const updateActiveSection = () => {
      frame = 0;
      const triggerY = 180;
      let current = items[0].id;

      items.forEach((item) => {
        const section = document.getElementById(item.id);

        if (section && section.getBoundingClientRect().top <= triggerY) {
          current = item.id;
        }
      });

      setActiveSection(current);
    };

    const requestUpdate = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(updateActiveSection);
      }
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);

      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [items]);

  return (
    <nav className="section-tracker" aria-label="ページ内の現在地">
      <div className="section-tracker__inner">
        <span className="section-tracker__label">現在地</span>
        <div className="section-tracker__items">
          {items.map((item) => (
            <button
              className={activeSection === item.id ? "is-active" : ""}
              key={item.id}
              type="button"
              data-section-id={item.id}
              aria-current={activeSection === item.id ? "location" : undefined}
              onClick={() => {
                setActiveSection(item.id);
                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

function SectionHeading({
  eyebrow,
  title,
  body,
  invert = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  invert?: boolean;
}) {
  return (
    <div className={invert ? "section-heading section-heading--invert" : "section-heading"}>
      <p>{eyebrow}</p>
      <h2>{title}</h2>
      <span>{body}</span>
    </div>
  );
}

function PageIntro({
  eyebrow,
  title,
  body,
  tone = "light",
}: {
  eyebrow: string;
  title: string;
  body: string;
  tone?: "light" | "dark";
}) {
  return (
    <section className={tone === "dark" ? "page-intro page-intro--dark" : "page-intro"}>
      <div className="page-intro-copy">
        <p>{eyebrow}</p>
        <h1>{title}</h1>
        <span>{body}</span>
      </div>
    </section>
  );
}

function Overview() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = structureLayers[activeIndex];
  const lowerLayer = structureLayers[activeIndex + 1];

  return (
    <section className="section section--bright" id="overview">
      <SectionHeading
        eyebrow="Structure map"
        title="現代の経営管理基盤は、5つのレイヤーを統合して初めて成立する"
        body="AI、業務サイクル、管理会計データ、データ・AI基盤を個別に作るだけでは機能しません。経営アクションまで一貫してつながるように、全体をひとつの設計として統合することが重要です。"
      />
      <div className="pyramid-architecture">
        <div className="pyramid-panel" aria-label="経営管理高度化のピラミッド">
          <div className="pyramid-panel-title" aria-hidden="true">現代経営管理のピラミッド</div>
          <div className="pyramid-outline" aria-hidden="true" />
          <div className="pyramid-beam" aria-hidden="true" />
          <div className="integration-spine" aria-hidden="true" />
          <div className="integration-badge" aria-hidden="true">統合デザイン</div>
          <div className="pyramid-rim" aria-hidden="true" />
          <div className="pyramid-stack">
            {structureLayers.map((layer, index) => (
              <motion.button
                key={layer.title}
                type="button"
                className={[
                  "pyramid-layer",
                  `pyramid-layer--${index}`,
                  index === activeIndex ? "pyramid-layer--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setActiveIndex(index)}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <strong>{layer.title}</strong>
                <small>{layer.outcome}</small>
              </motion.button>
            ))}
          </div>
          <div className="pyramid-caption">
            <span>上位目的</span>
            <i aria-hidden="true" />
            <span>前提基盤</span>
          </div>
        </div>
        <aside className="pyramid-detail" aria-live="polite">
          <div className="integration-note">
            <span>統合デザインの要点</span>
            <strong>レイヤー単体ではなく、下位レイヤーと接続して初めて機能します。</strong>
          </div>
          <div className="detail-layer">
            <h3>{active.title}</h3>
            <strong>{active.outcome}</strong>
            <p>{active.body}</p>
          </div>
          <div className="layer-relation">
            <span>下位レイヤーが支えること</span>
            {lowerLayer ? (
              <>
                <div className="relation-chain">
                  <div className="relation-node relation-node--current">
                    <small>上位</small>
                    <strong>{active.title}</strong>
                  </div>
                  <div className="relation-support">
                    <span>支える</span>
                    <strong>{active.support}</strong>
                  </div>
                  <div className="relation-node relation-node--base">
                    <small>前提</small>
                    <strong>{lowerLayer.title}</strong>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="relation-support relation-support--base">
                  <span>支える</span>
                  <strong>{active.support}</strong>
                </div>
              </>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

function LayerIssues() {
  return (
    <section className="section section--bright" id="layer-issues">
      <SectionHeading
        eyebrow="Layer issues"
        title="各レイヤーで決めるべき論点をそろえる"
        body="上位の経営アクションから下位のデータ・AI基盤まで、何を決めると次の設計に進めるのかを整理します。"
      />
      <div className="layer-issue-grid">
        {structureLayers.map((layer) => (
          <article className="layer-issue-card" key={layer.title}>
            <div className="layer-issue-head">
              <span>{layer.outcome}</span>
              <h3>{layer.title}</h3>
            </div>
            <p>{layer.body}</p>
            <div className="layer-issue-support">
              <strong>接続論点</strong>
              <span>{layer.support}</span>
            </div>
            <div className="layer-issue-tags">
              {layer.items.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AIUseCases() {
  return (
    <section className="section section--dark" id="ai">
      <SectionHeading
        eyebrow="AI operating layer"
        title="AIを、分析結果の先にある実行へつなげる"
        body="予測や検知で終わらせず、会議で使える説明、施策候補、確認論点まで一続きにします。"
        invert
      />
      <div className="ai-lab">
        <div className="radar-board" aria-label="AIユースケース">
          <div className="radar-core">
            <BrainCircuit size={42} aria-hidden="true" />
            <span>AI</span>
          </div>
          {aiUseCases.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                className={`radar-node radar-node--${index}`}
                key={item.label}
                initial={false}
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.25 }}
              >
                <Icon size={20} aria-hidden="true" />
                <h3>{item.label}</h3>
                <p>{item.copy}</p>
              </motion.article>
            );
          })}
        </div>
        <aside className="ai-brief">
          <span>AI is not a chart add-on</span>
          <h3>経営管理の業務設計に埋め込む</h3>
          <p>
            AIは単独の機能ではなく、見込管理、差異分析、会議体、アクション管理の中に配置して初めて使われます。
            そのため、モデルよりも先に「誰が、どの数字を見て、何を決めるか」を定義します。
          </p>
          <div className="brief-flow">
            <span>Data</span>
            <ArrowRight size={15} aria-hidden="true" />
            <span>Insight</span>
            <ArrowRight size={15} aria-hidden="true" />
            <span>Decision</span>
            <ArrowRight size={15} aria-hidden="true" />
            <span>Action</span>
          </div>
        </aside>
      </div>
    </section>
  );
}

function TraditionalAnalytics() {
  const barSets = [
    [45, 62, 76, 68, 84],
    [70, 54, 88, 72, 92],
    [36, 48, 61, 78, 86],
    [58, 64, 69, 81, 79],
    [42, 71, 66, 83, 91],
    [77, 69, 82, 74, 89],
  ];

  return (
    <section className="section section--dashboard" id="traditional">
      <SectionHeading
        eyebrow="Management analytics"
        title="従来型分析を、AIの信頼できる土台にする"
        body="予実、見込、KPI、収益性、レポートは古いものではなく、AIが参照する経営管理の共通言語です。"
      />
      <div className="analytics-wall">
        {analyticsItems.map((item, index) => (
          <article className="analytics-tile" key={item}>
            <div className="tile-top">
              <span>{item}</span>
              <LineChart size={18} aria-hidden="true" />
            </div>
            <h3>{item}</h3>
            <p>定義済みの数字、責任単位、管理粒度をそろえ、AIが説明できる状態にする。</p>
            <div className="bar-chart" aria-hidden="true">
              {barSets[index % barSets.length].map((value, barIndex) => (
                <i key={`${item}-${barIndex}`} style={{ height: `${value}%` }} />
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function IntegratedOperatingLoop() {
  return (
    <section className="section section--bright" id="integrated-state">
      <SectionHeading
        eyebrow="Integrated operating loop"
        title="「統合している」とはどういう状態か"
        body="経営判断、業務サイクル、管理会計データ、データ・AI基盤が同じ目的と同じ定義でつながり、一つの運用ループとして回っている状態です。"
      />
      <div className="operating-loop">
        <div className="loop-visual" aria-label="統合された経営管理ループ">
          <div className="loop-orbit" aria-hidden="true" />
          <div className="loop-core">
            <span>Integrated core</span>
            <strong>統合経営管理基盤</strong>
            <small>判断・業務・データ・AIを一つの運用に束ねる</small>
          </div>
          {integrationLoopNodes.map((node, index) => (
            <motion.article
              className={`operating-node operating-node--${index}`}
              key={node.title}
              initial={false}
              whileHover={{ y: -3, scale: 1.02 }}
              transition={{ duration: 0.22 }}
            >
              <span>{node.title}</span>
              <p>{node.copy}</p>
            </motion.article>
          ))}
        </div>
        <div className="loop-summary">
          {[
            ["同じ目的", "経営アクションまでつながる目的で、AI、業務、データを設計する。"],
            ["同じ定義", "KPI、科目、組織、粒度をそろえ、数字の意味を会議で説明できる状態にする。"],
            ["同じ運用", "予算、見込、実績、分析、打ち手が途切れず回る業務リズムに載せる。"],
          ].map(([title, copy]) => (
            <article className="loop-summary-card" key={title}>
              <strong>{title}</strong>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BrokenManagementLoop() {
  return (
    <section className="section section--dark approach-horror-section" id="broken-loop">
      <SectionHeading
        eyebrow="Broken management loop"
        title="統合しないとどうなるか"
        body="レイヤーが分断されると、数字、会議、AI、基盤が別々に動き、現場の努力が経営判断に届かなくなります。"
        invert
      />
      <div className="broken-management-loop">
        <div className="broken-loop-visual" aria-label="分断された経営管理ループ">
          <div className="broken-loop-ring" aria-hidden="true" />
          <div className="broken-fracture broken-fracture--top" aria-hidden="true" />
          <div className="broken-fracture broken-fracture--right" aria-hidden="true" />
          <div className="broken-fracture broken-fracture--bottom" aria-hidden="true" />
          <div className="broken-loop-core">
            <span>Broken loop</span>
            <strong>分断された経営管理</strong>
            <small>数字はあるのに、判断と実行に接続しない</small>
          </div>
          {brokenLoopRisks.map((risk, index) => (
            <article className={`broken-risk-card broken-risk-card--${index}`} key={risk.title}>
              <span>{risk.title}</span>
              <p>{risk.copy}</p>
            </article>
          ))}
        </div>
        <aside className="horror-story">
          <span>Reality scenario</span>
          <h3>基盤はあるのに、経営管理が前に進まない</h3>
          <p>
            月次会議は数字の前提確認から始まり、AIの予測は参考資料扱いになります。
            整備したデータ基盤は業務の判断プロセスに入らず、最後は担当者の手作業と経験で報告を成立させる状態に戻ります。
          </p>
        </aside>
      </div>
    </section>
  );
}

function RouteDetailVisual({ variant }: { variant: string }) {
  if (variant === "cycle") {
    const cycleNodes = ["予算", "見込", "実績", "差異", "アクション"];

    return (
      <div className="route-visual route-visual--cycle" aria-label="業務サイクルを起点にした導入ビジュアル">
        <div className="route-visual-title">
          <span>Operating cycle</span>
          <strong>業務の回転にAIを埋め込む</strong>
        </div>
        <div className="cycle-diagram">
          <div className="cycle-ring" aria-hidden="true" />
          <div className="cycle-core">
            <strong>管理会計データ</strong>
            <span>KPI / 科目 / 組織 / 粒度</span>
          </div>
          {cycleNodes.map((node, index) => (
            <div className={`cycle-node cycle-node--${index}`} key={node}>
              {node}
            </div>
          ))}
          <div className="cycle-ai-bridge">AIで判断を強化</div>
        </div>
      </div>
    );
  }

  if (variant === "platform") {
    return (
      <div className="route-visual route-visual--platform" aria-label="技術基盤から業務へ戻す導入ビジュアル">
        <div className="route-visual-title">
          <span>Platform bridge</span>
          <strong>技術資産を経営管理へ接続する</strong>
        </div>
        <div className="platform-diagram">
          <div className="platform-cloud">
            <span>DWH</span>
            <span>BI</span>
            <span>AI基盤</span>
          </div>
          <div className="platform-stream" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="platform-ladder">
            <span>使えるデータ</span>
            <span>判断ユースケース</span>
            <span>業務サイクルへ定着</span>
          </div>
          <div className="platform-return">会議体・管理会計データへ戻す</div>
        </div>
      </div>
    );
  }

  return (
    <div className="route-visual route-visual--backcast" aria-label="構想から逆算する導入ビジュアル">
      <div className="route-visual-title">
        <span>Backcasting design</span>
        <strong>経営判断から必要条件を逆算する</strong>
      </div>
      <div className="backcast-diagram">
        <div className="backcast-target">
          <span>Target</span>
          <strong>経営判断を実行へ変える</strong>
        </div>
        <div className="backcast-lines" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className="backcast-stack">
          <span>論点・選択肢</span>
          <span>会議体・責任</span>
          <span>データ・AI条件</span>
        </div>
      </div>
    </div>
  );
}

function ApproachRouteMap() {
  const [activeRouteIndex, setActiveRouteIndex] = useState(0);

  return (
    <section className="section section--bright" id="route-map">
      <SectionHeading
        eyebrow="Route map"
        title="アプローチの順序"
        body="入口は構想、業務、技術のどこからでもよいですが、最終的には統合経営管理基盤へ合流させることが重要です。"
      />
      <div className="route-map">
        {approachRoutes.map((route, routeIndex) => {
          const isActive = activeRouteIndex === routeIndex;
          const detailId = `route-detail-${routeIndex}`;

          return (
            <article
              className={`route-card route-card--${routeIndex} ${isActive ? "route-card--active" : ""}`}
              key={route.title}
            >
              <button
                type="button"
                className="route-card-button"
                aria-expanded={isActive}
                aria-controls={detailId}
                onClick={() => setActiveRouteIndex(routeIndex)}
              >
                <div className="route-card-head">
                  <span>{route.pattern}</span>
                  <h3>{route.title}</h3>
                </div>
                <div className="route-steps" aria-label={`${route.title}の導入順序`}>
                  {route.steps.map((step, stepIndex) => (
                    <div className="route-step-pair" key={`${route.title}-${step}`}>
                      <strong className="route-step">{step}</strong>
                      {stepIndex < route.steps.length - 1 && (
                        <ArrowRight className="route-arrow" size={18} aria-hidden="true" />
                      )}
                    </div>
                  ))}
                  <div className="route-merge">
                    <ArrowRight size={18} aria-hidden="true" />
                    <strong>統合経営管理基盤</strong>
                  </div>
                </div>
                <span className="route-toggle">
                  {isActive ? "詳細を表示中" : "詳細を開く"}
                  <ChevronRight size={17} aria-hidden="true" />
                </span>
              </button>
              <motion.div
                id={detailId}
                className="route-detail"
                initial={false}
                animate={isActive ? "open" : "closed"}
                variants={{
                  open: { height: "auto", opacity: 1, y: 0 },
                  closed: { height: 0, opacity: 0, y: -8 },
                }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                aria-hidden={!isActive}
              >
                <div className="route-detail-inner">
                  <RouteDetailVisual variant={route.visual} />
                  <div className="route-detail-main">
                    <span>詳細</span>
                    <p>{route.detail}</p>
                  </div>
                  <div className="route-meta">
                    <p>
                      <strong>向く場面</strong>
                      {route.fit}
                    </p>
                    <p>
                      <strong>注意点</strong>
                      {route.caution}
                    </p>
                  </div>
                  <div className="route-point-grid">
                    {route.points.map((point) => (
                      <span key={point}>{point}</span>
                    ))}
                  </div>
                  <div className="route-output">
                    <strong>成果物</strong>
                    <span>{route.output}</span>
                  </div>
                </div>
              </motion.div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function FoundationPage() {
  return (
    <>
      <PageIntro
        eyebrow="Foundation"
        title="統合経営管理基盤"
        body="AIを活用した経営管理高度化を、5つのレイヤー、統合している状態、統合しない場合のリスクから整理します。"
      />
      <SectionTrackerNav items={foundationSectionNav} />
      <Overview />
      <IntegratedOperatingLoop />
      <BrokenManagementLoop />
    </>
  );
}

function ApproachPage() {
  return (
    <>
      <PageIntro
        eyebrow="Implementation approach"
        title="基盤導入アプローチ"
        body="構想、業務、技術のどこから始めても、最終的に統合経営管理基盤へ合流させる導入順序を整理します。"
      />
      <ApproachRouteMap />
    </>
  );
}

function LayersPage() {
  return (
    <>
      <PageIntro
        eyebrow="Layer issues"
        title="レイヤー別論点"
        body="経営アクション、判断インサイト、業務サイクル、管理会計データ、データ・AI基盤を個別に見直します。"
        tone="dark"
      />
      <LayerIssues />
      <AIUseCases />
      <TraditionalAnalytics />
    </>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState<PageId>(() => getPageFromHash());

  const navigateToPage = (page: PageId) => {
    setActivePage(page);
    window.history.pushState(null, "", page === "home" ? "#top" : `#${page}`);
    window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 0);
  };

  useEffect(() => {
    const syncPage = () => {
      setActivePage(getPageFromHash());
      window.setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
      }, 0);
    };

    window.addEventListener("hashchange", syncPage);
    window.addEventListener("popstate", syncPage);

    return () => {
      window.removeEventListener("hashchange", syncPage);
      window.removeEventListener("popstate", syncPage);
    };
  }, []);

  return (
    <>
      <Header activePage={activePage} onNavigate={navigateToPage} />
      <main>
        {activePage === "home" && <HomePage onNavigate={navigateToPage} />}
        {activePage === "foundation" && <FoundationPage />}
        {activePage === "approach" && <ApproachPage />}
        {activePage === "layers" && <LayersPage />}
      </main>
    </>
  );
}
