import type React from "react"
import { useState } from "react"
import { Link } from "@inertiajs/react"
import {
  BookOpen,
  ChevronDown,
  LayoutDashboard,
  LineChart,
  LogOut,
  Settings,
  Users,
  Award,
  HelpCircle,
  Menu,
  X
} from "lucide-react"
import { Button } from "@/Components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu"
import { Card, CardContent } from "@/Components/ui/card"

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-white dark:bg-slate-950 shadow-sm transition-transform duration-300 lg:translate-x-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b lg:hidden">
          <h2 className="text-lg font-semibold text-transparent bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text">
            Teacher Portal
          </h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <h2 className="hidden text-lg font-semibold text-transparent bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text lg:block">
            Teacher Portal
          </h2>
          <p className="hidden text-sm text-slate-500 dark:text-slate-400 lg:block">Manage your courses and students</p>
        </div>
        <nav className="grid gap-1 px-2">
          <Link href="/teacher">
            <Button
              variant="ghost"
              className="justify-start w-full h-12 gap-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              <LayoutDashboard className="w-5 h-5 text-blue-600 dark:text-blue-500" />
              <span>Dashboard</span>
            </Button>
          </Link>
          <Link href="/teacher/courses">
            <Button
              variant="ghost"
              className="justify-start w-full h-12 gap-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-500" />
              <span>Courses</span>
            </Button>
          </Link>

          <Link href="/teacher/analytics">
            <Button
              variant="ghost"
              className="justify-start w-full h-12 gap-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              <LineChart className="w-5 h-5 text-blue-600 dark:text-blue-500" />
              <span>Analytics</span>
            </Button>
          </Link>
          <Link href="/teacher/student-grades">
            <Button
              variant="ghost"
              className="justify-start w-full h-12 gap-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              <Award className="w-5 h-5 text-blue-600 dark:text-blue-500" />
              <span>Student Grades</span>
            </Button>
          </Link>
          <Link href="/teacher/student-monitoring">
            <Button
              variant="ghost"
              className="justify-start w-full h-12 gap-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-500" />
              <span>Student Monitoring</span>
            </Button>
          </Link>
          <Link href="/teacher/student-progress">
            <Button
              variant="ghost"
              className="justify-start w-full h-12 gap-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-500" />
              <span>Student Progress</span>
            </Button>
          </Link>
        </nav>
        <div className="p-4 mt-auto">
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
      <div className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-40 flex items-center h-16 px-4 bg-white border-b dark:border-slate-800 dark:bg-slate-950 lg:px-6">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/teacher" className="flex items-center gap-2 font-semibold">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-500" />
            <span className="text-lg font-bold text-transparent bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text">
              LMS Tels
            </span>
            <span className="rounded-md bg-blue-100 dark:bg-blue-900 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
              Teacher
            </span>
          </Link>
          <div className="flex items-center gap-4 ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 rounded-full">
                  <Avatar className="w-8 h-8 border-2 border-blue-100 dark:border-blue-800">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Teacher" />
                    <AvatarFallback className="text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400">
                      TC
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden font-medium md:inline-flex">Dr. Smith</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl">
                <DropdownMenuItem className="rounded-lg cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto bg-slate-50 dark:bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  )
}
