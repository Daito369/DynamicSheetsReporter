# 仕様書: Google Colab 高度分析ワーカー

このドキュメントは、非同期分析を実行する `analysis_worker.ipynb` の仕様を定義します。

## 1. 目的
GASの6分/30分の実行時間制限やメモリ、CPU、ライブラリの制約を回避し、Pythonの強力なデータサイエンスエコシステムを利用して高度な分析（時系列予測、クラスタリング、回帰分析など）を実行する。

## 2. トリガーメカニズム
* **起動:** このColabノートブックは、Google Colabの機能（または他のスケジューリングサービス）を用いて、**5〜15分ごとの時間ベースのトリガー**で定期的に実行されるように設定します。
* **ジョブ発見:** 起動するたびに、特定のGoogle Driveフォルダ（例: `/DynamicReporter/ColabJobs/Input/`）をポーリングし、未処理のジョブ指示ファイル (`job_*.json`) を探します。

## 3. 認証
* **必須ライブラリ:** `google-auth`, `google-auth-oauthlib`, `gspread`
* **認証方法:** ユーザー中心のOAuth2フローを使用します。ノートブックの初回実行時または認証が切れた際に、以下のコードで実行ユーザー自身に認証を求めます。これにより、サービスアカウントキーを管理する必要がなく、ユーザー自身の権限でDriveとSheetsに安全にアクセスできます。

    ```python
    from google.colab import auth
    auth.authenticate_user()

    import gspread
    from google.auth import default
    creds, _ = default()
    gc = gspread.authorize(creds)
    ```

## 4. 処理ワークフロー
1.  **Driveマウント:** `/content/drive` にGoogle Driveをマウントします。
2.  **ジョブスキャン:** `/ColabJobs/Input/` 内の `job_*.json` を検索。
3.  **ジョブ処理ループ:**
    * 見つかった各 `job.json` ファイルを読み込みます。
        ```json
        {
          "jobId": "unique_job_id_123",
          "spreadsheetId": "source_spreadsheet_id",
          "inputDataSheetId": "temp_sheet_id_with_filtered_data",
          "analysisType": "demand_forecast", // or "customer_segmentation"
          "parameters": { "period": 12 },
          "outputSheetName": "Forecast_Results_20250731"
        }
        ```
    * `gspread` を使用して、`spreadsheetId` と `inputDataSheetId` から入力データをPandas DataFrameとして読み込みます。
    * `analysisType` に基づいて、適切な分析関数（例: `run_forecast(df, params)`）を呼び出します。
    * 分析結果（新しいDataFrameやMatplotlibで生成したグラフ画像など）を取得します。
    * 結果を、元のスプレッドシートに `outputSheetName` という名前の新しいシートとして書き戻します。
    * 処理が完了した `job.json` と関連する入力データシートを、`/ColabJobs/Processed/` フォルダに移動させます。
4.  **エラーハンドリング:** 処理中にエラーが発生した場合、ジョブファイルを `/ColabJobs/Failed/` に移動させ、エラー情報をログシートなどに記録します。

## 5. `requirements.txt`
Colabノートブックの最初のセルで、以下のライブラリがインストールされるように記述します。
`!pip install gspread google-auth-oauthlib pandas scikit-learn statsmodels`

---