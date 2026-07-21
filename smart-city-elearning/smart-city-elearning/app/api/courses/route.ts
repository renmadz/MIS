import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get("level");
  const category = searchParams.get("category");
  const target_audience = searchParams.get("target_audience");
  const durationMin = searchParams.get("durationMin") ? parseInt(searchParams.get("durationMin")!) : undefined;
  const durationMax = searchParams.get("durationMax") ? parseInt(searchParams.get("durationMax")!) : undefined;
  const search = searchParams.get("search");

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );

  let query = supabase
    .from("courses")
    .select(`
      *,
      modules!course_id (
        id,
        course_id,
        title,
        description,
        order,
        estimated_duration,
        is_required
      )
    `)
    .eq("is_active", true);

  if (level) query = query.eq("level", level);
  if (category) query = query.eq("category", category);
  if (target_audience) {
    const audienceArray = JSON.parse(target_audience) as string[];
    query = query.contains("target_audience", audienceArray);
  }
  if (durationMin !== undefined) query = query.gte("duration", durationMin * 60);
  if (durationMax !== undefined) query = query.lte("duration", durationMax * 60);
  if (search) query = query.ilike("title", `%${search}%`);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }

  const coursesWithModules = data.map((course) => {
    const modules = Array.isArray(course.modules) ? course.modules : [];
    return {
      ...course,
      modules,
    };
  });

  return NextResponse.json({ courses: coursesWithModules });
}