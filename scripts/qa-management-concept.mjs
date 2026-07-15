import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { chromium } from "playwright";
import { preview } from "vite";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceHtml = path.join(projectRoot, "management-concept.html");
const builtHtml = path.join(projectRoot, "dist", "management-concept.html");
const screenshotDir = path.join(projectRoot, "qa-screenshots", "management-concept");

const views = [
  { width: 1920, height: 1080 },
  { width: 1366, height: 768 },
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
      return {
        browser: await chromium.launch(attempt.options),
        label: attempt.label,
      };
    } catch (error) {
      failures.push(`${attempt.label}: ${error instanceof Error ? error.message.split("\n")[0] : String(error)}`);
    }
  }

  throw new Error(
    `Unable to launch a browser. Install Playwright Chromium or set PLAYWRIGHT_CHANNEL to an installed Chromium channel.\n${failures.join("\n")}`,
  );
}

function observeRuntimeErrors(page, label) {
  const errors = [];

  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`${label} console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`${label} pageerror: ${error.message}`));
  page.on("requestfailed", (request) => {
    errors.push(`${label} request failed: ${request.method()} ${request.url()} (${request.failure()?.errorText ?? "unknown"})`);
  });
  page.on("response", (response) => {
    if (response.status() >= 400) errors.push(`${label} HTTP ${response.status()}: ${response.url()}`);
  });

  return () => assert.deepEqual(errors, [], errors.join("\n"));
}

async function waitForHash(page, slug) {
  await page.waitForFunction((expected) => window.location.hash === `#${expected}`, slug);
}

async function assertTagetikScopeState(page, { pressed, visible }, label) {
  const toggle = page.locator("button.tagetik-toggle");
  const scope = page.locator(".tagetik-scope");

  assert.equal(await toggle.count(), 1, `${label}: exactly one Tagetik toggle button`);
  assert.equal(await scope.count(), 1, `${label}: exactly one Tagetik scope`);

  await page.waitForFunction(
    ({ expectedPressed, expectedVisible }) => {
      const targetToggle = document.querySelector("button.tagetik-toggle");
      const targetScope = document.querySelector(".tagetik-scope");
      if (!targetToggle || !targetScope) return false;

      const rect = targetScope.getBoundingClientRect();
      let visuallyVisible = rect.width > 0 && rect.height > 0;
      for (let current = targetScope; current && visuallyVisible; current = current.parentElement) {
        const style = getComputedStyle(current);
        visuallyVisible =
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          style.visibility !== "collapse" &&
          Number.parseFloat(style.opacity) > 0;
      }

      return (
        targetToggle.getAttribute("aria-pressed") === expectedPressed &&
        targetScope.classList.contains("is-visible") === expectedVisible &&
        visuallyVisible === expectedVisible
      );
    },
    { expectedPressed: String(pressed), expectedVisible: visible },
  );

  const state = await scope.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    let visuallyVisible = rect.width > 0 && rect.height > 0;
    for (let current = element; current && visuallyVisible; current = current.parentElement) {
      const style = getComputedStyle(current);
      visuallyVisible =
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        style.visibility !== "collapse" &&
        Number.parseFloat(style.opacity) > 0;
    }

    return {
      hasVisibleClass: element.classList.contains("is-visible"),
      visuallyVisible,
    };
  });

  assert.equal(await toggle.getAttribute("aria-pressed"), String(pressed), `${label}: aria-pressed`);
  assert.equal(state.hasVisibleClass, visible, `${label}: Tagetik scope visible class`);
  assert.equal(state.visuallyVisible, visible, `${label}: Tagetik scope visual visibility`);

  if (visible) {
    await assertTagetikScopeGeometry(page, label);
  }
}

