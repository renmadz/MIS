// app/courses/[id]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/ui/header"
import { CourseHeader } from "@/components/courses/course-header"
import { CourseContent } from "@/components/courses/course-content" // Ensure correct import
import { CourseSidebar } from "@/components/courses/course-sidebar"
import { Loader2 } from "lucide-react"
import { supabaseBrowser } from "@/lib/supabase/browser-client"
import type { Course, Enrollment, Module } from "@/lib/types/database"

// Define a minimal type for progress data relevant to this component
interface ProgressDataItem {
  lesson_id: string;
  completed: boolean;
  module_id: string; // Although not directly used for lesson check, useful for grouping if needed
}

export default function CoursePage() {
  const { id } = useParams()
  const [course, setCourse] = useState<Course | null>(null)
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [progressData, setProgressData] = useState<ProgressDataItem[] | null>(null); // State for progress data
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourseAndEnrollment = async () => {
      setIsLoading(true)
      setError(null); // Reset error on new fetch
      try {
        // Fetch course with nested modules and lessons
        const { data: courseData, error: courseError } = await supabaseBrowser
          .from('courses')
          .select('*, modules(*, lessons(id, module_id, title, type, order, duration, start_page))')
          .eq('id', id)
          .single()

        if (courseError) throw courseError
        // Sort modules and lessons
        if (courseData.modules) {
          courseData.modules.sort((a: Module, b: Module) => a.order - b.order)
          courseData.modules.forEach((mod: Module) => {
            if (mod.lessons) mod.lessons.sort((a: any, b: any) => a.order - b.order)
          })
        }
        setCourse(courseData)

        // Fetch enrollment
        const { data: { user } } = await supabaseBrowser.auth.getUser()
        let userEnrollment: Enrollment | null = null;
        if (user?.id) {
          const { data: enrollmentData, error: enrollmentError } = await supabaseBrowser
            .from('enrollments')
            .select('*')
            .eq('course_id', id)
            .eq('user_id', user.id)
            .maybeSingle()

          if (enrollmentError && enrollmentError.code !== 'PGRST116') throw enrollmentError
          userEnrollment = enrollmentData || null;
          setEnrollment(userEnrollment);

          // --- Fetch Progress Data if enrolled ---
          if (userEnrollment) {
             const { data: progressDataResult, error: progressError } = await supabaseBrowser
              .from('progress')
              .select('lesson_id, completed, module_id') // Select relevant fields
              .eq('user_id', user.id)
              .eq('course_id', id)
              .not('lesson_id', 'is', null); // Only get lesson-specific progress

            if (progressError) {
                // Don't throw, just log and proceed without progress data
                setProgressData([]); // Set empty array if error
            } else {
                setProgressData(progressDataResult || []);
            }
          } else {
              setProgressData([]); // No enrollment, no progress
          }
          // --- End Fetch Progress Data ---
        } else {
             setProgressData([]); // No user, no progress
        }
      } catch (err: any) {
        setError("Failed to load course. Please try again.")
        setProgressData([]); // Ensure progressData is set even on error
      } finally {
        setIsLoading(false)
      }
    }
    fetchCourseAndEnrollment()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p className="text-red-600">{error || "Course not found."}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <CourseHeader courseId={course.id} course={course} enrollment={enrollment} />
        <div className="grid lg:grid-cols-4 gap-8 mt-8">
          <div className="lg:col-span-3">
            {/* Pass enrollment and progressData props */}
            <CourseContent courseId={course.id} course={course} enrollment={enrollment} progressData={progressData} />
          </div>
          <div className="lg:col-span-1">
            <CourseSidebar courseId={course.id} enrollment={enrollment} course={course} />
          </div>
        </div>
      </div>
    </div>
  )
}