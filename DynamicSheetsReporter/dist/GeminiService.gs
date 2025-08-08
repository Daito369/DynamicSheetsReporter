// GeminiService: Google AI Studio v1beta generateContent 呼び出し（Apps Script UrlFetchApp）
// 注意: ここは .gs に変換され、GAS 環境で実行されます。
// - 認証は Authorization: Bearer <API_KEY>
// - モデル: gemini-2.5-pro / gemini-2.5-flash / gemini-2.5-flash-lite
// - 429/5xx は指数バックオフで再試行

const PROP_NS = 'DSR';
const PROP_API_KEY = `${PROP_NS}_GEMINI_API_KEY`;
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
function getApiKey_() {
    const key = PropertiesService.getUserProperties().getProperty(PROP_API_KEY) || '';
    if (!key)
        throw new Error('Gemini API Key is not set. Save it in user settings first.');
    return key;
}
function isRetryable_(code) {
    // 429/5xx は再試行
    return code === 429 || (code >= 500 && code < 600);
}
function generateContent(req) {
    const apiKey = getApiKey_();
    const url = `${BASE_URL}/${encodeURIComponent(req.model)}:generateContent`;
    const payload = {
        contents: req.contents,
    };
    if (typeof req.temperature === 'number')
        payload.temperature = req.temperature;
    if (typeof req.topP === 'number')
        payload.topP = req.topP;
    if (typeof req.topK === 'number')
        payload.topK = req.topK;
    const body = JSON.stringify(payload);
    const options = {
        method: 'post',
        contentType: 'application/json',
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
        payload: body,
        muteHttpExceptions: true,
    };
    const maxAttempts = 4;
    let attempt = 0;
    while (attempt < maxAttempts) {
        attempt++;
        const res = UrlFetchApp.fetch(url, options);
        const code = res.getResponseCode();
        const text = res.getContentText();
        if (code >= 200 && code < 300) {
            try {
                const json = text ? JSON.parse(text) : {};
                return { ok: true, data: json };
            }
            catch (e) {
                return { ok: false, error: `Invalid JSON from Gemini: ${(e === null || e === void 0 ? void 0 : e.message) || e}` };
            }
        }
        if (isRetryable_(code) && attempt < maxAttempts) {
            const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
            Utilities.sleep(backoffMs);
            continue;
        }
        // 非再試行 or 試行しきった
        return { ok: false, error: `Gemini error HTTP ${code}: ${text}` };
    }
    return { ok: false, error: 'Gemini request failed after retries' };
}
