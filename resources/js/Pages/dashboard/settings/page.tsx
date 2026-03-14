"use client"

import { useEffect, useState } from "react"
import { Link, usePage, useForm, Head } from "@inertiajs/react"
import {
  BookOpen,
  ChevronDown,
  LineChart,
  LogOut,
  Settings,
  Users,
  FileText,
  Shield,
  ScrollText,
  Menu,
  X,
  Building2,
  Award,
  Monitor,
  GraduationCap,
  Calendar,
  Activity,
  BarChart3,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Save,
  User,
  Mail,
  Lock
} from "lucide-react"
import { Button } from "@/Components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import StudentSidebar from "@/Components/StudentSidebar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Components/ui/dialog"
import { toast } from "sonner"
import { getFirstMessage } from "@/lib/api-messages"

export default function SettingsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const { auth, flash } = usePage().props as any
  const user = auth.user

  useEffect(() => {
    if (flash?.success) {
      toast.success(flash.success)
    }
    if (flash?.error) {
      toast.error(flash.error)
    }
  }, [flash?.success, flash?.error])

  const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
    nama_lengkap: user?.nama_lengkap || '',
    email: user?.email || '',
    username: user?.username || '',
  })

  const passwordForm = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    patch(route('profile.update'), {
      onError: (errors) => {
        toast.error(getFirstMessage({ errors }, 'Failed to update profile. Please try again.'))
      }
    })
  }

  const updatePassword = (e: React.FormEvent) => {
    e.preventDefault()

    passwordForm.put(route('password.update'), {
      onSuccess: () => {
        setIsPasswordModalOpen(false)
        passwordForm.reset()
      },
      onError: (errors) => {
        toast.error(getFirstMessage({ errors }, 'Failed to update password'))
      },
    })
  }

  return (
    <div className="flex min-h-screen">
      <Head title="Settings" />
      <StudentSidebar
        active="settings"
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main content */}
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
          <div className="flex items-center gap-4 ml-auto">
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
        <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 p-6">
          <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text">
                  Settings
                </h1>
                <p className="text-slate-500 dark:text-slate-400">Manage your account settings and preferences</p>
              </div>
          </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Profile Information */}
              <Card className="border-0 shadow-sm rounded-xl">
                  <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal information and contact details
                  </CardDescription>
                  </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                      <Label htmlFor="nama_lengkap">Full Name</Label>
                        <Input
                        id="nama_lengkap"
                        value={data.nama_lengkap}
                        onChange={(e) => setData('nama_lengkap', e.target.value)}
                        placeholder="Enter your full name"
                      />
                      {errors.nama_lengkap && (
                        <p className="text-sm text-red-600">{errors.nama_lengkap}</p>
                      )}
                      </div>

                      <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                        <Input
                        id="username"
                        value={data.username}
                        onChange={(e) => setData('username', e.target.value)}
                        placeholder="Enter your username"
                      />
                      {errors.username && (
                        <p className="text-sm text-red-600">{errors.username}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="Enter your email address"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>

                    <Button type="submit" disabled={processing} className="w-full bg-blue-600 hover:bg-blue-700">
                      <Save className="h-4 w-4 mr-2" />
                      {processing ? 'Saving...' : 'Save Changes'}
                    </Button>

                    {recentlySuccessful && flash?.success && (
                      <p className="text-sm text-green-600 text-center">{flash.success}</p>
                    )}
                  </form>
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card className="border-0 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Account Information
                  </CardTitle>
                  <CardDescription>
                    Your account details and current status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Student ID</p>
                        <p className="text-xs text-slate-500">{user?.id || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Class</p>
                        <p className="text-xs text-slate-500">{user?.class || 'Not Assigned'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">User Type</p>
                        <p className="text-xs text-slate-500 capitalize">{user?.tipe_user || 'Student'}</p>
                    </div>
                  </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Member Since</p>
                        <p className="text-xs text-slate-500">
                          {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                  </div>

                    <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <Lock className="h-4 w-4 mr-2" />
                          Change Password
                  </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Change Password</DialogTitle>
                          <DialogDescription>
                            Enter your current password and choose a new one.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={updatePassword} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="current_password">Current Password</Label>
                            <Input
                              id="current_password"
                              type="password"
                              value={passwordForm.data.current_password}
                              onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                              placeholder="Enter current password"
                              required
                            />
                            {passwordForm.errors.current_password && (
                              <p className="text-sm text-red-600">{passwordForm.errors.current_password}</p>
                            )}
                      </div>
                          <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                              id="password"
                              type="password"
                              value={passwordForm.data.password}
                              onChange={(e) => passwordForm.setData('password', e.target.value)}
                              placeholder="Enter new password"
                              required
                            />
                            {passwordForm.errors.password && (
                              <p className="text-sm text-red-600">{passwordForm.errors.password}</p>
                            )}
                      </div>
                          <div className="space-y-2">
                            <Label htmlFor="password_confirmation">Confirm New Password</Label>
                            <Input
                              id="password_confirmation"
                              type="password"
                              value={passwordForm.data.password_confirmation}
                              onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                              placeholder="Confirm new password"
                              required
                            />
                            {passwordForm.errors.password_confirmation && (
                              <p className="text-sm text-red-600">{passwordForm.errors.password_confirmation}</p>
                            )}
                      </div>
                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsPasswordModalOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              className="bg-blue-600 hover:bg-blue-700"
                              disabled={passwordForm.processing}
                            >
                              {passwordForm.processing ? 'Updating...' : 'Update Password'}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>
        </div>
      </main>
      </div>

    </div>
  )
}
