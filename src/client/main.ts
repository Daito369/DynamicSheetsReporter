// Client bootstrap: Promise wrapper for google.script.run and simple UI wiring

type GAS = typeof google.script;

declare const google: {
  script: {
    run: any;
  };
};

function run<T>(funcName: string, ...args: any[]): Promise<T> {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-undef
    (google.script.run as any)
      .withSuccessHandler((res: T) => resolve(res))
      .withFailureHandler((err: any) => reject(err))[funcName](...args);
  });
}

type GeminiModel = 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'gemini-2.5-flash-lite';

interface UserSettings {
  apiKeyMasked: string;
  hasApiKey: boolean;
  model: GeminiModel;
  locale: string;
  timezone: string;
}

interface SaveUserSettingsRequest {
  apiKeyPlain?: string;
  model: GeminiModel;
  locale?: string;
  timezone?: string;
}

function byId<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`element not found: ${id}`);
  return el as T;
}

async function init() {
  const apiKeyInput = byId<HTMLInputElement>('apiKey');
  const apiKeyMasked = byId<HTMLDivElement>('apiKeyMasked');
  const modelSel = byId<HTMLSelectElement>('model');
  const localeInput = byId<HTMLInputElement>('locale');
  const tzInput = byId<HTMLInputElement>('tz');
  const saveBtn = byId<HTMLButtonElement>('saveBtn');
  const saveStatus = byId<HTMLDivElement>('saveStatus');

  const pingBtn = byId<HTMLButtonElement>('pingBtn');
  const pingResult = byId<HTMLDivElement>('pingResult');

  // Gemini minimal test UI
  let gemBtn: HTMLButtonElement | null = null;
  let gemPrompt: HTMLInputElement | null = null;
  let gemResult: HTMLDivElement | null = null;
  try {
    gemBtn = byId<HTMLButtonElement>('gemBtn');
    gemPrompt = byId<HTMLInputElement>('gemPrompt');
    gemResult = byId<HTMLDivElement>('gemResult');
  } catch (_) {
    // optional section not present
  }

  // load current settings
  try {
    const settings = await run<UserSettings>('getUserSettings');
    apiKeyMasked.textContent = settings.hasApiKey ? `保存済み: ${settings.apiKeyMasked}` : '未保存';
    modelSel.value = settings.model;
    localeInput.value = settings.locale || 'ja-JP';
    tzInput.value = settings.timezone || 'Asia/Tokyo';
  } catch (e) {
    saveStatus.textContent = `設定の取得に失敗しました: ${e}`;
    saveStatus.className = 'error';
  }

  saveBtn.addEventListener('click', async () => {
    try {
      saveBtn.disabled = true;
      saveStatus.textContent = '保存中...';
      const req: SaveUserSettingsRequest = {
        model: modelSel.value as GeminiModel,
        locale: localeInput.value,
        timezone: tzInput.value,
      };
      if (apiKeyInput.value && apiKeyInput.value.trim().length > 0) {
        req.apiKeyPlain = apiKeyInput.value.trim();
      }
      const res = await run<{ ok: boolean; settings?: UserSettings; error?: string }>('saveUserSettings', req);
      if (res.ok) {
        saveStatus.textContent = '保存しました';
        saveStatus.className = 'ok';
        const st = res.settings!;
        apiKeyMasked.textContent = st.hasApiKey ? `保存済み: ${st.apiKeyMasked}` : '未保存';
        apiKeyInput.value = '';
      } else {
        saveStatus.textContent = `保存に失敗: ${res.error}`;
        saveStatus.className = 'error';
      }
    } catch (e) {
      saveStatus.textContent = `保存中にエラー: ${e}`;
      saveStatus.className = 'error';
    } finally {
      saveBtn.disabled = false;
    }
  });

  if (gemBtn && gemPrompt && gemResult) {
    gemBtn.addEventListener('click', async () => {
      const prompt = gemPrompt!.value || 'こんにちは';
      gemResult!.textContent = '生成中...';
      gemResult!.className = 'mono';
      try {
        const req = {
          model: (byId<HTMLSelectElement>('model').value as GeminiModel) || 'gemini-2.5-flash',
          contents: [
            { role: 'user', parts: [{ text: prompt }] }
          ]
        };
        const res = await run<{ ok: boolean; text?: string; error?: string }>('generateContentProxy', req);
        if (res.ok) {
          gemResult!.textContent = res.text || '(empty)';
          gemResult!.className = 'ok mono';
        } else {
          gemResult!.textContent = `error: ${res.error}`;
          gemResult!.className = 'error mono';
        }
      } catch (e) {
        gemResult!.textContent = `error: ${e}`;
        gemResult!.className = 'error mono';
      }
    });
  }

  pingBtn.addEventListener('click', async () => {
    pingResult.textContent = 'ping...';
    try {
      const res = await run<string>('ping');
      pingResult.textContent = res;
      pingResult.className = 'ok mono';
    } catch (e) {
      pingResult.textContent = `error: ${e}`;
      pingResult.className = 'error mono';
    }
  });
}

document.addEventListener('DOMContentLoaded', init);