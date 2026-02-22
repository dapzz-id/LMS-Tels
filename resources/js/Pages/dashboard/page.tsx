"use client"

import { useState } from "react"
import { Link, usePage } from "@inertiajs/react"
import {
  BookOpen,
  ChevronDown,
  LogOut,
  Settings,
  Award,
  Menu,
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
import StudentSidebar from "@/Components/StudentSidebar"

export default function MainDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { auth } = usePage().props as any
  const user = auth.user

  return (
    <div className="flex min-h-screen">
      <StudentSidebar
        active="dashboard"
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-40 flex items-center h-16 px-4 bg-white border-b dark:border-slate-800 dark:bg-slate-950 lg:px-6">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-500" />
            <span className="text-lg font-bold text-transparent bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text">
              LMS Tels
            </span>
            <span className="rounded-md bg-blue-100 dark:bg-blue-900 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
              Student
            </span>
          </Link>
          <div className="flex items-center gap-4 ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 rounded-full">
                  <Avatar className="w-8 h-8 border-2 border-blue-100 dark:border-blue-800">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Student" />
                    <AvatarFallback className="text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400">
                      ST
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden font-medium md:inline-flex">{user?.nama_lengkap || 'Student'}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl">
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                  <Link href="/profile" className="flex w-full items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                  <Link href={route("logout")} method="post" as="button" className="flex w-full items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto bg-slate-50 dark:bg-slate-950">
          <div className="max-w-6xl mx-auto space-y-6">
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
              <Card className="bg-white border-0 shadow-sm rounded-xl dark:bg-slate-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Courses</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">5</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900">
                      <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm rounded-xl dark:bg-slate-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Assignments Done</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">12</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full dark:bg-green-900">
                      <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm rounded-xl dark:bg-slate-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Due This Week</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">3</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-full dark:bg-orange-900">
                      <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm rounded-xl dark:bg-slate-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Average Grade</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">85%</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full dark:bg-purple-900">
                      <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Recent Courses */}
              <Card className="bg-white border-0 shadow-sm rounded-xl dark:bg-slate-900 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-xl">My Courses</CardTitle>
                  <CardDescription>Continue learning from your enrolled courses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 transition-colors border rounded-lg border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <div className="p-3 bg-blue-100 rounded-lg dark:bg-blue-900">
                        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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

                    <div className="flex items-center gap-4 p-4 transition-colors border rounded-lg border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <div className="p-3 bg-green-100 rounded-lg dark:bg-green-900">
                        <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
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

                    <div className="flex items-center gap-4 p-4 transition-colors border rounded-lg border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <div className="p-3 bg-purple-100 rounded-lg dark:bg-purple-900">
                        <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
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
                <Card className="bg-white border-0 shadow-sm rounded-xl dark:bg-slate-900">
                  <CardHeader>
                    <CardTitle className="text-xl">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="justify-start w-full gap-2" asChild>
                      <Link href="/dashboard/courses">
                        <BookOpen className="w-4 h-4" />
                        Browse Courses
                      </Link>
                    </Button>
                    <Button variant="outline" className="justify-start w-full gap-2" asChild>
                      <Link href="/dashboard/grades">
                        <Award className="w-4 h-4" />
                        View Grades
                      </Link>
                    </Button>
                    <Button variant="outline" className="justify-start w-full gap-2" asChild>
                      <Link href="/dashboard/assignments">
                        <FileText className="w-4 h-4" />
                        Assignments
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Upcoming Deadlines */}
                <Card className="bg-white border-0 shadow-sm rounded-xl dark:bg-slate-900">
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
