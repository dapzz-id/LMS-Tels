"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { router } from "@inertiajs/react"
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileUp,
  HelpCircle,
  Save,
  Send,
  Upload,
  FileText,
  Calendar,
  Info,
  Book,
  ChevronDown,
  Download,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Sparkles,
  User,
  X,
  LucideBarChart,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  Filter,
  MoreHorizontal,
  Star,
  StarHalf,
  Users,
} from "lucide-react"

import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group"
import { Label } from "@/Components/ui/label"
import { Separator } from "@/Components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import { Input } from "@/Components/ui/input"
import { Textarea } from "@/Components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert"
import {usePage} from "@inertiajs/react"
import StudentSidebar from "@/Components/StudentSidebar"

// Mock data for assignments
const assignments = [
  {
    id: 1,
    title: "Calculus Problem Set",
    course: "Mathematics",
    courseColor: "blue",
    dueDate: "Today, 11:59 PM",
    dueDateTimestamp: new Date().setHours(23, 59, 59, 0), // Today at 11:59 PM
    status: "due-soon",
    progress: 75,
    description: "Complete problems 1-15 on derivatives and integrals from Chapter 4.",
    type: "Multiple Choice Quiz",
    points: 50,
    submissionType: "Online Quiz",
    lastModified: "Yesterday, 8:30 PM",
    attachments: 2,
    instructor: "Dr. Robert Chen",
    assignmentType: "quiz",
    timeLimit: 60, // in minutes
    questions: [
      {
        id: 1,
        question: "What is the derivative of f(x) = x²?",
        options: [
          { id: "a", text: "f'(x) = x" },
          { id: "b", text: "f'(x) = 2x" },
          { id: "c", text: "f'(x) = 2" },
          { id: "d", text: "f'(x) = x²" },
        ],
        correctAnswer: "b",
      },
      {
        id: 2,
        question: "Which of the following is the integral of f(x) = 2x?",
        options: [
          { id: "a", text: "F(x) = x² + C" },
          { id: "b", text: "F(x) = x² - C" },
          { id: "c", text: "F(x) = 2x² + C" },
          { id: "d", text: "F(x) = x² / 2 + C" },
        ],
        correctAnswer: "a",
      },
      {
        id: 3,
        question: "What is the derivative of sin(x)?",
        options: [
          { id: "a", text: "cos(x)" },
          { id: "b", text: "-sin(x)" },
          { id: "c", text: "tan(x)" },
          { id: "d", text: "-cos(x)" },
        ],
        correctAnswer: "a",
      },
      {
        id: 4,
        question: "If f(x) = e^x, then f'(x) = ?",
        options: [
          { id: "a", text: "xe^(x-1)" },
          { id: "b", text: "e^x" },
          { id: "c", text: "e^(x-1)" },
          { id: "d", text: "xe^x" },
        ],
        correctAnswer: "b",
      },
      {
        id: 5,
        question: "What is the derivative of ln(x)?",
        options: [
          { id: "a", text: "1/x" },
          { id: "b", text: "ln(x)/x" },
          { id: "c", text: "x" },
          { id: "d", text: "1/ln(x)" },
        ],
        correctAnswer: "a",
      },
      {
        id: 6,
        question: "Find the derivative of f(x) = x³ - 4x² + 7x - 9",
        options: [
          { id: "a", text: "f'(x) = 3x² - 8x + 7" },
          { id: "b", text: "f'(x) = 3x² - 4x + 7" },
          { id: "c", text: "f'(x) = 3x² - 8x - 9" },
          { id: "d", text: "f'(x) = x² - 8x + 7" },
        ],
        correctAnswer: "a",
      },
      {
        id: 7,
        question: "What is the integral of f(x) = cos(x)?",
        options: [
          { id: "a", text: "F(x) = sin(x) + C" },
          { id: "b", text: "F(x) = -sin(x) + C" },
          { id: "c", text: "F(x) = tan(x) + C" },
          { id: "d", text: "F(x) = sec(x) + C" },
        ],
        correctAnswer: "a",
      },
      {
        id: 8,
        question: "The derivative of a constant is:",
        options: [
          { id: "a", text: "The constant itself" },
          { id: "b", text: "Zero" },
          { id: "c", text: "One" },
          { id: "d", text: "Undefined" },
        ],
        correctAnswer: "b",
      },
      {
        id: 9,
        question: "If f(x) = x⁴, then f''(x) = ?",
        options: [
          { id: "a", text: "4x³" },
          { id: "b", text: "12x²" },
          { id: "c", text: "24x" },
          { id: "d", text: "16x²" },
        ],
        correctAnswer: "b",
      },
      {
        id: 10,
        question: "What is the derivative of tan(x)?",
        options: [
          { id: "a", text: "sec(x)" },
          { id: "b", text: "sec²(x)" },
          { id: "c", text: "cot(x)" },
          { id: "d", text: "-csc²(x)" },
        ],
        correctAnswer: "b",
      },
      {
        id: 11,
        question: "The integral of 1/x is:",
        options: [
          { id: "a", text: "x + C" },
          { id: "b", text: "ln|x| + C" },
          { id: "c", text: "e^x + C" },
          { id: "d", text: "1/(x+1) + C" },
        ],
        correctAnswer: "b",
      },
      {
        id: 12,
        question: "What is the derivative of arcsin(x)?",
        options: [
          { id: "a", text: "1/√(1-x²)" },
          { id: "b", text: "-1/√(1-x²)" },
          { id: "c", text: "1/(1+x²)" },
          { id: "d", text: "√(1-x²)" },
        ],
        correctAnswer: "a",
      },
      {
        id: 13,
        question: "The chain rule is used when:",
        options: [
          { id: "a", text: "Differentiating a sum of functions" },
          { id: "b", text: "Differentiating a product of functions" },
          { id: "c", text: "Differentiating a quotient of functions" },
          { id: "d", text: "Differentiating a composition of functions" },
        ],
        correctAnswer: "d",
      },
      {
        id: 14,
        question: "What is the integral of e^x?",
        options: [
          { id: "a", text: "e^x + C" },
          { id: "b", text: "xe^x + C" },
          { id: "c", text: "ln(x) + C" },
          { id: "d", text: "e^(x+1) + C" },
        ],
        correctAnswer: "a",
      },
      {
        id: 15,
        question: "The derivative of a sum of functions is:",
        options: [
          { id: "a", text: "The product of their derivatives" },
          { id: "b", text: "The sum of their derivatives" },
          { id: "c", text: "The quotient of their derivatives" },
          { id: "d", text: "The composition of their derivatives" },
        ],
        correctAnswer: "b",
      },
      {
        id: 16,
        question: "What is the second derivative of f(x) = sin(x)?",
        options: [
          { id: "a", text: "cos(x)" },
          { id: "b", text: "-cos(x)" },
          { id: "c", text: "sin(x)" },
          { id: "d", text: "-sin(x)" },
        ],
        correctAnswer: "d",
      },
      {
        id: 17,
        question: "The integral of sin(x) is:",
        options: [
          { id: "a", text: "cos(x) + C" },
          { id: "b", text: "-cos(x) + C" },
          { id: "c", text: "tan(x) + C" },
          { id: "d", text: "sec(x) + C" },
        ],
        correctAnswer: "b",
      },
      {
        id: 18,
        question: "What is the derivative of x^n where n is a constant?",
        options: [
          { id: "a", text: "nx^(n-1)" },
          { id: "b", text: "nx^n" },
          { id: "c", text: "n^x" },
          { id: "d", text: "x^(n+1)" },
        ],
        correctAnswer: "a",
      },
      {
        id: 19,
        question: "The fundamental theorem of calculus relates:",
        options: [
          { id: "a", text: "Differentiation and multiplication" },
          { id: "b", text: "Integration and differentiation" },
          { id: "c", text: "Addition and subtraction" },
          { id: "d", text: "Exponents and logarithms" },
        ],
        correctAnswer: "b",
      },
      {
        id: 20,
        question: "What is the derivative of arctan(x)?",
        options: [
          { id: "a", text: "1/(1+x²)" },
          { id: "b", text: "-1/(1+x²)" },
          { id: "c", text: "1/√(1-x²)" },
          { id: "d", text: "1/x" },
        ],
        correctAnswer: "a",
      },
    ],
  },
  {
    id: 2,
    title: "Chemical Reactions Lab Report",
    course: "Science",
    courseColor: "green",
    dueDate: "Tomorrow, 11:59 PM",
    dueDateTimestamp: new Date(new Date().setDate(new Date().getDate() + 1)).setHours(23, 59, 59, 0), // Tomorrow at 11:59 PM
    status: "in-progress",
    progress: 60,
    description:
      "Write a detailed report on the chemical reactions experiment conducted in lab last week. Include your observations, data analysis, and conclusions.",
    type: "Lab Report",
    points: 100,
    submissionType: "File Upload",
    lastModified: "Today, 10:15 AM",
    attachments: 1,
    instructor: "Ms. Sarah Johnson",
    assignmentType: "essay",
    requirements: [
      "Minimum 1500 words",
      "Include at least 3 diagrams or charts",
      "Cite at least 5 academic sources",
      "Follow APA formatting guidelines",
      "Submit as PDF or Word document",
    ],
    rubric: [
      { criteria: "Introduction & Background", points: 20 },
      { criteria: "Methodology", points: 15 },
      { criteria: "Results & Data Analysis", points: 25 },
      { criteria: "Discussion & Conclusion", points: 25 },
      { criteria: "References & Formatting", points: 15 },
    ],
  },
]

