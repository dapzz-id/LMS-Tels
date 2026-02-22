import type React from "react"
import { useState } from "react"
import { Link, usePage } from "@inertiajs/react"
import type { PageProps } from "@/types"
import {
  BookOpen,
  ChevronDown,
  LayoutDashboard,
  LineChart,
  LogOut,
  Settings,
  Users,
  ScrollText,
  Menu,
  X,
  Building2,
  Award,
  Monitor,
  Globe
} from "lucide-react"
import { Button } from "@/Components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Components/ui/dialog"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { app } = usePage<PageProps<{ app?: { vNetLink?: string | null } }>>().props
  const vNetLink = app?.vNetLink ?? null

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col overflow-y-auto border-r bg-white dark:bg-slate-950 shadow-sm transition-transform duration-300 lg:translate-x-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="flex h-16 items-center justify-between border-b px-6 lg:hidden">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
            Admin Portal
          </h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent hidden lg:block">
            Admin Portal
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 hidden lg:block">System management & control</p>
        </div>
        <nav className="grid gap-1 px-2">
          <Link href="/admin">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-12 rounded-xl hover:bg-red-50 dark:hover:bg-red-950"
            >
              <LayoutDashboard className="h-5 w-5 text-red-600 dark:text-red-500" />
              <span>Dashboard</span>
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-12 rounded-xl hover:bg-red-50 dark:hover:bg-red-950"
            >
              <Users className="h-5 w-5 text-red-600 dark:text-red-500" />
              <span>User Management</span>
            </Button>
          </Link>
          <Link href="/admin/courses">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-12 rounded-xl hover:bg-red-50 dark:hover:bg-red-950"
            >
              <BookOpen className="h-5 w-5 text-red-600 dark:text-red-500" />
              <span>Course Management</span>
            </Button>
          </Link>
          <Link href="/admin/departments">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-12 rounded-xl hover:bg-red-50 dark:hover:bg-red-950"
            >
              <Building2 className="h-5 w-5 text-red-600 dark:text-red-500" />
              <span>Subject Management</span>
            </Button>
          </Link>
          <Link href="/admin/analytics">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-12 rounded-xl hover:bg-red-50 dark:hover:bg-red-950"
            >
              <LineChart className="h-5 w-5 text-red-600 dark:text-red-500" />
              <span>Analytics & Reports</span>
            </Button>
          </Link>
          <Link href="/admin/grades">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-12 rounded-xl hover:bg-red-50 dark:hover:bg-red-950"
            >
              <Award className="h-5 w-5 text-red-600 dark:text-red-500" />
              <span>Grades Management</span>
            </Button>
          </Link>
          <Link href="/admin/student-monitoring">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-12 rounded-xl hover:bg-red-50 dark:hover:bg-red-950"
            >
              <Monitor className="h-5 w-5 text-red-600 dark:text-red-500" />
              <span>Student Monitoring</span>
            </Button>
          </Link>
          <Link href="/admin/student-progress">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-12 rounded-xl hover:bg-red-50 dark:hover:bg-red-950"
            >
              <ScrollText className="h-5 w-5 text-red-600 dark:text-red-500" />
              <span>Student Progress</span>
            </Button>
          </Link>
        </nav>
        <div className="mt-auto p-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="h-12 w-full justify-start gap-2 rounded-xl border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
              >
                <Globe className="h-5 w-5" />
                <span>Login V-Net</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Login V-Net</DialogTitle>
                <DialogDescription>
                  Anda akan diarahkan ke halaman login V-Net di tab baru.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:justify-end">
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Tutup
                  </Button>
                </DialogClose>
                {vNetLink ? (
                  <Button type="button" asChild>
                    <a href={vNetLink} target="_blank" rel="noopener noreferrer">
                      Lanjut ke V-Net
                    </a>
                  </Button>
                ) : (
                  <Button type="button" disabled>
                    V_NET_LINK belum diatur
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
        <header className="sticky top-0 z-40 flex h-16 items-center border-b bg-white px-4 dark:border-slate-800 dark:bg-slate-950 lg:px-6">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <BookOpen className="h-6 w-6 text-red-600 dark:text-red-500" />
            <span className="text-lg font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
              LMS Tels
            </span>
            <span className="rounded-md bg-red-100 dark:bg-red-900 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
              Admin
            </span>
          </Link>
          <div className="flex items-center gap-4 ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 rounded-full">
                  <Avatar className="h-8 w-8 border-2 border-red-100 dark:border-red-800">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" />
                    <AvatarFallback className="bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400">
                      AD
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline-flex font-medium">Admin</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                  <Link href="/admin/settings" className="flex w-full items-center gap-2">
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
        <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
