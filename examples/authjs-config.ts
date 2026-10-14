import { createGoogleAuthJsProvider } from "../src/authjs/provider.js";

export const authConfig = {
  providers: [createGoogleAuthJsProvider()],
  session: { strategy: "jwt" as const },
  callbacks: {
    async signIn({ account }: { account?: { provider?: string } | null }) {
      // Add app-specific backend account synchronization here. Verify the Google
      // ID token on the backend; do not trust browser-posted email/name values.
      return account?.provider === "google";
    },
  },
};
