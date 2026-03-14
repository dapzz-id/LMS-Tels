"use client"

import TeacherLayout from "./layout"
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
  total_courses: number
  total_students: number
  total_quizzes: number
  total_content: number
  course_growth: number
  recent_students: Array<{
    id: number
    nama_lengkap: string
    email: string
    tipe_user: string
    created_at: string
  }>
  recent_courses: Array<{
    id: number
    judul_kursus: string
    status: string
    created_at: string
  }>
}

export default function TeacherDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        
        const response = await axios.get('/api/teacher/analytics?range=last-30-days')
        
        setStats(response.data.data)
      } catch (error) {
        
        if (axios.isAxiosError(error)) {
          
          
        }
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <TeacherLayout>
      <Head title="Dashboard" />
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text">
              Teacher Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Welcome to the Telesandi teacher dashboard</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:text-black" asChild>
              <Link href="/teacher/courses/create">
                <BookOpen className="w-4 h-4 mr-2" />
                New Course
              </Link>
            </Button>
            <Button variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:text-black" asChild>
              <Link href="/teacher/student-progress">
                <Users className="w-4 h-4 mr-2" />
                View Students
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-sm rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Active Courses</CardTitle>
              <CardDescription className="text-blue-600/80 dark:text-blue-400/80">Your created courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats?.total_courses ?? 0}</div>
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="w-4 h-4 mr-1 text-green-600" />
                <p className="text-xs text-green-600">{stats?.course_growth ?? 0}% from last month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Students</CardTitle>
              <CardDescription className="text-blue-600/80 dark:text-blue-400/80">Enrolled in your courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats?.total_students ?? 0}</div>
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="mt-2 text-xs text-blue-600/80 dark:text-blue-400/80">Active enrollments</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Course Content</CardTitle>
              <CardDescription className="text-blue-600/80 dark:text-blue-400/80">Total content items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats?.total_content ?? 0}</div>
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="mt-2 text-xs text-blue-600/80 dark:text-blue-400/80">Across all courses</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Quizzes</CardTitle>
              <CardDescription className="text-blue-600/80 dark:text-blue-400/80">Total quizzes created</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats?.total_quizzes ?? 0}</div>
                <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="mt-2 text-xs text-blue-600/80 dark:text-blue-400/80">Assessment tools</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Students</CardTitle>
                  <CardDescription>Latest enrolled students</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/teacher/student-progress">
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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-slate-500">Loading recent students...</p>
                  </div>
                </div>
              ) : stats?.recent_students && stats.recent_students.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recent_students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.nama_lengkap}</TableCell>
                        <TableCell>
                          <Badge variant="default">
                            {student.tipe_user}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(student.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500">No recent students found.</p>
                  <p className="text-sm text-slate-400 mt-1">Recent student enrollments will appear here.</p>
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
                  <Link href="/teacher/courses">
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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-slate-500">Loading recent courses...</p>
                  </div>
                </div>
              ) : stats?.recent_courses && stats.recent_courses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recent_courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.judul_kursus}</TableCell>
                        <TableCell>
                          <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                            {course.status}
                          </Badge>
                        </TableCell>
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
    </TeacherLayout>
  )
}
