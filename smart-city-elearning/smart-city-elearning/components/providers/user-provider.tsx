"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { supabaseBrowser } from "@/lib/supabase/browser-client"
import type { User } from "@/lib/types/database"

// The union of every column the guards/headers/lists consume, fetched once and
// shared. Replaces the per-component getUser()+users-select that each of them
// used to run independently (~3-4 getUser round-trips per instructor page).
export type UserProfile = Pick<
  User,
  "id" | "name" | "email" | "avatar" | "user_type" | "is_admin" | "is_instructor" | "status"
>

const PROFILE_COLUMNS = "id,name,email,avatar,user_type,is_admin,is_instructor,status"

interface UserContextValue {
  profile: UserProfile | null
  loading: boolean
  /** Force a full re-read (getUser + profile). For post-mutation refresh. */
  refresh: () => Promise<void>
}

const UserContext = createContext<UserContextValue>({
  profile: null,
  loading: true,
  refresh: async () => {},
})

export function useUser() {
  return useContext(UserContext)
}

/**
 * Single client-side source of the current user's profile.
 *
 * SECURITY: this is UX/display state only. It is NEVER an access-control input.
 * The authoritative gate is middleware.ts (server-side getUser() + fresh users
 * select on every protected request), which is untouched and does not trust any
 * client value. A stale is_admin/is_instructor here can, at worst, show stale
 * nav chrome between a demotion and the next invalidation trigger — it can never
 * grant access, because the server never reads this.
 *
 * Invalidation triggers:
 *  - mount: one getUser() + profile select
 *  - onAuthStateChange: SIGNED_OUT clears; SIGNED_IN/USER_UPDATED/TOKEN_REFRESHED
 *    refetch the profile from session.user.id (no extra getUser)
 *  - navigation (pathname change): profile-only refetch, catches DB-side role
 *    flips that fire no auth event
 */
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  // Latest known profile id, read by the navigation refetch without adding
  // `profile` to that effect's deps (which would loop).
  const profileIdRef = useRef<string | null>(null)
  useEffect(() => {
    profileIdRef.current = profile?.id ?? null
  }, [profile?.id])

  const fetchProfileById = useCallback(async (id: string) => {
    const { data, error } = await supabaseBrowser
      .from("users")
      .select(PROFILE_COLUMNS)
      .eq("id", id)
      .single()
    setProfile(error ? null : (data as UserProfile))
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabaseBrowser.auth.getUser()
      if (!user) {
        setProfile(null)
        return
      }
      await fetchProfileById(user.id)
    } catch {
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [fetchProfileById])

  // Mount: one full load, plus the auth-state subscription.
  useEffect(() => {
    refresh()

    const { data: sub } = supabaseBrowser.auth.onAuthStateChange((event, session) => {
      // INITIAL_SESSION duplicates the mount refresh() above — skip it.
      if (event === "INITIAL_SESSION") return
      if (event === "SIGNED_OUT" || !session?.user) {
        setProfile(null)
        return
      }
      // SIGNED_IN / USER_UPDATED / TOKEN_REFRESHED — use the session's user id
      // directly, no extra getUser round-trip.
      fetchProfileById(session.user.id)
    })

    return () => sub.subscription.unsubscribe()
  }, [refresh, fetchProfileById])

  // Navigation: cheap profile-only refetch to catch a DB-side role/status change
  // (which fires no auth event). Skips when signed out. No getUser() here.
  useEffect(() => {
    if (!profileIdRef.current) return
    fetchProfileById(profileIdRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <UserContext.Provider value={{ profile, loading, refresh }}>
      {children}
    </UserContext.Provider>
  )
}
