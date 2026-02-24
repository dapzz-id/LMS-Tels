"use client"

import { Link } from "@inertiajs/react"
import {
  Award,
  BookOpen,
  FileText,
  LayoutDashboard,
  Settings,
  X,
} from "lucide-react"
import { Button } from "@/Components/ui/button"

type StudentSidebarActive = "dashboard" | "courses" | "grades" | "certificates" | "settings"

type StudentSidebarProps = {
  active: StudentSidebarActive
  isOpen: boolean
  onClose: () => void
}

const navItems: Array<{
  key: StudentSidebarActive
  label: string
  href: string
  icon: typeof LayoutDashboard
}> = [
  { key: "dashboard", label: "Dashboard", href: "/", icon: LayoutDashboard },
  { key: "courses", label: "My Courses", href: "/dashboard/courses", icon: BookOpen },
  { key: "grades", label: "Grades", href: "/dashboard/grades", icon: Award },
  { key: "certificates", label: "Certificates", href: "/dashboard/certificates", icon: FileText },
  { key: "settings", label: "Settings", href: "/dashboard/settings", icon: Settings },
]

export default function StudentSidebar({ active, isOpen, onClose }: StudentSidebarProps) {
  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-white shadow-sm transition-transform duration-300 dark:bg-slate-950 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b lg:hidden">
          <h2 className="text-lg font-semibold text-transparent bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text">
            LMS Tels
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <h2 className="hidden text-lg font-semibold text-transparent bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text lg:block">
            LMS Tels
          </h2>
          <p className="hidden text-sm text-slate-500 dark:text-slate-400 lg:block">
            Learning Management System
          </p>
        </div>
        <nav className="grid gap-1 px-2">
          {navItems.map((item) => {
            const isActive = active === item.key
            const Icon = item.icon

            return (
              <Link key={item.key} href={item.href}>
                <Button
                  variant="ghost"
                  className={`h-12 w-full justify-start gap-2 rounded-xl ${
                    isActive
                      ? "bg-blue-50 text-blue-700 hover:bg-blue-50 dark:bg-blue-950 dark:text-blue-200"
                      : "text-slate-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:bg-blue-950"
                  }`}
                >
                  <Icon className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </nav>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  )
}
