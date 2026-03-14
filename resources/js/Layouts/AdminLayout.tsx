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

  const page = usePage<PageProps<{ app?: { vNetLink?: string | null } }>>()
  const { app } = page.props
  const vNetLink = app?.vNetLink ?? null

  const currentUrl = page.url
  const normalizePath = (path: string) =>
    path.split("?")[0].replace(/\/+$/, "") || "/"
  const currentPath = normalizePath(currentUrl)

  const isActivePath = (
    path: string,
    options?: { exact?: boolean; aliases?: string[] }
  ) => {
    const exact = options?.exact ?? false
    const aliases = options?.aliases ?? []
    const candidates = [path, ...aliases]

    return candidates.some((candidate) =>
      exact
        ? currentPath === candidate
        : currentPath === candidate || currentPath.startsWith(`${candidate}/`)
    )
  }

  const navButtonClass = (active: boolean) =>
    `w-full justify-start gap-2 h-12 rounded-xl ${
      active
        ? "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-300"
        : "hover:bg-red-50 dark:hover:bg-red-950"
    }`

  const navIconClass = (active: boolean) =>
    active
      ? "h-5 w-5 text-red-700 dark:text-red-300"
      : "h-5 w-5 text-red-600 dark:text-red-500"

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col overflow-y-auto border-r bg-white dark:bg-slate-950 shadow-sm transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
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
          <p className="text-sm text-slate-500 dark:text-slate-400 hidden lg:block">
            System management & control
          </p>
        </div>

        <nav className="grid gap-1 px-2">

          {(() => {
            const active = isActivePath("/admin", { exact: true })
            return (
              <Button asChild variant="ghost" className={navButtonClass(active)}>
                <Link href="/admin">
                  <LayoutDashboard className={navIconClass(active)} />
                  <span>Dashboard</span>
                </Link>
              </Button>
            )
          })()}

          {(() => {
            const active = isActivePath("/admin/users")
            return (
              <Button asChild variant="ghost" className={navButtonClass(active)}>
                <Link href="/admin/users">
                  <Users className={navIconClass(active)} />
                  <span>User Management</span>
                </Link>
              </Button>
            )
          })()}

          {(() => {
            const active = isActivePath("/admin/courses")
            return (
              <Button asChild variant="ghost" className={navButtonClass(active)}>
                <Link href="/admin/courses">
                  <BookOpen className={navIconClass(active)} />
                  <span>Course Management</span>
                </Link>
              </Button>
            )
          })()}

          {(() => {
            const active = isActivePath("/admin/departments")
            return (
              <Button asChild variant="ghost" className={navButtonClass(active)}>
                <Link href="/admin/departments">
                  <Building2 className={navIconClass(active)} />
                  <span>Subject Management</span>
                </Link>
              </Button>
            )
          })()}

          {(() => {
            const active = isActivePath("/admin/analytics")
            return (
              <Button asChild variant="ghost" className={navButtonClass(active)}>
                <Link href="/admin/analytics">
                  <LineChart className={navIconClass(active)} />
                  <span>Analytics & Reports</span>
                </Link>
              </Button>
            )
          })()}

          {(() => {
            const active = isActivePath("/admin/grades")
            return (
              <Button asChild variant="ghost" className={navButtonClass(active)}>
                <Link href="/admin/grades">
                  <Award className={navIconClass(active)} />
                  <span>Grades Management</span>
                </Link>
              </Button>
            )
          })()}

          {(() => {
            const active = isActivePath("/admin/student-monitoring")
            return (
              <Button asChild variant="ghost" className={navButtonClass(active)}>
                <Link href="/admin/student-monitoring">
                  <Monitor className={navIconClass(active)} />
                  <span>Student Monitoring</span>
                </Link>
              </Button>
            )
          })()}

          {(() => {
            const active = isActivePath("/admin/student-progress")
            return (
              <Button asChild variant="ghost" className={navButtonClass(active)}>
                <Link href="/admin/student-progress">
                  <ScrollText className={navIconClass(active)} />
                  <span>Student Progress</span>
                </Link>
              </Button>
            )
          })()}

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

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-40 flex h-16 items-center border-b bg-white px-4 dark:border-slate-800 dark:bg-slate-950 lg:px-6">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <img src="/logotelesandi.png" alt="Logo" className="h-8 w-8 rounded-full" />
            <span className="text-lg font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
              LMS Tels
            </span>
            <span className="rounded-md bg-red-100 dark:bg-red-900 px-2 ml-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
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