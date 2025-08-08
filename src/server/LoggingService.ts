// LoggingService: structured logging with trace IDs for GAS environment
// Transpiled to .gs and executed in Apps Script.

/* ===== GAS shims ===== */
declare const console: { log: (msg: any) => void };

function randomId_(): string {
  const chars = '0123456789abcdef';
  let id = '';
  for (let i = 0; i < 16; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function log_(severity: string, traceId: string, message: string, data?: any): void {
  const entry: any = {
    severity,
    traceId,
    message,
    timestamp: new Date().toISOString(),
  };
  if (data !== undefined) entry.data = data;
  console.log(JSON.stringify(entry));
}

export function withTrace(traceId?: string) {
  const id = traceId || randomId_();
  return {
    traceId: id,
    info: (message: string, data?: any) => log_('INFO', id, message, data),
    error: (message: string, data?: any) => log_('ERROR', id, message, data),
  };
}