async function assertTagetikScopeGeometry(page, label) {
  // Let the reveal transform settle before comparing the frame with its tiers.
  // Reduced-motion contexts complete this almost immediately; this also keeps
  // the assertion reliable if the transition implementation changes later.
  await page.waitForTimeout(50);

  const geometry = await page.evaluate(() => {
    const frame = document.querySelector(".tagetik-scope__frame");
    const cycle = document.querySelector(
      ".pyramid__tier-slot--cycle > .pyramid__tier",
    );
    const data = document.querySelector(
      ".pyramid__tier-slot--data > .pyramid__tier",
    );
    const platform = document.querySelector(
      ".pyramid__tier-slot--platform > .pyramid__tier",
    );
    const insight = document.querySelector(
      ".pyramid__tier-slot--insight > .pyramid__tier",
    );

    if (!frame || !cycle || !data || !platform || !insight) return null;

    const serialize = (element) => {
      const rect = element.getBoundingClientRect();
      return {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      };
    };

    const frameStyle = getComputedStyle(frame);
    return {
      frame: serialize(frame),
      cycle: serialize(cycle),
      data: serialize(data),
      platform: serialize(platform),
      insight: serialize(insight),
      borderWidths: [
        frameStyle.borderTopWidth,
        frameStyle.borderRightWidth,
        frameStyle.borderBottomWidth,
        frameStyle.borderLeftWidth,
      ].map(Number.parseFloat),
    };
  });

  assert.ok(geometry, `${label}: Tagetik frame and all pyramid tier slots exist`);

  const tolerance = 3;
  const { frame, cycle, data, platform, insight, borderWidths } = geometry;
  const targetLeft = Math.min(cycle.left, data.left);
  const targetRight = Math.max(cycle.right, data.right);
  const targetTop = Math.min(cycle.top, data.top);
  const targetBottom = Math.max(cycle.bottom, data.bottom);

  assert.ok(
    frame.left <= targetLeft + tolerance,
    `${label}: Tagetik frame encloses the cycle/data left edge (${JSON.stringify(geometry)})`,
  );
  assert.ok(
    frame.right >= targetRight - tolerance,
    `${label}: Tagetik frame encloses the cycle/data right edge (${JSON.stringify(geometry)})`,
  );
  assert.ok(
    frame.top <= targetTop + tolerance,
    `${label}: Tagetik frame encloses the cycle tier top (${JSON.stringify(geometry)})`,
  );
  assert.ok(
    frame.bottom >= targetBottom - tolerance,
    `${label}: Tagetik frame encloses the data tier bottom (${JSON.stringify(geometry)})`,
  );
  assert.ok(
    frame.top >= insight.bottom - tolerance,
    `${label}: Tagetik frame starts below the insight tier (${JSON.stringify(geometry)})`,
  );
  assert.ok(
    frame.bottom <= platform.top + tolerance,
    `${label}: Tagetik frame excludes the platform tier (${JSON.stringify(geometry)})`,
  );
  assert.ok(
    borderWidths.every((width) => Number.isFinite(width) && width >= 5),
    `${label}: Tagetik frame border remains presentation-weight (${borderWidths.join(", ")})`,
  );
}

