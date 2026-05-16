import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";

const realm = process.env.KEYCLOAK_REALM ?? "writer-assistant";
const internalBase =
  process.env.KEYCLOAK_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_KEYCLOAK_URL ??
  "http://localhost:8080";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, account }) {
      if (account?.access_token) {
        return {
          ...token,
          access_token: account.access_token,
          refresh_token: account.refresh_token,
          expires_at:
            account.expires_at ??
            Math.floor(Date.now() / 1000 + (account.expires_in ?? 300)),
        };
      }

      const expiresAt = token.expires_at;
      if (
        typeof expiresAt === "number" &&
        Date.now() < expiresAt * 1000 - 60_000
      ) {
        return token;
      }

      if (!token.refresh_token) {
        return { ...token, error: "RefreshAccessTokenError" };
      }

      try {
        const body = new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: String(token.refresh_token),
          client_id: process.env.KEYCLOAK_CLIENT_ID ?? "writer-assistant-web",
          client_secret: process.env.KEYCLOAK_CLIENT_SECRET ?? "",
        });
        const response = await fetch(
          `${internalBase}/realms/${realm}/protocol/openid-connect/token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
          },
        );
        const refreshed: Record<string, unknown> = await response.json();
        if (!response.ok) {
          throw new Error(
            typeof refreshed.error === "string"
              ? refreshed.error
              : "refresh_failed",
          );
        }
        const expiresIn =
          typeof refreshed.expires_in === "number" ? refreshed.expires_in : 300;
        return {
          ...token,
          access_token: refreshed.access_token as string,
          expires_at: Math.floor(Date.now() / 1000 + expiresIn),
          refresh_token:
            (refreshed.refresh_token as string | undefined) ??
            token.refresh_token,
          error: undefined,
        };
      } catch {
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },
    async session({ session, token }) {
      session.accessToken =
        typeof token.access_token === "string" ? token.access_token : undefined;
      if (typeof token.error === "string") {
        session.error = token.error;
      }
      return session;
    },
  },
});
