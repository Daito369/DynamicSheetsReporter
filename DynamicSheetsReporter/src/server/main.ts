// Entry point exporting GAS-accessible functions
// Transpiled to Code.gs via webpack/emit

import {
  getUserSettings as getUserSettings_,
  saveUserSettings as saveUserSettings_,
} from './controllers/UserSettingsController';
import { ping as ping_ } from './controllers/PingController';
import { generateContentProxy as generateContentProxy_ } from './controllers/GeminiProxyController';
import { doGet as doGet_ } from './controllers/AppController';
import {
  SaveUserSettingsRequest,
  SaveUserSettingsResult,
  UserSettings,
} from '../shared/types';

export function getUserSettings(): UserSettings {
  return getUserSettings_();
}

export function saveUserSettings(
  req: SaveUserSettingsRequest,
): SaveUserSettingsResult {
  return saveUserSettings_(req);
}

export function ping(): string {
  return ping_();
}

export function generateContentProxy(req: any): any {
  return generateContentProxy_(req);
}

export function doGet(): any {
  return doGet_();
}

