# Dynamic Sheets Reporter - 初期スキャフォールド

このプロジェクトは、TypeScript/webpack を用いて Apps Script 互換の .gs/.html を dist/ に生成し、clasp でデプロイする構成です。

## ディレクトリ

- build/
  - webpack.config.js … client/server を out/ にビルド
  - emit-gas.js … out/ から dist/ へ .gs/.html を生成
- src/
  - client/ … ブラウザ側（Index.html テンプレート、main.ts）
  - server/ … GAS 側（Code.ts, GeminiService.ts, SheetsService.ts）
  - shared/ … 共通型・バリデーション
- dist/ … 最終成果物（Apps Script 互換：.gs/.html）
- appsscript.json … GAS プロジェクト設定
- package.json … スクリプトや依存

## 最初の使い方

1. 依存をインストール
   - npm i

2. ビルド
   - npm run build

3. dist/ に Code.gs / Index.html などが生成されます

4. clasp で push/open（必要に応じてログインとプロジェクト紐付け）
   - npm run push
   - npm run open

## 動作検証

- Web アプリを開き、以下を確認:
  - ユーザー設定フォームで API Key および Model を設定して保存できる
  - ping ボタンで「pong」が返る

## 注意

- ローカル TypeScript では GAS の型が存在しないため、最小限の型シムを server/*.ts に定義しています（実行時は Apps Script のグローバルが利用されます）。
- Gemini API は Google AI Studio v1beta generateContent を使用します。API Key は User Properties に保存されます。