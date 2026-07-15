import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { chromium } from "playwright";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const standaloneHtml = path.join(projectRoot, "ET&O_AI経営管理のコンセプト.html");
const standaloneUrl = pathToFileURL(standaloneHtml).href;

const views = [
  { width: 1920, height: 1080 },
  { width: 1280, height: 720 },
];

const panels = [
  {
    slug: "ai",
    tab: "AIで変わる経営管理",
    title: "AIによって進化する経営管理",
  },
  {
    slug: "foundation",
    tab: "5レイヤーの統合",
    title: "AIを活用した経営管理基盤は5つのレイヤーを統合して初めて成立する",
  },
  {
    slug: "approach",
    tab: "導入アプローチ",
    title: "基盤導入アプローチに定石はなく、自社のスタイルに合わせて定める必要がある",
  },
];

const normalizeText = (value) => value.replace(/\s+/gu, "");

async function assertSelfContainedMarkup() {
  const html = await fs.readFile(standaloneHtml, "utf8");
  const scriptTags = html.match(/<script\b[^>]*>/giu) ?? [];
  const stylesheetLinks = (html.match(/<link\b[^>]*>/giu) ?? []).filter(
    (tag) =>
      /\brel\s*=\s*(?:"[^"]*\bstylesheet\b[^"]*"|'[^']*\bstylesheet\b[^']*'|stylesheet\b)/iu.test(tag),
  );
  const inlineScripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/giu)]
    .map((match) => match[1])
    .join("\n");
  const inlineStyles = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/giu)]
    .map((match) => match[1])
    .join("\n");

  assert.ok(html.trim().length > 0, "standalone HTML is not empty");
  assert.deepEqual(
    scriptTags.filter((tag) => /\bsrc\s*=/iu.test(tag)),
    [],
    "standalone HTML must not reference external script files",
  );
  assert.deepEqual(
    stylesheetLinks,
    [],
    "standalone HTML must not reference linked stylesheets",
  );
  assert.doesNotMatch(inlineStyles, /@import\s+(?:url\s*\()?\s*["']/iu, "inline CSS must not use @import");
  assert.doesNotMatch(
    inlineScripts,
    /(?:^|[;\n}])\s*import\s+(?:["'{*A-Za-z_$])|\bimport\s*\(\s*["'`]/mu,
    "inline JavaScript must not contain import references",
  );
  assert.doesNotMatch(
    inlineScripts,
    /(?:^|[;\n}])\s*export\s+(?:\*|\{|default\b|const\b|let\b|var\b|function\b|class\b)/mu,
    "inline JavaScript must not contain module references",
  );
}

async function launchAvailableBrowser() {
  const requestedChannel = process.env.PLAYWRIGHT_CHANNEL?.trim();
  const attempts = requestedChannel
    ? [{ label: requestedChannel, options: { headless: true, channel: requestedChannel } }]
    : [
        { label: "Playwright Chromium", options: { headless: true } },
        { label: "Microsoft Edge", options: { headless: true, channel: "msedge" } },
      ];

  const failures = [];
  for (const attempt of attempts) {
    try {
      return { browser: await chromium.launch(attempt.options), label: attempt.label };
    } catch (error) {
      failures.push(`${attempt.label}: ${error instanceof Error ? error.message.split("\n")[0] : String(error)}`);
    }
  }

  throw new Error(
    `Unable to launch a browser. Install Playwright Chromium or set PLAYWRIGHT_CHANNEL to an installed Chromium channel.\n${failures.join("\n")}`,
  );
}

function observeRuntime(page, label) {
  const errors = [];
  const subresourceRequests = [];

  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`${label} console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`${label} pageerror: ${error.message}`));
  page.on("requestfailed", (request) => {
    errors.push(`${label} request failed: ${request.method()} ${request.url()} (${request.failure()?.errorText ?? "unknown"})`);
  });
  page.on("request", (request) => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) return;
    if (request.url().startsWith("data:") || request.url().startsWith("blob:")) return;
    subresourceRequests.push(`${request.resourceType()}: ${request.url()}`);
  });

  return () => {
    assert.deepEqual(errors, [], errors.join("\n"));
    assert.deepEqual(
      subresourceRequests,
      [],
      `${label}: standalone page must not request files or network resources\n${subresourceRequests.join("\n")}`,
    );
  };
}

async function waitForHash(page, slug) {
  await page.waitForFunction((expected) => window.location.hash === `#${expected}`, slug);
}

async function assertLayoutAndType(page, label) {
  const audit = await page.evaluate(() => {
    const minimumFontSize = 18;
    const tolerance = 1;
    const activePanel = document.querySelector('[role="tabpanel"]:not([hidden])');
    const panelContent = activePanel?.querySelector('[data-qa="panel-content"]') ?? null;
    const topUi = document.querySelector(".concept-chrome");

    const ownsVisibleText = (element) => {
      if (![...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim())) {
        return false;
      }
      if (element.getClientRects().length === 0) return false;
      for (let current = element; current; current = current.parentElement) {
        const style = getComputedStyle(current);
        if (
          style.display === "none" ||
          style.visibility === "hidden" ||
          style.visibility === "collapse" ||
          Number.parseFloat(style.opacity) === 0
        ) {
          return false;
        }
      }
      return true;
    };

    const scopes = [topUi, activePanel].filter(Boolean);
    const textElements = [
      ...new Set(scopes.flatMap((scope) => [scope, ...scope.querySelectorAll("*")]).filter(ownsVisibleText)),
    ];
    const undersizedText = textElements
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        className: typeof element.className === "string" ? element.className : element.getAttribute("class") ?? "",
        text: [...element.childNodes]
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((node) => node.textContent?.trim() ?? "")
          .filter(Boolean)
          .join(" ")
          .slice(0, 100),
        fontSize: Number.parseFloat(getComputedStyle(element).fontSize),
      }))
      .filter(({ fontSize }) => fontSize < minimumFontSize);

    const heading = activePanel?.querySelector("h1") ?? null;
    let headingLineCount = 0;
    if (heading) {
      const range = document.createRange();
      range.selectNodeContents(heading);
      const lineTops = [...range.getClientRects()].map((rect) => Math.round(rect.top));
      headingLineCount = new Set(lineTops).size;
    }

    const measureSurface = (element) => {
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return {
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
        scrollHeight: element.scrollHeight,
        clientHeight: element.clientHeight,
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
      };
    };

    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      document: {
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
      },
      body: { width: document.body.scrollWidth, height: document.body.scrollHeight },
      activePanel: measureSurface(activePanel),
      panelContent: measureSurface(panelContent),
      headingLineCount,
      textCandidateCount: textElements.length,
      undersizedText,
      tolerance,
    };
  });

  assert.ok(audit.activePanel, `${label}: active panel exists`);
  assert.ok(audit.panelContent, `${label}: active panel content exists`);
  assert.ok(audit.document.width <= audit.viewport.width + audit.tolerance, `${label}: no document horizontal scroll`);
  assert.ok(audit.document.height <= audit.viewport.height + audit.tolerance, `${label}: no document vertical scroll`);
  assert.ok(audit.body.width <= audit.viewport.width + audit.tolerance, `${label}: no body horizontal scroll`);
  assert.ok(audit.body.height <= audit.viewport.height + audit.tolerance, `${label}: no body vertical scroll`);
  assert.ok(
    audit.activePanel.scrollWidth <= audit.activePanel.clientWidth + audit.tolerance,
    `${label}: no active-panel horizontal clipping`,
  );
  assert.ok(
    audit.activePanel.scrollHeight <= audit.activePanel.clientHeight + audit.tolerance,
    `${label}: no active-panel vertical clipping`,
  );
  assert.ok(audit.activePanel.left >= -audit.tolerance, `${label}: active panel stays inside left edge`);
  assert.ok(audit.activePanel.top >= -audit.tolerance, `${label}: active panel stays inside top edge`);
  assert.ok(audit.activePanel.right <= audit.viewport.width + audit.tolerance, `${label}: active panel stays inside right edge`);
  assert.ok(audit.activePanel.bottom <= audit.viewport.height + audit.tolerance, `${label}: active panel stays inside bottom edge`);
  assert.ok(
    audit.panelContent.scrollWidth <= audit.panelContent.clientWidth + audit.tolerance,
    `${label}: no panel-content horizontal clipping`,
  );
  assert.ok(
    audit.panelContent.scrollHeight <= audit.panelContent.clientHeight + audit.tolerance,
    `${label}: no panel-content vertical clipping`,
  );
  assert.ok(audit.panelContent.left >= -audit.tolerance, `${label}: panel content stays inside left edge`);
  assert.ok(audit.panelContent.top >= -audit.tolerance, `${label}: panel content stays inside top edge`);
  assert.ok(audit.panelContent.right <= audit.viewport.width + audit.tolerance, `${label}: panel content stays inside right edge`);
  assert.ok(audit.panelContent.bottom <= audit.viewport.height + audit.tolerance, `${label}: panel content stays inside bottom edge`);
  assert.equal(audit.headingLineCount, 1, `${label}: title remains on one line`);
  assert.ok(audit.textCandidateCount > 0, `${label}: visible text audit found candidates`);
  assert.deepEqual(
    audit.undersizedText,
    [],
    `${label}: every visible text element must be at least 18px\n${JSON.stringify(audit.undersizedText, null, 2)}`,
  );
}

