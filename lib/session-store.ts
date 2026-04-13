// lib/session-store.ts
export interface SessionData {
  userId: string;
  email: string;
  role: string;
  expiresAt: Date;
}

// Global session store (shared across all API routes)
const globalSessions = new Map<string, SessionData>();

if (!(global as any).sessions) {
  (global as any).sessions = globalSessions;
}

export const sessions = (global as any).sessions as Map<string, SessionData>;
