import { UserSettings, SaveUserSettingsRequest, SaveUserSettingsResult, GenerateContentRequest, GenerateContentResult, GeminiModel } from '../../shared/types';

declare const google: { script: { run: any } };

function run<T>(name: string, ...args: any[]): Promise<T> {
  return new Promise((resolve, reject) => {
    (google.script.run as any)
      .withSuccessHandler((res: T) => resolve(res))
      .withFailureHandler((err: any) => reject(err))[name](...args);
  });
}

export const ApiClient = {
  ping(): Promise<string> {
    return run<string>('ping');
  },
  getUserSettings(): Promise<UserSettings> {
    return run<UserSettings>('getUserSettings');
  },
  saveUserSettings(req: SaveUserSettingsRequest): Promise<SaveUserSettingsResult> {
    return run<SaveUserSettingsResult>('saveUserSettings', req);
  },
  generateContent(req: GenerateContentRequest): Promise<GenerateContentResult> {
    return run<GenerateContentResult>('generateContentProxy', req);
  }
};

export type { UserSettings, SaveUserSettingsRequest, SaveUserSettingsResult, GenerateContentRequest, GenerateContentResult, GeminiModel };
