"use client"

import { useState, useRef } from "react"
import { Head, router } from "@inertiajs/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Textarea } from "@/Components/ui/textarea"
import { Plus, Search, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import AdminPageLayout from "../layout"
import { toast } from "sonner"
import { getFirstMessage } from "@/lib/api-messages"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/Components/ui/form"

const departmentFormSchema = z.object({
  nama_mapel: z.string().min(3, {
    message: "Subject name must be at least 3 characters.",
  }),
  deskripsi: z.string().optional(),
})

type DepartmentFormValues = z.infer<typeof departmentFormSchema>

interface Department {
  id: number
  nama_mapel: string
  deskripsi: string
  created_at: string
}

interface Props {
  departments: Department[]
}

export default function DepartmentsPage({ departments }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null)
  const [openDropdownDepartmentId, setOpenDropdownDepartmentId] = useState<number | null>(null)
  const threeDotsRef = useRef<HTMLButtonElement | null>(null)

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      nama_mapel: "",
      deskripsi: "",
    },
  })

  const editForm = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      nama_mapel: "",
      deskripsi: "",
    },
  })

  const handleSubmit = async (data: DepartmentFormValues) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/admin/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.status === 'success') {
        toast.success(getFirstMessage(result, 'Subject created successfully'))
        form.reset()
        setIsDialogOpen(false)
        router.reload()
      } else {
        const errorBag = (result.errors && typeof result.errors === 'object')
          ? result.errors
          : (result.message && typeof result.message === 'object' ? result.message : null)

        if (errorBag) {
          Object.entries(errorBag).forEach(([key, value]) => {
            const message = Array.isArray(value) ? value[0] : String(value)
            form.setError(key as any, { message })
          })
        } else {
          toast.error(getFirstMessage(result, 'Failed to create subject'))
        }
      }
    } catch (error) {
      toast.error('Error creating subject')
      
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (data: DepartmentFormValues) => {
    if (!editingDepartment) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/admin/departments/${editingDepartment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.status === 'success') {
        toast.success(getFirstMessage(result, 'Subject updated successfully'))
        editForm.reset()
        setIsEditDialogOpen(false)
        setEditingDepartment(null)
        router.reload()
      } else {
        const errorBag = (result.errors && typeof result.errors === 'object')
          ? result.errors
          : (result.message && typeof result.message === 'object' ? result.message : null)

        if (errorBag) {
          Object.entries(errorBag).forEach(([key, value]) => {
            const message = Array.isArray(value) ? value[0] : String(value)
            editForm.setError(key as any, { message })
          })
        } else {
          toast.error(getFirstMessage(result, 'Failed to update subject'))
        }
      }
    } catch (error) {
      toast.error('Error updating subject')
      
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditModal = (department: Department, event?: React.MouseEvent) => {
    setOpenDropdownDepartmentId(null) // Always close dropdown before opening modal
    setEditingDepartment(department)
    editForm.reset()
    editForm.setValue('nama_mapel', department.nama_mapel)
    editForm.setValue('deskripsi', department.deskripsi || "")
    setIsEditDialogOpen(true)
    if (event) {
      threeDotsRef.current = event.currentTarget as HTMLButtonElement
    }
  }

  const closeEditModal = () => {
    setEditingDepartment(null)
    editForm.reset()
    setIsEditDialogOpen(false)
    // Restore focus to the three dots button
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    if (threeDotsRef.current) {
      threeDotsRef.current.focus()
      threeDotsRef.current = null
    }
  }

  const openDeleteModal = (department: Department, event?: React.MouseEvent) => {
    setOpenDropdownDepartmentId(null) // Always close dropdown before opening modal
    setDeletingDepartment(department)
    setIsDeleteDialogOpen(true)
    if (event) {
      threeDotsRef.current = event.currentTarget as HTMLButtonElement
    }
  }

  const closeDeleteModal = () => {
    setDeletingDepartment(null)
    setIsDeleteDialogOpen(false)
    // Restore focus to the three dots button
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    if (threeDotsRef.current) {
      threeDotsRef.current.focus()
      threeDotsRef.current = null
    }
  }

  const handleDelete = async () => {
    if (!deletingDepartment) return

    setIsDeleteSubmitting(true)

    try {
      const response = await fetch(`/admin/departments/${deletingDepartment.id}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      })

      const result = await response.json()

      if (result.status === 'success') {
        toast.success(getFirstMessage(result, 'Subject deleted successfully'))
        closeDeleteModal()
        router.reload()
      } else {
        toast.error(getFirstMessage(result, 'Failed to delete subject'))
      }
    } catch (error) {
      toast.error('Error deleting subject')
      
    } finally {
      setIsDeleteSubmitting(false)
    }
  }

  const filteredDepartments = departments.filter(dept =>
    dept.nama_mapel.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AdminPageLayout>
      <Head title="Subject Management" />
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-red-700 to-red-500 bg-clip-text">
              Subject Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Manage your subjects and their courses</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Subject</DialogTitle>
                <DialogDescription>
                  Create a new subject to organize your courses.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="nama_mapel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter subject name" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is the name that will be displayed to users.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deskripsi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter subject description"
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Describe what this subject is about.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create Subject"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Edit Department Modal */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Subject</DialogTitle>
                <DialogDescription>
                  Update the subject information.
                </DialogDescription>
              </DialogHeader>
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
                  <FormField
                    control={editForm.control}
                    name="nama_mapel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter subject name" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is the name that will be displayed to users.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="deskripsi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter subject description"
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Describe what this subject is about.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={closeEditModal}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
                      {isSubmitting ? "Updating..." : "Update Subject"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Delete Department Modal */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Subject</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{deletingDepartment?.nama_mapel}"? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDeleteModal}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleteSubmitting}
                >
                  {isDeleteSubmitting ? "Deleting..." : "Delete Subject"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Subjects</CardTitle>
                <CardDescription>A list of all subjects in your system.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder="Search subjects..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredDepartments.map((department) => (
                <Card key={department.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{department.nama_mapel}</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {department.deskripsi}
                      </p>
                    </div>
                    <DropdownMenu open={openDropdownDepartmentId === department.id} onOpenChange={(open) => {
                      setOpenDropdownDepartmentId(open ? department.id : null)
                    }}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(event) => {
                            event.stopPropagation()
                            setOpenDropdownDepartmentId(openDropdownDepartmentId === department.id ? null : department.id)
                          }}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(event) => openEditModal(department, event)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={(event) => openDeleteModal(department, event)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              ))}
              {filteredDepartments.length === 0 && (
                <div className="py-6 text-center">
                  <p className="text-slate-500 dark:text-slate-400">No subjects found.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  )
}
