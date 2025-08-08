// Controller to proxy generateContent requests to GeminiService

declare const GeminiService: {
  generateContent: (req: any) => any;
};

export function generateContentProxy(req: any): any {
  try {
    return (GeminiService as any).generateContent(req);
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