// Timer component for countdown
const CountdownTimer = ({ dueDate, timeLimit }: { dueDate: number; timeLimit?: number }) => {
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
    total: number
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  })

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime()
      const distance = dueDate - now

      // If time limit is provided, use it instead of due date
      // This is for timed quizzes that might have a shorter time limit than the due date

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        total: distance,
      })
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [dueDate, timeLimit])

  // Determine urgency level for styling
  const getUrgencyLevel = () => {
    const { total } = timeRemaining

    if (total <= 0) return "expired" // Past due
    if (total <= 1000 * 60 * 60 * 3) return "critical" // Less than 3 hours
    if (total <= 1000 * 60 * 60 * 24) return "urgent" // Less than 24 hours
    if (total <= 1000 * 60 * 60 * 48) return "warning" // Less than 48 hours
    return "normal" // More than 48 hours
  }

  const urgencyLevel = getUrgencyLevel()

  // Style based on urgency
  const getTimerStyles = () => {
    switch (urgencyLevel) {
      case "expired":
        return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
      case "critical":
        return "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/50"
      case "urgent":
        return "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800/50"
      case "warning":
        return "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800/50"
      default:
        return "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/50"
    }
  }

  // Format display text
  const formatTimeDisplay = () => {
    const { days, hours, minutes, seconds, total } = timeRemaining

    if (total <= 0) {
      return "Past Due"
    }

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m remaining`
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s remaining`
    }

    return `${minutes}m ${seconds}s remaining`
  }

  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${getTimerStyles()}`}>
      <Clock className="w-4 h-4" />
      <span className="font-medium">{formatTimeDisplay()}</span>
    </div>
  )
}

export default function AssignmentDetailPage() {
  const { props } = usePage();
  const assignmentId = props.id;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [assignment, setAssignment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [notes, setNotes] = useState("")
  const [saveStatus, setSaveStatus] = useState("")

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [visibleQuestionNav, setVisibleQuestionNav] = useState(false)

  // Timer for quiz
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizEndTime, setQuizEndTime] = useState<number | null>(null)

  useEffect(() => {
    // Simulate loading the assignment data
    setTimeout(() => {
      const foundAssignment = assignments.find((a) => a.id === assignmentId)
      if (foundAssignment) {
        setAssignment(foundAssignment)
      }
      setLoading(false)
    }, 500)
  }, [assignmentId])

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleSubmitQuiz = () => {
    if (!assignment) return

    let correctCount = 0
    assignment.questions.forEach((question: any) => {
      if (answers[question.id] === question.correctAnswer) {
        correctCount++
      }
    })

    const calculatedScore = Math.round((correctCount / assignment.questions.length) * 100)
    setScore(calculatedScore)
    setSubmitted(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSaveDraft = () => {
    setSaveStatus("Draft saved successfully!")
    setTimeout(() => setSaveStatus(""), 3000)
  }

  const handleSubmitEssay = () => {
    if (selectedFile) {
      setSubmitted(true)
    }
  }

  const handleQuestionNavigation = (index: number) => {
    setCurrentQuestionIndex(index)
    // On mobile, close the navigation after selecting a question
    if (window.innerWidth < 768) {
      setVisibleQuestionNav(false)
    }
  }

  const startQuiz = () => {
    setQuizStarted(true)
    // Set end time based on time limit
    if (assignment && assignment.timeLimit) {
      const endTime = new Date().getTime() + assignment.timeLimit * 60 * 1000
      setQuizEndTime(endTime)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (assignment?.assignmentType !== "quiz" || submitted || !quizStarted) return

      if (e.key === "ArrowRight" && currentQuestionIndex < (assignment?.questions?.length || 0) - 1) {
        setCurrentQuestionIndex((prev) => prev + 1)
      } else if (e.key === "ArrowLeft" && currentQuestionIndex > 0) {
        setCurrentQuestionIndex((prev) => prev - 1)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [assignment, currentQuestionIndex, submitted, quizStarted])

  const renderLayout = (content: React.ReactNode) => (
    <div className="flex min-h-screen bg-blue-50/30 dark:bg-blue-950/90">
      <StudentSidebar
        active="courses"
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center px-4 bg-white border-b border-blue-100 h-14 dark:border-blue-800/30 dark:bg-blue-900/90 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <h1 className="text-base font-semibold">Assignment</h1>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {content}
        </main>
      </div>
    </div>
  )

  if (loading) {
    return renderLayout(
      <div className="container mx-auto flex h-[80vh] items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
          <p className="text-lg font-medium">Loading assignment...</p>
        </div>
      </div>
    )
  }

  if (!assignment) {
    return renderLayout(
      <div className="container p-4 mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Assignment Not Found</CardTitle>
            <CardDescription>
              The assignment you're looking for doesn't exist or you don't have access to it.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.visit("/dashboard/assignments")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Assignments
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Helper function to get course badge color
  const getCourseBadgeClass = (color: string) => {
    const baseClasses = "border bg-opacity-15 text-opacity-90"
    switch (color) {
      case "blue":
        return `${baseClasses} border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300`
      case "green":
        return `${baseClasses} border-green-200 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300`
      default:
        return `${baseClasses} border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900/30 dark:text-gray-300`
    }
  }

  return renderLayout(
    <div className="container p-4 mx-auto lg:p-6">
      <Button variant="outline" className="mb-6" onClick={() => router.visit("/dashboard/assignments")}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Assignments
      </Button>

      <div className="p-6 mb-6 bg-white border border-blue-100 rounded-lg shadow-sm dark:bg-blue-900/40 dark:border-blue-800/30">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">{assignment.title}</h1>
            <p className="mt-2 text-gray-600 dark:text-blue-200/80">{assignment.description}</p>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              <Badge variant="outline" className={getCourseBadgeClass(assignment.courseColor)}>
                {assignment.course}
              </Badge>
              <Badge variant="outline" className="text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300">
                {assignment.type}
              </Badge>
              <div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-300">
                <Calendar className="mr-1.5 h-4 w-4" />
                Due: {assignment.dueDate}
              </div>
            </div>

            <div className="mt-4 space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-blue-300/70">Points:</span>
                <span className="font-medium">{assignment.points}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-blue-300/70">Instructor:</span>
                <span className="font-medium">{assignment.instructor}</span>
              </div>
              {assignment.timeLimit && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-blue-300/70">Time Limit:</span>
                  <span className="font-medium">{assignment.timeLimit} minutes</span>
                </div>
              )}
            </div>
          </div>

          <div className="md:w-64">
            <div className="p-4 border border-blue-100 rounded-lg dark:border-blue-800/30 bg-blue-50/50 dark:bg-blue-900/20">
              <h3 className="flex items-center mb-3 font-medium">
                <Clock className="w-4 h-4 mr-2" />
                Time Remaining
              </h3>

              {quizStarted && quizEndTime ? (
                <CountdownTimer dueDate={quizEndTime} />
              ) : (
                <CountdownTimer dueDate={assignment.dueDateTimestamp} />
              )}

              {assignment.assignmentType === "quiz" && !quizStarted && !submitted && (
                <div className="mt-4">
                  <Alert className="text-blue-800 border-blue-200 bg-blue-50/80 dark:bg-blue-900/30 dark:border-blue-800/50 dark:text-blue-200">
                    <Info className="w-4 h-4" />
                    <AlertTitle>Timed Quiz</AlertTitle>
                    <AlertDescription>
                      This quiz has a time limit of {assignment.timeLimit} minutes once you start.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {assignment.assignmentType === "quiz" && (
        <div className="relative flex flex-col gap-4 lg:flex-row">
          <Card className="flex-1">
            <CardHeader className="border-b bg-blue-50/80 dark:bg-blue-900/50 dark:border-blue-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center text-blue-800 dark:text-blue-200">
                    <FileText className="w-5 h-5 mr-2" />
                    Multiple Choice Quiz
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Select the best answer for each question. Use the navigation panel to move between questions.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white lg:hidden dark:bg-blue-800/60"
                  onClick={() => setVisibleQuestionNav(!visibleQuestionNav)}
                >
                  <FileText className="mr-1.5 h-4 w-4" />
                  Questions
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {!quizStarted && !submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 bg-blue-100 rounded-full dark:bg-blue-900/50">
                    <FileText className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="mt-4 text-xl font-medium">Ready to Begin?</h3>
                  <p className="max-w-md mt-2 text-gray-600 dark:text-gray-300">
                    This quiz contains {assignment.questions.length} questions and has a time limit of{" "}
                    {assignment.timeLimit} minutes. Once you start, the timer will begin counting down.
                  </p>
                  <Button className="mt-6 bg-blue-600 hover:bg-blue-700" onClick={startQuiz}>
                    Start Quiz
                  </Button>
                </div>
              ) : submitted ? (
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                    <h3 className="text-lg font-medium">Quiz Results</h3>
                    <div className="flex items-center justify-between mt-4">
                      <span>Your Score:</span>
                      <span className="text-xl font-bold">{score}%</span>
                    </div>
                    <div className="w-full h-2 mt-2 bg-gray-200 rounded-full dark:bg-gray-700">
                      <div
                        className={`h-2 rounded-full ${
                          score >= 90
                            ? "bg-green-500"
                            : score >= 70
                              ? "bg-blue-500"
                              : score >= 60
                                ? "bg-yellow-500"
                                : "bg-red-500"
                        }`}
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                    <p className="mt-4 text-sm">
                      You answered {Math.round((score / 100) * assignment.questions.length)} out of{" "}
                      {assignment.questions.length} questions correctly.
                    </p>
                  </div>

                  <div>
                    {assignment.questions.map((question: any, index: number) => (
                      <div
                        key={question.id}
                        className={`${index === currentQuestionIndex ? "block" : "hidden"} rounded-lg border p-4 ${
                          answers[question.id] === question.correctAnswer
                            ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                            : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium">
                            Question {question.id}: {question.question}
                          </h4>
                          {answers[question.id] === question.correctAnswer ? (
                            <Badge className="bg-green-600">Correct</Badge>
                          ) : (
                            <Badge className="bg-red-600">Incorrect</Badge>
                          )}
                        </div>

                        <div className="mt-3 space-y-2">
                          {question.options.map((option: any) => {
                            const isSelected = answers[question.id] === option.id
                            const isCorrectOption = option.id === question.correctAnswer

                            let optionClass = "flex items-center space-x-2 rounded-md border p-3"
                            if (isSelected && isCorrectOption) {
                              optionClass += " border-green-500 bg-green-100 dark:border-green-700 dark:bg-green-900/40"
                            } else if (isSelected && !isCorrectOption) {
                              optionClass += " border-red-500 bg-red-100 dark:border-red-700 dark:bg-red-900/40"
                            } else if (isCorrectOption) {
                              optionClass += " border-green-500 bg-green-50 dark:border-green-700 dark:bg-green-900/20"
                            } else {
                              optionClass += " border-gray-200 dark:border-gray-700"
                            }

                            return (
                              <div key={option.id} className={optionClass}>
                                <RadioGroupItem
                                  value={option.id}
                                  id={`q${question.id}-${option.id}`}
                                  checked={isSelected}
                                  disabled
                                />
                                <Label htmlFor={`q${question.id}-${option.id}`} className="flex-1">
                                  {option.text}
                                </Label>
                                {isSelected && isCorrectOption && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                                {isSelected && !isCorrectOption && (
                                  <div className="flex items-center justify-center w-5 h-5 text-red-600 border border-red-500 rounded-full">
                                    ✕
                                  </div>
                                )}
                                {!isSelected && isCorrectOption && (
                                  <CheckCircle2 className="w-5 h-5 text-green-600 opacity-50" />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => currentQuestionIndex > 0 && setCurrentQuestionIndex((prev) => prev - 1)}
                      disabled={currentQuestionIndex === 0}
                    >
                      Previous Question
                    </Button>
                    <span className="text-sm text-gray-500">
                      Question {currentQuestionIndex + 1} of {assignment.questions.length}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() =>
                        currentQuestionIndex < assignment.questions.length - 1 &&
                        setCurrentQuestionIndex((prev) => prev + 1)
                      }
                      disabled={currentQuestionIndex === assignment.questions.length - 1}
                    >
                      Next Question
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  {assignment.questions.map((question: any, index: number) => (
                    <div
                      key={question.id}
                      className={`${index === currentQuestionIndex ? "block" : "hidden"} rounded-lg border border-gray-200 p-6 dark:border-gray-700`}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-lg font-medium">
                          Question {question.id}: {question.question}
                        </h4>
                        <Badge
                          variant="outline"
                          className="text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300"
                        >
                          {currentQuestionIndex + 1} of {assignment.questions.length}
                        </Badge>
                      </div>
                      <RadioGroup
                        value={answers[question.id] || ""}
                        onValueChange={(value) => handleAnswerChange(question.id, value)}
                        className="space-y-3"
                      >
                        {question.options.map((option: any) => (
                          <div
                            key={option.id}
                            className={`flex items-center space-x-2 rounded-md border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50 ${
                              answers[question.id] === option.id
                                ? "border-blue-500 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20"
                                : ""
                            }`}
                          >
                            <RadioGroupItem value={option.id} id={`q${question.id}-${option.id}`} />
                            <Label htmlFor={`q${question.id}-${option.id}`} className="flex-1 cursor-pointer">
                              {option.text}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>

                      <div className="flex items-center justify-between mt-6">
                        <Button
                          variant="outline"
                          onClick={() => currentQuestionIndex > 0 && setCurrentQuestionIndex((prev) => prev - 1)}
                          disabled={currentQuestionIndex === 0}
                        >
                          Previous Question
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            currentQuestionIndex < assignment.questions.length - 1 &&
                            setCurrentQuestionIndex((prev) => prev + 1)
                          }
                          disabled={currentQuestionIndex === assignment.questions.length - 1}
                        >
                          Next Question
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between px-6 py-4 border-t bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
              {!submitted ? (
                quizStarted ? (
                  <>
                    <Button variant="outline">Save Progress</Button>
                    <Button
                      onClick={handleSubmitQuiz}
                      disabled={Object.keys(answers).length !== assignment.questions.length}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Submit Quiz
                    </Button>
                  </>
                ) : null
              ) : (
                <Button
                  onClick={() => router.visit("/dashboard/assignments")}
                  className="ml-auto bg-blue-600 hover:bg-blue-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Return to Assignments
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Question Navigation Panel */}
          {quizStarted && (
            <div
              className={`
              fixed inset-y-0 right-0 z-50 w-64 transform bg-white p-4 shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-900
              lg:static lg:z-0 lg:w-64 lg:transform-none lg:shadow-none
              ${visibleQuestionNav ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
            `}
            >
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h3 className="font-medium">Questions</h3>
                <Button variant="ghost" size="sm" onClick={() => setVisibleQuestionNav(false)}>
                  ✕
                </Button>
              </div>

              <div className="sticky top-4">
                <div className="mb-4">
                  <h3 className="mb-2 font-medium">Quiz Navigation</h3>
                  <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                    <div
                      className="h-2 bg-blue-600 rounded-full"
                      style={{ width: `${(Object.keys(answers).length / assignment.questions.length) * 100}%` }}
                    ></div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {Object.keys(answers).length} of {assignment.questions.length} answered
                  </p>
                </div>

                {quizEndTime && (
                  <div className="mb-4">
                    <h3 className="mb-2 font-medium">Time Remaining</h3>
                    <CountdownTimer dueDate={quizEndTime} />
                  </div>
                )}

                <div className="grid grid-cols-5 gap-2">
                  {assignment.questions.map((question: any, index: number) => {
                    const isAnswered = !!answers[question.id]
                    const isCurrent = index === currentQuestionIndex

                    let buttonClass = "flex h-8 w-8 items-center justify-center rounded-md text-sm"

                    if (submitted) {
                      if (answers[question.id] === question.correctAnswer) {
                        buttonClass += " bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        if (isCurrent) buttonClass += " ring-2 ring-green-500 dark:ring-green-400"
                      } else {
                        buttonClass += " bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        if (isCurrent) buttonClass += " ring-2 ring-red-500 dark:ring-red-400"
                      }
                    } else {
                      if (isCurrent) {
                        buttonClass += " bg-blue-600 text-white dark:bg-blue-700"
                      } else if (isAnswered) {
                        buttonClass += " bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      } else {
                        buttonClass += " bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                      }
                    }

                    return (
                      <button
                        key={question.id}
                        className={buttonClass}
                        onClick={() => handleQuestionNavigation(index)}
                        aria-label={`Go to question ${question.id}`}
                      >
                        {question.id}
                      </button>
                    )
                  })}
                </div>

                <div className="p-3 mt-6 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <h4 className="mb-2 text-sm font-medium">Question Status</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 mr-2 bg-blue-600 rounded-full"></div>
                      <span>Current Question</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 mr-2 bg-blue-100 rounded-full dark:bg-blue-900/30"></div>
                      <span>Answered</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 mr-2 bg-gray-100 rounded-full dark:bg-gray-800"></div>
                      <span>Unanswered</span>
                    </div>
                    {submitted && (
                      <>
                        <div className="flex items-center">
                          <div className="w-3 h-3 mr-2 bg-green-100 rounded-full dark:bg-green-900/30"></div>
                          <span>Correct</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 mr-2 bg-red-100 rounded-full dark:bg-red-900/30"></div>
                          <span>Incorrect</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {quizStarted && !submitted && (
                  <div className="mt-4">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={Object.keys(answers).length !== assignment.questions.length}
                      onClick={handleSubmitQuiz}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Submit Quiz
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Essay Assignment */}
      {assignment.assignmentType === "essay" && (
        <Card>
          <CardHeader className="border-b bg-blue-50/80 dark:bg-blue-900/50 dark:border-blue-800/50">
            <CardTitle className="flex items-center text-blue-800 dark:text-blue-200">
              <FileUp className="w-5 h-5 mr-2" />
              Lab Report Submission
            </CardTitle>
            <CardDescription className="mt-1">
              Upload your completed lab report following the requirements below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="p-6 text-center rounded-lg bg-green-50 dark:bg-green-900/30">
                <CheckCircle2 className="w-12 h-12 mx-auto text-green-600 dark:text-green-400" />
                <h3 className="mt-4 text-xl font-medium text-green-800 dark:text-green-300">Submission Successful!</h3>
                <p className="mt-2 text-green-700 dark:text-green-400">
                  Your lab report has been submitted successfully. You'll receive feedback once it's graded.
                </p>
                <div className="p-4 mt-4 text-left bg-white border border-green-200 rounded-lg dark:border-green-800 dark:bg-green-900/20">
                  <p className="font-medium">File Submitted:</p>
                  <p>{selectedFile?.name}</p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-green-300/70">
                    Submitted on {new Date().toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <Tabs defaultValue="upload">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="upload">File Upload</TabsTrigger>
                    <TabsTrigger value="requirements">Requirements</TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="space-y-4">
                    <div className="p-6 text-center border-2 border-gray-300 border-dashed rounded-lg dark:border-gray-700">
                      <FileUp className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500" />
                      <h3 className="mt-2 text-sm font-medium">Upload your lab report</h3>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">PDF, DOC, or DOCX up to 10MB</p>
                      <Input
                        type="file"
                        className="max-w-xs mx-auto mt-4"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                    </div>

                    {selectedFile && (
                      <div className="p-4 border border-green-200 rounded-lg bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{selectedFile.name}</p>
                            <p className="text-sm text-gray-500 dark:text-green-300/70">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setSelectedFile(null)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="notes">Additional Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any notes for your instructor..."
                        className="mt-1"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>

                    {saveStatus && (
                      <Alert className="text-green-800 bg-green-50 dark:bg-green-900/30 dark:text-green-300">
                        <CheckCircle2 className="w-4 h-4" />
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>{saveStatus}</AlertDescription>
                      </Alert>
                    )}

                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <h3 className="flex items-center mb-2 font-medium">
                        <Clock className="w-4 h-4 mr-2" />
                        Time Remaining
                      </h3>
                      <CountdownTimer dueDate={assignment.dueDateTimestamp} />
                    </div>
                  </TabsContent>

                  <TabsContent value="requirements" className="space-y-6">
                    <div>
                      <h3 className="mb-2 font-medium">Assignment Requirements</h3>
                      <ul className="ml-6 space-y-1 list-disc">
                        {assignment.requirements.map((req: string, index: number) => (
                          <li key={index} className="text-sm">
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="mb-2 font-medium">Grading Rubric</h3>
                      <div className="border rounded-lg dark:border-gray-700">
                        <div className="grid grid-cols-2 p-3 font-medium border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                          <div>Criteria</div>
                          <div>Points</div>
                        </div>
                        {assignment.rubric.map((item: any, index: number) => (
                          <div
                            key={index}
                            className={`grid grid-cols-2 p-3 ${index !== assignment.rubric.length - 1 ? "border-b dark:border-gray-700" : ""}`}
                          >
                            <div>{item.criteria}</div>
                            <div>{item.points}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                      <div className="flex">
                        <HelpCircle className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                        <h3 className="font-medium text-blue-800 dark:text-blue-300">Need Help?</h3>
                      </div>
                      <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                        If you have questions about this assignment, contact your instructor at{" "}
                        {assignment.instructor.split(" ")[1].toLowerCase()}@school.edu
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </CardContent>
          {!submitted && (
            <CardFooter className="flex justify-between px-6 py-4 border-t bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
              <Button variant="outline" onClick={handleSaveDraft}>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button onClick={handleSubmitEssay} disabled={!selectedFile} className="bg-blue-600 hover:bg-blue-700">
                <Upload className="w-4 h-4 mr-2" />
                Submit Assignment
              </Button>
            </CardFooter>
          )}
          {submitted && (
            <CardFooter className="px-6 py-4 border-t bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
              <Button
                onClick={() => router.visit("/dashboard/assignments")}
                className="ml-auto bg-blue-600 hover:bg-blue-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Assignments
              </Button>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  )
}
