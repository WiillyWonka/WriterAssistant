import type { NextAuthConfig } from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

const realm = process.env.KEYCLOAK_REALM ?? "writer-assistant";
const publicBase =
  process.env.NEXT_PUBLIC_KEYCLOAK_URL ?? "http://localhost:8080";
const internalBase =
  process.env.KEYCLOAK_INTERNAL_URL ?? publicBase;
const issuer =
  process.env.KEYCLOAK_ISSUER ?? `${publicBase}/realms/${realm}`;

export const authConfig = {
  trustHost: true,
  providers: [
    Keycloak({
      id: "keycloak",
      name: "Keycloak",
      clientId: process.env.KEYCLOAK_CLIENT_ID ?? "writer-assistant-web",
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET ?? "",
      issuer,
      authorization: {
        url: `${publicBase}/realms/${realm}/protocol/openid-connect/auth`,
        params: {
          scope: "openid email profile offline_access",
        },
      },
      token: `${internalBase}/realms/${realm}/protocol/openid-connect/token`,
      userinfo: `${internalBase}/realms/${realm}/protocol/openid-connect/userinfo`,
    }),
    Keycloak({
      id: "keycloak-register",
      name: "Keycloak (register)",
      clientId: process.env.KEYCLOAK_CLIENT_ID ?? "writer-assistant-web",
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET ?? "",
      issuer,
      authorization: {
        url: `${publicBase}/realms/${realm}/protocol/openid-connect/registrations`,
        params: {
          scope: "openid email profile offline_access",
        },
      },
      token: `${internalBase}/realms/${realm}/protocol/openid-connect/token`,
      userinfo: `${internalBase}/realms/${realm}/protocol/openid-connect/userinfo`,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      if (pathname.startsWith("/api/auth") || pathname.startsWith("/auth/")) {
        return true;
      }
      return !!auth;
    },
  },
} satisfies NextAuthConfig;
