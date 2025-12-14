"use client"

import { Head } from '@inertiajs/react'
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table"
import { BookOpen, Users } from "lucide-react"
import TeacherLayout from "../layout"
import { Toaster } from "sonner"

interface Course {
  id: number;
  judul_kursus: string;
}

interface Student {
  id: number;
  nama_lengkap: string;
  email: string;
  class: string;
}

interface Progress {
  total_content: number;
  completed_content: number;
  progress_percentage: number;
  is_completed: boolean;
  completion_status: string;
  quiz_submissions: Array<any>;
}

interface StudentCourseProgress {
  course: Course;
  progress: Progress;
}

interface StudentProgress {
  student: Student;
  courses: StudentCourseProgress[];
}

interface Props {
  studentProgress: StudentProgress[];
  courses: Course[];
}

export default function TeacherStudentProgressPage({ studentProgress, courses }: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case 'almost_completed': return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case 'in_progress': return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case 'started': return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <TeacherLayout>
      <Head title="Student Progress" />
      <Toaster position="top-right" />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text">
            Student Progress
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Track progress of all students in your courses
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <CardDescription>Enrolled in your courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{studentProgress.length}</div>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <CardDescription>You are teaching</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{courses.length}</div>
                <BookOpen className="w-4 h-4 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Progress Table */}
        <Card className="border-0 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle>Student Progress Overview</CardTitle>
            <CardDescription>Progress of all students across your courses</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Quizzes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentProgress && studentProgress.length > 0 ? (
                  studentProgress.flatMap(({ student, courses }) =>
                    courses.map(({ course, progress }, index) => (
                      <TableRow key={`${student.id}-${course.id}`}>
                        {index === 0 ? (
                          <TableCell className="font-medium" rowSpan={courses.length}>
                            <div>
                              <div>{student.nama_lengkap}</div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">{student.email}</div>
                            </div>
                          </TableCell>
                        ) : null}
                        {index === 0 ? (
                          <TableCell rowSpan={courses.length}>
                            {student.class || "Not assigned"}
                          </TableCell>
                        ) : null}
                        <TableCell className="font-medium">{course.judul_kursus}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(progress.completion_status || '')}>
                            {progress.completion_status?.replace('_', ' ') || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-secondary rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${progress.progress_percentage || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">
                              {progress.completed_content || 0}/{progress.total_content || 0} ({progress.progress_percentage || 0}%)
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{progress.quiz_submissions?.length || 0} quizzes</span>
                            {progress.quiz_submissions && progress.quiz_submissions.length > 0 && (
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                ({progress.quiz_submissions.filter(qs => qs.score >= 70).length || 0} passed)
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500 dark:text-slate-400">
                      No student progress data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </TeacherLayout>
  );
}
