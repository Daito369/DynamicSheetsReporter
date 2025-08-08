// SheetsService: 将来の構造化クエリやエクスポート処理の入口（最小スタブ）
// .gs 化後にGASで実行されます。現時点では疎通確認用の簡易APIのみ。

/* ===== GAS shims ===== */
declare const Session: { getActiveUser(): { getEmail(): string } };
declare const Logger: { log: (msg: string) => void };

export function whoAmI(): string {
  try {
    const email = Session.getActiveUser().getEmail();
    const msg = email ? `You are ${email}` : 'Unknown user';
    if (Logger) Logger.log(msg);
    return msg;
  } catch (e: any) {
    return `whoAmI error: ${e?.message || e}`;
  }
}