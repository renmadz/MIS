"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Home,
  Users,
  BookOpen,
  Award,
  BarChart3,
  Settings,
  FileText,
  Shield,
  Building2,
  MapPin,
  Calendar,
  MessageSquare,
  ClipboardCheck,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { supabaseBrowser } from "@/lib/supabase/browser-client"

export function AdminSidebar() {
  const pathname = usePathname()
  const [pendingCount, setPendingCount] = useState<number | null>(null)

  // Live "N pending" for the review queue. head+count avoids fetching rows.
  useEffect(() => {
    const load = async () => {
      const { count } = await supabaseBrowser
        .from("modules")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending_review")
      setPendingCount(count ?? 0)
    }
    load()
  }, [])

  const menuItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: Home,
    },
    {
      title: "User Management",
      href: "/admin/users",
      icon: Users,
      badge: "1,247",
    },
    {
      title: "Course Management",
      href: "/admin/courses",
      icon: BookOpen,
      badge: "24",
    },
    {
      title: "Content Review",
      href: "/admin/review",
      icon: ClipboardCheck,
      badge: pendingCount != null && pendingCount > 0 ? String(pendingCount) : undefined,
    },
    {
      title: "Certificates",
      href: "/admin/certificates",
      icon: Award,
      badge: "892",
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
    },
    {
      title: "Organizations",
      href: "/admin/organizations",
      icon: Building2,
    },
    {
      title: "Regional Data",
      href: "/admin/regional",
      icon: MapPin,
    },
    {
      title: "Events",
      href: "/admin/events",
      icon: Calendar,
    },
    {
      title: "Content",
      href: "/admin/content",
      icon: FileText,
    },
    {
      title: "Messages",
      href: "/admin/messages",
      icon: MessageSquare,
      badge: "12",
    },
  ]

  const systemItems = [
    {
      title: "System Settings",
      href: "/admin/settings",
      icon: Settings,
    },
    {
      title: "Security",
      href: "/admin/security",
      icon: Shield,
    },
  ]

  return (
    <aside className="w-64 border-r bg-card/30 min-h-screen">
      <div className="p-6">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Button
                key={item.href}
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start gap-3"
                asChild
              >
                <Link href={item.href} prefetch={false}>
                  <item.icon className="w-4 h-4" />
                  {item.title}
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </Button>
            )
          })}
        </nav>

        <div className="mt-8">
          <h4 className="text-sm font-medium text-muted-foreground mb-2 px-3">System</h4>
          <nav className="space-y-2">
            {systemItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3"
                  asChild
                >
                  <Link href={item.href} prefetch={false}>
                    <item.icon className="w-4 h-4" />
                    {item.title}
                  </Link>
                </Button>
              )
            })}
          </nav>
        </div>
      </div>
    </aside>
  )
}