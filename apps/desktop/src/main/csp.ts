/// <reference types="vite/client" />

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined

export const CONNECT_SRC = [
  'https://open-api.bser.io',
  ...(supabaseUrl ? [supabaseUrl] : []),
]

export function buildCSP(isDev: boolean): string {
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self'"

  const connectSrc = isDev
    ? `connect-src 'self' ws://localhost:* http://localhost:* ${CONNECT_SRC.join(' ')}`
    : `connect-src 'self' ${CONNECT_SRC.join(' ')}`

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    connectSrc,
    "img-src 'self' https://cdn.dak.gg data:",
  ].join('; ')
}
