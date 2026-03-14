"use client"

import AdminPageLayout from "./layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Users, BookOpen, GraduationCap, BarChart3, Activity, Calendar, Plus, ArrowUpRight, ArrowDownRight, Building2, FileText } from "lucide-react"
import { Button } from "@/Components/ui/button"
import { Progress } from "@/Components/ui/progress"
import { Link, Head } from "@inertiajs/react"
import { useEffect, useState } from "react"
import axios from "axios"
import { Badge } from "@/Components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"

interface DashboardStats {
  total_users: number
  total_kursus: number
  total_departments?: number
  total_quizzes?: number
  user_growth?: number
  course_growth?: number
  recent_users?: Array<{
    id: number
    nama_lengkap: string
    email: string
    tipe_user: string
    created_at: string
  }>
  recent_courses?: Array<{
    id: number
    judul_kursus: string
    created_at: string
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        
        const response = await axios.get('/api/admin/get-stats')
        
        setStats(response.data.data)
      } catch (error) {
        
        // Show a more detailed error message
        if (axios.isAxiosError(error)) {
          
          
        }
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <AdminPageLayout>
      <Head title="Dashboard" />
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-red-700 to-red-500 bg-clip-text">
              Admin Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Welcome to the Telesandi admin dashboard</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="text-red-600 border-red-200 bg-red-50 hover:bg-red-100 hover:text-black" asChild>
              <Link href="/admin/users/new">
                <Users className="w-4 h-4 mr-2" />
                Add User
              </Link>
            </Button>
            <Button variant="outline" className="text-red-600 border-red-200 bg-red-50 hover:bg-red-100 hover:text-black" asChild>
              <Link href="/admin/courses/create">
                <BookOpen className="w-4 h-4 mr-2" />
                New Course
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-sm rounded-xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Total Users</CardTitle>
              <CardDescription className="text-red-600/80 dark:text-red-400/80">All registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-red-700 dark:text-red-300">{stats?.total_users || 0}</div>
                <Users className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="w-4 h-4 mr-1 text-green-600" />
                <p className="text-xs text-green-600">{stats?.user_growth || 0}% from last month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Active Courses</CardTitle>
              <CardDescription className="text-red-600/80 dark:text-red-400/80">Currently running courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-red-700 dark:text-red-300">{stats?.total_kursus || 0}</div>
                <BookOpen className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="w-4 h-4 mr-1 text-green-600" />
                <p className="text-xs text-green-600">{stats?.course_growth || 0}% from last month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Subjects</CardTitle>
              <CardDescription className="text-red-600/80 dark:text-red-400/80">Total subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-red-700 dark:text-red-300">{stats?.total_departments || 0}</div>
                <Building2 className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <p className="mt-2 text-xs text-red-600/80 dark:text-red-400/80">Active subjects</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Quizzes</CardTitle>
              <CardDescription className="text-red-600/80 dark:text-red-400/80">Total quizzes created</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-red-700 dark:text-red-300">{stats?.total_quizzes || 0}</div>
                <FileText className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <p className="mt-2 text-xs text-red-600/80 dark:text-red-400/80">Across all courses</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Users</CardTitle>
                  <CardDescription>Latest registered users</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/users">
                    <Users className="w-4 h-4 mr-2" />
                    View All
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
                    <p className="text-sm text-slate-500">Loading recent users...</p>
                  </div>
                </div>
              ) : stats?.recent_users && stats.recent_users.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recent_users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.nama_lengkap}</TableCell>
                        <TableCell>
                          <Badge variant={user.tipe_user === 'admin' ? 'destructive' : user.tipe_user === 'guru' ? 'secondary' : 'default'}>
                            {user.tipe_user}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500">No recent users found.</p>
                  <p className="text-sm text-slate-400 mt-1">Recent user registrations will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Courses</CardTitle>
                  <CardDescription>Latest created courses</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/courses">
                    <BookOpen className="w-4 h-4 mr-2" />
                    View All
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
                    <p className="text-sm text-slate-500">Loading recent courses...</p>
                  </div>
                </div>
              ) : stats?.recent_courses && stats.recent_courses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recent_courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.judul_kursus}</TableCell>
                        <TableCell>{new Date(course.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500">No recent courses found.</p>
                  <p className="text-sm text-slate-400 mt-1">Recent course creations will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminPageLayout>
  )
}
