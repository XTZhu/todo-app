import type { User } from '@supabase/supabase-js'
import { setSupabaseClient } from './supabase-api'

let clientInitialized = false

function getConfig() {
  if (typeof window === 'undefined') return { url: '', key: '' }
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  }
}

export function isCloudEnabled(): boolean {
  const { url, key } = getConfig()
  return !!(url && key)
}

export async function getOrCreateAnonymousUser(): Promise<User | null> {
  if (!isCloudEnabled()) return null
  if (clientInitialized) return null // Already tried, don't re-init

  const { url, key } = getConfig()
  if (!url || !key) return null

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const client = createClient(url, key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
    setSupabaseClient(client)
    clientInitialized = true

    const { data: { session } } = await client.auth.getSession()
    if (session?.user) return session.user

    const { data, error } = await client.auth.signInAnonymously()
    if (error) {
      console.error('Anonymous sign-in failed:', error.message)
      setSupabaseClient(null)
      return null
    }
    return data.user
  } catch (err) {
    console.error('Supabase init failed:', err)
    setSupabaseClient(null)
    return null
  }
}
