import Google from "next-auth/providers/google";

// Merge the provider into your Auth.js/NextAuth configuration.
export const googleProvider = Google({
  clientId: process.env.AUTH_GOOGLE_ID!,
  clientSecret: process.env.AUTH_GOOGLE_SECRET!,
});

// In the signIn callback, send a verified ID token to your backend. Never use
// a browser-supplied email/name as proof of identity.
