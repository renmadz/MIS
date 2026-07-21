import { type NextRequest, NextResponse } from "next/server"
import { forbiddenUnlessSelfOrAdmin, requireAuth } from "@/lib/auth/api-auth"
import { getCertificatesByUserId } from "@/lib/database/queries"

export async function GET(request: NextRequest) {
  const { error, user, profile } = await requireAuth()
  if (error) {
    return error
  }

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId parameter required" }, { status: 400 })
    }

    const forbidden = forbiddenUnlessSelfOrAdmin(userId, user!.id, !!profile!.is_admin)
    if (forbidden) {
      return forbidden
    }

    const certificates = await getCertificatesByUserId(userId)
    return NextResponse.json({ certificates })
  } catch (err) {
    console.error("Error fetching certificates:", err)
    return NextResponse.json({ error: "Failed to fetch certificates" }, { status: 500 })
  }
}
