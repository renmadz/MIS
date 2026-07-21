import { type NextRequest, NextResponse } from "next/server"
import { forbiddenUnlessSelfOrAdmin, requireAuth } from "@/lib/auth/api-auth"
import { getEnrollmentsByUserId, getEnrollmentsByCourseId } from "@/lib/database/queries"

export async function GET(request: NextRequest) {
  const { error, user, profile } = await requireAuth()
  if (error) {
    return error
  }

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const courseId = searchParams.get("courseId")

    if (userId) {
      const forbidden = forbiddenUnlessSelfOrAdmin(userId, user!.id, !!profile!.is_admin)
      if (forbidden) {
        return forbidden
      }

      const enrollments = await getEnrollmentsByUserId(userId)
      return NextResponse.json({ enrollments })
    }

    if (courseId) {
      if (!profile!.is_admin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      const enrollments = await getEnrollmentsByCourseId(courseId)
      return NextResponse.json({ enrollments })
    }

    return NextResponse.json({ error: "userId or courseId parameter required" }, { status: 400 })
  } catch (err) {
    console.error("Error fetching enrollments:", err)
    return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 })
  }
}
