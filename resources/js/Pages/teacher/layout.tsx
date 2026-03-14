import type React from "react"
import { useEffect, useState } from "react"
import { Link, usePage } from "@inertiajs/react"
import {
  BookOpen,
  ChevronDown,
  LayoutDashboard,
  LineChart,
  LogOut,
  Settings,
  Users,
  Award,
  Menu,
  X
} from "lucide-react"
import { Button } from "@/Components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu"
import type { User } from "@/types"

type TeacherLayoutPageProps = {
  auth: {
    user: User
  }
}

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const page = usePage<TeacherLayoutPageProps>()
  const { auth } = page.props
  const currentUrl = page.url
  const normalizePath = (path: string) =>
    path.split("?")[0].replace(/\/+$/, "") || "/"
  const currentPath = normalizePath(currentUrl)
  const displayName = auth.user?.nama_lengkap || auth.user?.name || "Teacher"

  useEffect(() => {
    setIsSidebarOpen(false)
  }, [currentUrl])

  const isActivePath = (path: string, options?: { exact?: boolean; aliases?: string[] }) => {
    const exact = options?.exact ?? false
    const aliases = options?.aliases ?? []
    const candidates = [path, ...aliases]

    return candidates.some((candidate) =>
      exact ? currentPath === candidate : currentPath === candidate || currentPath.startsWith(`${candidate}/`),
    )
  }

  const navButtonClass = (active: boolean) =>
    `justify-start w-full h-12 gap-2 rounded-xl ${
      active
        ? "bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300"
        : "hover:bg-blue-50 dark:hover:bg-blue-950"
    }`

  const navIconClass = (active: boolean) =>
    active ? "w-5 h-5 text-blue-700 dark:text-blue-300" : "w-5 h-5 text-blue-600 dark:text-blue-500"

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
          {(() => {
            const active = isActivePath("/teacher", { exact: true })
            return (
          <Button
            asChild
            variant="ghost"
            className={navButtonClass(active)}
          >
            <Link href="/teacher">
              <LayoutDashboard className={navIconClass(active)} />
              <span>Dashboard</span>
            </Link>
          </Button>
            )
          })()}
          {(() => {
            const active = isActivePath("/teacher/courses")
            return (
          <Button
            asChild
            variant="ghost"
            className={navButtonClass(active)}
          >
            <Link href="/teacher/courses">
              <BookOpen className={navIconClass(active)} />
              <span>Courses</span>
            </Link>
          </Button>
            )
          })()}

          {(() => {
            const active = isActivePath("/teacher/analytics")
            return (
          <Button
            asChild
            variant="ghost"
            className={navButtonClass(active)}
          >
            <Link href="/teacher/analytics">
              <LineChart className={navIconClass(active)} />
              <span>Analytics</span>
            </Link>
          </Button>
            )
          })()}
          {(() => {
            const active = isActivePath("/teacher/student-grades")
            return (
          <Button
            asChild
            variant="ghost"
            className={navButtonClass(active)}
          >
            <Link href="/teacher/student-grades">
              <Award className={navIconClass(active)} />
              <span>Student Grades</span>
            </Link>
          </Button>
            )
          })()}
          {(() => {
            const active = isActivePath("/teacher/student-monitoring")
            return (
          <Button
            asChild
            variant="ghost"
            className={navButtonClass(active)}
          >
            <Link href="/teacher/student-monitoring">
              <Users className={navIconClass(active)} />
              <span>Student Monitoring</span>
            </Link>
          </Button>
            )
          })()}
          {(() => {
            const active = isActivePath("/teacher/student-progress", { aliases: ["/teacher/students"] })
            return (
          <Button
            asChild
            variant="ghost"
            className={navButtonClass(active)}
          >
            <Link href="/teacher/student-progress">
              <Users className={navIconClass(active)} />
              <span>Student Progress</span>
            </Link>
          </Button>
            )
          })()}
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
            <img src="/logotelesandi.png" alt="Logo" className="h-8 w-8 rounded-full" />
            <span className="text-lg font-bold text-transparent bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text">
              LMS Tels
            </span>
            <span className="rounded-md bg-blue-100 dark:bg-blue-900 px-2 ml-1 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
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
                  <span className="hidden font-medium md:inline-flex">{displayName}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl">
                <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                  <Link href="/profile" className="flex w-full items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
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
        <main className="flex-1 p-6 overflow-auto bg-slate-50 dark:bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  )
}
