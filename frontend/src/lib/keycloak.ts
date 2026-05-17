import Keycloak from "keycloak-js";

const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8080";
const keycloakRealm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "writer-assistant";
const keycloakClientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "writer-assistant-frontend";

const keycloakConfig = {
  url: keycloakUrl,
  realm: keycloakRealm,
  clientId: keycloakClientId,
};

export const keycloak = new Keycloak(keycloakConfig);

export const initKeycloak = async () => {
  try {
    const authenticated = await keycloak.init({
      onLoad: "check-sso",
      silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
      pkceMethod: "S256",
    });
    return authenticated;
  } catch (error) {
    console.error("Failed to initialize Keycloak:", error);
    return false;
  }
};

export const login = () => {
  keycloak.login();
};

export const logout = () => {
  keycloak.logout({ redirectUri: window.location.origin });
};

export const getToken = () => {
  return keycloak.token;
};

export const isAuthenticated = () => {
  return keycloak.authenticated ?? false;
};

export const getUsername = () => {
  return keycloak.tokenParsed?.preferred_username;
};

export const getEmail = () => {
  return keycloak.tokenParsed?.email;
};
