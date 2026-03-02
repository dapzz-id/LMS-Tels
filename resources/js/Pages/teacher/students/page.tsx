"use client"

import { useEffect, useMemo, useState } from "react"
import { Head, router } from '@inertiajs/react'
import {
  Users,
  Filter,
  MoreHorizontal,
  BookOpen,
  TrendingUp,
  Trash2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Badge } from "@/Components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { Progress } from "@/Components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/Components/ui/dialog"
import TeacherLayout from "../layout"
import ClientPagination from "@/Components/ui/client-pagination"
import { toast } from "sonner"

interface Student {
  id: number;
  name: string;
  email: string;
  course_name: string;
  course_id: number;
  progress: number;
  completed_at: string | null;
  last_active: string;
  quiz_submissions_count: number;
  average_score: number;
}

interface CourseProgressItem {
  course_id: number;
  course_name: string;
  progress: number;
  completed_at: string | null;
  last_active: string;
  quiz_submissions_count: number;
  average_score: number;
}

interface GroupedStudent {
  id: number;
  name: string;
  email: string;
  courses: CourseProgressItem[];
  status: "completed" | "active" | "inactive";
  overall_progress: number;
  completed_courses: number;
  total_quiz_submissions: number;
  overall_average_score: number;
  last_active: string;
}

interface Props {
  students: Student[];
  totalStudents: number;
  totalCourses: number;
  averageProgress: number;
  activeStudents: number;
}

