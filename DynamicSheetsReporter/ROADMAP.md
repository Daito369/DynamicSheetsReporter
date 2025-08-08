# Dynamic Sheets Reporter v2.0 実装ロードマップ

本ロードマップは、実装計画書（参照: [`project/DynamicSheetsReporter/実装計画書.md`](project/DynamicSheetsReporter/実装計画書.md)）に基づき、実装を段階的に完了させるためのステップ形式の計画である。各ステップは 2〜5 日規模を想定し、完了基準（Definition of Done; DoD）と成果物（Artifacts）を明記する。

## 0. 準備フェーズ（Day 0）

- 目的: 開発環境、マニフェスト、最小構成の整備
- タスク
  - Node/Clasp/TypeScript/Vue 開発環境整備
  - dist ディレクトリ出力のビルド配線確認（webpack）
  - appsscript.json の executeAs=USER_ACCESSING, access=DOMAIN, スコープ最小化の確認
  - 空の GAS プロジェクトに clasp push → Web アプリ最小デプロイ
- DoD
  - デプロイ URL が発行され、index が描画される
- 成果物
  - appsscript.json 最終版、初期デプロイ記録

## 1. コア・スキャフォールド（サーバ/クライアント）（Sprint 1）

- 目的: 最小 API と SPA 骨格の確立
- タスク
  - /src/server: main.ts, controllers/*, services/*, utils/*, common/*
  - /src/client: AppShell, ルータ無し単一ページ、API クライアント（[`src/client/services/ApiClient.ts`](src/client/services/ApiClient.ts)）
  - google.script.run Promise ラッパ実装
  - LoggingService（構造化ログ with traceId）
- DoD
  - /health 代替の簡易 API が往復し、UI でレスポンス表示
- 成果物
  - コード骨格、ログ出力方針

## 2. ユーザー設定（API キー/モデル）（Sprint 2）

- 目的: AI Studio API キー/モデルをユーザー毎に保存・読み出し
- タスク
  - UserSettingsController: saveUserSettings, getUserSettings
  - PropertiesService(User) への保存実装、Validation
  - SettingsModal UI と保存/読込フロー
- DoD
  - 設定保存/再読込が UI で確認可能、API キーはクライアントに露出しない
- 成果物
  - UserSettings 型、E2E 動作

## 3. GeminiService v1beta 接続（Sprint 3）

- 目的: generateContent エンドポイント接続とエラー制御
- タスク
  - UrlFetchApp 呼び出し、429/5xx リトライ、エラー分類
  - モデル選択 gemini-2.5-pro/flash/flash-lite
  - シンプルなプロンプトで疎通確認
- DoD
  - テキスト→テキスト生成が UI ボタン経由で返る（デモ）
- 成果物
  - GeminiService, エラーハンドリング仕様

## 4. スキーマ推定/キャッシュ（Sprint 4）

- 目的: Query 前提のシートスキーマ推定
- タスク
  - SchemaService: ヘッダ/型推定、軽量キャッシュ
  - API: getSheetSchema(spreadsheetId, sheetName)
  - ValidationService: スキーマ型検証
- DoD
  - 任意シートに対して列/型が UI に表示
- 成果物
  - SchemaService 実装、キャッシュ層

## 5. 自然言語→StructuredQuery 変換（Sprint 5）

- 目的: NL を構造化クエリへ安全に変換
- タスク
  - Prompt 設計（役割固定/出力 JSON 厳格化）
  - GeminiService 呼び出しと JSON 検証（ValidationService）
  - QueryController: executeQueryFromNaturalLanguage
- DoD
  - 代表的な NL 指示が StructuredQuery として UI の Dev パネルに表示
- 成果物
  - Prompt テンプレート、出力検証

## 6. 集計エンジン（フィルタ/集計/JOIN）（Sprint 6）

- 目的: StructuredQuery を用いた GAS 内集計
- タスク
  - QueryService: filters（equals/contains/gt/lt/last_n_days/last_month）、metrics（sum/avg/count/min/max）
  - JOIN（小規模メモリ結合）
  - 実行時間ガード/トレース ID
- DoD
  - 1〜2 万行クエリが p95 &lt; 4s（サンプルデータで）
- 成果物
  - QueryService 実装、ベンチ結果

## 7. 結果表示 UI（テーブル/チャート）（Sprint 7）

- 目的: 高速なデータ表とチャート描画
- タスク
  - DataTable（仮想スクロール）
  - ChartPanel（Chart.js）と「チャート種推奨」API
  - UX（スケルトン/エラー/リトライ）
- DoD
  - 大量行で快適にスクロール、チャート自動選択が描画
- 成果物
  - UI コンポーネント群

## 8. プロアクティブ・インサイト（Sprint 8）

- 目的: 結果から AI が次アクションを提案
- タスク
  - InsightService: プロンプト/検証
  - InsightCards UI（「深掘り」ボタン連携）
- DoD
  - 3件の示唆が安定出力、深掘りで再クエリ
- 成果物
  - Insight フロー

## 9. ビュー保存/共有（Sprint 9）

- 目的: 分析状態（フィルタ/列/チャート）を保存/復元
- タスク
  - ViewDefinition 型、saveView/getViews
  - URL パラメータ共有（read-only ビュー）
- DoD
  - 保存リストから 1 クリック再現、共有 URL 動作
- 成果物
  - View 機能

## 10. Colab ジョブ投入/監視（Sprint 10）

- 目的: 非同期高度分析エンジン統合
- タスク
  - ColabOrchestratorService: Job JSON/CSV 作成、Drive 配置
  - JobStatus API と UI バナー
  - 同時実行/重複/バックオフ/Failed シンクポリシー
- DoD
  - 10分トリガーで Colab が検知→結果シート生成→UI 通知
- 成果物
  - ジョブ投入/監視機構

## 11. Colab ノートブック実装（Sprint 11）

- 目的: 需要予測/クラスタリング等のワーカー本体
- タスク
  - analysis_worker.ipynb: 入力読込→分析→出力→ジョブ管理
  - gspread/pandas/scikit-learn、要件ファイル
- DoD
  - 少なくとも 1 種（forecast）が E2E 完了
- 成果物
  - ノートブック、requirements.txt

## 12. Looker エクスポート（Sprint 12）

- 目的: クリーン非正規化表の生成とリンク導線
- タスク
  - 命名規約 DSR_Export_{YYYYMMDD_HHmm}_v{n}（Asia/Tokyo）
  - データ型整形、_meta 付与、UI リンク提示
- DoD
  - Looker Studio で即接続可能
- 成果物
  - エクスポートユーティリティ、ユーザーガイド

## 13. セキュリティ強化/検証（Sprint 13）

- 目的: 最小権限・プロンプト防御・入力検証
- タスク
  - ValidationService の網羅、未使用スコープ削減
  - XSS/入力サニタイズ、ログの PII 最小化
- DoD
  - SECURITY.md のチェック通過、簡易ペネトレーション観点クリア
- 成果物
  - セキュリティ証跡

## 14. 運用/監視/SLO（Sprint 14）

- 目的: 安定運用に必要な可観測性
- タスク
  - 構造化ログ、主要メトリクス（p95/エラー率/Colab 成否）
  - インシデントランブック/ロールバック手順
- DoD
  - 運用チェックリストで Ready 判定
- 成果物
  - docs/runbook.md, 運用ダッシュの雛形（シート）

## 15. リリース候補/ユーザーテスト（Sprint 15）

- 目的: ドメイン内パイロット公開
- タスク
  - パイロット 5〜10 名に配布、フィードバック収集
  - 性能・使い勝手の最終チューニング
- DoD
  - 主要阻害要因なし、SLO 準拠
- 成果物
  - バージョンタグ、改善バックログ

---

## マイルストーン

- M0: 準備完了（Day 0）
- M1: コア・スキャフォールド完了（Sprint 1〜3）
- M2: NL クエリ〜集計〜可視化 E2E（Sprint 4〜7）
- M3: インサイト/ビュー保存（Sprint 8〜9）
- M4: Colab E2E + Looker エクスポート（Sprint 10〜12）
- M5: セキュリティ/運用/リリース候補（Sprint 13〜15）

## リスクと緩和

- Gemini レート制限: 再試行/モデル切替（flash/flash-lite）、ユーザー通知
- GAS 実行時間: 重処理は Colab に委譲、早期中断ロジック
- データ品質: スキーマ推定の誤判定→ユーザー修正 UI と学習キャッシュ
- ドメイン配布: access=DOMAIN 設定の再検証、権限エラー時の自動診断

## 追跡方法

- スプリントバーンダウンをシート管理（バックログ/進行中/完了）
- 各ステップの DoD と成果物リンクをシートに記録
- 重要 PR/デプロイはタグ付け（clasp バージョンノート）