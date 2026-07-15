import fs from "node:fs";
import path from "node:path";

const siteUrl = "https://phi-phanquynh.github.io/ai-fpa-concept/";
const basePath = "/ai-fpa-concept/";
const workflowPath = path.join(".github", "workflows", "deploy-pages.yml");

const pages = [
  {
    source: "index.html",
    built: path.join("dist", "index.html"),
    publicUrl: siteUrl,
  },
  {
    source: "management-concept.html",
    built: path.join("dist", "management-concept.html"),
    publicUrl: `${siteUrl}management-concept.html`,
  },
];

const forbiddenPaths = [
  "CNAME",
  path.join("public", "CNAME"),
];

const requiredFiles = [
  workflowPath,
  path.join("public", "favicon.svg"),
  path.join("public", "og-image.svg"),
  path.join("public", "robots.txt"),
];

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const requiredPatterns = (publicUrl) => [
  {
    label: "canonical",
    pattern: new RegExp(
      `<link\\s+rel=["']canonical["']\\s+href=["']${escapeRegExp(publicUrl)}["']\\s*/?>`,
      "i",
    ),
  },
  { label: "description", pattern: /<meta\s+name=["']description["']\s+content=["'][^"']+["']\s*\/?>/i },
  { label: "og:title", pattern: /<meta\s+property=["']og:title["']\s+content=["'][^"']+["']\s*\/?>/i },
  {
    label: "og:url",
    pattern: new RegExp(
      `<meta\\s+property=["']og:url["']\\s+content=["']${escapeRegExp(publicUrl)}["']\\s*/?>`,
      "i",
    ),
  },
  {
    label: "og:image",
    pattern: new RegExp(
      `<meta\\s+property=["']og:image["']\\s+content=["']${escapeRegExp(siteUrl)}og-image\\.svg["']\\s*/?>`,
      "i",
    ),
  },
  { label: "twitter:card", pattern: /<meta\s+name=["']twitter:card["']\s+content=["']summary_large_image["']\s*\/?>/i },
];

const failures = [];

for (const file of forbiddenPaths) {
  if (fs.existsSync(file)) failures.push(`Unexpected custom-domain deployment file exists: ${file}`);
}

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) failures.push(`Required public deployment file is missing: ${file}`);
}

const distExists = fs.existsSync("dist");

for (const page of pages) {
  const scanTargets = [page.source, ...(distExists ? [page.built] : [])];

  for (const file of scanTargets) {
    if (!fs.existsSync(file)) {
      failures.push(`Required public page is missing: ${file}`);
      continue;
    }

    const html = fs.readFileSync(file, "utf8");
    if (/noindex|nofollow|noarchive/i.test(html)) {
      failures.push(`Search-blocking robots metadata found in ${file}`);
    }
    for (const check of requiredPatterns(page.publicUrl)) {
      if (!check.pattern.test(html)) failures.push(`Required public metadata "${check.label}" missing in ${file}`);
    }
    if (file === page.built && !html.includes(`${basePath}assets/`)) {
      failures.push(`Built asset paths do not appear to use the GitHub Pages base path in ${file}`);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Public GitHub Pages configuration check passed.");
