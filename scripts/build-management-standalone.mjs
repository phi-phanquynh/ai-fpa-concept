import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { writeFile } from "node:fs/promises";
import react from "@vitejs/plugin-react";
import { build as viteBuild } from "vite";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "..");
const entryPoint = resolve(repositoryRoot, "src/management-concept/main.tsx");
const outputPath = resolve(repositoryRoot, "ET&O_AI経営管理のコンセプト.html");

const buildResult = await viteBuild({
  configFile: false,
  root: repositoryRoot,
  base: "./",
  plugins: [react()],
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  build: {
    write: false,
    target: ["chrome100", "edge100", "firefox100", "safari15.4"],
    minify: "esbuild",
    cssCodeSplit: false,
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    modulePreload: false,
    rollupOptions: {
      input: entryPoint,
      output: {
        format: "iife",
        inlineDynamicImports: true,
        entryFileNames: "management-concept.js",
        assetFileNames: "management-concept.[ext]",
      },
    },
  },
});

const rollupOutputs = Array.isArray(buildResult) ? buildResult : [buildResult];
const emittedFiles = rollupOutputs.flatMap((result) => result.output);
const javascriptFiles = emittedFiles.filter(
  (file) => file.type === "chunk" && file.isEntry,
);
const stylesheetFiles = emittedFiles.filter(
  (file) => file.type === "asset" && file.fileName.endsWith(".css"),
);

if (javascriptFiles.length !== 1) {
  throw new Error(`Expected one JavaScript bundle, received ${javascriptFiles.length}.`);
}

const javascript = javascriptFiles[0].code.replace(/<\/script/gi, "<\\/script");
const stylesheet = stylesheetFiles
  .map((file) =>
    typeof file.source === "string"
      ? file.source
      : new TextDecoder().decode(file.source),
  )
  .join("\n")
  .replace(/<\/style/gi, "<\\/style");

const faviconSvg = encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="15" fill="#082038"/><path d="M20 32a12 12 0 0 1 24 0 12 12 0 0 1-24 0Z" fill="none" stroke="#45ddd2" stroke-width="4"/><circle cx="32" cy="32" r="4" fill="#45ddd2"/><path d="M32 13v7M51 32h-7M32 51v-7M13 32h7" stroke="#45ddd2" stroke-width="4" stroke-linecap="round"/></svg>',
);

const html = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="AIによって進化する経営管理、5レイヤーの統合、基盤導入アプローチを全画面図解で紹介するET&amp;O向けコンセプト資料。"
    />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="ja_JP" />
    <meta property="og:title" content="ET&amp;O AI経営管理のコンセプト" />
    <meta
      property="og:description"
      content="AIによって進化する経営管理、5レイヤーの統合、基盤導入アプローチを一続きの図解で紹介します。"
    />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,${faviconSvg}" />
    <title>ET&amp;O AI経営管理のコンセプト</title>
    <style>${stylesheet}</style>
  </head>
  <body>
    <div id="root"></div>
    <script>${javascript}</script>
  </body>
</html>
`;

await writeFile(outputPath, html, "utf8");

console.log(`Standalone HTML created: ${outputPath}`);
