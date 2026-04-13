import { cookies } from "next/headers";
import { sessions } from "@/lib/session-store";

const SESSION_COOKIE_NAME = "admin_session";

export async function getSessionAdmin() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return null;
    }

    const session = sessions.get(sessionToken);

    if (!session || session.expiresAt < new Date()) {
      sessions.delete(sessionToken);
      return null;
    }

    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}