async function assertPanel(page, panel, label) {
  await page.getByRole("heading", { level: 1, name: panel.title, exact: true }).waitFor({ state: "visible" });

  assert.equal(page.url().startsWith("file:"), true, `${label}: page runs directly from file://`);
  assert.equal(new URL(page.url()).hash, `#${panel.slug}`, `${label}: URL hash`);
  assert.equal(await page.title(), "ET&O AI経営管理のコンセプト", `${label}: document title`);
  assert.equal(await page.getByRole("tab").count(), 3, `${label}: exactly three tabs`);
  assert.equal(await page.locator('[role="tabpanel"]').count(), 3, `${label}: exactly three tab panels`);
  assert.equal(await page.locator('[role="tabpanel"]:visible').count(), 1, `${label}: exactly one visible panel`);
  assert.equal(await page.locator('[role="tab"][aria-selected="true"]').count(), 1, `${label}: exactly one selected tab`);
  assert.equal(
    normalizeText((await page.locator('[role="tab"][aria-selected="true"]').getAttribute("aria-label")) ?? ""),
    normalizeText(panel.tab),
    `${label}: selected tab name`,
  );

  if (panel.slug === "approach") {
    const visuals = page.locator('[role="tabpanel"]:visible .approach-card__visual');
    assert.equal(await visuals.count(), 3, `${label}: exactly three approach visuals`);
    for (let index = 0; index < 3; index += 1) {
      assert.equal(
        await visuals.nth(index).evaluate((element) => element.tagName.toLowerCase()),
        "svg",
        `${label}: visual ${index + 1} is inline SVG`,
      );
    }
  }

  await assertLayoutAndType(page, label);
}

