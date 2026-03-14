"use client"

import { useState, useEffect, useMemo } from "react"
import { Head, Link, router, usePage } from "@inertiajs/react"
import {
  BookOpen,
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  Play,
  FileText,
  Clock,
  Award,
  Calendar,
  Book,
  ChevronRight,
  Grid,
  List,
} from "lucide-react"

import { Button } from "@/Components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { Input } from "@/Components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/Components/ui/card"
import { Progress } from "@/Components/ui/progress"
import { Badge } from "@/Components/ui/badge"
import StudentSidebar from "@/Components/StudentSidebar"
import { toast } from "sonner"
import { toAbsoluteAssetUrl } from "@/lib/utils"
import ClientPagination from "@/Components/ui/client-pagination"

import Swal from "sweetalert2"
import axios from "axios"

interface Course {
  id: number
  judul_kursus: string
  deskripsi_kursus: string
  url_thumbnail: string
  created_at: string
  mapel: {
    id: number
    nama_mapel: string
  }
  contents: Array<{
    id: number
    type: 'video' | 'quiz' | 'pdf'
    title: string
    description?: string
    url?: string
    duration?: number
    quiz_data?: string
    order: number
  }>
}

interface Department {
  id: number
  nama_mapel: string
  courses: Course[]
}

const StudentCoursesPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const FALLBACK_THUMBNAIL = 'https://placehold.co/600x400/e2e8f0/64748b?text=No+Image'
  const { auth } = usePage().props as any
  const user = auth.user

  const [courses, setCourses] = useState<Course[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(6)

  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileView = window.innerWidth < 1024
      setIsMobile(isMobileView)
      setIsSidebarOpen(!isMobileView)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [departments.length])

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        
        const coursesResponse = await axios.get('/api/getDataCourseku')
        

        // Check if we have valid courses data
        if (coursesResponse.data && Array.isArray(coursesResponse.data.kursus)) {
          
          setCourses(coursesResponse.data.kursus)

          // Group courses by department
          const groupedDepartments = groupCoursesByDepartment(coursesResponse.data.kursus)
          setDepartments(groupedDepartments)
        } else {
          
          setCourses([])
          setDepartments([])
          if (coursesResponse.data?.message) {
            toast.error(coursesResponse.data.message)
          } else {
            toast.error("Failed to load courses. Please try again later.")
          }
        }
      } catch (err) {
        
        if (axios.isAxiosError(err)) {
          

          // Handle specific error cases
          if (err.response?.status === 404) {
            toast.error("No courses found.")
          } else if (err.response?.data?.message) {
            toast.error(err.response.data.message)
          } else {
            toast.error("Failed to load courses. Please try again later.")
          }
        } else {
          toast.error("An unexpected error occurred. Please try again later.")
        }
        setCourses([])
        setDepartments([])
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  // Function to group courses by department
  const groupCoursesByDepartment = (courses: Course[]): Department[] => {
    const departmentMap: Record<string, { id: number; nama_mapel: string; courses: Course[] }> = {}

    courses.forEach(course => {
      const departmentId = course.mapel?.id || 0
      const departmentName = course.mapel?.nama_mapel || 'No Subject'

      if (!departmentMap[departmentId]) {
        departmentMap[departmentId] = {
          id: departmentId,
          nama_mapel: departmentName,
          courses: []
        }
      }

      departmentMap[departmentId].courses.push(course)
    })

    return Object.values(departmentMap)
  }

  const getCourseThumbnail = (thumbnail?: string) => {
    return toAbsoluteAssetUrl(thumbnail, FALLBACK_THUMBNAIL)
  }

  const flatCourses = useMemo(() => departments.flatMap((department) => department.courses), [departments])

  const paginatedCourses = useMemo(() => {
    return flatCourses.slice((currentPage - 1) * perPage, currentPage * perPage)
  }, [flatCourses, currentPage, perPage])

  const visibleDepartments = useMemo(() => groupCoursesByDepartment(paginatedCourses), [paginatedCourses])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Head title="My Courses" />
      <StudentSidebar
        active="courses"
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
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text">
                  My Courses
                </h1>
                <p className="text-slate-500 dark:text-slate-400">Browse courses organized by subject</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {departments.length === 0 ? (
              <Card className="border-0 shadow-sm rounded-xl">
                <CardContent className="p-12 text-center">
                  <div className="space-y-4">
                    <BookOpen className="w-16 h-16 text-slate-400 mx-auto" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No courses available for your class</h3>
                    <p className="text-slate-500 dark:text-slate-400">
                      {user?.class ?
                        `No courses have been assigned to class "${user.class}" yet.` :
                        'Your class has not been assigned yet. Please contact your administrator.'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {visibleDepartments.map((department) => (
                  <div key={department.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {department.nama_mapel}
                      </h2>
                      <Badge variant="secondary" className="text-sm">
                        {department.courses.length} {department.courses.length === 1 ? 'Course' : 'Courses'}
                      </Badge>
                    </div>

                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {department.courses.map((course) => (
                          <Card key={course.id} className="overflow-hidden transition-shadow hover:shadow-lg bg-white dark:bg-slate-900">
                            <div className="relative w-full h-48">
                              <img
                                src={getCourseThumbnail(course.url_thumbnail)}
                                alt={course.judul_kursus}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  e.currentTarget.src = FALLBACK_THUMBNAIL;
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            </div>
                            <CardHeader>
                              <CardTitle className="line-clamp-1 text-slate-900 dark:text-slate-100">{course.judul_kursus}</CardTitle>
                              <CardDescription className="line-clamp-2">
                                {course.deskripsi_kursus}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                  <Book className="w-4 h-4" />
                                  <span>{course.contents?.length || 0} lessons</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>{new Date(course.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter>
                              <Button
                                className="w-full text-white bg-blue-600 hover:bg-blue-700"
                                onClick={() => router.get(route('student.courses.learn', { id: course.id }))}
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Start Learning
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {department.courses.map((course) => (
                          <Card key={course.id} className="transition-shadow hover:shadow-lg bg-white dark:bg-slate-900">
                            <div className="flex flex-col md:flex-row">
                              <div className="md:w-1/3">
                                <img
                                  src={getCourseThumbnail(course.url_thumbnail)}
                                  alt={course.judul_kursus}
                                  className="object-cover w-full h-48 md:h-full"
                                  onError={(e) => {
                                    e.currentTarget.src = FALLBACK_THUMBNAIL;
                                  }}
                                />
                              </div>
                              <div className="flex-1 p-6">
                                <div className="flex flex-col h-full">
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                                        {course.mapel?.nama_mapel || 'No Subject'}
                                      </span>
                                    </div>
                                    <CardTitle className="text-xl mb-2 text-slate-900 dark:text-slate-100">{course.judul_kursus}</CardTitle>
                                    <CardDescription className="mb-4">
                                      {course.deskripsi_kursus}
                                    </CardDescription>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                                      <div className="flex items-center gap-1">
                                        <Book className="w-4 h-4" />
                                        <span>{course.contents?.length || 0} lessons</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>{new Date(course.created_at).toLocaleDateString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="mt-auto">
                                    <Button
                                      className="text-white bg-blue-600 hover:bg-blue-700"
                                      onClick={() => router.get(route('student.courses.learn', { id: course.id }))}
                                    >
                                      <Play className="w-4 h-4 mr-2" />
                                      Start Learning
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {flatCourses.length > 0 && (
                  <ClientPagination
                    totalItems={flatCourses.length}
                    currentPage={currentPage}
                    perPage={perPage}
                    onPageChange={setCurrentPage}
                    onPerPageChange={(value) => {
                      setPerPage(value)
                      setCurrentPage(1)
                    }}
                    itemLabel="courses"
                  />
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default StudentCoursesPage
