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
import { ArrowLeft, BookOpen, CheckCircle, Clock } from "lucide-react"
import TeacherLayout from "../../layout"
import { Link } from "@inertiajs/react"
import { Toaster } from "sonner"

interface Course {
  id: number;
  judul_kursus: string;
  deskripsi_kursus: string;
  url_thumbnail: string;
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

interface StudentProgress {
  student: Student;
  progress: Progress;
}

interface Props {
  course: Course;
  studentProgress: StudentProgress[];
}

export default function TeacherCourseStudentProgress({ course, studentProgress }: Props) {
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
      <Head title={`Student Progress - ${course.judul_kursus}`} />
      <Toaster position="top-right" />

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="rounded-lg">
            <Link href={`/teacher/courses/${course.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text">
              Student Progress
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Progress tracking for course: {course.judul_kursus}
            </p>
          </div>
        </div>

        {/* Course Info */}
        <Card className="border-0 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
            <CardDescription>Details about the course</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">{course.judul_kursus}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{course.deskripsi_kursus}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Progress */}
        <Card className="border-0 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle>Student Progress</CardTitle>
            <CardDescription>Progress of all students enrolled in this course</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Quizzes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentProgress && studentProgress.length > 0 ? (
                  studentProgress.map(({ student, progress }) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.nama_lengkap}</TableCell>
                      <TableCell>{student.class || "Not assigned"}</TableCell>
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
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500 dark:text-slate-400">
                      No students enrolled in this course
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
