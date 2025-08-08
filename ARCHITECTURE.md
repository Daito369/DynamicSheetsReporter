# 建築設計書: Dynamic Sheets Reporter v2.0

本ドキュメントは、v2.0のシステムアーキテクチャを定義します。GCPを利用せず、Google Workspaceのコンポーネントのみで完結するサーバーレスアーキテクチャを基本とします。

## 1. システム構成図

v2.0では、インテリジェンス層を大幅に強化し、特にGoogle Colabを非同期の高度分析エンジンとして組み込みます。

```mermaid
graph TD
    subgraph "ユーザーブラウザ (Vue.js SPA)"
        A[UI: 自然言語クエリ入力 / 設定]
        B[UI: 高度分析実行ボタン]
        C[UI: 結果表示 (表, チャート, AIインサイト)]
    end

    subgraph "Google Apps Script (Backend / API Layer)"
        D[main.ts: doGet, APIエンドポイント]
        E[services/QueryService.ts]
        F[services/InsightService.ts]
        G[services/ColabOrchestratorService.ts]
        H[controllers/UserSettings.ts]
    end

    subgraph "Google Intelligence & Data Layer"
        I[Gemini API]
        J[Google Sheets]
        K[Google Drive]
        L[Google Colab]
        M[PropertiesService (User Scope)]
    end

    A -- "google.script.run (saveUserSettings)" --> H
    H -- "PropertiesService.getUserProperties()" --> M

    A -- "google.script.run (executeQuery)" --> E
    E -- "SpreadsheetApp" --> J
    E -- "UrlFetchApp (User's API Key from M)" --> I

    B -- "google.script.run (initiateColabJob)" --> G
    G -- "DriveApp (Create Job Files)" --> K

    F -- "UrlFetchApp (User's API Key from M)" --> I

    L -- "Time-based Trigger (Polling)" --> K
    L -- "gspread (User OAuth)" --> J
    L -- "pandas, scikit-learn" --> L

    D -- "HtmlService.createHtmlOutputFromFile" --> A
    D -- "HtmlService.createHtmlOutputFromFile" --> B
    D -- "HtmlService.createHtmlOutputFromFile" --> C
```

## 2. アーキテクチャレイヤー

### 2.1. Presentation Layer (フロントエンド)

- **技術スタック:** Vue.js (or React/Svelte) を利用したシングルページアプリケーション (SPA)。
- **実行環境:** GASの `HtmlService` 内で実行。`clasp` を用いてビルドされたJS/CSSファイルを配信します。
- **役割:** 全てのUIコンポーネントのレンダリング、ユーザーインタラクションの管理、およびバックエンドAPI（GAS関数）の非同期呼び出しを担当します。

### 2.2. Application Layer (バックエンド)

- **技術スタック:** TypeScript on Google Apps Script (GAS)。
- **役割:**
    - フロントエンドからのリクエストを受け付けるAPIエンドポイントを提供 (`google.script.run`)。
    - ビジネスロジックの中核を担う（データ取得、クエリ解釈、インサイト生成、Colabジョブ調整）。
    - Googleサービス（Sheets, Drive, Gemini）との連携を司る。
    - **ユーザー固有のAPIキー管理:** `PropertiesService.getUserProperties()` を使用し、各ユーザーのAPIキーとモデル設定を安全に保存・取得します。これはユーザーごとにスコープが区切られているため、他のユーザーからは一切見えません。

### 2.3. Intelligence & Data Layer (サービス)

- **Gemini API:** 自然言語の解釈、構造化クエリへの変換、インサイトの抽出、グラフ種類の推奨など、システムの「知能」を担当します。各ユーザーが設定したAPIキーで呼び出されます。
- **Google Sheets:** プライマリデータソース。`SpreadsheetApp`を通じて読み書きされます。
- **Google Drive:** Colabとの非同期連携におけるジョブファイル（CSVデータ、JSON指示書）の中継地点として機能します。
- **Google Colab:** 非同期で実行される高度分析エンジン。GASの実行時間やライブラリの制約を超えた、Pythonベースのデータサイエンス処理（需要予測、クラスタリング等）を実行します。Colabは、実行ユーザー自身の権限でGoogle DriveとSheetsにアクセスします。
- **PropertiesService (User Scope):** 各ユーザーの認証情報（APIキー）をセキュアに永続化するためのキーバリューストア。