async function runViewport(browser, view) {
  const viewportLabel = `${view.width}x${view.height}`;
  const context = await browser.newContext({ viewport: view, reducedMotion: "reduce" });
  const page = await context.newPage();
  const assertRuntimeClean = observeRuntime(page, viewportLabel);

  for (const panel of panels) {
    const label = `${viewportLabel} #${panel.slug}`;
    await page.goto(`${standaloneUrl}#${panel.slug}`, { waitUntil: "load" });
    await assertPanel(page, panel, label);
    console.log(`✓ ${label}`);
  }

  assertRuntimeClean();
  await context.close();
}

async function runInteractionFlow(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  const assertRuntimeClean = observeRuntime(page, "interaction flow");

  await page.goto(`${standaloneUrl}#ai`, { waitUntil: "load" });
  await assertPanel(page, panels[0], "interaction initial state");

  await page.getByRole("tab", { name: panels[1].tab, exact: true }).click();
  await waitForHash(page, "foundation");
  await assertPanel(page, panels[1], "interaction tab click");

  const tagetikToggle = page.locator("button.tagetik-toggle");
  const tagetikScope = page.locator(".tagetik-scope");
  assert.equal(await tagetikToggle.count(), 1, "interaction: exactly one Tagetik toggle");
  assert.equal(await tagetikScope.count(), 1, "interaction: exactly one Tagetik scope");
  assert.equal(await tagetikToggle.getAttribute("aria-pressed"), "false", "interaction: Tagetik starts hidden");
  await tagetikToggle.click();
  await page.waitForFunction(() => document.querySelector(".tagetik-scope")?.classList.contains("is-visible"));
  assert.equal(await tagetikToggle.getAttribute("aria-pressed"), "true", "interaction: Tagetik toggle shows scope");
  assert.equal(await tagetikScope.getAttribute("aria-hidden"), "false", "interaction: shown Tagetik scope is exposed");
  await tagetikToggle.click();
  await page.waitForFunction(() => !document.querySelector(".tagetik-scope")?.classList.contains("is-visible"));
  assert.equal(await tagetikToggle.getAttribute("aria-pressed"), "false", "interaction: Tagetik toggle hides scope");
  assert.equal(await tagetikScope.getAttribute("aria-hidden"), "true", "interaction: hidden Tagetik scope is concealed");

  await page.getByRole("tab", { name: panels[1].tab, exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await waitForHash(page, "approach");
  await assertPanel(page, panels[2], "interaction ArrowRight");
  await page.keyboard.press("ArrowLeft");
  await waitForHash(page, "foundation");
  await assertPanel(page, panels[1], "interaction ArrowLeft");

  await page.evaluate(() => {
    window.location.hash = "approach";
  });
  await waitForHash(page, "approach");
  await assertPanel(page, panels[2], "interaction direct hash switch");

  assertRuntimeClean();
  await context.close();
  console.log("✓ tabs, direct hash, keyboard navigation and Tagetik toggle");
}

let browser;

try {
  await fs.access(standaloneHtml);
  await assertSelfContainedMarkup();
  console.log(`✓ standalone markup: ${path.basename(standaloneHtml)}`);

  const launched = await launchAvailableBrowser();
  browser = launched.browser;
  console.log(`Browser: ${launched.label}`);
  console.log(`Direct file: ${standaloneUrl}`);

  for (const view of views) {
    await runViewport(browser, view);
  }
  await runInteractionFlow(browser);
  console.log("Standalone management concept QA passed without an HTTP server.");
} catch (error) {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
} finally {
  await browser?.close();
}
