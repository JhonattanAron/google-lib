# google-lib

Paquete compartido para integrar inicio de sesión con Google en aplicaciones React/Next.js y validar la identidad en un backend Node.js. El paquete abstrae la integración con Google; cada aplicación conserva su modelo de usuarios, sesión y permisos.

> Estado: estructura inicial de extracción. Revisar `docs/EXTRACTION-PLAN.md` antes de usar en producción. El endpoint Google actual de Invox recibe email/nombre; el backend debería validar un ID token o intercambiar un código OAuth antes de confiar en esos datos.

## Requisitos

- Node.js 20 o superior.
- Proyecto frontend con React. Para el adaptador actual de Next.js, usar Auth.js/NextAuth v5.
- Backend Node.js. El adaptador NestJS es opcional.
- Proyecto OAuth configurado en Google Cloud Console.

## Instalación desde GitHub

```bash
npm install git+https://github.com/ORGANIZACION/google-lib.git
```

Reemplaza `ORGANIZACION` por el usuario u organización que publique el repositorio. También se puede fijar una versión o commit:

```bash
npm install git+https://github.com/ORGANIZACION/google-lib.git#v1.0.0
```

## Variables de entorno

El frontend/server Auth.js necesita:

```dotenv
AUTH_SECRET=pon_aqui_un_secreto_aleatorio_largo
AUTH_GOOGLE_ID=tu_client_id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=tu_client_secret
GOOGLE_AUTH_CALLBACK_URL=http://localhost:3000/api/auth/callback/google
```

El callback debe coincidir exactamente con el URI autorizado en Google Cloud. Para producción, reemplaza localhost por el dominio HTTPS real. En el cliente web solo se usa el Client ID; **nunca expongas el Client Secret**.

Si el backend recibe el token directamente, configura el ID de audiencia esperado:

```dotenv
GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
```

No pongas secretos en variables `NEXT_PUBLIC_*`, no subas `.env` y no uses credenciales reales en ejemplos.

## Ejemplo de integración

Configura Google en Auth.js y conecta su callback a la ruta de login propia de tu backend. Consulta [`examples/next-auth.ts`](examples/next-auth.ts). El callback de backend debe validar la identidad antes de crear/iniciar la sesión local.

La validación recomendada en el servidor comprueba firma, emisor, expiración y audiencia del ID token. El email/nombre enviados por el navegador por sí solos no prueban que el usuario controla esa cuenta.

## Estructura

- `src/frontend`: componentes/adaptadores del flujo web.
- `src/backend`: validación de credenciales Google y adaptadores Node/Nest.
- `examples`: ejemplos sin secretos.
- `docs/EXTRACTION-PLAN.md`: pasos para completar la separación de Invox.

## Seguridad

Guarda el Client Secret en el servidor. Restringe los dominios de redirect URI en Google Cloud. Verifica el token en backend y aplica allí las políticas de creación de cuenta, autorización y emisión de JWT propios.
