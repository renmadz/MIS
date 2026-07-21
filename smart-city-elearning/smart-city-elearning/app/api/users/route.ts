import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/api-auth"
import { getAllUsers, getUsersByType } from "@/lib/database/queries"

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) {
    return error
  }

  try {
    const { searchParams } = new URL(request.url)
    const userType = searchParams.get("type")

    const users = userType ? await getUsersByType(userType) : await getAllUsers()

    return NextResponse.json({ users })
  } catch (err) {
    console.error("Error fetching users:", err)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
