# Smart Plan – Vercel Starter

## Deploy (schnell)
1. Repo erstellen (GitHub) und diese drei Elemente pushen:
   - `public/index.html`
   - `api/plan.js`
   - `package.json`

2. Auf https://vercel.com → **New Project** → Repo importieren → **Deploy**.

3. In Vercel → Project Settings → **Environment Variables**:
   - `OPENAI_API_KEY` (Required)
   - `TESTER_KEY` (Optional, z. B. `beta123`)

4. Redeploy. Fertig. Teilen: `https://<dein-projekt>.vercel.app`

## Lokal testen
```bash
npx vercel dev
# öffnet http://localhost:3000
```
