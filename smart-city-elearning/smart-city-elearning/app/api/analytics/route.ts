import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/api-auth"
import { getEnrollmentStats, getUserStats, getCourseStats } from "@/lib/database/queries"

export async function GET() {
  const { error } = await requireAdmin()
  if (error) {
    return error
  }

  try {
    const [enrollmentStats, userStats, courseStats] = await Promise.all([
      getEnrollmentStats(),
      getUserStats(),
      getCourseStats(),
    ])

    return NextResponse.json({
      enrollments: enrollmentStats,
      users: userStats,
      courses: courseStats,
    })
  } catch (err) {
    console.error("Error fetching analytics:", err)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
