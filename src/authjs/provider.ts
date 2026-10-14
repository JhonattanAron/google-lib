import Google from "next-auth/providers/google";

export interface GoogleAuthJsOptions {
  clientId?: string;
  clientSecret?: string;
  allowDangerousEmailAccountLinking?: boolean;
}

/** Auth.js v5 Google provider; credentials are read from server environment by default. */
export function createGoogleAuthJsProvider(options: GoogleAuthJsOptions = {}) {
  const clientId = options.clientId ?? process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID;
  const clientSecret = options.clientSecret ?? process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Set AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET (or GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET)");
  }
  return Google({ clientId, clientSecret, allowDangerousEmailAccountLinking: options.allowDangerousEmailAccountLinking });
}
