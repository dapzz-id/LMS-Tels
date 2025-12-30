"use client"

import { useState, useEffect } from "react"
import { Link, router, usePage } from "@inertiajs/react"
import {
  Book,
  Calendar,
  ChevronDown,
  Download,
  FileText,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
  LucideBarChart,
  TrendingUp,
  Award,
  Star,
  Users,
  BookOpen,
  CheckCircle,
  Clock,
  Lock,
} from "lucide-react"

import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Progress } from "@/Components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { Badge } from "@/Components/ui/badge"
import { Input } from "@/Components/ui/input"
import StudentSidebar from "@/Components/StudentSidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import { toast } from "sonner"

interface Grade {
  id: number
  course_name: string
  course_code: string
  quiz_title: string
  score: number
  max_score: number
  percentage: number
  letter_grade: string
  submitted_at: string
  created_at: string
}

interface CourseGrade {
  course_name: string
  course_code: string
  average_score: number
  letter_grade: string
  total_quizzes: number
  highest_score: number
  lowest_score: number
  quizzes: Grade[]
  course_id: number
  completed: boolean
  certificate_eligible: boolean
  certificate_issued: boolean
  certificate_title: string | null
  certificate_id: number | null
}

interface Certificate {
  id: number
  title: string
  course_name: string
  issued_at: string
  certificate_number: string
}

interface Statistics {
  totalQuizzes: number
  averageScore: number
  highestScore: number
  lowestScore: number
  overallGrade: string
}

interface Props {
  grades: Grade[]
  courseGrades: CourseGrade[]
  certificates: Certificate[]
  statistics: Statistics
}

export default function GradesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const { auth } = usePage().props as any
  const user = auth.user
  const props = usePage().props as any
  const { grades, courseGrades, certificates, statistics } = props

  // Helper function to get grade color
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "text-green-600 dark:text-green-400"
      case "B":
        return "text-blue-600 dark:text-blue-400"
      case "C":
        return "text-yellow-600 dark:text-yellow-400"
      case "D":
        return "text-orange-600 dark:text-orange-400"
      case "F":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  // Helper function to get grade badge color
  const getGradeBadgeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "B":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "C":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "D":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "F":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  // Function to download certificate
  const handleDownloadCertificate = async (certificateId: number) => {
    try {
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = route('student.certificates.download', certificateId);
      link.target = '_blank';
      link.style.display = 'none';

      // Append to the body, click and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate. Please try again.');
    }
  }

  return (
    <div className="flex min-h-screen">
      <StudentSidebar
        active="grades"
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
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-500" />
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              LMS Tels
            </span>
            <span className="rounded-md bg-blue-100 dark:bg-blue-900 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
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
                <Link href="/profile">
                  <DropdownMenuItem className="rounded-lg cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/logout" method="post" as="button">
                  <DropdownMenuItem className="rounded-lg cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-6">
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-transparent bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text">
                  My Grades & Certificates
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg mt-2">Track your academic performance and download your certificates</p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-blue-100 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-all ${activeTab === 'overview' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('certificates')}
                className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-all ${activeTab === 'certificates' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                Certificates
              </button>
              <button
                onClick={() => setActiveTab('quizzes')}
                className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-all ${activeTab === 'quizzes' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                Quiz Results
              </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-slate-900">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                      <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Overall Grade</p>
                      <p className={`text-2xl font-bold ${getGradeColor(statistics.overallGrade)}`}>
                        {statistics.overallGrade}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-slate-900">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                      <LucideBarChart className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Average Score</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {statistics.averageScore}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-slate-900">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                      <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Certificates</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {certificates.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-slate-900">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                      <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Quizzes</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {statistics.totalQuizzes}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Certificates Section */}
            {activeTab === 'overview' || activeTab === 'certificates' ? (
              <div className="space-y-6">
                <Card className="border-0 shadow-lg rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-blue-100 dark:border-gray-700">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">My Certificates</CardTitle>
                        <CardDescription>Certificates you've earned for course completion</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {certificates.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                          <FileText className="w-12 h-12 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Certificates Yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                          You haven't earned any certificates. Complete courses to earn certificates.
                        </p>
                        <Button
                          onClick={() => router.visit('/dashboard/courses')}
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3"
                        >
                          Browse Courses
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {certificates.map((certificate: Certificate) => (
                          <Card
                            key={certificate.id}
                            className="bg-white dark:bg-gray-700/50 border border-blue-100 dark:border-gray-600 hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden"
                          >
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-lg font-bold">{certificate.title}</CardTitle>
                                  <p className="text-blue-100 text-sm mt-1">{certificate.course_name}</p>
                                </div>
                                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                                  Certificate
                                </Badge>
                              </div>
                            </div>
                            <CardContent className="pt-4">
                              <div className="space-y-3">
                                <div className="flex items-center text-gray-600 dark:text-gray-300">
                                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                                  <span className="text-sm">Issued: {certificate.issued_at}</span>
                                </div>
                                <div className="flex items-center text-gray-600 dark:text-gray-300">
                                  <Award className="h-4 w-4 mr-2 text-blue-500" />
                                  <span className="text-sm font-mono">ID: {certificate.certificate_number}</span>
                                </div>
                                <div className="flex gap-2 pt-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => router.visit(`/dashboard/certificates/${certificate.id}`)}
                                    className="flex-1 border-blue-200 dark:border-gray-600"
                                  >
                                    <FileText className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleDownloadCertificate(certificate.id)}
                                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : null
          }

          {/* Recent Quiz Results */}
          <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-xl">Recent Quiz Results</CardTitle>
              <CardDescription>Your most recent quiz submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {grades.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">
                    No quiz results yet. Complete some quizzes to see your results here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {grades.slice(0, 5).map((grade: Grade) => (
                    <div key={grade.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-slate-900 dark:text-slate-100">{grade.quiz_title}</h3>
                          <Badge className={getGradeBadgeColor(grade.letter_grade)}>
                            {grade.letter_grade}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{grade.course_name}</p>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-lg font-bold">{grade.score}%</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {new Date(grade.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
    </div>
  )
}
