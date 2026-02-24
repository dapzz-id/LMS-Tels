"use client"

import { useEffect, useState } from "react"
import { Head, router } from '@inertiajs/react'
import {
  BookOpen,
  Search,
  MoreHorizontal,
  Download,
  Trash2,
  Edit,
  Plus,
  Filter,
  ArrowUpDown,
  Eye,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Badge } from "@/Components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import TeacherLayout from "../layout"
import { toast } from "sonner"
import { getFirstMessage } from "@/lib/api-messages"
import { Link } from "@inertiajs/react"
import { Toaster } from "sonner"
import ClientPagination from "@/Components/ui/client-pagination"
import { toAbsoluteAssetUrl } from "@/lib/utils"

interface Course {
  id: number;
  id_mapel: number;
  judul_kursus: string;
  deskripsi_kursus: string;
  url_thumbnail: string;
  created_at: string;
  mapel?: {
    id: number;
    nama_mapel: string;
  };
  content_count?: number;
  student_count?: number;
}

interface Props {
  courses?: Course[]
}

export default function CoursesPage({ courses = [] }: Props) {
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // Filter courses based on search query and filters
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.judul_kursus.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.mapel?.nama_mapel.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDepartment =
      departmentFilter === "all" || course.mapel?.nama_mapel.toLowerCase() === departmentFilter.toLowerCase()

    return matchesSearch && matchesDepartment
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, departmentFilter])

  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  )

  const handleDeleteCourse = async (course: Course) => {
    if (isDeleting) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/teacher/courses/${course.id}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      })
      const data = await response.json()

      if (data.status === 'success') {
        toast.success(getFirstMessage(data, 'Course deleted successfully'))
        router.reload() // Refresh the page to update the list
      } else {
        toast.error(getFirstMessage(data, 'Failed to delete course'))
      }
    } catch (error) {
      toast.error('Error deleting course')
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setSelectedCourse(null)
    }
  }

  const handleEditCourse = (course: Course) => {
    router.visit(`/teacher/courses/${course.id}/edit`)
  }

  const handleViewCourse = (course: Course) => {
    router.visit(`/teacher/courses/${course.id}`)
  }

  return (
    <TeacherLayout>
      <Head title="Course Management" />
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text">
              Course Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Manage your courses and their content</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/teacher/courses/create">
              <Button
                className="text-white bg-blue-600 shadow-md hover:bg-blue-700 rounded-xl shadow-blue-200 dark:shadow-blue-900/20"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Course
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <CardDescription>All your courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{courses.length}</div>
                <BookOpen className="w-4 h-4 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-sm rounded-xl">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        {Array.from(new Set(courses.map(course => course.mapel?.nama_mapel))).map((department) => (
                          <SelectItem key={department} value={department?.toLowerCase() || ''}>
                            {department}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">No courses found</TableCell>
                    </TableRow>
                  ) : (
                    paginatedCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={toAbsoluteAssetUrl(course.url_thumbnail, "/placeholder.svg")} alt={course.judul_kursus} />
                              <AvatarFallback>{course.judul_kursus.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{course.judul_kursus}</div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                {course.deskripsi_kursus.substring(0, 50)}...
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{course.mapel?.nama_mapel}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{course.content_count || 0} items</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{course.student_count || 0} enrolled</Badge>
                        </TableCell>
                        <TableCell>{new Date(course.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="w-8 h-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewCourse(course)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditCourse(course)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedCourse(course)
                                  setIsDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
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
            {filteredCourses.length > 0 && (
              <div className="mt-4">
                <ClientPagination
                  totalItems={filteredCourses.length}
                  currentPage={currentPage}
                  perPage={perPage}
                  onPageChange={setCurrentPage}
                  onPerPageChange={(value) => {
                    setPerPage(value)
                    setCurrentPage(1)
                  }}
                  itemLabel="courses"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this course? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setSelectedCourse(null)
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedCourse && handleDeleteCourse(selectedCourse)}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TeacherLayout>
  )
}
