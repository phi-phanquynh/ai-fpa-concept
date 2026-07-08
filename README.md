# AI経営管理高度化コンセプト

AIを活用した経営管理高度化を提案するための公開コンセプトサイトです。静的なコンセプトサイトとして、経営意思決定、経営管理、分析、データ基盤、AI活用を一つのストーリーで見せます。

公開URL: https://phi-phanquynh.github.io/ai-fpa-concept/

## ローカル実行

```powershell
pnpm install
pnpm run dev
```

ビルド確認:

```powershell
pnpm run build
pnpm run preview
```

## 公開設定

GitHub Pagesで公開します。`main` ブランチにpushすると、`.github/workflows/deploy-pages.yml` が `dist/` をビルドして公開します。

カスタムドメインは使わず、CNAMEは追加しません。
