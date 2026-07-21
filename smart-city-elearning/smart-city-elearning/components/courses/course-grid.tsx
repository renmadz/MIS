"use client";

import { useState, useEffect } from "react";
import { CourseCard } from "./course-card";
import { Loader2 } from "lucide-react";
import type { Course } from "@/lib/types/database";

interface CourseGridProps {
  filters: {
    level?: string;
    category?: string;
    target_audience?: string[];
    duration?: { min?: number; max?: number };
  };
  search?: string;
}

export function CourseGrid({ filters, search }: CourseGridProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const url = new URL("/api/courses", window.location.origin);
        if (filters.level) url.searchParams.append("level", filters.level);
        if (filters.category) url.searchParams.append("category", filters.category);
        if (filters.target_audience?.length)
          url.searchParams.append("target_audience", JSON.stringify(filters.target_audience));
        if (filters.duration?.min) url.searchParams.append("durationMin", filters.duration.min.toString());
        if (filters.duration?.max) url.searchParams.append("durationMax", filters.duration.max?.toString() || "");
        if (search) url.searchParams.append("search", search);

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();
        setCourses(data.courses || []);
      } catch (err: any) {
        setError("Failed to load courses. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, [filters, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Available Courses</h2>
        <p className="text-muted-foreground">{courses.length} courses found</p>
      </div>

      {isLoading && (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!isLoading && !error && courses.length === 0 && (
        <p className="text-muted-foreground">No courses found.</p>
      )}
      {!isLoading && !error && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}