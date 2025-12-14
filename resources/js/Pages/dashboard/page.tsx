"use client"

import { useState } from "react"
import { Link, usePage } from "@inertiajs/react"
import {
  Bell,
  BookOpen,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings,
  Award,
  Menu,
  X,
  GraduationCap,
  Calendar,
  BarChart3,
  ArrowUpRight,
  FileText
} from "lucide-react"
import { Button } from "@/Components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Progress } from "@/Components/ui/progress"
import { Badge } from "@/Components/ui/badge"

export default function MainDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { auth } = usePage().props as any
  const user = auth.user

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-white dark:bg-slate-950 shadow-sm transition-transform duration-300 lg:relative lg:translate-x-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="flex h-16 items-center justify-between border-b px-6 lg:hidden">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
            LMS Tels
          </h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent hidden lg:block">
            LMS Tels
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 hidden lg:block">Learning Management System</p>
        </div>
        <nav className="grid gap-1 px-2">
          <Link href="/">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              <LayoutDashboard className="h-5 w-5 text-blue-600 dark:text-blue-500" />
              <span>Dashboard</span>
            </Button>
          </Link>
          <Link href="/dashboard/courses">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-12 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-500" />
              <span>My Courses</span>
            </Button>
          </Link>
          <Link href="/dashboard/grades">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-12 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              <Award className="h-5 w-5 text-blue-600 dark:text-blue-500" />
              <span>Grades</span>
            </Button>
          </Link>
          <Link href="/dashboard/settings">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-12 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              <Settings className="h-5 w-5 text-blue-600 dark:text-blue-500" />
              <span>Settings</span>
            </Button>
          </Link>
        </nav>
        <div className="mt-auto p-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 rounded-xl shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Student Info</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    {user?.nama_lengkap || 'Student Name'}
                  </p>
                  <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
                    Class: {user?.class || 'Not Assigned'}
                  </p>
                </div>
                <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg" asChild>
                  <Link href="/profile">
                    View Profile
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1">
        <header className="sticky top-0 z-40 flex h-16 items-center border-b bg-white px-4 dark:border-slate-800 dark:bg-slate-950 lg:px-6">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-500" />
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              LMS Tels
            </span>
            <span className="rounded-md bg-blue-100 dark:bg-blue-900 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
              Student
            </span>
          </Link>
          <div className="flex items-center gap-4 ml-auto">
            <Button
              variant="outline"
              size="icon"
              className="relative rounded-full border-blue-200 dark:border-blue-800"
            >
              <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
                3
              </span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 rounded-full">
                  <Avatar className="h-8 w-8 border-2 border-blue-100 dark:border-blue-800">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Student" />
                    <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                      ST
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline-flex font-medium">{user?.nama_lengkap || 'Student'}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                <Link href="/profile">
                  <DropdownMenuItem className="rounded-lg cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/logout" method="post" as="button">
                  <DropdownMenuItem className="rounded-lg cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 p-6">
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text">
                  Welcome Back, {user?.nama_lengkap?.split(' ')[0] || 'Student'}!
                </h1>
                <p className="text-slate-500 dark:text-slate-400">Here's what's happening with your courses today</p>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-slate-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Courses</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">5</p>
                    </div>
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                      <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-slate-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Assignments Done</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">12</p>
                    </div>
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                      <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-slate-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Due This Week</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">3</p>
                    </div>
                    <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                      <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-slate-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Average Grade</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">85%</p>
                    </div>
                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                      <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Recent Courses */}
              <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-slate-900 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-xl">My Courses</CardTitle>
                  <CardDescription>Continue learning from your enrolled courses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                        <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900 dark:text-slate-100">Advanced Mathematics</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Professor Johnson</p>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Progress</span>
                            <span className="font-medium">75%</span>
                          </div>
                          <Progress value={75} className="h-2 mt-1" />
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/courses/1">Continue</Link>
                      </Button>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                        <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900 dark:text-slate-100">Physics Fundamentals</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Professor Smith</p>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Progress</span>
                            <span className="font-medium">60%</span>
                          </div>
                          <Progress value={60} className="h-2 mt-1" />
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/courses/2">Continue</Link>
                      </Button>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                        <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900 dark:text-slate-100">History of Science</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Professor Williams</p>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Progress</span>
                            <span className="font-medium">90%</span>
                          </div>
                          <Progress value={90} className="h-2 mt-1" />
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/courses/3">Continue</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions and Upcoming */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-slate-900">
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
                    <Button variant="outline" className="w-full justify-start gap-2" asChild>
                      <Link href="/dashboard/assignments">
                        <FileText className="h-4 w-4" />
                        Assignments
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Upcoming Deadlines */}
                <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-slate-900">
                  <CardHeader>
                    <CardTitle className="text-xl">Upcoming Deadlines</CardTitle>
                    <CardDescription>Don't miss these important dates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">15</span>
                          <span className="text-xs text-slate-500">Jun</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Mathematics Quiz</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Due tomorrow</p>
                        </div>
                        <Badge variant="destructive" className="text-xs">Urgent</Badge>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">18</span>
                          <span className="text-xs text-slate-500">Jun</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Physics Assignment</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Due in 3 days</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">Medium</Badge>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">22</span>
                          <span className="text-xs text-slate-500">Jun</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">History Essay</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Due next week</p>
                        </div>
                        <Badge variant="outline" className="text-xs">Low</Badge>
                      </div>
                    </div>
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
