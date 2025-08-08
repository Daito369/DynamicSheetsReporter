# API定義書 & データモデル

本ドキュメントは、フロントエンドとバックエンド間で通信される関数シグネチャとデータオブジェクトの構造を定義します。TypeScriptのインターフェースとして記述します。

## 1. サーバーサイドAPI (GAS `google.script.run` で呼び出し)

```typescript
// /src/server/controllers/Endpoints.ts

/** ユーザー設定を保存・取得する */
function saveUserSettings(settings: UserSettings): void;
function getUserSettings(): UserSettings;

/** スプレッドシートのスキーマ情報を取得する */
function getSheetSchema(spreadsheetId: string, sheetName: string): SheetSchema;

/** 自然言語または構造化クエリから分析を実行する */
function executeQuery(request: QueryRequest): QueryResult;

/** 分析結果からプロアクティブなインサイトを取得する */
function getProactiveInsights(resultData: any[]): Insight[];

/** Colabでの高度分析ジョブを開始する */
function initiateColabJob(jobRequest: ColabJobRequest): JobStatus;

/** Colabジョブのステータスを確認する */
function checkColabJobStatus(jobId: string): JobStatus;

/** 保存されたビューの一覧を取得・保存する */
function saveView(view: ViewDefinition): void;
function getViews(spreadsheetId: string): ViewDefinition[];
```

## 2. データモデル (共通インターフェース)
```typescript
// /src/common/interfaces.ts

export interface UserSettings {
  apiKey?: string;
  model?: 'gemini-1.5-pro-latest' | 'gemini-1.5-flash-latest';
}

export interface SheetSchema {
  columns: Array<{
    name: string;
    type: 'string' | 'number' | 'date' | 'boolean' | 'unknown';
  }>;
}

export interface QueryRequest {
  spreadsheetId: string;
  sheetName: string;
  query: StructuredQuery | { naturalLanguage: string };
}

export interface StructuredQuery {
  dimensions: string[];
  metrics: Array<{
    field: string;
    aggregation: 'sum' | 'average' | 'count' | 'max' | 'min';
  }>;
  filters: Array<{
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'last_n_days' | 'last_month';
    value?: any;
  }>;
  joins?: Array<{
    sheetName: string;
    on: { left: string; right: string; };
  }>;
}

export interface QueryResult {
  headers: string[];
  rows: any[][];
  metadata: {
    executionTime: number;
    rowCount: number;
    query: StructuredQuery;
  };
}

export interface Insight {
  title: string;
  description: string;
  nextActionQuery: StructuredQuery;
}
// 他、ColabJobRequest, JobStatus, ViewDefinition などのインターフェースを定義
```