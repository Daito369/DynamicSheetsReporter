// LoggingService: structured logging with trace IDs for GAS environment
// Transpiled to .gs and executed in Apps Script.

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