async function assertActivePanel(page, panel, label) {
  await page.getByRole("tablist").waitFor({ state: "visible" });
  await page.getByRole("heading", { level: 1, name: panel.title, exact: true }).waitFor({ state: "visible" });

  assert.equal(new URL(page.url()).hash, `#${panel.slug}`, `${label}: URL hash`);
  assert.equal(await page.getByRole("tab").count(), 3, `${label}: exactly three tabs`);
  assert.equal(await page.locator('[role="tabpanel"]').count(), 3, `${label}: exactly three tab panels`);

  const selectedTabs = page.locator('[role="tab"][aria-selected="true"]');
  const visiblePanels = page.locator('[role="tabpanel"]:visible');
  const visibleHeadings = page.locator("h1:visible");

  assert.equal(await selectedTabs.count(), 1, `${label}: one selected tab`);
  assert.equal(await visiblePanels.count(), 1, `${label}: one visible tab panel`);
  assert.equal(await visibleHeadings.count(), 1, `${label}: one visible h1`);
  assert.equal(
    normalizeText((await selectedTabs.getAttribute("aria-label")) ?? ""),
    normalizeText(panel.tab),
    `${label}: selected tab accessible name`,
  );
  assert.equal(normalizeText(await visibleHeadings.innerText()), normalizeText(panel.title), `${label}: visible h1 text`);

  const activeTab = selectedTabs.first();
  const activePanel = visiblePanels.first();
  const controlledPanelId = await activeTab.getAttribute("aria-controls");
  const activeTabId = await activeTab.getAttribute("id");
  assert.ok(controlledPanelId, `${label}: selected tab has aria-controls`);
  assert.equal(await activePanel.getAttribute("id"), controlledPanelId, `${label}: selected tab controls visible panel`);
  assert.equal(await activePanel.getAttribute("aria-labelledby"), activeTabId, `${label}: panel is labelled by selected tab`);

  if (panel.slug === "foundation") {
    await assertTagetikScopeState(page, { pressed: false, visible: false }, `${label}: initial Tagetik state`);
  }

  if (panel.slug === "approach") {
    const visuals = activePanel.locator(".approach-card__visual");
    assert.equal(await visuals.count(), 3, `${label}: exactly three approach card visuals`);
    for (let index = 0; index < 3; index += 1) {
      assert.equal(
        await visuals.nth(index).evaluate((element) => element.tagName.toLowerCase()),
        "svg",
        `${label}: approach card visual ${index + 1} is an SVG`,
      );
    }
  }

  const interactionAudit = await page.evaluate(() => {
    const selectors = [
      "a",
      "button",
      "input",
      "select",
      "textarea",
      "details",
      "summary",
      "[contenteditable='true']",
      "[role='button']",
      "[role='link']",
      "[role='checkbox']",
      "[role='radio']",
      "[role='switch']",
      "[role='combobox']",
      "[role='menuitem']",
    ];
    const interactive = [...new Set(document.querySelectorAll(selectors.join(",")))];
    const tabs = [...document.querySelectorAll('button[role="tab"]')];
    const tagetikToggleElements = [...document.querySelectorAll(".tagetik-toggle")];
    const tagetikToggleButtons = [...document.querySelectorAll("button.tagetik-toggle")];
    const allowed = new Set([...tabs, ...tagetikToggleButtons]);
    return {
      interactiveCount: interactive.length,
      tabButtonCount: tabs.length,
      tagetikToggleElementCount: tagetikToggleElements.length,
      tagetikToggleButtonCount: tagetikToggleButtons.length,
      unexpected: interactive
        .filter((element) => !allowed.has(element))
        .map((element) => element.outerHTML.slice(0, 180)),
    };
  });

  assert.equal(interactionAudit.tabButtonCount, 3, `${label}: tabs are buttons`);
  assert.equal(interactionAudit.tagetikToggleElementCount, 1, `${label}: exactly one .tagetik-toggle element`);
  assert.equal(interactionAudit.tagetikToggleButtonCount, 1, `${label}: .tagetik-toggle is a button`);
  assert.equal(interactionAudit.interactiveCount, 4, `${label}: only tabs and the Tagetik toggle are interactive`);
  assert.deepEqual(interactionAudit.unexpected, [], `${label}: unexpected interactive elements`);

  const layout = await page.evaluate(() => {
    const tolerance = 1;
    const minimumTextSize = 18;
    const isVisible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    };
    const ownsVisibleText = (element) => {
      if (element.closest("svg, [hidden], [inert], [aria-hidden='true']")) return false;
      if (![...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim())) return false;
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
    const directText = (element) =>
      [...element.childNodes]
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent?.trim() ?? "")
        .filter(Boolean)
        .join(" ");
    const measure = (element) => {
      const rect = element.getBoundingClientRect();
      return {
        tag: element.tagName.toLowerCase(),
        qa: element.getAttribute("data-qa"),
        checkInternalOverflow: element.matches('[role="tabpanel"], [data-qa="panel-content"]'),
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        contained:
          rect.left >= -tolerance &&
          rect.top >= -tolerance &&
          rect.right <= window.innerWidth + tolerance &&
          rect.bottom <= window.innerHeight + tolerance,
        internalOverflowX: element.scrollWidth > element.clientWidth + tolerance,
        internalOverflowY: element.scrollHeight > element.clientHeight + tolerance,
      };
    };

    const keyContent = [...document.querySelectorAll('[data-qa="panel-content"]')].filter(isVisible);
    const activePanel = [...document.querySelectorAll('[role="tabpanel"]')].find(isVisible);
    const visibleHeading = [...document.querySelectorAll("h1")].find(isVisible);
    const tablist = document.querySelector('[role="tablist"]');
    const topUi = document.querySelector(".concept-chrome");
    const textScopes = [topUi, activePanel].filter(Boolean);
    const textElements = [
      ...new Set(
        textScopes.flatMap((scope) => [scope, ...scope.querySelectorAll("*")]).filter(ownsVisibleText),
      ),
    ];
    const undersizedText = textElements
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        className: element.className || "",
        text: directText(element).slice(0, 100),
        fontSize: Number.parseFloat(getComputedStyle(element).fontSize),
      }))
      .filter((item) => item.fontSize < minimumTextSize);

    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      document: {
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
      },
      body: {
        scrollWidth: document.body.scrollWidth,
        scrollHeight: document.body.scrollHeight,
      },
      keyContentCount: keyContent.length,
      measured: [activePanel, visibleHeading, tablist, ...keyContent].filter(Boolean).map(measure),
      textSizeAudit: {
        candidateCount: textElements.length,
        minimumTextSize,
        undersizedText,
      },
    };
  });

  assert.ok(layout.document.scrollWidth <= layout.viewport.width + 1, `${label}: no document horizontal overflow`);
  assert.ok(layout.document.scrollHeight <= layout.viewport.height + 1, `${label}: no document vertical overflow`);
  assert.ok(layout.body.scrollWidth <= layout.viewport.width + 1, `${label}: no body horizontal overflow`);
  assert.ok(layout.body.scrollHeight <= layout.viewport.height + 1, `${label}: no body vertical overflow`);
  assert.equal(layout.keyContentCount, 1, `${label}: active panel exposes one data-qa=panel-content wrapper`);
  assert.ok(layout.textSizeAudit.candidateCount > 0, `${label}: visible text size audit found candidates`);
  assert.deepEqual(
    layout.textSizeAudit.undersizedText,
    [],
    `${label}: visible panel and top UI text must be at least ${layout.textSizeAudit.minimumTextSize}px\n${JSON.stringify(
      layout.textSizeAudit.undersizedText,
      null,
      2,
    )}`,
  );

  for (const item of layout.measured) {
    assert.ok(item.contained, `${label}: ${item.qa ?? item.tag} stays within the viewport (${JSON.stringify(item)})`);
    if (item.checkInternalOverflow) {
      assert.equal(item.internalOverflowX, false, `${label}: ${item.qa ?? item.tag} has no clipped horizontal content`);
      assert.equal(item.internalOverflowY, false, `${label}: ${item.qa ?? item.tag} has no clipped vertical content`);
    }
  }
}

