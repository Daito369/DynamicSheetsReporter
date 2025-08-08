var ClientBundle;
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/client/services/ApiClient.ts":
/*!******************************************!*\
  !*** ./src/client/services/ApiClient.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiClient = void 0;
function run(name, ...args) {
    return new Promise((resolve, reject) => {
        google.script.run
            .withSuccessHandler((res) => resolve(res))
            .withFailureHandler((err) => reject(err))[name](...args);
    });
}
exports.ApiClient = {
    ping() {
        return run('ping');
    },
    getUserSettings() {
        return run('getUserSettings');
    },
    saveUserSettings(req) {
        return run('saveUserSettings', req);
    },
    generateContent(req) {
        return run('generateContentProxy', req);
    }
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!****************************!*\
  !*** ./src/client/main.ts ***!
  \****************************/

// Client bootstrap and simple UI wiring
Object.defineProperty(exports, "__esModule", ({ value: true }));
const ApiClient_1 = __webpack_require__(/*! ./services/ApiClient */ "./src/client/services/ApiClient.ts");
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
        const settings = await ApiClient_1.ApiClient.getUserSettings();
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
            const res = await ApiClient_1.ApiClient.saveUserSettings(req);
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
            var _a, _b, _c, _d, _e, _f;
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
                const res = await ApiClient_1.ApiClient.generateContent(req);
                if (res.ok) {
                    const txt = ((_f = (_e = (_d = (_c = (_b = (_a = res.data) === null || _a === void 0 ? void 0 : _a.candidates) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.content) === null || _d === void 0 ? void 0 : _d.parts) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.text) || '(empty)';
                    gemResult.textContent = txt;
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
            const res = await ApiClient_1.ApiClient.ping();
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

})();

ClientBundle = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=client.js.map