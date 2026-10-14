export const logger = {
  info: (message: string, meta?: unknown) => {
    console.log(`[${new Date().toISOString()}] [INFO] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  warn: (message: string, meta?: unknown) => {
    console.warn(`[${new Date().toISOString()}] [WARN] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  error: (message: string, error?: unknown) => {
    console.error(`[${new Date().toISOString()}] [ERROR] ${message}`, error ?? '');
  },
};
