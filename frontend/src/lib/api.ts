export function authedFetch(
  input: RequestInfo | URL,
  accessToken: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  return fetch(input, { ...init, headers });
}
