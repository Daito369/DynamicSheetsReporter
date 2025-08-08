# 開発ガイド（ビルドとデプロイの手順）

本プロジェクトは TypeScript + webpack で out/ にビルドした後、emit-gas.js により Apps Script 互換の .gs/.html を dist/ に生成します。clasp で dist を push してください。

## 前提

- Node.js 18+
- clasp セットアップ済み（`clasp login` 済み）
- Google Apps Script プロジェクトに対して `appsscript.json` は本リポジトリのルートに配置（既に存在）
- ドメイン配布は `access=DOMAIN` を採用（実装計画書参照）

## 初回セットアップ

```sh
npm i
```

## ビルド

```sh
npm run build
# 内部:
# - webpack が client/server を project/DynamicSheetsReporter/out/ に出力
# - emit-gas.js が out/ から dist/ へ .gs/.html を生成
```

生成物:
- dist/Code.gs
- dist/GeminiService.gs
- dist/SheetsService.gs
- dist/Index.html

## ローカル開発（ウォッチ）

```sh
npm run dev
# webpack --watch と emit スクリプトを継続実行したい場合は
# ターミナル分割で `npm run build:webpack -- --watch` を使い、
# 変更後に手動で `npm run build:emit` を実行する運用も可能
```

## デプロイ

```sh
npm run push
npm run open
```

- `push` は dist/ の内容を GAS プロジェクトへ同期します
- 必要に応じて Google Apps Script のエディタから Web アプリとしてデプロイしてください

## 確認ポイント

- Web アプリ起動 → 設定保存（API Key, Model, Locale, Timezone）→ 成功表示
- ping ボタンで pong 表示

## トラブルシュート

- TypeScript が GAS の型を解決できない:
  - server/*.ts に最小限の型シムを定義済み。ローカルコンパイルは shims で通り、実行時は GAS のグローバルが使用されます。
- dist が生成されない:
  - `npm run build` のログを確認。out/ が生成され、次に emit-gas.js が dist/ を作ります。
- 429/5xx で Gemini エラー:
  - GeminiService の指数バックオフが機能しますが、恒常的なら API キー/クォータを確認してください。
