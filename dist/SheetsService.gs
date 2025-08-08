/******/ 	"use strict";

/*!*************************************!*\
  !*** ./src/server/SheetsService.ts ***!
  \*************************************/

// SheetsService: 将来の構造化クエリやエクスポート処理の入口（最小スタブ）
// .gs 化後にGASで実行されます。現時点では疎通確認用の簡易APIのみ。
Object.defineProperty(exports, "__esModule", ({ value: true }));

function whoAmI() {
    try {
        const email = Session.getActiveUser().getEmail();
        const msg = email ? `You are ${email}` : 'Unknown user';
        if (Logger)
            Logger.log(msg);
        return msg;
    }
    catch (e) {
        return `whoAmI error: ${(e === null || e === void 0 ? void 0 : e.message) || e}`;
    }
}
