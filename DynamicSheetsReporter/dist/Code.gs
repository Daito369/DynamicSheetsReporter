/******/ 	"use strict";

/*!****************************!*\
  !*** ./src/server/Code.ts ***!
  \****************************/

// GAS entry points and user settings handlers
// Note: Transpiled to .gs and executed in Apps Script environment (V8)
// Local TypeScript build will not have GAS ambient types; define minimal shims to satisfy TS.
Object.defineProperty(exports, "__esModule", ({ value: true }));





/* ============================================================= */
// Constants
const PROP_NS = 'DSR';
const PROP_API_KEY = `${PROP_NS}_GEMINI_API_KEY`;
const PROP_MODEL = `${PROP_NS}_MODEL`;
const PROP_LOCALE = `${PROP_NS}_LOCALE`;
const PROP_TZ = `${PROP_NS}_TIMEZONE`;
function maskKey(key) {
    if (!key)
        return '';
    const last4 = key.slice(-4);
    return `****${last4}`;
}
function getUserProps_() {
    return PropertiesService.getUserProperties();
}
function getOrDefault_(v, dflt) {
    return v == null || v === '' ? dflt : v;
}
function getSettings_() {
    const props = getUserProps_();
    const rawKey = props.getProperty(PROP_API_KEY) || '';
    const model = props.getProperty(PROP_MODEL) || 'gemini-2.5-flash';
    const locale = getOrDefault_(props.getProperty(PROP_LOCALE), 'ja-JP');
    const timezone = getOrDefault_(props.getProperty(PROP_TZ), 'Asia/Tokyo');
    return {
        apiKeyMasked: rawKey ? maskKey(rawKey) : '',
        hasApiKey: !!rawKey,
        model,
        locale,
        timezone,
    };
}
function doGet() {
    // Serve SPA HTML from dist/Index.html
    const html = HtmlService.createHtmlOutputFromFile('Index')
        .setTitle('Dynamic Sheets Reporter')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    return html;
}
function getUserSettings() {
    return getSettings_();
}
function saveUserSettings(req) {
    try {
        const props = getUserProps_();
        if (req.apiKeyPlain && req.apiKeyPlain.trim().length > 0) {
            props.setProperty(PROP_API_KEY, req.apiKeyPlain.trim());
        }
        if (req.model)
            props.setProperty(PROP_MODEL, req.model);
        if (req.locale)
            props.setProperty(PROP_LOCALE, req.locale);
        if (req.timezone)
            props.setProperty(PROP_TZ, req.timezone);
        const updated = getSettings_();
        return { ok: true, settings: updated };
    }
    catch (e) {
        return { ok: false, error: `Failed to save settings: ${(e === null || e === void 0 ? void 0 : e.message) || e}` };
    }
}
// Minimal ping to verify backend reachable
function ping() {
    return 'pong';
}
function generateContentProxy(req) {
    try {
        return GeminiService.generateContent(req);
    }
    catch (e) {
        return { ok: false, error: (e === null || e === void 0 ? void 0 : e.message) || String(e) };
    }
}
