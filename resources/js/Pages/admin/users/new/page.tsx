"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import AdminPageLayout from "../../layout"
import { Link, router, Head } from "@inertiajs/react"

import type { Errors } from "@inertiajs/core"
import { getFieldErrorMessage } from "@/lib/api-messages"

export default function NewUserPage() {
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    username: "",
    email: "",
    password: "",
    tipe_user: "",
    class: "",
  })
  const [errors, setErrors] = useState<Errors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const namaLengkapError = getFieldErrorMessage(errors.nama_lengkap)
  const usernameError = getFieldErrorMessage(errors.username)
  const emailError = getFieldErrorMessage(errors.email)
  const passwordError = getFieldErrorMessage(errors.password)
  const tipeUserError = getFieldErrorMessage(errors.tipe_user)
  const classError = getFieldErrorMessage(errors.class)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    router.post(route('admin.users.store'), formData, {
      onSuccess: () => {
        router.visit(route('admin.users'))
      },
      onError: (errors: Errors) => {
        setErrors(errors)
        setIsSubmitting(false)
      },
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev:any) => ({ ...prev, [name]: [] }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev:any) => ({ ...prev, [name]: [] }))
    }
  }

  return (
    <AdminPageLayout>
      <Head title="Add New User" />
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-red-700 to-red-500 bg-clip-text">
              Add New User
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Create a new user account</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={route('admin.users')}>
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </div>

        <Card className="border-0 shadow-md rounded-xl">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Enter the user's details below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nama_lengkap">Full Name</Label>
                  <Input
                    id="nama_lengkap"
                    name="nama_lengkap"
                    value={formData.nama_lengkap}
                    onChange={handleChange}
                    className={errors.nama_lengkap ? "border-red-500" : ""}
                    required
                  />
                  {namaLengkapError && (
                    <p className="text-sm text-red-500">{namaLengkapError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={errors.username ? "border-red-500" : ""}
                    required
                  />
                  {usernameError && (
                    <p className="text-sm text-red-500">{usernameError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? "border-red-500" : ""}
                    required
                  />
                  {emailError && (
                    <p className="text-sm text-red-500">{emailError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? "border-red-500" : ""}
                    required
                  />
                  {passwordError && (
                    <p className="text-sm text-red-500">{passwordError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipe_user">User Role</Label>
                  <Select
                    value={formData.tipe_user}
                    onValueChange={(value) => handleSelectChange("tipe_user", value)}
                  >
                    <SelectTrigger className={errors.tipe_user ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="siswa">Student</SelectItem>
                      <SelectItem value="guru">Teacher</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                  {tipeUserError && (
                    <p className="text-sm text-red-500">{tipeUserError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Input
                    id="class"
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    className={errors.class ? "border-red-500" : ""}
                    placeholder="e.g., XII TKJ 1"
                  />
                  {classError && (
                    <p className="text-sm text-red-500">{classError}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Link href={route('admin.users')}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create User"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  )
}