async function runViewportMatrix(browser, baseUrl) {
  for (const view of views) {
    const viewportLabel = `${view.width}x${view.height}`;
    const context = await browser.newContext({ viewport: view, reducedMotion: "reduce" });
    const page = await context.newPage();
    const assertNoRuntimeErrors = observeRuntimeErrors(page, viewportLabel);

    for (const panel of panels) {
      const label = `${viewportLabel} #${panel.slug}`;
      await page.goto(new URL(`management-concept.html#${panel.slug}`, baseUrl).href, { waitUntil: "load" });
      await assertActivePanel(page, panel, label);

      if (panel.slug === "foundation") {
        const tagetikToggle = page.locator("button.tagetik-toggle");
        await tagetikToggle.click();
        await assertTagetikScopeState(
          page,
          { pressed: true, visible: true },
          `${label}: Tagetik geometry`,
        );
        await tagetikToggle.click();
        await assertTagetikScopeState(
          page,
          { pressed: false, visible: false },
          `${label}: Tagetik reset`,
        );
      }

      await page.screenshot({
        path: path.join(screenshotDir, `${viewportLabel}-${panel.slug}.png`),
        animations: "disabled",
      });
      console.log(`✓ ${label}`);
    }

    assertNoRuntimeErrors();
    await context.close();
  }
}

