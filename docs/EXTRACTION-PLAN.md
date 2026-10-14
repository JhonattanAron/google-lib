# Plan de extracción a `google-lib`

## Fuentes actuales en Invox

- Frontend Auth.js/NextAuth: `frontend-api/auth.ts`.
- Botón React: `frontend-api/components/auth/google-button.tsx`.
- Variables frontend: `frontend-api/lib/env.ts`.
- Mock paralelo que no debe tomarse como implementación real: `frontend-api/lib/stores/authStore.ts`.
- Endpoint Google del backend: `backend/src/modules/auth/infrastructure/controllers/auth.controller.ts` (`POST /auth/google`).

## Trabajo antes de publicar

1. Diseñar el contrato del backend para recibir un ID token o authorization code verificable. El endpoint actual confía en `{email,name}` y puede permitir suplantación si queda accesible.
2. Implementar verificación server-side (firma, issuer, audience, expiración) con biblioteca mantenida o flujo OIDC oficial; definir errores y perfiles tipados.
3. Implementar adaptador Auth.js v5 sin amarrarlo al modelo de usuarios de Invox; conservar solo identidad/proveedor.
4. Extraer botón React con props de texto, estilos/clases, estado y callback configurables, sin asumir Tailwind ni `lucide-react`.
5. Completar ejemplos para Next.js y NestJS, `.env.example`, licencia, versionado y compatibilidad.
6. Integrar como dependencia Git en Invox; retirar el mock paralelo o conectarlo formalmente al flujo acordado.

## Variables documentadas

`AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `GOOGLE_AUTH_CALLBACK_URL` para frontend/Auth.js. `GOOGLE_CLIENT_ID` para audiencia del token backend. Los secretos existen solo en runtime y nunca se publican.
