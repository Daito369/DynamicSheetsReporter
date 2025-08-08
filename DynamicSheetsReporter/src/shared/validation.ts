// 最小のバリデーションスタブ（将来拡張予定）
// Apps Script 互換の単純関数群。TypeScriptで定義し .gs に変換されます。

export function isNonEmptyString(v: any): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

export function assertNonEmptyString(name: string, v: any): asserts v is string {
  if (!isNonEmptyString(v)) {
    throw new Error(`${name} must be a non-empty string`);
  }
}

export function clampNumber(v: any, min: number, max: number, dflt: number): number {
  const n = typeof v === 'number' ? v : dflt;
  return Math.max(min, Math.min(max, n));
}