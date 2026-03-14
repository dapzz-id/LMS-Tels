"use client"

import { useEffect, useRef, useState } from "react"
import {
  Users,
  Search,
  MoreHorizontal,
  Download,
  Trash2,
  Edit,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  BookOpen,
  Plus,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Avatar, AvatarFallback } from "@/Components/ui/avatar"
import { Badge } from "@/Components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import AdminPageLayout from "../layout"
import { Link, router, Head } from "@inertiajs/react"
import { Label } from "@/Components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/Components/ui/dialog"
import { getFieldErrorMessage } from "@/lib/api-messages"
import ClientPagination from "@/Components/ui/client-pagination"

interface User {
  id: number
  nama_lengkap: string
  username: string
  email: string
  tipe_user: string
  class?: string
  created_at: string
}

interface Props {
  users?: User[]
}

interface ImportFeedback {
  variant: "success" | "error"
  title: string
  message?: string
  details?: string[]
}

// Helper function to get role badge
const getRoleBadge = (role: string) => {
  const colors = {
    admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    guru: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    siswa: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
  }
  return (
    <Badge className={colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  )
}

const fallbackImportErrorMessage = "Import gagal. Periksa detail kesalahan di bawah."

const normalizeRowLabel = (message: string) => message.replace(/\brow\b/gi, "Baris")

const normalizeImportError = (payload: any) => {
  let message = typeof payload?.message === "string" ? payload.message : ""
  if (message === "The given data was invalid.") {
    message = "Data tidak valid."
  }

  let details: string[] = []
  let fileError: string | undefined

  if (payload?.errors) {
    if (Array.isArray(payload.errors)) {
      details = payload.errors
        .filter((item: unknown) => typeof item === "string")
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0)
    } else if (typeof payload.errors === "object") {
      for (const [key, value] of Object.entries(payload.errors)) {
        if (Array.isArray(value)) {
          const messages = value
            .filter((item: unknown) => typeof item === "string")
            .map((item: string) => item.trim())
            .filter((item: string) => item.length > 0)
          details.push(...messages)
          if (key === "file" && messages.length > 0) {
            fileError = messages[0]
          }
        }
      }
    }
  }

  if (details.length === 0 && message) {
    const splitMessages = message
      .split(";")
      .map((item : any) => item.trim())
      .filter((item : any) => item.length > 0)
    if (splitMessages.length > 1) {
      details = splitMessages
      message = fallbackImportErrorMessage
    }
  }

  if (!message) {
    message = fallbackImportErrorMessage
  }

  message = normalizeRowLabel(message)
  details = details.map((detail) => normalizeRowLabel(detail))
  if (fileError) {
    fileError = normalizeRowLabel(fileError)
  }

  return {
    message,
    details: details.length > 0 ? details : undefined,
    fileError,
  }
}

