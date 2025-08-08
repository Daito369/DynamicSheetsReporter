// Shared types for both client and server (transpiled for GAS compatibility)
export type GeminiModel = 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'gemini-2.5-flash-lite';

export interface UserSettings {
  apiKeyMasked: string; // server returns masked key only (e.g., 'sk-****last4')
  hasApiKey: boolean;   // server-side truthy if stored in PropertiesService
  model: GeminiModel;
  locale: string;       // e.g. 'ja-JP'
  timezone: string;     // e.g. 'Asia/Tokyo'
}

export interface SaveUserSettingsRequest {
  apiKeyPlain?: string; // optionally provided from client; never returned back
  model: GeminiModel;
  locale?: string;
  timezone?: string;
}

export interface SaveUserSettingsResponse {
  ok: true;
  settings: UserSettings;
}

export interface ErrorResponse {
  ok: false;
  error: string;
  code?: string;
}

export type SaveUserSettingsResult = SaveUserSettingsResponse | ErrorResponse;

export interface GenerateContentRequest {
  model: GeminiModel;
  contents: any; // Gemini v1beta generateContent contents object
  temperature?: number;
  topP?: number;
  topK?: number;
}

export interface GenerateContentResponse {
  ok: true;
  data: any; // raw JSON from Gemini endpoint
}

export type GenerateContentResult = GenerateContentResponse | ErrorResponse;