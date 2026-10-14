# google-lib

Integración reutilizable de Google OAuth para Auth.js v5 y backends Node.js. Incluye un botón React, provider Auth.js y verificación de ID token en servidor. La aplicación mantiene su modelo de usuarios, sesión, permisos y emisión de JWT.

## Requisitos

- Node.js 20 o superior.
- Auth.js/NextAuth v5 y React 18+ para los adaptadores frontend.
- Proyecto OAuth Web Client configurado en Google Cloud Console.

## Instalación desde GitHub

```bash
npm install git+https://github.com/JhonattanAron/google-lib.git
```

Para fijar una versión o commit:

```bash
npm install git+https://github.com/JhonattanAron/google-lib.git#v1.0.0
```

## Variables de entorno

```dotenv
# Auth.js (solo servidor)
AUTH_SECRET=pon_aqui_un_secreto_aleatorio_largo
AUTH_GOOGLE_ID=tu_client_id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=tu_client_secret
AUTH_URL=http://localhost:3000

# Backend: audiencia aceptada por el verificador del ID token
GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
```

En Google Cloud, agrega `http://localhost:3000/api/auth/callback/google` como redirect URI de desarrollo y el callback equivalente de tu dominio HTTPS para producción. Mantén el Client Secret en el servidor; no uses `NEXT_PUBLIC_` para secretos ni subas archivos `.env`.

## Auth.js / Next.js

```ts
import NextAuth from "next-auth";
import { createGoogleAuthJsProvider } from "@jhonattanaron/google-lib/authjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [createGoogleAuthJsProvider()],
  session: { strategy: "jwt" },
});
```

El helper lee `AUTH_GOOGLE_ID` y `AUTH_GOOGLE_SECRET` (también admite `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`). Consulta [`examples/authjs-config.ts`](examples/authjs-config.ts).

## Botón React

```tsx
import { GoogleSignInButton } from "@jhonattanaron/google-lib/frontend";

<GoogleSignInButton callbackUrl="/dashboard" label="Continuar con Google" className="mi-boton" />
```

El botón usa `signIn` de Auth.js. Puedes pasar `onError` para tratar errores desde tu aplicación.

## Verificar credencial en backend

El cliente debe enviar el `id_token` emitido por el flujo OAuth; email/nombre no prueban identidad:

```ts
import { verifyGoogleIdToken } from "@jhonattanaron/google-lib/backend";

const identity = await verifyGoogleIdToken(body.idToken, {
  clientId: process.env.GOOGLE_CLIENT_ID!,
});
if (!identity.emailVerified) throw new Error("Email no verificado");
// Busca/crea tu usuario por identity.sub y emite la sesión propia de tu app.
```

`createGoogleLoginHandler` permite conectar una función propia y restringir dominios Workspace. El verificador usa el endpoint `tokeninfo` de Google para comprobar audiencia, issuer, vencimiento y claims. Para alto volumen, Google recomienda validar la firma localmente con una biblioteca oficial y limitar las solicitudes en tu API.

## API exportada

- `createGoogleAuthJsProvider(options?)` — provider Auth.js.
- `GoogleSignInButton` — botón React listo para usar.
- `verifyGoogleIdToken(idToken, options)` — identidad OIDC verificada.
- `createGoogleLoginHandler(options)` — verificación más callback de usuario propio.

## Seguridad

El endpoint backend debe validar el token y decidir su propia política de cuentas. No vincules automáticamente cuentas por email sin una política segura. Nunca confíes en datos de perfil enviados por el browser sin token verificado.

## Apóyame

Si esta librería te resulta útil, puedes seguirme en [Instagram](https://www.instagram.com/jhonattan_aron/).

## Licencia

MIT. Consulta [`LICENSE`](LICENSE).
