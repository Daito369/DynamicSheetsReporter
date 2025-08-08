// User settings persistence via PropertiesService
// Extracted from former Code.ts

import {
  GeminiModel,
  SaveUserSettingsRequest,
  SaveUserSettingsResult,
  UserSettings,
} from '../../shared/types';

/* ===== GAS shims ===== */
declare const PropertiesService: {
  getUserProperties(): {
    getProperty(key: string): string | null;
    setProperty(key: string, value: string): void;
  };
};

declare namespace GoogleAppsScript {
  namespace Properties {
    type Properties = {
      getProperty(key: string): string | null;
      setProperty(key: string, value: string): void;
    };
  }
}

const PROP_NS = 'DSR';
const PROP_API_KEY = `${PROP_NS}_GEMINI_API_KEY`;
const PROP_MODEL = `${PROP_NS}_MODEL`;
const PROP_LOCALE = `${PROP_NS}_LOCALE`;
const PROP_TZ = `${PROP_NS}_TIMEZONE`;

function maskKey_(key: string): string {
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
    apiKeyMasked: rawKey ? maskKey_(rawKey) : '',
    hasApiKey: !!rawKey,
    model,
    locale,
    timezone,
  };
}

export function getUserSettings(): UserSettings {
  return getSettings_();
}

export function saveUserSettings(
  req: SaveUserSettingsRequest,
): SaveUserSettingsResult {
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