async function runInteractionFlow(browser, baseUrl) {
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  const assertNoRuntimeErrors = observeRuntimeErrors(page, "interaction flow");

  await page.goto(new URL("management-concept.html#ai", baseUrl).href, { waitUntil: "load" });
  await assertActivePanel(page, panels[0], "interaction initial load");

  await page.getByRole("tab", { name: panels[1].tab, exact: true }).click();
  await waitForHash(page, panels[1].slug);
  await assertActivePanel(page, panels[1], "interaction click");

  const tagetikToggle = page.locator("button.tagetik-toggle");
  await tagetikToggle.click();
  await assertTagetikScopeState(
    page,
    { pressed: true, visible: true },
    "interaction Tagetik scope after first click",
  );
  await page.screenshot({
    path: path.join(screenshotDir, "1366x768-foundation-tagetik.png"),
    animations: "disabled",
  });
  await tagetikToggle.click();
  await assertTagetikScopeState(
    page,
    { pressed: false, visible: false },
    "interaction Tagetik scope after second click",
  );

  await page.getByRole("tab", { name: panels[2].tab, exact: true }).click();
  await waitForHash(page, panels[2].slug);
  await assertActivePanel(page, panels[2], "interaction second click");

  await page.goBack();
  await waitForHash(page, panels[1].slug);
  await assertActivePanel(page, panels[1], "interaction history back");

  await page.goForward();
  await waitForHash(page, panels[2].slug);
  await assertActivePanel(page, panels[2], "interaction history forward");

  await page.reload({ waitUntil: "load" });
  await assertActivePanel(page, panels[2], "interaction reload");

  await page.getByRole("tab", { name: panels[2].tab, exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await waitForHash(page, panels[0].slug);
  await assertActivePanel(page, panels[0], "interaction ArrowRight wrap");

  await page.keyboard.press("ArrowLeft");
  await waitForHash(page, panels[2].slug);
  await assertActivePanel(page, panels[2], "interaction ArrowLeft wrap");

  assertNoRuntimeErrors();
  await context.close();
  console.log("✓ click, keyboard, reload, back and forward navigation");
}

async function runMotionAudit(browser, baseUrl) {
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  const assertNoRuntimeErrors = observeRuntimeErrors(page, "motion audit");

  await page.goto(new URL("management-concept.html#ai", baseUrl).href, { waitUntil: "load" });
  await page.locator(".ai-core__orbit").waitFor({ state: "visible" });
  const coreOrbitAnimation = await page.locator(".ai-core__orbit").evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      animationName: style.animationName,
      animationDuration: style.animationDuration,
    };
  });
  assert.notEqual(
    coreOrbitAnimation.animationName,
    "none",
    `motion audit: AI Core orbit has an animation-name (${JSON.stringify(coreOrbitAnimation)})`,
  );

  await page.goto(new URL("management-concept.html#approach", baseUrl).href, { waitUntil: "load" });
  await page.locator(".approach-card__visual .visual-flow").first().waitFor({ state: "visible" });
  const approachFlowAnimations = await page
    .locator(".approach-card__visual .visual-flow")
    .evaluateAll((elements) =>
      elements.map((element) => {
        const style = getComputedStyle(element);
        return {
          animationName: style.animationName,
          animationDuration: style.animationDuration,
        };
      }),
    );

  assert.ok(approachFlowAnimations.length > 0, "motion audit: approach SVGs expose flow paths");
  assert.ok(
    approachFlowAnimations.every(({ animationName }) => animationName !== "none"),
    `motion audit: every approach visual-flow has an animation-name (${JSON.stringify(approachFlowAnimations)})`,
  );

  assertNoRuntimeErrors();
  await context.close();
  console.log("✓ AI Core orbit and approach flow motion");
}