export default function TeacherStudentsPage({ students, totalStudents, totalCourses, averageProgress, activeStudents }: Props) {
  const [searchQuery, setSearchQuery] = useState("")
  const [courseFilter, setCourseFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [selectedStudent, setSelectedStudent] = useState<GroupedStudent | null>(null)
  const [removingCourseKey, setRemovingCourseKey] = useState<string | null>(null)

  const groupedStudents = useMemo<GroupedStudent[]>(() => {
    const grouped = new Map<number, { id: number; name: string; email: string; courses: CourseProgressItem[] }>()

    students.forEach((student) => {
      const existing = grouped.get(student.id)
      const courseItem: CourseProgressItem = {
        course_id: student.course_id,
        course_name: student.course_name,
        progress: student.progress,
        completed_at: student.completed_at,
        last_active: student.last_active,
        quiz_submissions_count: student.quiz_submissions_count,
        average_score: student.average_score,
      }

      if (!existing) {
        grouped.set(student.id, {
          id: student.id,
          name: student.name,
          email: student.email,
          courses: [courseItem],
        })
        return
      }

      existing.courses.push(courseItem)
    })

    return Array.from(grouped.values()).map((student) => {
      const totalCourses = student.courses.length
      const completedCourses = student.courses.filter((course) => course.completed_at || course.progress >= 100).length
      const averageStudentProgress = totalCourses > 0
        ? Number((student.courses.reduce((sum, course) => sum + course.progress, 0) / totalCourses).toFixed(1))
        : 0
      const totalQuizSubmissions = student.courses.reduce((sum, course) => sum + course.quiz_submissions_count, 0)
      const weightedScore = student.courses.reduce(
        (sum, course) => sum + (course.average_score * course.quiz_submissions_count),
        0,
      )
      const overallAverageScore = totalQuizSubmissions > 0
        ? Number((weightedScore / totalQuizSubmissions).toFixed(2))
        : 0

      let status: GroupedStudent["status"] = "inactive"
      if (totalCourses > 0 && completedCourses === totalCourses) {
        status = "completed"
      } else if (student.courses.some((course) => course.progress > 0)) {
        status = "active"
      }

      return {
        ...student,
        status,
        overall_progress: averageStudentProgress,
        completed_courses: completedCourses,
        total_quiz_submissions: totalQuizSubmissions,
        overall_average_score: overallAverageScore,
        last_active: student.courses[0]?.last_active ?? "Never",
      }
    })
  }, [students])

  const courseOptions = useMemo(() => {
    const uniqueCourses = new Map<number, string>()
    students.forEach((student) => {
      if (!uniqueCourses.has(student.course_id)) {
        uniqueCourses.set(student.course_id, student.course_name)
      }
    })

    return Array.from(uniqueCourses.entries()).map(([id, name]) => ({ id, name }))
  }, [students])

  // Filter students based on search query and filters
  const filteredStudents = groupedStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.courses.some((course) => course.course_name.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCourse = courseFilter === "all" || student.courses.some((course) => course.course_id.toString() === courseFilter)

    const matchesStatus = statusFilter === "all" || student.status === statusFilter

    return matchesSearch && matchesCourse && matchesStatus
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, courseFilter, statusFilter])

  useEffect(() => {
    if (selectedStudent !== null) {
      return
    }

    if (typeof document !== "undefined" && document.body.style.pointerEvents === "none") {
      document.body.style.pointerEvents = ""
    }
  }, [selectedStudent])

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  )

  const getStatusBadge = (status: GroupedStudent["status"]) => {
    if (status === "completed") {
      return <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Completed</Badge>
    } else if (status === "active") {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Active</Badge>
    } else {
      return <Badge variant="outline" className="text-slate-500">Inactive</Badge>
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100 dark:bg-green-900"
    if (score >= 80) return "text-blue-600 bg-blue-100 dark:bg-blue-900"
    if (score >= 70) return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900"
    if (score >= 60) return "text-orange-600 bg-orange-100 dark:bg-orange-900"
    return "text-red-600 bg-red-100 dark:bg-red-900"
  }

  const handleRemoveFromCourse = async (studentId: number, courseId: number, courseName: string) => {
    const courseKey = `${studentId}:${courseId}`
    setRemovingCourseKey(courseKey)

    try {
      const response = await fetch(`/teacher/students/${studentId}/courses/${courseId}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
          Accept: "application/json",
        },
      })

      const data = await response.json().catch(() => ({} as { message?: string }))
      if (!response.ok) {
        throw new Error(data.message || "Failed to remove student from course.")
      }

      toast.success(`Removed from ${courseName}. Progress data has been deleted.`)

      setSelectedStudent((prev) => {
        if (!prev || prev.id !== studentId) {
          return prev
        }

        const nextCourses = prev.courses.filter((course) => course.course_id !== courseId)
        if (nextCourses.length === 0) {
          return null
        }

        return {
          ...prev,
          courses: nextCourses,
        }
      })

      router.reload()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to remove student from course."
      toast.error(message)
    } finally {
      setRemovingCourseKey(null)
    }
  }

  return (
    <TeacherLayout>
      <Head title="My Students" />
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text">
              My Students
            </h1>
            <p className="text-slate-500 dark:text-slate-400">View and manage students enrolled in your courses</p>
          </div>
          {/* <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              Export List
            </Button>
          </div> */}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <CardDescription>Enrolled in your courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{totalStudents}</div>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <CardDescription>Currently learning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{activeStudents}</div>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <CardDescription>With enrolled students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{totalCourses}</div>
                <BookOpen className="w-4 h-4 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
              <CardDescription>Across all students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{averageProgress}%</div>
                <Progress value={averageProgress} className="w-16 h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-sm rounded-xl">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <Select value={courseFilter} onValueChange={setCourseFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        {courseOptions.map((course) => (
                          <SelectItem key={course.id} value={course.id.toString()}>
                            {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
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
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Quiz Submissions</TableHead>
                    <TableHead>Average Score</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">No students found</TableCell>
                    </TableRow>
                  ) : (
                    paginatedStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={`https://ui-avatars.com/api/?name=${student.name}&background=blue&color=white`} alt={student.name} />
                              <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{student.name}</div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">{student.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{student.courses.length} courses</div>
                            <p
                              className="max-w-[280px] truncate text-sm text-slate-500 dark:text-slate-400"
                              title={student.courses.map((course) => course.course_name).join(", ")}
                            >
                              {student.courses.map((course) => course.course_name).join(", ")}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(student.status)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Average</span>
                              <span>{student.overall_progress}%</span>
                            </div>
                            <Progress
                              value={student.overall_progress}
                              className="h-2"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {student.completed_courses}/{student.courses.length} courses completed
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="font-medium">{student.total_quiz_submissions}</span> submissions
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getScoreColor(student.overall_average_score)}
                          >
                            {student.overall_average_score}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {student.last_active}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="w-8 h-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => setSelectedStudent(student)}>
                                <BookOpen className="mr-2 h-4 w-4" />
                                View Progress
                              </DropdownMenuItem>
                              {/*
                              <DropdownMenuItem>
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Send Message
                              </DropdownMenuItem>
                              */}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {filteredStudents.length > 0 && (
              <div className="mt-4">
                <ClientPagination
                  totalItems={filteredStudents.length}
                  currentPage={currentPage}
                  perPage={perPage}
                  onPageChange={setCurrentPage}
                  onPerPageChange={(value) => {
                    setPerPage(value)
                    setCurrentPage(1)
                  }}
                  itemLabel="students"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={Boolean(selectedStudent)} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedStudent?.name} - Course Progress
            </DialogTitle>
            <DialogDescription>
              Lihat progress per course secara detail agar tindak lanjut pembelajaran lebih tepat sasaran.
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Card className="border-0 bg-slate-50 shadow-none dark:bg-slate-900">
                  <CardContent className="pt-6">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Total Courses</p>
                    <p className="text-xl font-semibold">{selectedStudent.courses.length}</p>
                  </CardContent>
                </Card>
                <Card className="border-0 bg-slate-50 shadow-none dark:bg-slate-900">
                  <CardContent className="pt-6">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Average Progress</p>
                    <p className="text-xl font-semibold">{selectedStudent.overall_progress}%</p>
                  </CardContent>
                </Card>
                <Card className="border-0 bg-slate-50 shadow-none dark:bg-slate-900">
                  <CardContent className="pt-6">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Quiz Submissions</p>
                    <p className="text-xl font-semibold">{selectedStudent.total_quiz_submissions}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Quiz Submissions</TableHead>
                      <TableHead>Average Score</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedStudent.courses.map((course) => (
                      <TableRow key={`${selectedStudent.id}-${course.course_id}`}>
                        <TableCell className="font-medium">{course.course_name}</TableCell>
                        <TableCell>
                          {getStatusBadge(course.completed_at || course.progress >= 100 ? "completed" : course.progress > 0 ? "active" : "inactive")}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>{course.quiz_submissions_count} submissions</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getScoreColor(course.average_score)}>
                            {course.average_score}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-500">{course.last_active}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                            onClick={() => handleRemoveFromCourse(selectedStudent.id, course.course_id, course.course_name)}
                            disabled={removingCourseKey === `${selectedStudent.id}:${course.course_id}`}
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            {removingCourseKey === `${selectedStudent.id}:${course.course_id}` ? "Removing..." : "Remove from Course"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </TeacherLayout>
  )
}
