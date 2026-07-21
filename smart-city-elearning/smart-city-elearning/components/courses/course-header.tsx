"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, BookOpenText, Users, Star, Award, Play } from "lucide-react"
import Image from "next/image"
import { supabaseBrowser } from "@/lib/supabase/browser-client"
import type { Course, Enrollment } from "@/lib/types/database"

interface CourseHeaderProps {
  courseId: string
  course: Course
  enrollment: Enrollment | null
}

export function CourseHeader({ courseId, course, enrollment }: CourseHeaderProps) {
  const handleEnroll = async () => {
    try {
      const { data: { user } } = await supabaseBrowser.auth.getUser()
      if (!user?.id) throw new Error("User not authenticated")

      // Fetch modules and lessons for the course
      const { data: modules, error: modulesError } = await supabaseBrowser
        .from('modules')
        .select(`
          id,
          course_id,
          lessons(id, module_id, title, order)
        `)
        .eq('course_id', courseId)
        .order('order', { ascending: true, foreignTable: 'lessons' })

      if (modulesError) throw modulesError
      if (!modules || modules.length === 0) throw new Error("No modules found for this course")

      // Flatten lessons from all modules
      const lessons = modules.flatMap(module => module.lessons || [])

      if (lessons.length === 0) {
        // Silently skip progress inserts if no lessons
      }

      // Prepare enrollment and progress data
      const enrollmentData = {
        user_id: user.id,
        course_id: courseId,
        status: "active",
        progress: 0,
        enrolled_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
      }

      const progressData = lessons.map(lesson => ({
        user_id: user.id,
        course_id: courseId,
        module_id: lesson.module_id,
        lesson_id: lesson.id,
        completed: false,
        time_spent: 0,
        completed_at: null,
      }))

      // Perform transaction: insert enrollment and progress entries
      const { data: rpcData, error: rpcError } = await supabaseBrowser.rpc('enroll_and_track_progress', {
        enrollment_input: enrollmentData,
        progress_inputs: progressData,
      })

      if (rpcError) {
        throw rpcError
      }

      window.location.reload() // Refresh to update enrollment status
    } catch (err: any) {
      alert("Failed to enroll in the course. Please try again.")
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary">{course.level}</Badge>
          <Badge variant="outline">{course.category}</Badge>
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-4 font-serif">{course.title}</h1>

        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{course.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-primary" />
            <span>{course.duration} hours</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <BookOpenText className="w-4 h-4 text-primary" />
            <span>{course.modules?.length || 0} modules</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{course.rating !== null ? course.rating : "N/A"} rating</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-primary" />
            <span>{course.enrollment_count !== null ? course.enrollment_count.toLocaleString() : 0} students</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-sm font-medium">Target Audience:</span>
          {course.target_audience.map((type) => (
            <Badge key={type} variant="outline" className="text-xs">
              {type}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Button
            size="lg"
            className="gap-2 cursor-pointer"
            onClick={handleEnroll}
            disabled={!!enrollment || !course.is_active}
          >
            <Play className="w-4 h-4" />
            {enrollment ? "Enrolled" : "Start Learning"}
          </Button>
          <Button variant="outline" size="lg" disabled>
            Preview Course
          </Button>
        </div>

        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
          <Award className="w-4 h-4 text-primary" />
          <span>Certificate awarded upon course completion</span>
        </div>
      </div>

      <div className="relative">
        <Image
          src={course.thumbnail || "/placeholder.svg"}
          alt={course.title}
          width={500}
          height={300}
          className="w-full h-64 object-cover rounded-lg shadow-lg"
          priority
        />
        <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
          <Button size="lg" variant="secondary" className="gap-2" disabled>
            <Play className="w-5 h-5" />
            Preview
          </Button>
        </div>
      </div>
    </div>
  )
}