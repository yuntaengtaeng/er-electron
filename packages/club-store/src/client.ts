import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function initClubStore(url: string, anonKey: string): void {
  client = createClient(url, anonKey)
}

export function getClient(): SupabaseClient {
  if (!client) throw new Error('[club-store] initClubStore() must be called before use')
  return client
}
