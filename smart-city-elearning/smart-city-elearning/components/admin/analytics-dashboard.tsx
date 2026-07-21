import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Users, BookOpen, Award, MapPin, Calendar, Target } from "lucide-react"

export function AnalyticsDashboard() {
  const metrics = [
    {
      title: "Monthly Active Users",
      value: "1,189",
      change: "+12.5%",
      trend: "up",
      description: "Users active in the last 30 days",
    },
    {
      title: "Course Completion Rate",
      value: "78%",
      change: "+5.2%",
      trend: "up",
      description: "Average completion rate across all courses",
    },
    {
      title: "Certificate Issuance",
      value: "156",
      change: "+24.1%",
      trend: "up",
      description: "Certificates issued this month",
    },
    {
      title: "User Satisfaction",
      value: "4.7/5",
      change: "+0.3",
      trend: "up",
      description: "Average course rating",
    },
  ]

  const regionalData = [
    { province: "Cagayan", users: 456, growth: 15, completion: 82 },
    { province: "Isabela", users: 389, growth: 12, completion: 75 },
    { province: "Nueva Vizcaya", users: 234, growth: 8, completion: 79 },
    { province: "Quirino", users: 123, growth: 18, completion: 71 },
    { province: "Batanes", users: 45, growth: 22, completion: 88 },
  ]

  const coursePerformance = [
    { course: "IoT Fundamentals", enrollments: 1250, completion: 65, rating: 4.8 },
    { course: "Data Analytics", enrollments: 890, completion: 60, rating: 4.9 },
    { course: "Digital Governance", enrollments: 1100, completion: 90, rating: 4.6 },
    { course: "Energy Management", enrollments: 780, completion: 72, rating: 4.8 },
    { course: "Waste Management", enrollments: 920, completion: 58, rating: 4.5 },
  ]

  const userTypeDistribution = [
    { type: "LGU", count: 456, percentage: 37 },
    { type: "Individual", count: 245, percentage: 19 },
    { type: "SUC", count: 234, percentage: 19 },
    { type: "HEI", count: 189, percentage: 15 },
    { type: "DOST", count: 123, percentage: 10 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-serif">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Platform performance and user insights</p>
        </div>
        <Badge variant="secondary" className="gap-2">
          <Calendar className="w-4 h-4" />
          Last 30 Days
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <TrendingUp className={`h-4 w-4 ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.description}</p>
              <div className="flex items-center mt-2">
                <Badge
                  variant="outline"
                  className={`text-xs ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}
                >
                  {metric.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Regional Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Regional Performance
            </CardTitle>
            <CardDescription>User engagement by province</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {regionalData.map((region) => (
              <div key={region.province} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{region.province}</span>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{region.users} users</span>
                    <Badge variant="outline" className="text-green-600">
                      +{region.growth}%
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-20">Completion:</span>
                  <Progress value={region.completion} className="flex-1 h-2" />
                  <span className="text-xs font-medium w-8">{region.completion}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* User Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Distribution
            </CardTitle>
            <CardDescription>Platform users by organization type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userTypeDistribution.map((userType) => (
              <div key={userType.type} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="font-medium">{userType.type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{userType.count} users</span>
                  <Badge variant="outline">{userType.percentage}%</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Course Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Course Performance
          </CardTitle>
          <CardDescription>Enrollment and completion statistics by course</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coursePerformance.map((course) => (
              <div key={course.course} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{course.course}</span>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{course.enrollments.toLocaleString()} enrolled</span>
                    <div className="flex items-center gap-1">
                      <Award className="w-3 h-3 text-yellow-500" />
                      <span>{course.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-20">Completion:</span>
                  <Progress value={course.completion} className="flex-1 h-2" />
                  <span className="text-xs font-medium w-8">{course.completion}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Goals */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Monthly Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">New Enrollments</span>
                <span className="text-sm font-medium">1,234 / 1,500</span>
              </div>
              <Progress value={82} className="h-2" />
              <p className="text-xs text-muted-foreground">82% of monthly target achieved</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Certificates Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Certificates Issued</span>
                <span className="text-sm font-medium">156 / 200</span>
              </div>
              <Progress value={78} className="h-2" />
              <p className="text-xs text-muted-foreground">78% of monthly target achieved</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Completion Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Avg Completion Rate</span>
                <span className="text-sm font-medium">78% / 80%</span>
              </div>
              <Progress value={97} className="h-2" />
              <p className="text-xs text-muted-foreground">97% of target completion rate</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
