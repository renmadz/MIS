import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Search, Plus, MoreHorizontal, Users, Clock, Star, Edit, Eye, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function CourseManagement() {
  const courses = [
    {
      id: "iot-fundamentals",
      title: "IoT Fundamentals for Smart Cities",
      instructor: "Dr. Maria Santos",
      category: "Technology",
      level: "Beginner",
      status: "Published",
      enrollments: 1250,
      completions: 812,
      rating: 4.8,
      duration: "4 weeks",
      modules: 8,
      createdDate: "2024-01-15",
      lastUpdated: "2024-11-20",
    },
    {
      id: "data-analytics",
      title: "Smart City Data Analytics",
      instructor: "Prof. Juan Dela Cruz",
      category: "Analytics",
      level: "Intermediate",
      status: "Published",
      enrollments: 890,
      completions: 534,
      rating: 4.9,
      duration: "6 weeks",
      modules: 12,
      createdDate: "2024-02-10",
      lastUpdated: "2024-12-01",
    },
    {
      id: "digital-governance",
      title: "Digital Governance and E-Services",
      instructor: "Dir. Carlos Reyes",
      category: "Governance",
      level: "Intermediate",
      status: "Draft",
      enrollments: 0,
      completions: 0,
      rating: 0,
      duration: "5 weeks",
      modules: 10,
      createdDate: "2024-12-05",
      lastUpdated: "2024-12-10",
    },
  ]

  const courseStats = [
    { label: "Total Courses", value: "24", change: "+3" },
    { label: "Published", value: "21", change: "+2" },
    { label: "Draft", value: "3", change: "+1" },
    { label: "Total Enrollments", value: "5,247", change: "+234" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-serif">Course Management</h1>
          <p className="text-muted-foreground">Create and manage learning content</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Course
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {courseStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
                <Badge variant="outline" className="text-xs mt-1">
                  {stat.change} this month
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="all">All Courses (24)</TabsTrigger>
            <TabsTrigger value="published">Published (21)</TabsTrigger>
            <TabsTrigger value="draft">Draft (3)</TabsTrigger>
            <TabsTrigger value="archived">Archived (0)</TabsTrigger>
          </TabsList>

          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search courses..." className="pl-10 w-64" />
          </div>
        </div>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                All Courses
              </CardTitle>
              <CardDescription>Manage all platform courses and content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courses.map((course) => (
                  <div key={course.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-lg">{course.title}</h4>
                        <Badge variant={course.status === "Published" ? "default" : "secondary"}>{course.status}</Badge>
                        <Badge variant="outline">{course.level}</Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>by {course.instructor}</span>
                        <span>{course.category}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {course.duration}
                        </div>
                        <span>{course.modules} modules</span>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-primary" />
                          <span>{course.enrollments.toLocaleString()} enrolled</span>
                        </div>
                        <span>{course.completions.toLocaleString()} completed</span>
                        {course.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{course.rating}</span>
                          </div>
                        )}
                        <span>Updated: {course.lastUpdated}</span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Course
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Course
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="w-4 h-4 mr-2" />
                          View Enrollments
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Star className="w-4 h-4 mr-2" />
                          View Reviews
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Course
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="draft">
          <Card>
            <CardHeader>
              <CardTitle>Draft Courses</CardTitle>
              <CardDescription>Courses in development or awaiting publication</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courses
                  .filter((course) => course.status === "Draft")
                  .map((course) => (
                    <div key={course.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-muted-foreground" />
                      </div>

                      <div className="flex-1">
                        <h4 className="font-semibold">{course.title}</h4>
                        <p className="text-sm text-muted-foreground">by {course.instructor}</p>
                        <p className="text-xs text-muted-foreground">Created: {course.createdDate}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="bg-transparent">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button size="sm">Publish</Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
