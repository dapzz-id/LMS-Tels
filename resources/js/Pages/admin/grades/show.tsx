"use client"

import { Head, Link } from '@inertiajs/react'
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  BookOpen,
  FileText,
  Award
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Badge } from "@/Components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import AdminLayout from "@/Layouts/AdminLayout"

interface DetailedResult {
  question: string;
  options: string[];
  correct_answer: number;
  student_answer: number | null;
  is_correct: boolean;
}

interface Submission {
  id: number;
  user: {
    id: number;
    nama_lengkap: string;
    email: string;
  };
  course: {
    id: number;
    judul_kursus: string;
  };
  courseContent: {
    id: number;
    title: string;
  };
  score: number;
  total_questions: number;
  submitted_at: string;
  time_taken: number;
}

interface Props {
  submission: Submission;
  detailedResults: DetailedResult[];
}

export default function AdminGradesShowPage({ submission, detailedResults }: Props) {
  // Debug: Log the submission data
  
  
  

  const percentage = submission.total_questions > 0
    ? Math.round((submission.score / submission.total_questions) * 100)
    : 0;

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return "A"
    if (percentage >= 80) return "B"
    if (percentage >= 70) return "C"
    if (percentage >= 60) return "D"
    return "F"
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800"
    if (percentage >= 80) return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800"
    if (percentage >= 70) return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-800"
    if (percentage >= 60) return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-800"
    return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800"
  }

  return (
    <AdminLayout>
      <Head title="Quiz Submission Details" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/grades">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-red-700 to-red-500 bg-clip-text">
              Quiz Submission Details
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Detailed breakdown of student's quiz performance</p>
          </div>
        </div>

        {/* Submission Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Student</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${submission.user.nama_lengkap || 'Student'}&background=red&color=white`} />
                  <AvatarFallback>{submission.user.nama_lengkap?.charAt(0) || 'S'}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{submission.user.nama_lengkap || 'Unknown Student'}</div>
                  <div className="text-sm text-slate-500">{submission.user.email || 'No email'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Course & Quiz</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-red-600" />
                <div>
                  <div className="font-medium">{submission.course?.judul_kursus || 'Unknown Course'}</div>
                  <div className="text-sm text-slate-500">{submission.courseContent?.title || 'Unknown Quiz'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-red-600" />
                <div>
                  <div className="text-2xl font-bold">{percentage}%</div>
                  <Badge variant="outline" className={getGradeColor(percentage)}>
                    {getGrade(percentage)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Submission Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>{new Date(submission.submitted_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Submitted on {new Date(submission.submitted_at).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Score Summary */}
        <Card className="border-0 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle>Score Summary</CardTitle>
            <CardDescription>Overall performance breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{submission.score}</div>
                <div className="text-sm text-slate-500">Correct Answers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-600">{submission.total_questions}</div>
                <div className="text-sm text-slate-500">Total Questions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{percentage}%</div>
                <div className="text-sm text-slate-500">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question-by-Question Breakdown */}
        <Card className="border-0 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle>Question Breakdown</CardTitle>
            <CardDescription>Detailed analysis of each question</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {detailedResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Question {index + 1}</span>
                      {result.is_correct ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <Badge variant={result.is_correct ? "default" : "destructive"}>
                      {result.is_correct ? "Correct" : "Incorrect"}
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <p className="font-medium mb-3">{result.question}</p>
                    <div className="space-y-2">
                      {result.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-3 rounded-lg border ${
                            optionIndex === result.correct_answer
                              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                              : optionIndex === result.student_answer && !result.is_correct
                              ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                              : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{String.fromCharCode(65 + optionIndex)}.</span>
                            <span>{option}</span>
                            {optionIndex === result.correct_answer && (
                              <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                            )}
                            {optionIndex === result.student_answer && !result.is_correct && (
                              <XCircle className="w-4 h-4 text-red-600 ml-auto" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <span>Correct Answer:</span>
                      <span className="font-medium">{String.fromCharCode(65 + result.correct_answer)}</span>
                    </div>
                    {result.student_answer !== null && (
                      <div className="flex items-center gap-1">
                        <span>Student Answer:</span>
                        <span className="font-medium">{String.fromCharCode(65 + result.student_answer)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