async function runExistingSiteSmoke(browser, baseUrl) {
  const routes = [
    { hash: "top", title: "AI時代の経営管理基盤を再構築する" },
    { hash: "foundation", title: "統合経営管理基盤" },
    { hash: "approach", title: "基盤導入アプローチ" },
    { hash: "layers", title: "レイヤー別論点" },
  ];
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  const assertNoRuntimeErrors = observeRuntimeErrors(page, "existing site smoke");

  for (const route of routes) {
    await page.goto(new URL(`#${route.hash}`, baseUrl).href, { waitUntil: "load" });
    const visibleHeading = page.locator("h1:visible");
    await visibleHeading.waitFor({ state: "visible" });
    assert.equal(await visibleHeading.count(), 1, `existing site #${route.hash}: one visible h1`);
    assert.equal(
      normalizeText(await visibleHeading.innerText()),
      normalizeText(route.title),
      `existing site #${route.hash}: correct h1`,
    );
    console.log(`✓ existing site #${route.hash}`);
  }

  assertNoRuntimeErrors();
  await context.close();
}

async function runDirectFileGuidance(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(pathToFileURL(sourceHtml).href, { waitUntil: "load" });
  await page
    .getByRole("heading", { level: 1, name: "ローカルサーバーから開いてください", exact: true })
    .waitFor({ state: "visible" });
  assert.equal(
    await page.locator("html").getAttribute("data-file-open"),
    "true",
    "direct file open shows launcher guidance instead of a blank page",
  );
  await context.close();
  console.log("✓ direct file open guidance");
}

let previewServer;
let browser;

try {
  await fs.access(builtHtml);
} catch {
  console.error("dist/management-concept.html is missing. Run `pnpm build` before `pnpm qa:management-concept`.");
  process.exitCode = 1;
}

if (process.exitCode !== 1) {
  try {
    await fs.mkdir(screenshotDir, { recursive: true });
    previewServer = await preview({
      root: projectRoot,
      logLevel: "error",
      preview: { host: "127.0.0.1", port: 0, strictPort: false },
    });

    const address = previewServer.httpServer.address();
    assert.ok(address && typeof address !== "string", "Vite preview did not expose a TCP port");
    const basePath = previewServer.config.base.replace(/^\/+|\/+$/gu, "");
    const baseUrl = `http://127.0.0.1:${address.port}/${basePath}/`;

    const launched = await launchAvailableBrowser();
    browser = launched.browser;
    console.log(`Browser: ${launched.label}`);
    console.log(`Preview: ${baseUrl}`);

    await runViewportMatrix(browser, baseUrl);
    await runInteractionFlow(browser, baseUrl);
    await runMotionAudit(browser, baseUrl);
    await runExistingSiteSmoke(browser, baseUrl);
    await runDirectFileGuidance(browser);
    console.log(`Management concept QA passed. Screenshots: ${path.relative(projectRoot, screenshotDir)}`);
  } catch (error) {
    console.error(error instanceof Error ? error.stack : error);
    process.exitCode = 1;
  } finally {
    await browser?.close();
    await previewServer?.close();
  }
}
