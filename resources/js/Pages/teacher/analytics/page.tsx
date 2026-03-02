"use client"

import { useState, useEffect } from "react"
import { Head } from '@inertiajs/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/Components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Button } from "@/Components/ui/button"
import { Download, LineChartIcon, ChevronRight, Users, BookOpen, FileText, Building2 } from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Progress } from "@/Components/ui/progress"
import { Badge } from "@/Components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import TeacherLayout from "../layout"
import axios from "axios"

interface AnalyticsData {
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
  course_stats: {
    published: number
    draft: number
    total_content: number
  }
  quiz_stats: {
    total_submissions: number
    average_score: number
    completion_rate: number
  }
  monthly_data: Array<{
    month: string
    courses: number
    students: number
    quizzes: number
  }>
  top_courses: Array<{
    id: number
    title: string
    enrollment_count: number
    completion_rate: number
  }>
  student_activity: Array<{
    date: string
    active_students: number
    new_enrollments: number
  }>
  engagement_data: {
    engagement_rate: number
    completion_rate: number
    average_score: number
    total_enrollments: number
    active_enrollments: number
    completed_enrollments: number
  }
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [timeRange, setTimeRange] = useState("last-30-days")

  const handleExportReport = async () => {
    const params = new URLSearchParams({ range: timeRange })

    try {
      setIsExporting(true)

      const response = await axios.get(`/api/teacher/analytics/export?${params.toString()}`, {
        responseType: "blob",
      })

      const disposition = response.headers["content-disposition"] as string | undefined
      const fileNameMatch = disposition?.match(/filename="?([^"]+)"?/)
      const fileName = fileNameMatch?.[1] ?? `teacher-progress-report-${Date.now()}.xlsx`

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export report:", error)
    } finally {
      setIsExporting(false)
    }
  }

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/api/teacher/analytics?range=${timeRange}`)
        setData(response.data.data)
      } catch (error) {
        
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [timeRange])

  if (loading) {
    return (
      <TeacherLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-slate-500">Loading analytics...</p>
            </div>
          </div>
        </div>
      </TeacherLayout>
    )
  }

  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444']

  return (
    <TeacherLayout>
      <Head title="Analytics Dashboard" />
      <div className="space-y-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text">
              Analytics & Reports
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Track your courses and student performance</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px] rounded-xl border-slate-200 dark:border-slate-800">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="last-7-days">Last 7 days</SelectItem>
                <SelectItem value="last-30-days">Last 30 days</SelectItem>
                <SelectItem value="last-90-days">Last 90 days</SelectItem>
                <SelectItem value="all-time">All time</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="rounded-xl border-slate-200 dark:border-slate-800"
              onClick={handleExportReport}
              disabled={isExporting}
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? "Exporting..." : "Export Report"}
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="overflow-hidden transition-shadow border-0 shadow-md rounded-xl hover:shadow-lg">
            <div className="p-1 bg-gradient-to-r from-blue-600 to-blue-500"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <div className="flex items-center justify-center bg-blue-100 rounded-full h-9 w-9 dark:bg-blue-900">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data?.total_courses || 0}</div>
              <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="text-green-500">+{data?.course_growth || 0}%</span> from last month
              </p>
              <div className="mt-4">
                <Progress value={75} className="h-1.5 bg-blue-100 dark:bg-blue-900" />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden transition-shadow border-0 shadow-md rounded-xl hover:shadow-lg">
            <div className="p-1 bg-gradient-to-r from-green-600 to-green-500"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <div className="flex items-center justify-center bg-green-100 rounded-full h-9 w-9 dark:bg-green-900">
                <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data?.total_students || 0}</div>
              <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                Enrolled students
              </p>
              <div className="mt-4">
                <Progress value={65} className="h-1.5 bg-green-100 dark:bg-green-900" />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden transition-shadow border-0 shadow-md rounded-xl hover:shadow-lg">
            <div className="p-1 bg-gradient-to-r from-purple-600 to-purple-500"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Quiz Submissions</CardTitle>
              <div className="flex items-center justify-center bg-purple-100 rounded-full h-9 w-9 dark:bg-purple-900">
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data?.quiz_stats?.total_submissions || 0}</div>
              <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                Avg score: {data?.quiz_stats?.average_score || 0}%
              </p>
              <div className="mt-4">
                <Progress value={data?.quiz_stats?.completion_rate || 0} className="h-1.5 bg-purple-100 dark:bg-purple-900" />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden transition-shadow border-0 shadow-md rounded-xl hover:shadow-lg">
            <div className="p-1 bg-gradient-to-r from-amber-600 to-amber-500"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
              <div className="flex items-center justify-center rounded-full h-9 w-9 bg-amber-100 dark:bg-amber-900">
                <LineChartIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data?.engagement_data?.engagement_rate || 0}%</div>
              <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                Student engagement
              </p>
              <div className="mt-4">
                <Progress value={data?.engagement_data?.engagement_rate || 0} className="h-1.5 bg-amber-100 dark:bg-amber-900" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Tables */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
            <TabsTrigger
              value="overview"
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="students"
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm"
            >
              Students
            </TabsTrigger>
            <TabsTrigger
              value="courses"
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm"
            >
              Courses
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm"
            >
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-0 shadow-md rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Course Growth</CardTitle>
                  <CardDescription>Monthly growth trends (January until current month)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data?.monthly_data || []} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="courses" name="Courses" stroke="#3b82f6" strokeWidth={2} />
                        <Line type="monotone" dataKey="students" name="Students" stroke="#22c55e" strokeWidth={2} />
                        <Line type="monotone" dataKey="quizzes" name="Quizzes" stroke="#f59e0b" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Course Status</CardTitle>
                  <CardDescription>Published vs Draft courses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Published', value: data?.course_stats?.published || 0 },
                            { name: 'Draft', value: data?.course_stats?.draft || 0 },
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                        >
                          {COLORS.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-0 shadow-md rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Student Activity</CardTitle>
                  <CardDescription>Daily active students and enrollments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data?.student_activity || []} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="active_students" name="Active Students" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                        <Area type="monotone" dataKey="new_enrollments" name="New Enrollments" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Recent Students</CardTitle>
                  <CardDescription>Latest enrolled students</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.recent_students?.map((student) => (
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
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="courses" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-0 shadow-md rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Top Courses</CardTitle>
                  <CardDescription>Most popular courses by enrollment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data?.top_courses || []} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="title" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="enrollment_count" name="Enrollments" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Recent Courses</CardTitle>
                  <CardDescription>Latest created courses</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.recent_courses?.map((course) => (
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
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <Card className="border-0 shadow-md rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Quiz Performance</CardTitle>
                <CardDescription>Overall quiz statistics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{data?.quiz_stats?.total_submissions || 0}</div>
                    <p className="text-sm text-slate-500">Total Submissions</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{data?.quiz_stats?.average_score || 0}%</div>
                    <p className="text-sm text-slate-500">Average Score</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-600">{data?.quiz_stats?.completion_rate || 0}%</div>
                    <p className="text-sm text-slate-500">Completion Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
    </TeacherLayout>
  )
}
