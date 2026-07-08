import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { homePageLinks } from "../siteContent";
import type { PageId } from "../siteContent";

const ArchitectureScene = lazy(() =>
  import("./ArchitectureScene").then((module) => ({ default: module.ArchitectureScene })),
);

type HomePageProps = {
  onNavigate: (page: PageId) => void;
};

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <section className="hero" id="top">
      <div className="hero-scene" aria-hidden="true">
        <Suspense fallback={<div className="scene-fallback" />}>
          <ArchitectureScene />
        </Suspense>
      </div>
      <div className="hero-scanlines" aria-hidden="true" />
      <div className="hero-content">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="eyebrow-row">
            <span>AI x 経営管理</span>
          </div>
          <h1>
            AI時代の経営管理基盤を
            <span>再構築する</span>
          </h1>
          <p>
            予実、見込、KPI、会議体、管理会計データ、AIエージェントをつなぎ、
            経営判断の速度と説明力を上げるためのコンセプトサイトです。
          </p>
          <nav className="page-link-rail" aria-label="ページ選択">
            {homePageLinks.map((page, index) => {
              const Icon = page.icon;

              return (
                <button
                  className={`page-link-card page-link-card--${index}`}
                  key={page.id}
                  type="button"
                  onClick={() => onNavigate(page.id)}
                >
                  <span className="page-link-step">{page.step}</span>
                  <span className="page-link-title">
                    <Icon size={18} aria-hidden="true" />
                    <strong>{page.label}</strong>
                  </span>
                  <span className="page-link-points">
                    {page.points.map((point) => (
                      <i key={point}>{point}</i>
                    ))}
                  </span>
                  <span className="page-link-open">
                    開く
                    <ArrowRight size={16} aria-hidden="true" />
                  </span>
                </button>
              );
            })}
          </nav>
        </motion.div>
      </div>
    </section>
  );
}
