// GAS entry points and user settings handlers
// Note: Transpiled to .gs and executed in Apps Script environment (V8)
// Local TypeScript build will not have GAS ambient types; define minimal shims to satisfy TS.

import { GeminiModel, SaveUserSettingsRequest, SaveUserSettingsResult, UserSettings } from '../shared/types';

/* ===== Minimal GAS type/value shims for local TS compile ===== */
// These shims are erased at runtime in Apps Script because actual globals exist there.
declare const PropertiesService: {
  getUserProperties(): {
    getProperty(key: string): string | null;
    setProperty(key: string, value: string): void;
  };
};

declare const HtmlService: {
  createHtmlOutputFromFile(name: string): any;
  XFrameOptionsMode: { ALLOWALL: any };
};

declare namespace GoogleAppsScript {
  namespace HTML {
    type HtmlOutput = any;
  }
  namespace Properties {
    type Properties = {
      getProperty(key: string): string | null;
      setProperty(key: string, value: string): void;
    };
  }
}
/* ============================================================= */

// Constants
const PROP_NS = 'DSR';
const PROP_API_KEY = `${PROP_NS}_GEMINI_API_KEY`;
const PROP_MODEL = `${PROP_NS}_MODEL`;
const PROP_LOCALE = `${PROP_NS}_LOCALE`;
const PROP_TZ = `${PROP_NS}_TIMEZONE`;

function maskKey(key: string): string {
  if (!key) return '';
  const last4 = key.slice(-4);
  return `****${last4}`;
}

function getUserProps_(): GoogleAppsScript.Properties.Properties {
  return PropertiesService.getUserProperties();
}

function getOrDefault_(v: string | null, dflt: string): string {
  return v == null || v === '' ? dflt : v;
}

function getSettings_(): UserSettings {
  const props = getUserProps_();
  const rawKey = props.getProperty(PROP_API_KEY) || '';
  const model = (props.getProperty(PROP_MODEL) as GeminiModel) || 'gemini-2.5-flash';
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

export function doGet(): GoogleAppsScript.HTML.HtmlOutput {
  // Serve SPA HTML from dist/Index.html
  const html = HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Dynamic Sheets Reporter')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return html;
}

export function getUserSettings(): UserSettings {
  return getSettings_();
}

export function saveUserSettings(req: SaveUserSettingsRequest): SaveUserSettingsResult {
  try {
    const props = getUserProps_();
    if (req.apiKeyPlain && req.apiKeyPlain.trim().length > 0) {
      props.setProperty(PROP_API_KEY, req.apiKeyPlain.trim());
    }
    if (req.model) props.setProperty(PROP_MODEL, req.model);
    if (req.locale) props.setProperty(PROP_LOCALE, req.locale);
    if (req.timezone) props.setProperty(PROP_TZ, req.timezone);

    const updated = getSettings_();
    return { ok: true, settings: updated };
  } catch (e: any) {
    return { ok: false, error: `Failed to save settings: ${e?.message || e}` };
  }
}

// Minimal ping to verify backend reachable
export function ping(): string {
  return 'pong';
}

/**
 * Proxy to call GeminiService.generateContent from client.
 * Keep the request/response types aligned with shared/types.
 */
declare const GeminiService: {
  generateContent: (req: any) => any;
};

export function generateContentProxy(req: any): any {
  try {
    return (GeminiService as any).generateContent(req);
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}