import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, Filter, UserPlus, MoreHorizontal, Building2, MapPin, Mail } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function UserManagement() {
  const users = [
    {
      id: "1",
      name: "Juan Santos",
      email: "juan.santos@lgu.gov.ph",
      organization: "City Government of Tuguegarao",
      userType: "LGU",
      location: "Cagayan",
      status: "Active",
      joinDate: "2024-01-15",
      coursesCompleted: 3,
      certificatesEarned: 2,
      lastActive: "2 hours ago",
    },
    {
      id: "2",
      name: "Dr. Maria Santos",
      email: "maria.santos@isu.edu.ph",
      organization: "Isabela State University",
      userType: "SUC",
      location: "Isabela",
      status: "Active",
      joinDate: "2024-02-20",
      coursesCompleted: 5,
      certificatesEarned: 4,
      lastActive: "1 day ago",
    },
    {
      id: "3",
      name: "Carlos Reyes",
      email: "carlos.reyes@dost.gov.ph",
      organization: "DOST Region 2",
      userType: "DOST",
      location: "Cagayan",
      status: "Pending",
      joinDate: "2024-12-10",
      coursesCompleted: 0,
      certificatesEarned: 0,
      lastActive: "Never",
    },
  ]

  const userTypeStats = [
    { type: "LGU", count: 456, percentage: 37 },
    { type: "SUC", count: 234, percentage: 19 },
    { type: "HEI", count: 189, percentage: 15 },
    { type: "DOST", count: 123, percentage: 10 },
    { type: "Individual", count: 245, percentage: 19 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-serif">User Management</h1>
          <p className="text-muted-foreground">Manage platform users and organizations</p>
        </div>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {userTypeStats.map((stat) => (
          <Card key={stat.type}>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stat.count}</div>
                <div className="text-sm text-muted-foreground">{stat.type}</div>
                <div className="text-xs text-muted-foreground">{stat.percentage}%</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="all">All Users (1,247)</TabsTrigger>
            <TabsTrigger value="active">Active (1,189)</TabsTrigger>
            <TabsTrigger value="pending">Pending (58)</TabsTrigger>
            <TabsTrigger value="inactive">Inactive (0)</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-10 w-64" />
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="lgu">LGU</SelectItem>
                <SelectItem value="suc">SUC</SelectItem>
                <SelectItem value="hei">HEI</SelectItem>
                <SelectItem value="dost">DOST</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                All Users
              </CardTitle>
              <CardDescription>Complete list of platform users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/placeholder.svg" alt={user.name} />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{user.name}</h4>
                        <Badge variant={user.status === "Active" ? "default" : "secondary"}>{user.status}</Badge>
                        <Badge variant="outline">{user.userType}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {user.organization}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {user.location}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span>{user.coursesCompleted} courses completed</span>
                        <span>{user.certificatesEarned} certificates earned</span>
                        <span>Last active: {user.lastActive}</span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Edit User</DropdownMenuItem>
                        <DropdownMenuItem>View Progress</DropdownMenuItem>
                        <DropdownMenuItem>Send Message</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Suspend User</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Verifications</CardTitle>
              <CardDescription>Users awaiting organization verification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users
                  .filter((user) => user.status === "Pending")
                  .map((user) => (
                    <div key={user.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="/placeholder.svg" alt={user.name} />
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <h4 className="font-semibold">{user.name}</h4>
                        <p className="text-sm text-muted-foreground">{user.organization}</p>
                        <p className="text-xs text-muted-foreground">Registered: {user.joinDate}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="bg-transparent">
                          Review
                        </Button>
                        <Button size="sm">Approve</Button>
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
