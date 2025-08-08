// 最小のバリデーションスタブ（将来拡張予定）
// Apps Script 互換の単純関数群。TypeScriptで定義し .gs に変換されます。



function isNonEmptyString(v) {
    return typeof v === 'string' && v.trim().length > 0;
}
function assertNonEmptyString(name, v) {
    if (!isNonEmptyString(v)) {
        throw new Error(`${name} must be a non-empty string`);
    }
}
function clampNumber(v, min, max, dflt) {
    const n = typeof v === 'number' ? v : dflt;
    return Math.max(min, Math.min(max, n));
}