export default function UsersPage({ users = [] }: Props) {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // Edit user modal state
  const [editUser, setEditUser] = useState<User | null>(null)
  const threeDotsRef = useRef<HTMLButtonElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [openDropdownUserId, setOpenDropdownUserId] = useState<number | null>(null)
  const [deleteUser, setDeleteUser] = useState<User | null>(null)
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false)
  const [editForm, setEditForm] = useState({
    nama_lengkap: "",
    username: "",
    email: "",
    password: "",
    tipe_user: "",
    class: "",
  })
  const [editErrors, setEditErrors] = useState<any>({})
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)
  const [importFeedback, setImportFeedback] = useState<ImportFeedback | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)

  const editNamaLengkapError = getFieldErrorMessage(editErrors.nama_lengkap)
  const editUsernameError = getFieldErrorMessage(editErrors.username)
  const editEmailError = getFieldErrorMessage(editErrors.email)
  const editPasswordError = getFieldErrorMessage(editErrors.password)
  const editTipeUserError = getFieldErrorMessage(editErrors.tipe_user)
  const editClassError = getFieldErrorMessage(editErrors.class)

  // Filter users based on search query and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = roleFilter === "all" || user.tipe_user === roleFilter

    return matchesSearch && matchesRole
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, roleFilter])

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  )

  const openDeleteModal = (user: User, event?: React.MouseEvent) => {
    setOpenDropdownUserId(null);
    setDeleteUser(user);
    if (event) {
      threeDotsRef.current = event.currentTarget as HTMLButtonElement;
    }
  }

  const closeDeleteModal = () => {
    setDeleteUser(null);
    setIsDeleteSubmitting(false);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    if (threeDotsRef.current) {
      threeDotsRef.current.focus();
      threeDotsRef.current = null;
    }
  }

  const handleDelete = () => {
    if (!deleteUser) return;
    setIsDeleteSubmitting(true);
    router.delete(`/admin/users/${deleteUser.id}`, {
        onSuccess: () => {
        closeDeleteModal();
        router.reload({ only: ['users'] });
      },
      onFinish: () => setIsDeleteSubmitting(false),
    });
  }

  const openEditModal = (user: User, event?: React.MouseEvent) => {
    setOpenDropdownUserId(null); // Always close dropdown before opening modal
    setEditUser(user)
    setEditForm({
      nama_lengkap: user.nama_lengkap,
      username: user.username,
      email: user.email,
      password: "", // leave blank for security
      tipe_user: user.tipe_user,
      class: user.class || "",
    })
    setEditErrors({})
    // Save the button ref for focus restoration
    if (event) {
      threeDotsRef.current = event.currentTarget as HTMLButtonElement
    }
  }

  const closeEditModal = () => {
    setEditUser(null)
    setEditErrors({})
    setIsEditSubmitting(false)
    // Blur any active element to prevent stuck focus
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    // Restore focus to the three-dots button if needed
    if (threeDotsRef.current) {
      threeDotsRef.current.focus()
      threeDotsRef.current = null
    }
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditForm(prev => ({ ...prev, [name]: value }))
    if (editErrors[name]) {
      setEditErrors((prev:any) => ({ ...prev, [name]: [] }))
    }
  }

  const handleEditSelectChange = (name: string, value: string) => {
    setEditForm(prev => ({ ...prev, [name]: value }))
    if (editErrors[name]) {
      setEditErrors((prev:any) => ({ ...prev, [name]: [] }))
    }
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editUser) return
    setIsEditSubmitting(true)
    setEditErrors({})
    router.put(`/admin/users/${editUser.id}`, editForm, {
      onSuccess: () => {
        closeEditModal()
        router.reload({ only: ['users'] })
      },
      onError: (errors: any) => {
        setEditErrors(errors)
        setIsEditSubmitting(false)
      },
    })
  }

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null
    setImportFile(file)
    setFileError(null)
    if (importFeedback) {
      setImportFeedback(null)
    }
  }

  // Handle import form submit
  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setImportFeedback(null)
    setFileError(null)

    // Guard: file harus ada
    if (!importFile) {
      const message = "Silakan pilih file terlebih dahulu."
      setFileError(message)
      setImportFeedback({
        variant: "error",
        title: "File belum dipilih",
        message,
      })
      return
    }

    // Build FormData untuk upload
    const formData = new FormData()
    formData.append("file", importFile)

    try {
      setIsImporting(true)
      const token =
        document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""

      const res = await fetch("/admin/users/import", {
        method: "POST",
        body: formData,
        headers: {
          "X-CSRF-TOKEN": token,
          "X-Requested-With": "XMLHttpRequest",
        },
      })

      let json: any = null
      try {
        json = await res.json()
      } catch {
        json = null
      }

      if (res.ok && json?.status === "success") {
        setImportFeedback({
          variant: "success",
          title: "Import berhasil",
          message: json?.message || "Import selesai.",
        })
        setImportFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        router.reload({ only: ["users"] }) // refresh tabel user
      } else {
        const { message, details, fileError: apiFileError } =
          normalizeImportError(json)
        setImportFeedback({
          variant: "error",
          title: "Import gagal",
          message,
          details,
        })
        if (apiFileError) {
          setFileError(apiFileError)
        }
      }
    } catch (error: any) {
      setImportFeedback({
        variant: "error",
        title: "Import gagal",
        message: error?.message
          ? `Terjadi kesalahan jaringan: ${error.message}`
          : "Terjadi kesalahan jaringan.",
      })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <AdminPageLayout>
      <Head title="Users Management" />
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-red-700 to-red-500 bg-clip-text">
              User Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Manage user accounts and permissions</p>
          </div>
          <Link href="/admin/users/new">
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <CardDescription>All registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{users.length}</div>
                <Users className="w-4 h-4 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <CardDescription>Active learning accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {users.filter(user => user.tipe_user === 'siswa').length}
                </div>
                <GraduationCap className="w-4 h-4 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Teachers</CardTitle>
              <CardDescription>Course instructors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {users.filter(user => user.tipe_user === 'guru').length}
                </div>
                <BookOpen className="w-4 h-4 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Import Users Form */}
        <Card className="mb-6 border-0 shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Import Users</CardTitle>
            <CardDescription>Upload an Excel or CSV file to add users in bulk.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <div className="flex-1">
                  <Label htmlFor="import-file">Select File</Label>
                  <Input
                    id="import-file"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    ref={fileInputRef}
                    onChange={handleImportFileChange}
                    required
                    className={`mt-1 ${fileError ? "border-red-500" : ""}`}
                  />
                  <p className="mt-1 text-xs text-gray-500">Supported formats: .xlsx, .xls, .csv (Max 10MB)</p>
                  {fileError && <p className="mt-1 text-sm text-red-500">{fileError}</p>}
                </div>
                <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" disabled={isImporting}>
                  {isImporting ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-current rounded-full animate-spin border-t-transparent"></div>
                      Importing...
                    </>
                  ) : 'Import Users'}
                </Button>
              </div>
              {importFeedback && (
                <Alert
                  variant={importFeedback.variant === "error" ? "destructive" : "default"}
                  className={
                    importFeedback.variant === "success"
                      ? "border-green-200 bg-green-50 text-green-800 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-200"
                      : ""
                  }
                >
                  {importFeedback.variant === "success" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <AlertTitle>{importFeedback.title}</AlertTitle>
                  <AlertDescription>
                    {importFeedback.message && <p>{importFeedback.message}</p>}
                    {importFeedback.details && importFeedback.details.length > 0 && (
                      <ul className="pl-5 mt-2 space-y-1 list-disc">
                        {importFeedback.details.map((detail, index) => (
                          <li key={`${detail}-${index}`}>{detail}</li>
                        ))}
                      </ul>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                <h4 className="mb-2 font-medium text-blue-800 dark:text-blue-200">Import Instructions</h4>
                <ul className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                  <li>- Download and use the template for best results</li>
                  <li>- Required columns: nama_lengkap, username, email, password, and one of: tipe_user/role/user_type</li>
                  <li>- User types accepted: admin, guru or teacher, siswa or student</li>
                  <li>- Class field is optional (for students only)</li>
                  <li>- Duplicate usernames or emails will be skipped</li>
                </ul>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 text-blue-700 bg-white border-blue-300 dark:bg-gray-800 dark:border-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                  onClick={() => window.location.href = '/admin/users/template'}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage user accounts and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-blue-300/70" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="pl-8 rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[150px] rounded-lg">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="guru">Teacher</SelectItem>
                    <SelectItem value="siswa">Student</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-lg"
                  onClick={() => {
                    window.location.href = '/admin/users/export';
                  }}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">
                      <div className="flex items-center gap-1">
                        User
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        Role
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                        No users found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 border border-slate-200 dark:border-slate-800">
                              <AvatarFallback>
                                {user.nama_lengkap
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.nama_lengkap}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.tipe_user)}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.class || '-'}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu
                            open={openDropdownUserId === user.id}
                            onOpenChange={(open) => setOpenDropdownUserId(open ? user.id : null)}
                          >
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="rounded-full">
                                <MoreHorizontal className="w-4 h-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl">
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={(e) => {
                                  setOpenDropdownUserId(null);
                                  openEditModal(user, e);
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 cursor-pointer dark:text-red-400"
                                onClick={(e) => openDeleteModal(user, e)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {filteredUsers.length > 0 && (
              <div className="mt-4">
                <ClientPagination
                  totalItems={filteredUsers.length}
                  currentPage={currentPage}
                  perPage={perPage}
                  onPageChange={setCurrentPage}
                  onPerPageChange={(value) => {
                    setPerPage(value)
                    setCurrentPage(1)
                  }}
                  itemLabel="users"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit User Modal */}
      <Dialog open={!!editUser} onOpenChange={open => { if (!open) closeEditModal() }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update the user's information below</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit_nama_lengkap">Full Name</Label>
                <Input
                  id="edit_nama_lengkap"
                  name="nama_lengkap"
                  value={editForm.nama_lengkap}
                  onChange={handleEditChange}
                  className={editErrors.nama_lengkap ? "border-red-500" : ""}
                  required
                />
                {editNamaLengkapError && (
                  <p className="text-sm text-red-500">{editNamaLengkapError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_username">Username</Label>
                <Input
                  id="edit_username"
                  name="username"
                  value={editForm.username}
                  onChange={handleEditChange}
                  className={editErrors.username ? "border-red-500" : ""}
                  required
                />
                {editUsernameError && (
                  <p className="text-sm text-red-500">{editUsernameError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_email">Email Address</Label>
                <Input
                  id="edit_email"
                  name="email"
                  type="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  className={editErrors.email ? "border-red-500" : ""}
                  required
                />
                {editEmailError && (
                  <p className="text-sm text-red-500">{editEmailError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_password">Password</Label>
                <Input
                  id="edit_password"
                  name="password"
                  type="password"
                  value={editForm.password}
                  onChange={handleEditChange}
                  className={editErrors.password ? "border-red-500" : ""}
                  placeholder="Leave blank to keep current password"
                />
                {editPasswordError && (
                  <p className="text-sm text-red-500">{editPasswordError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_tipe_user">User Role</Label>
                <Select
                  value={editForm.tipe_user}
                  onValueChange={(value) => handleEditSelectChange("tipe_user", value)}
                >
                  <SelectTrigger className={editErrors.tipe_user ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="siswa">Student</SelectItem>
                    <SelectItem value="guru">Teacher</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
                {editTipeUserError && (
                  <p className="text-sm text-red-500">{editTipeUserError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_class">Class</Label>
                <Input
                  id="edit_class"
                  name="class"
                  value={editForm.class}
                  onChange={handleEditChange}
                  className={editErrors.class ? "border-red-500" : ""}
                  placeholder="e.g., XII TKJ 1"
                />
                {editClassError && (
                  <p className="text-sm text-red-500">{editClassError}</p>
                )}
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeEditModal}>
                Cancel
              </Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={isEditSubmitting}>
                {isEditSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Delete User Modal */}
      <Dialog open={!!deleteUser} onOpenChange={open => { if (!open) closeDeleteModal() }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-red-600">{deleteUser?.nama_lengkap}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={closeDeleteModal} disabled={isDeleteSubmitting}>
              Cancel
            </Button>
            <Button type="button" className="bg-red-600 hover:bg-red-700" onClick={handleDelete} disabled={isDeleteSubmitting}>
              {isDeleteSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  )
}
