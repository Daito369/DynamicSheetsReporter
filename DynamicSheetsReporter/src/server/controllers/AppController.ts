// Controller serving the single-page app HTML

declare const HtmlService: {
  createHtmlOutputFromFile(name: string): any;
  XFrameOptionsMode: { ALLOWALL: any };
};

declare namespace GoogleAppsScript {
  namespace HTML {
    type HtmlOutput = any;
  }
}

export function doGet(): GoogleAppsScript.HTML.HtmlOutput {
  const html = HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Dynamic Sheets Reporter')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return html;
}

