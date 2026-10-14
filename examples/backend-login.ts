import { createGoogleLoginHandler } from "../src/backend/google-token.js";

const loginWithGoogle = createGoogleLoginHandler({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  async onIdentity(identity) {
    // Find/create the app user by the stable provider subject (sub), then issue
    // the app's own session/JWT. Never accept email/name without token verification.
    return { providerSubject: identity.sub, email: identity.email, name: identity.name };
  },
});

// Framework-neutral handler: adapt this to Express/Nest/Fastify and validate
// request shape/rate limits in the framework controller.
export async function login(idToken: string) {
  return loginWithGoogle(idToken);
}
