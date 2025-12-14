"use client"

import { useState } from "react"
import { Head } from '@inertiajs/react'
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Mail,
  BookOpen,
  TrendingUp,
  Download,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import TeacherLayout from "../layout"

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

  // Filter students based on search query and filters
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.course_name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCourse = courseFilter === "all" || student.course_id.toString() === courseFilter

    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "active" && student.completed_at === null && student.progress > 0) ||
      (statusFilter === "completed" && student.completed_at !== null) ||
      (statusFilter === "inactive" && student.progress === 0)

    return matchesSearch && matchesCourse && matchesStatus
  })

  const getStatusBadge = (student: Student) => {
    if (student.completed_at) {
      return <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Completed</Badge>
    } else if (student.progress > 0) {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Active</Badge>
    } else {
      return <Badge variant="outline" className="text-slate-500">Inactive</Badge>
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500"
    if (progress >= 60) return "bg-blue-500"
    if (progress >= 40) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100 dark:bg-green-900"
    if (score >= 80) return "text-blue-600 bg-blue-100 dark:bg-blue-900"
    if (score >= 70) return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900"
    if (score >= 60) return "text-orange-600 bg-orange-100 dark:bg-orange-900"
    return "text-red-600 bg-red-100 dark:bg-red-900"
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
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export List
            </Button>
          </div>
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
                        {Array.from(new Set(students.map(student => ({ id: student.course_id, name: student.course_name }))))
                          .map((course) => (
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
                    filteredStudents.map((student) => (
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
                        <TableCell>{student.course_name}</TableCell>
                        <TableCell>
                          {getStatusBadge(student)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{student.progress}%</span>
                            </div>
                            <Progress
                              value={student.progress}
                              className="h-2"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="font-medium">{student.quiz_submissions_count}</span> submissions
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getScoreColor(student.average_score)}
                          >
                            {student.average_score}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {student.last_active}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="w-8 h-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <BookOpen className="w-4 h-4 mr-2" />
                                View Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="w-4 h-4 mr-2" />
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                Remove from Course
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
          </CardContent>
        </Card>
      </div>
    </TeacherLayout>
  )
}

