import type { User, SupabaseClient } from '@supabase/supabase-js'
import { setSupabaseClient } from './supabase-api'

let _clientPromise: Promise<SupabaseClient> | null = null

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

async function ensureClient() {
  if (_clientPromise) return _clientPromise
  const { url, key } = getConfig()
  if (!url || !key) throw new Error('Supabase not configured')

  _clientPromise = (async () => {
    const { createClient } = await import('@supabase/supabase-js')
    const client = createClient(url, key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
    setSupabaseClient(client)
    return client
  })()
  return _clientPromise
}

export async function getOrCreateAnonymousUser(captchaToken?: string): Promise<User | null> {
  if (!isCloudEnabled()) return null

  try {
    const client = await ensureClient()

    const { data: { session } } = await client.auth.getSession()
    if (session?.user) return session.user

    const { data, error } = await client.auth.signInAnonymously({
      options: { captchaToken },
    })
    if (error) {
      console.error('Anonymous sign-in failed:', error.message)
      return null
    }
    return data.user
  } catch (err) {
    console.error('Supabase init failed:', err)
    return null
  }
}

export async function hasExistingSession(): Promise<boolean> {
  if (!isCloudEnabled()) return false
  try {
    const client = await ensureClient()
    const { data: { session } } = await client.auth.getSession()
    return !!session?.user
  } catch {
    return false
  }
}
