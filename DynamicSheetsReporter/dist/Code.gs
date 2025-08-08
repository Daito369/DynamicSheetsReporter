/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/server/LoggingService.ts":
/*!**************************************!*\
  !*** ./src/server/LoggingService.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports) => {


// LoggingService: structured logging with trace IDs for GAS environment
// Transpiled to .gs and executed in Apps Script.
Object.defineProperty(exports, "__esModule", ({ value: true }));

function randomId_() {
    const chars = '0123456789abcdef';
    let id = '';
    for (let i = 0; i < 16; i++)
        id += chars[Math.floor(Math.random() * chars.length)];
    return id;
}
function log_(severity, traceId, message, data) {
    const entry = {
        severity,
        traceId,
        message,
        timestamp: new Date().toISOString(),
    };
    if (data !== undefined)
        entry.data = data;
    console.log(JSON.stringify(entry));
}
function withTrace(traceId) {
    const id = traceId || randomId_();
    return {
        traceId: id,
        info: (message, data) => log_('INFO', id, message, data),
        error: (message, data) => log_('ERROR', id, message, data),
    };
}


/***/ }),

/***/ "./src/server/controllers/AppController.ts":
/*!*************************************************!*\
  !*** ./src/server/controllers/AppController.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, exports) => {


// Controller serving the single-page app HTML
Object.defineProperty(exports, "__esModule", ({ value: true }));

function doGet() {
    const html = HtmlService.createHtmlOutputFromFile('Index')
        .setTitle('Dynamic Sheets Reporter')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    return html;
}


/***/ }),

/***/ "./src/server/controllers/GeminiProxyController.ts":
/*!*********************************************************!*\
  !*** ./src/server/controllers/GeminiProxyController.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, exports) => {


// Controller to proxy generateContent requests to GeminiService
Object.defineProperty(exports, "__esModule", ({ value: true }));

function generateContentProxy(req) {
    try {
        return GeminiService.generateContent(req);
    }
    catch (e) {
        return { ok: false, error: (e === null || e === void 0 ? void 0 : e.message) || String(e) };
    }
}


/***/ }),

/***/ "./src/server/controllers/PingController.ts":
/*!**************************************************!*\
  !*** ./src/server/controllers/PingController.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


// Simple ping endpoint with structured logging
Object.defineProperty(exports, "__esModule", ({ value: true }));

const LoggingService_1 = __webpack_require__(/*! ../LoggingService */ "./src/server/LoggingService.ts");
function ping() {
    const logger = (0, LoggingService_1.withTrace)();
    logger.info('ping');
    return 'pong';
}


/***/ }),

/***/ "./src/server/controllers/UserSettingsController.ts":
/*!**********************************************************!*\
  !*** ./src/server/controllers/UserSettingsController.ts ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, exports) => {


// User settings persistence via PropertiesService
// Extracted from former Code.ts
Object.defineProperty(exports, "__esModule", ({ value: true }));


const PROP_NS = 'DSR';
const PROP_API_KEY = `${PROP_NS}_GEMINI_API_KEY`;
const PROP_MODEL = `${PROP_NS}_MODEL`;
const PROP_LOCALE = `${PROP_NS}_LOCALE`;
const PROP_TZ = `${PROP_NS}_TIMEZONE`;
function maskKey_(key) {
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
        apiKeyMasked: rawKey ? maskKey_(rawKey) : '',
        hasApiKey: !!rawKey,
        model,
        locale,
        timezone,
    };
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

/*!****************************!*\
  !*** ./src/server/main.ts ***!
  \****************************/

// Entry point exporting GAS-accessible functions
// Transpiled to Code.gs via webpack/emit
Object.defineProperty(exports, "__esModule", ({ value: true }));





const UserSettingsController_1 = __webpack_require__(/*! ./controllers/UserSettingsController */ "./src/server/controllers/UserSettingsController.ts");
const PingController_1 = __webpack_require__(/*! ./controllers/PingController */ "./src/server/controllers/PingController.ts");
const GeminiProxyController_1 = __webpack_require__(/*! ./controllers/GeminiProxyController */ "./src/server/controllers/GeminiProxyController.ts");
const AppController_1 = __webpack_require__(/*! ./controllers/AppController */ "./src/server/controllers/AppController.ts");
function getUserSettings() {
    return (0, UserSettingsController_1.getUserSettings)();
}
function saveUserSettings(req) {
    return (0, UserSettingsController_1.saveUserSettings)(req);
}
function ping() {
    return (0, PingController_1.ping)();
}
function generateContentProxy(req) {
    return (0, GeminiProxyController_1.generateContentProxy)(req);
}
function doGet() {
    return (0, AppController_1.doGet)();
}
