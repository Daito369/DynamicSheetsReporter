var ClientBundle;
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
/*!****************************!*\
  !*** ./src/client/main.ts ***!
  \****************************/

// Client bootstrap: Promise wrapper for google.script.run and simple UI wiring
function run(funcName, ...args) {
    return new Promise((resolve, reject) => {
        // eslint-disable-next-line no-undef
        google.script.run
            .withSuccessHandler((res) => resolve(res))
            .withFailureHandler((err) => reject(err))[funcName](...args);
    });
}
function byId(id) {
    const el = document.getElementById(id);
    if (!el)
        throw new Error(`element not found: ${id}`);
    return el;
}
async function init() {
    const apiKeyInput = byId('apiKey');
    const apiKeyMasked = byId('apiKeyMasked');
    const modelSel = byId('model');
    const localeInput = byId('locale');
    const tzInput = byId('tz');
    const saveBtn = byId('saveBtn');
    const saveStatus = byId('saveStatus');
    const pingBtn = byId('pingBtn');
    const pingResult = byId('pingResult');
    // Gemini minimal test UI
    let gemBtn = null;
    let gemPrompt = null;
    let gemResult = null;
    try {
        gemBtn = byId('gemBtn');
        gemPrompt = byId('gemPrompt');
        gemResult = byId('gemResult');
    }
    catch (_) {
        // optional section not present
    }
    // load current settings
    try {
        const settings = await run('getUserSettings');
        apiKeyMasked.textContent = settings.hasApiKey ? `保存済み: ${settings.apiKeyMasked}` : '未保存';
        modelSel.value = settings.model;
        localeInput.value = settings.locale || 'ja-JP';
        tzInput.value = settings.timezone || 'Asia/Tokyo';
    }
    catch (e) {
        saveStatus.textContent = `設定の取得に失敗しました: ${e}`;
        saveStatus.className = 'error';
    }
    saveBtn.addEventListener('click', async () => {
        try {
            saveBtn.disabled = true;
            saveStatus.textContent = '保存中...';
            const req = {
                model: modelSel.value,
                locale: localeInput.value,
                timezone: tzInput.value,
            };
            if (apiKeyInput.value && apiKeyInput.value.trim().length > 0) {
                req.apiKeyPlain = apiKeyInput.value.trim();
            }
            const res = await run('saveUserSettings', req);
            if (res.ok) {
                saveStatus.textContent = '保存しました';
                saveStatus.className = 'ok';
                const st = res.settings;
                apiKeyMasked.textContent = st.hasApiKey ? `保存済み: ${st.apiKeyMasked}` : '未保存';
                apiKeyInput.value = '';
            }
            else {
                saveStatus.textContent = `保存に失敗: ${res.error}`;
                saveStatus.className = 'error';
            }
        }
        catch (e) {
            saveStatus.textContent = `保存中にエラー: ${e}`;
            saveStatus.className = 'error';
        }
        finally {
            saveBtn.disabled = false;
        }
    });
    if (gemBtn && gemPrompt && gemResult) {
        gemBtn.addEventListener('click', async () => {
            const prompt = gemPrompt.value || 'こんにちは';
            gemResult.textContent = '生成中...';
            gemResult.className = 'mono';
            try {
                const req = {
                    model: byId('model').value || 'gemini-2.5-flash',
                    contents: [
                        { role: 'user', parts: [{ text: prompt }] }
                    ]
                };
                const res = await run('generateContentProxy', req);
                if (res.ok) {
                    gemResult.textContent = res.text || '(empty)';
                    gemResult.className = 'ok mono';
                }
                else {
                    gemResult.textContent = `error: ${res.error}`;
                    gemResult.className = 'error mono';
                }
            }
            catch (e) {
                gemResult.textContent = `error: ${e}`;
                gemResult.className = 'error mono';
            }
        });
    }
    pingBtn.addEventListener('click', async () => {
        pingResult.textContent = 'ping...';
        try {
            const res = await run('ping');
            pingResult.textContent = res;
            pingResult.className = 'ok mono';
        }
        catch (e) {
            pingResult.textContent = `error: ${e}`;
            pingResult.className = 'error mono';
        }
    });
}
document.addEventListener('DOMContentLoaded', init);

ClientBundle = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=client.js.map