import { supabaseBrowser } from '@/lib/supabase/browser-client'
import type { User } from '@/lib/types/database'

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { data, error } = await supabaseBrowser
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (error) {
      console.error('Error fetching user by email:', error.message, error.details, error.hint)
      return null
    }

    return data
  } catch (err) {
    console.error('Unexpected error in getUserByEmail:', err)
    return null
  }
}