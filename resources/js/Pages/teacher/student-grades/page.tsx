"use client"

import { useState } from "react"
import { Head, Link, router } from '@inertiajs/react'
import {
  Award,
  Filter,
  Eye,
  TrendingUp,
  Users,
  BookOpen,
  FileText,
  ArrowUpDown,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
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
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import TeacherLayout from "../layout"

interface Submission {
  id: number;
  student_name: string;
  student_email: string;
  course_name: string;
  quiz_title: string;
  score: number;
  normalized_score?: number;
  total_questions?: number;
  letter_grade?: string;
  submitted_at: string;
  user: {
    id: number;
    nama_lengkap: string;
    email: string;
  };
  course: {
    id: number;
    judul_kursus: string;
  };
  quizContent: {
    id: number;
    title: string;
    quiz_data: string;
  };
  quiz_data?: string; // Direct field from the join
}

interface GradeDistribution {
  grade_range: string;
  count: number;
}

interface Props {
  submissions: {
    data: Submission[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  totalSubmissions: number;
  totalStudents: number;
  totalCourses: number;
  averageScore: number;
  gradeDistribution: GradeDistribution[];
  courses: Array<{ id: number; judul_kursus: string }>;
  filters: {
    search: string;
    course: string;
    status: string;
    sort_by: string;
    sort_order: string;
  };
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6b7280'];

type PieLabelPayload = {
  grade_range?: string;
  percent?: number;
}

export default function TeacherGradesPage({
  submissions,
  totalSubmissions,
  totalStudents,
  totalCourses,
  averageScore,
  gradeDistribution,
  courses,
  filters
}: Props) {
  const submissionItems = Array.isArray(submissions?.data) ? submissions.data : []
  const [searchQuery, setSearchQuery] = useState(filters.search || "")
  const [courseFilter, setCourseFilter] = useState(filters.course || "all")
  const [statusFilter, setStatusFilter] = useState(filters.status || "all")
  const [sortBy, setSortBy] = useState(filters.sort_by || "submitted_at")
  const [sortOrder, setSortOrder] = useState(filters.sort_order || "desc")

  const handleFilter = () => {
    router.get('/teacher/student-grades', {
      search: searchQuery,
      course: courseFilter === "all" ? "" : courseFilter,
      status: statusFilter === "all" ? "" : statusFilter,
      sort_by: sortBy,
      sort_order: sortOrder
    }, {
      preserveState: true,
      replace: true
    })
  }

  const handleSort = (column: string) => {
    const newSortOrder = sortBy === column && sortOrder === "asc" ? "desc" : "asc"
    setSortBy(column)
    setSortOrder(newSortOrder)
    router.get('/teacher/student-grades', {
      search: searchQuery,
      course: courseFilter === "all" ? "" : courseFilter,
      status: statusFilter === "all" ? "" : statusFilter,
      sort_by: column,
      sort_order: newSortOrder
    }, {
      preserveState: true,
      replace: true
    })
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800"
    if (percentage >= 80) return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800"
    if (percentage >= 70) return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-800"
    if (percentage >= 60) return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-800"
    return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800"
  }

  const parseQuizData = (rawQuizData: string): unknown => {
    let parsed: unknown = rawQuizData

    for (let attempt = 0; attempt < 2; attempt += 1) {
      if (typeof parsed !== "string") {
        break
      }

      parsed = JSON.parse(parsed)
    }

    return parsed
  }

  const calculateTotalQuestions = (submission: Submission) => {
    const rawCandidates = [submission.quiz_data, submission.quizContent?.quiz_data].filter(
      (value): value is string => typeof value === "string" && value.trim().length > 0,
    )

    for (const rawQuizData of rawCandidates) {
      try {
        const parsed = parseQuizData(rawQuizData)

        if (Array.isArray(parsed)) {
          return parsed.length
        }

        if (
          typeof parsed === "object" &&
          parsed !== null &&
          "questions" in parsed &&
          Array.isArray((parsed as { questions?: unknown }).questions)
        ) {
          return (parsed as { questions: unknown[] }).questions.length
        }
      } catch {
        continue
      }
    }

    return 0
  }

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return "A"
    if (percentage >= 80) return "B"
    if (percentage >= 70) return "C"
    if (percentage >= 60) return "D"
    return "F"
  }

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 80) return <CheckCircle className="w-4 h-4 text-green-600" />
    if (percentage >= 60) return <AlertCircle className="w-4 h-4 text-yellow-600" />
    return <XCircle className="w-4 h-4 text-red-600" />
  }

  const renderPieLabel = ({ grade_range, percent }: PieLabelPayload) => {
    const label = grade_range ?? "N/A"
    const percentage = ((percent ?? 0) * 100).toFixed(0)
    return `${label} ${percentage}%`
  }

  return (
    <TeacherLayout>
      <Head title="Student Grades Management" />
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text">
              Student Grades Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Monitor and manage quiz submissions and grades for your courses</p>
          </div>

        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <CardDescription>All quiz attempts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{totalSubmissions}</div>
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <CardDescription>Students with submissions</CardDescription>
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
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <CardDescription>Courses with submissions</CardDescription>
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
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <CardDescription>Across all submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{averageScore}%</div>
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grade Distribution */}
        <Card className="border-0 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>Distribution of grades across all submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gradeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderPieLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Table */}
        <Card className="border-0 shadow-sm rounded-xl">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search submissions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={courseFilter} onValueChange={setCourseFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.judul_kursus}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Filter by grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    <SelectItem value="excellent">A (90-100%)</SelectItem>
                    <SelectItem value="good">B (80-89%)</SelectItem>
                    <SelectItem value="average">C (70-79%)</SelectItem>
                    <SelectItem value="below_average">D (60-69%)</SelectItem>
                    <SelectItem value="failing">F (0-59%)</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleFilter} className="gap-2">
                  <Filter className="w-4 h-4" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course & Quiz</TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('score')}
                    >
                      <div className="flex items-center gap-1">
                        Score
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('submitted_at')}
                    >
                      <div className="flex items-center gap-1">
                        Submitted
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissionItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No submissions found matching your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    submissionItems.map((submission) => {
                      const totalQuestions = submission.total_questions ?? calculateTotalQuestions(submission);
                      const percentage = Math.round(
                        typeof submission.normalized_score === "number"
                          ? submission.normalized_score
                          : (
                              totalQuestions > 0
                                ? (submission.score / totalQuestions) * 100
                                : submission.score
                            ),
                      );
                      const letterGrade = submission.letter_grade || getGrade(percentage);

                      return (
                        <TableRow key={submission.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={`https://ui-avatars.com/api/?name=${submission.student_name || 'Student'}&background=blue&color=white`} />
                                <AvatarFallback>{submission.student_name?.charAt(0) || 'S'}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{submission.student_name || 'Unknown Student'}</div>
                                <div className="text-sm text-slate-500">{submission.student_email || 'No email'}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{submission.course_name || 'Unknown Course'}</div>
                              <div className="text-sm text-slate-500">{submission.quiz_title || 'Unknown Quiz'}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(percentage)}
                              <div>
                                <div className="font-medium">
                                  Score: {percentage}% | Questions: {totalQuestions}
                                </div>
                                <div className="text-sm text-slate-500">{percentage}%</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={getGradeColor(percentage)}
                            >
                              {letterGrade}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-slate-500">
                              <Calendar className="w-4 h-4" />
                              {Number.isNaN(Date.parse(submission.submitted_at))
                                ? "-"
                                : new Date(submission.submitted_at).toLocaleDateString()}
                            </div>
                          </TableCell>

                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="w-8 h-8 p-0">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/teacher/student-grades/${submission.id}`}>
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {submissions.last_page > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-slate-500">
                  Showing {((submissions.current_page - 1) * submissions.per_page) + 1} to {Math.min(submissions.current_page * submissions.per_page, submissions.total)} of {submissions.total} results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={submissions.current_page === 1}
                    onClick={() => router.get('/teacher/student-grades', { ...filters, page: submissions.current_page - 1 })}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {submissions.current_page} of {submissions.last_page}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={submissions.current_page === submissions.last_page}
                    onClick={() => router.get('/teacher/student-grades', { ...filters, page: submissions.current_page + 1 })}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TeacherLayout>
  )
}
