import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import { readFileSync, existsSync } from 'fs'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, process.cwd(), '')
  const viteUrl = fileEnv.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const viteKey = fileEnv.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

  let siteUrl = fileEnv.VITE_SITE_URL || process.env.VITE_SITE_URL || ''
  if (!siteUrl) {
    try {
      const cfgPath = path.resolve(process.cwd(), 'site.config.json')
      if (existsSync(cfgPath)) {
        const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'))
        siteUrl = String(cfg.siteUrl || '').trim().replace(/\/$/, '')
      }
    } catch {
      /* ignore */
    }
  }

  if (mode === 'production' && (!viteUrl || !viteKey)) {
    console.error(
      '\n[build] Variables VITE_SUPABASE_* introuvables au build.\n' +
        '  → Cloudflare Pages : Workers & Pages → ton projet → Settings → Variables and Secrets\n' +
        '  → Onglet **Production** (pas seulement Preview), puis **Save** et **Redeploy** (idéalement sans cache).\n' +
        '  → Si un fichier wrangler.toml Pages était présent : il peut empêcher l’injection des variables du dashboard dans le build (voir logs « Build environment variables: (none found) »).\n'
    )
    throw new Error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY at build time')
  }

  // En prod, forcer l’inlining des clés Supabase (évite les cas où le build CI n’expose pas les VITE_* à import.meta.env).
  const define =
    mode === 'production' && viteUrl && viteKey
      ? {
          'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(viteUrl),
          'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(viteKey),
          ...(siteUrl ? { 'import.meta.env.VITE_SITE_URL': JSON.stringify(siteUrl) } : {}),
        }
      : siteUrl
        ? { 'import.meta.env.VITE_SITE_URL': JSON.stringify(siteUrl) }
        : undefined

  return {
    logLevel: 'info',
    ...(define ? { define } : {}),
    server: {
      port: 5174,
      strictPort: true,
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})