"use client"

import { useParams } from "next/navigation"
import { Header } from "@/components/ui/header"
import { ModuleContent } from "@/components/courses/module-content"

export default function ModulePage() {
  const { id, moduleId } = useParams()
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ModuleContent courseId={id as string} moduleId={moduleId as string} />
    </div>
  )
}