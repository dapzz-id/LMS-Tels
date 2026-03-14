"use client"

import { useMemo, useState } from "react"
import { Link, usePage, Head } from "@inertiajs/react"
import type { PageProps as BasePageProps } from "@/types"
import {
  Award,
  BookOpen,
  ChevronDown,
  FileText,
  LogOut,
  Menu,
  Settings,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu"
import { Progress } from "@/Components/ui/progress"
import StudentSidebar from "@/Components/StudentSidebar"
import { toAbsoluteAssetUrl } from "@/lib/utils"

type DashboardStats = {
  active_courses: number
  assignments_done: number
  due_this_week: number
  average_grade: number
}

type DashboardCourse = {
  id: number
  title: string
  teacher_name: string
  progress: number
  thumbnail?: string | null
  last_activity_at?: string | null
}

type PageProps = BasePageProps<{
  stats?: DashboardStats
  myCourses?: DashboardCourse[]
  recentlyAccessedCourses?: DashboardCourse[]
}>

export default function MainDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { auth, stats, myCourses, recentlyAccessedCourses } = usePage<PageProps>().props
  const user = auth.user

  const studentName = useMemo(() => {
    return user?.nama_lengkap || user?.name || "Student"
  }, [user?.nama_lengkap, user?.name])

  const firstName = useMemo(() => {
    return studentName.split(" ")[0] || "Student"
  }, [studentName])

  const dashboardStats: DashboardStats = {
    active_courses: stats?.active_courses ?? 0,
    assignments_done: stats?.assignments_done ?? 0,
    due_this_week: stats?.due_this_week ?? 0,
    average_grade: stats?.average_grade ?? 0,
  }

  const courses = myCourses ?? []
  const recentCourses = recentlyAccessedCourses ?? []

  return (
    <div className="flex min-h-screen">
      <Head title="Dashboard" />
      <StudentSidebar
        active="dashboard"
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-40 flex h-16 items-center border-b bg-white px-4 dark:border-slate-800 dark:bg-slate-950 lg:px-6">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <img src="/logotelesandi.png" alt="Logo" className="h-8 w-8 rounded-full" />
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-lg font-bold text-transparent">
              LMS Tels
            </span>
            <span className="rounded-md bg-blue-100 px-2 ml-1 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-400">
              Student
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 rounded-full">
                  <Avatar className="h-8 w-8 border-2 border-blue-100 dark:border-blue-800">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Student" />
                    <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                      ST
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden font-medium md:inline-flex">{studentName}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                  <Link href="/profile" className="flex w-full items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                  <Link href={route("logout")} method="post" as="button" className="flex w-full items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50 p-6 dark:bg-slate-950">
          <div className="mx-auto max-w-6xl space-y-6">
            <div>
              <h1 className="bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
                Welcome Back, {firstName}!
              </h1>
              <p className="text-slate-500 dark:text-slate-400">Here's your latest study progress from real-time data.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="rounded-xl border-0 bg-white shadow-sm dark:bg-slate-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Courses</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{dashboardStats.active_courses}</p>
                    </div>
                    <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                      <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border-0 bg-white shadow-sm dark:bg-slate-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Assignments Done</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{dashboardStats.assignments_done}</p>
                    </div>
                    <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                      <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border-0 bg-white shadow-sm dark:bg-slate-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Due This Week</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{dashboardStats.due_this_week}</p>
                    </div>
                    <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900">
                      <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border-0 bg-white shadow-sm dark:bg-slate-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Average Grade</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{dashboardStats.average_grade}%</p>
                    </div>
                    <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
                      <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="rounded-xl border-0 bg-white shadow-sm dark:bg-slate-900 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-xl">My Courses</CardTitle>
                  <CardDescription>Continue learning from your enrolled courses</CardDescription>
                </CardHeader>
                <CardContent>
                  {courses.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                      <p className="font-medium text-slate-900 dark:text-slate-100">Belum ada kursus yang kamu ikuti</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Mulai dari halaman daftar kursus untuk melihat materi pembelajaran.</p>
                      <Button className="mt-4" asChild>
                        <Link href="/dashboard/courses">Lihat Kursus</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {courses.map((course) => (
                        <div
                          key={course.id}
                          className="flex items-center gap-4 rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                        >
                          <div className="h-14 w-20 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                            <img
                              src={toAbsoluteAssetUrl(course.thumbnail, "/placeholder.svg")}
                              alt={course.title}
                              className="h-full w-full object-cover"
                              onError={(event) => {
                                event.currentTarget.src = "/placeholder.svg"
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-slate-900 dark:text-slate-100">{course.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{course.teacher_name}</p>
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">Progress</span>
                                <span className="font-medium">{course.progress}%</span>
                              </div>
                              <Progress value={course.progress} className="mt-1 h-2" />
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={route('student.courses.learn', { id: course.id })}>Continue</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="rounded-xl border-0 bg-white shadow-sm dark:bg-slate-900">
                  <CardHeader>
                    <CardTitle className="text-xl">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start gap-2" asChild>
                      <Link href="/dashboard/courses">
                        <BookOpen className="h-4 w-4" />
                        Browse Courses
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2" asChild>
                      <Link href="/dashboard/grades">
                        <Award className="h-4 w-4" />
                        View Grades
                      </Link>
                    </Button>
                    {/* <Button variant="outline" className="w-full justify-start gap-2" asChild>
                      <Link href="/dashboard/assignments">
                        <FileText className="h-4 w-4" />
                        Assignments
                      </Link>
                    </Button> */}
                  </CardContent>
                </Card>
                <Card className="rounded-xl border-0 bg-white shadow-sm dark:bg-slate-900">
                  <CardHeader>
                    <CardTitle className="text-xl">Recently Accessed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentCourses.length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Belum ada aktivitas course terbaru.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {recentCourses.map((course) => (
                          <Link
                            key={course.id}
                            href={route('student.courses.learn', { id: course.id })}
                            className="block rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
                          >
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-1">{course.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Last access: {course.last_activity_at ? new Date(course.last_activity_at).toLocaleString() : "-"}
                            </p>
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
