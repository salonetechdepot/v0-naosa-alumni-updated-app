// lib/session-store.ts
export interface SessionData {
  userId: string;
  email: string;
  role: string;
  expiresAt: Date;
}

// Use a more persistent session store
const globalForSession = global as unknown as {
  sessions: Map<string, SessionData>;
};

if (!globalForSession.sessions) {
  globalForSession.sessions = new Map<string, SessionData>();
}

export const sessions = globalForSession.sessions;
