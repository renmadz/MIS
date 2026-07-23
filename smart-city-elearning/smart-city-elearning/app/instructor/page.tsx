import { InstructorHeader } from "@/components/instructor/instructor-header";
import { InstructorSidebar } from "@/components/instructor/instructor-sidebar";
import { InstructorGuard } from "@/components/instructor/instructor-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function InstructorPage() {
  return (
    <div className="min-h-screen bg-background">
      <InstructorHeader />
      <div className="flex">
        <InstructorSidebar />
        <main className="flex-1 p-6">
          <InstructorGuard>
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">My Courses</h2>
                <p className="text-muted-foreground">
                  Courses you have been assigned to as instructor.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>No course list yet</CardTitle>
                  <CardDescription>
                    Course listing and module upload are built in the next stage of this
                    workflow. Nothing is hidden here — this page has no data to show yet.
                  </CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            </div>
          </InstructorGuard>
        </main>
      </div>
    </div>
  );
}
