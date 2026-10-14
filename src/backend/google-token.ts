export interface GoogleIdentity {
  sub: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
  givenName?: string;
  familyName?: string;
  locale?: string;
  hostedDomain?: string;
  issuer: string;
  audience: string;
  expiresAt: number;
}

export interface GoogleTokenVerifierOptions {
  clientId: string | string[];
  fetcher?: typeof fetch;
  clockToleranceSeconds?: number;
}

export class GoogleTokenVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoogleTokenVerificationError";
  }
}

const GOOGLE_ISSUERS = new Set(["accounts.google.com", "https://accounts.google.com"]);

/** Verify a Google OIDC ID token with Google's tokeninfo endpoint.
 *  For high-volume production deployments, use Google's official auth library
 *  and local signature verification/JWKS caching instead of per-request tokeninfo.
 */
export async function verifyGoogleIdToken(
  idToken: string,
  options: GoogleTokenVerifierOptions,
): Promise<GoogleIdentity> {
  if (!idToken?.trim()) throw new GoogleTokenVerificationError("Google ID token is required");
  const clientIds = Array.isArray(options.clientId) ? options.clientId : [options.clientId];
  if (!clientIds.length || clientIds.some((value) => !value)) {
    throw new GoogleTokenVerificationError("At least one expected Google client ID is required");
  }

  const endpoint = new URL("https://oauth2.googleapis.com/tokeninfo");
  endpoint.searchParams.set("id_token", idToken);
  const response = await (options.fetcher ?? fetch)(endpoint, {
    method: "GET",
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new GoogleTokenVerificationError("Google rejected the ID token");

  let claims: Record<string, unknown>;
  try {
    claims = (await response.json()) as Record<string, unknown>;
  } catch {
    throw new GoogleTokenVerificationError("Google returned an invalid token response");
  }

  const audience = String(claims.aud ?? "");
  const issuer = String(claims.iss ?? "");
  const expiresAt = Number(claims.exp);
  const now = Math.floor(Date.now() / 1000);
  const tolerance = options.clockToleranceSeconds ?? 30;
  if (!clientIds.includes(audience)) throw new GoogleTokenVerificationError("Google token audience mismatch");
  if (!GOOGLE_ISSUERS.has(issuer)) throw new GoogleTokenVerificationError("Google token issuer mismatch");
  if (!Number.isFinite(expiresAt) || expiresAt + tolerance < now) {
    throw new GoogleTokenVerificationError("Google ID token has expired");
  }
  if (typeof claims.sub !== "string" || !claims.sub) {
    throw new GoogleTokenVerificationError("Google ID token has no subject");
  }
  if (typeof claims.email !== "string" || !claims.email) {
    throw new GoogleTokenVerificationError("Google ID token has no email");
  }

  return {
    sub: claims.sub,
    email: claims.email,
    emailVerified: claims.email_verified === true || claims.email_verified === "true",
    name: typeof claims.name === "string" ? claims.name : undefined,
    picture: typeof claims.picture === "string" ? claims.picture : undefined,
    givenName: typeof claims.given_name === "string" ? claims.given_name : undefined,
    familyName: typeof claims.family_name === "string" ? claims.family_name : undefined,
    locale: typeof claims.locale === "string" ? claims.locale : undefined,
    hostedDomain: typeof claims.hd === "string" ? claims.hd : undefined,
    issuer,
    audience,
    expiresAt,
  };
}

export interface GoogleLoginHandlerOptions<T> extends GoogleTokenVerifierOptions {
  allowUnverifiedEmail?: boolean;
  allowedHostedDomains?: string[];
  onIdentity(identity: GoogleIdentity): Promise<T> | T;
}

/** Framework-neutral login handler; app callback owns account lookup/session creation. */
export function createGoogleLoginHandler<T>(options: GoogleLoginHandlerOptions<T>) {
  return async (idToken: string): Promise<{ identity: GoogleIdentity; result: T }> => {
    const identity = await verifyGoogleIdToken(idToken, options);
    if (!options.allowUnverifiedEmail && !identity.emailVerified) {
      throw new GoogleTokenVerificationError("Google email is not verified");
    }
    if (options.allowedHostedDomains?.length &&
        (!identity.hostedDomain || !options.allowedHostedDomains.includes(identity.hostedDomain))) {
      throw new GoogleTokenVerificationError("Google Workspace domain is not allowed");
    }
    return { identity, result: await options.onIdentity(identity) };
  };
}
