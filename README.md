# Torre Élite · Interno (Next.js + Basic Auth)

## Protección (Basic Auth)
- Usuario por defecto: **equipo**
- Contraseña por defecto: **TorreElite2025!**
- Puedes cambiarlos en Vercel con variables de entorno:
  - `BASIC_AUTH_USER`
  - `BASIC_AUTH_PASS`

## Deploy en Vercel
1) Sube esta carpeta a un repo privado en GitHub.
2) En **vercel.com → Add New → Project** → Importa el repo.
3) Build: `next build` (por defecto) — Output: `.next` (por defecto).
4) En **Settings → Environment Variables**, agrega `BASIC_AUTH_USER` y `BASIC_AUTH_PASS`.
5) Deploy.

## Datos
- `public/apartments.json` (inventario)
- `public/reservas.json` (quién reservó y fecha)
- Planos en `public/planos/ID.png` (ej. `3E.png`)

## Local (opcional)
```bash
npm install
npm run dev
```

