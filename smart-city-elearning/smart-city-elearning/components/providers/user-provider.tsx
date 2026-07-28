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
const LOAD_TIMEOUT_MS = 9000

type Status = "loading" | "ready" | "error"

interface UserContextValue {
  profile: UserProfile | null
  /** true only during the initial load / an explicit retry. */
  loading: boolean
  /** true when the initial load or retry timed out or failed. */
  error: boolean
  /** Re-run the full load (getUser + profile). Drives the loading/error UI. */
  retry: () => Promise<void>
}

const UserContext = createContext<UserContextValue>({
  profile: null,
  loading: true,
  error: false,
  retry: async () => {},
})

export function useUser() {
  return useContext(UserContext)
}

// Reject if `p` doesn't settle within `ms`. getUser()/PostgREST have no native
// timeout, and this box's IPv6 path to Supabase is dead / IPv4 intermittently
// times out — without this the load can hang indefinitely (stuck spinner).
function withTimeout<T>(p: PromiseLike<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms)
    Promise.resolve(p).then(
      (v) => { clearTimeout(t); resolve(v) },
      (e) => { clearTimeout(t); reject(e) }
    )
  })
}

/**
 * Single client-side source of the current user's profile.
 *
 * SECURITY: this is UX/display state only. It is NEVER an access-control input.
 * The authoritative gate is middleware.ts (server-side getUser() + fresh users
 * select on every protected request), which is untouched and does not trust any
 * client value.
 *
 * Status model:
 *  - 'loading' — initial load or an explicit retry() is in flight
 *  - 'ready'   — load resolved (profile set, or null = genuinely signed out)
 *  - 'error'   — initial load / retry timed out or failed (network). Distinct
 *                from a null profile so guards do NOT treat a hang as a deauth.
 *
 * Invalidation:
 *  - mount / retry(): getUser() + profile select, each raced against a 9s
 *    timeout; failure -> 'error' (never stuck at 'loading')
 *  - onAuthStateChange: SIGNED_OUT clears (-> ready, null); other events do a
 *    best-effort background refetch
 *  - navigation: best-effort background refetch (catches DB-side role flips)
 *  Background refetches keep the last-known-good profile on failure — a
 *  transient blip must not blank a working session or flip it to 'error'.
 */
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [status, setStatus] = useState<Status>("loading")
  const pathname = usePathname()

  const profileIdRef = useRef<string | null>(null)
  useEffect(() => {
    profileIdRef.current = profile?.id ?? null
  }, [profile?.id])

  // Best-effort profile-only refetch. On failure keeps the current profile and
  // never changes status — used by navigation and non-signout auth events.
  const refetchBackground = useCallback(async (id: string) => {
    try {
      const { data, error } = await withTimeout(
        supabaseBrowser.from("users").select(PROFILE_COLUMNS).eq("id", id).single(),
        LOAD_TIMEOUT_MS
      )
      if (!error && data) setProfile(data as UserProfile)
    } catch {
      /* keep last-known-good */
    }
  }, [])

  // Full load: drives loading/error. getUser + profile select, both timed.
  const loadFull = useCallback(async () => {
    setStatus("loading")
    try {
      const { data: userData, error: userErr } = await withTimeout(
        supabaseBrowser.auth.getUser(),
        LOAD_TIMEOUT_MS
      )
      if (userErr) throw userErr
      const user = userData?.user
      if (!user) {
        // genuinely not authenticated
        setProfile(null)
        setStatus("ready")
        return
      }
      const { data, error } = await withTimeout(
        supabaseBrowser.from("users").select(PROFILE_COLUMNS).eq("id", user.id).single(),
        LOAD_TIMEOUT_MS
      )
      if (error) throw error
      setProfile(data as UserProfile)
      setStatus("ready")
    } catch {
      // Timeout or network failure — surface a retryable error. Keep whatever
      // profile we already had (may be null on first load).
      setStatus("error")
    }
  }, [])

  // Mount: one full load + the auth-state subscription.
  useEffect(() => {
    loadFull()

    const { data: sub } = supabaseBrowser.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") return // duplicates the mount loadFull()
      if (event === "SIGNED_OUT" || !session?.user) {
        setProfile(null)
        setStatus("ready")
        return
      }
      // SIGNED_IN / USER_UPDATED / TOKEN_REFRESHED — best-effort, no status flip.
      refetchBackground(session.user.id)
    })

    return () => sub.subscription.unsubscribe()
  }, [loadFull, refetchBackground])

  // Navigation: best-effort refetch to catch DB-side role/status changes (which
  // fire no auth event). Skips when signed out. Never flips to loading/error.
  useEffect(() => {
    if (!profileIdRef.current) return
    refetchBackground(profileIdRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <UserContext.Provider
      value={{ profile, loading: status === "loading", error: status === "error", retry: loadFull }}
    >
      {status === "error" && <ConnectionBanner onRetry={loadFull} />}
      {children}
    </UserContext.Provider>
  )
}

function ConnectionBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="fixed top-0 inset-x-0 z-[100] flex items-center justify-center gap-3 bg-destructive px-4 py-2 text-sm text-destructive-foreground shadow"
    >
      <span>Connection issue — couldn&apos;t reach the server.</span>
      <button
        type="button"
        onClick={onRetry}
        className="rounded border border-destructive-foreground/40 px-2 py-0.5 font-medium hover:bg-destructive-foreground/10"
      >
        Retry
      </button>
    </div>
  )
}
