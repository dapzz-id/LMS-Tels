"use client"

import { useState } from "react"
import {
  Book,
  Calendar,
  ChevronDown,
  Clock,
  Download,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Sparkles,
  User,
  X,
  Grid,
  List,
  CheckCircle2,
  AlertCircle,
  Clock4,
  CalendarClock,
  BookOpen,
  FileCheck,
  Eye,
  LucideBarChart,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  Award,
  Filter,
  MoreHorizontal,
  Star,
  StarHalf,
  Users,
} from "lucide-react"

import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/Components/ui/card"
import { Progress } from "@/Components/ui/progress"
import { Badge } from "@/Components/ui/badge"
import { Input } from "@/Components/ui/input"
import StudentSidebar from "@/Components/StudentSidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/Components/ui/tabs"

// Mock data for assignments
const assignments = [
  {
    id: 1,
    title: "Calculus Problem Set",
    course: "Mathematics",
    courseColor: "blue",
    dueDate: "Today, 11:59 PM",
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
  },
  {
    id: 2,
    title: "Chemical Reactions Lab Report",
    course: "Science",
    courseColor: "green",
    dueDate: "Tomorrow, 11:59 PM",
    status: "in-progress",
    progress: 60,
    description: "Write a detailed report on the chemical reactions experiment conducted in lab last week.",
    type: "Lab Report",
    points: 100,
    submissionType: "File Upload",
    lastModified: "Today, 10:15 AM",
    attachments: 1,
    instructor: "Ms. Sarah Johnson",
    assignmentType: "essay",
  },
  {
    id: 3,
    title: "The Great Gatsby Essay",
    course: "Literature",
    courseColor: "purple",
    dueDate: "Oct 15, 2023",
    status: "upcoming",
    progress: 25,
    description: "Write a 1000-word analytical essay on the symbolism in The Great Gatsby.",
    type: "Essay",
    points: 75,
    submissionType: "File Upload",
    lastModified: "Oct 5, 2023",
    attachments: 0,
    instructor: "Mr. James Wilson",
  },
  {
    id: 4,
    title: "World War II Timeline",
    course: "History",
    courseColor: "amber",
    dueDate: "Oct 12, 2023",
    status: "upcoming",
    progress: 40,
    description: "Create a detailed timeline of major events during World War II from 1939-1945.",
    type: "Project",
    points: 80,
    submissionType: "File Upload",
    lastModified: "Oct 7, 2023",
    attachments: 1,
    instructor: "Dr. Maria Garcia",
  },
  {
    id: 5,
    title: "Python Programming Exercise",
    course: "Computer Science",
    courseColor: "indigo",
    dueDate: "Oct 8, 2023",
    status: "completed",
    progress: 100,
    description: "Complete the programming exercises on loops, functions, and basic data structures.",
    type: "Coding Exercise",
    points: 60,
    submissionType: "Code Submission",
    lastModified: "Oct 7, 2023",
    attachments: 1,
    instructor: "Mr. David Park",
    grade: "95%",
    feedback: "Excellent work! Your code is well-structured and efficient.",
  },
  {
    id: 6,
    title: "Digital Art Portfolio",
    course: "Art",
    courseColor: "pink",
    dueDate: "Oct 5, 2023",
    status: "late",
    progress: 80,
    description: "Submit a portfolio of 5 digital art pieces demonstrating different techniques learned in class.",
    type: "Portfolio",
    points: 100,
    submissionType: "File Upload",
    lastModified: "Oct 6, 2023",
    attachments: 5,
    instructor: "Ms. Emily Chen",
  },
  {
    id: 7,
    title: "Fitness Tracking Report",
    course: "Physical Education",
    courseColor: "red",
    dueDate: "Oct 3, 2023",
    status: "completed",
    progress: 100,
    description: "Submit a two-week log of your physical activities and a reflection on your fitness goals.",
    type: "Report",
    points: 40,
    submissionType: "Online Form",
    lastModified: "Oct 3, 2023",
    attachments: 0,
    instructor: "Coach Thomas Brown",
    grade: "88%",
    feedback: "Good tracking and reflection. Consider setting more specific goals next time.",
  },
  {
    id: 8,
    title: "Spanish Conversation Recording",
    course: "Foreign Language",
    courseColor: "yellow",
    dueDate: "Oct 1, 2023",
    status: "completed",
    progress: 100,
    description: "Record a 3-minute conversation in Spanish using the vocabulary and grammar from Chapter 3.",
    type: "Audio Submission",
    points: 50,
    submissionType: "Audio Upload",
    lastModified: "Sep 30, 2023",
    attachments: 1,
    instructor: "Sra. Isabella Rodriguez",
    grade: "92%",
    feedback: "Excellent pronunciation and good use of new vocabulary!",
  },
]

export default function AssignmentsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [sortBy, setSortBy] = useState<string>("due-date")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterCourse, setFilterCourse] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedTab, setSelectedTab] = useState<string>("all")

  // Get unique courses for filter dropdown
  const courses = [...new Set(assignments.map((assignment) => assignment.course))].sort()

  // Filter and sort assignments
  const filteredAssignments = assignments
    .filter((assignment) => {
      // Filter by tab selection
      if (selectedTab === "upcoming" && !["upcoming", "due-soon", "in-progress"].includes(assignment.status))
        return false
      if (selectedTab === "completed" && assignment.status !== "completed") return false
      if (selectedTab === "late" && assignment.status !== "late") return false

      // Filter by status dropdown
      if (filterStatus !== "all" && assignment.status !== filterStatus) return false

      // Filter by course dropdown
      if (filterCourse !== "all" && assignment.course !== filterCourse) return false

      // Filter by search query
      if (
        searchQuery &&
        !assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !assignment.course.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !assignment.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false

      return true
    })
    .sort((a, b) => {
      if (sortBy === "due-date") {
        // Simple sorting by due date (would be more complex with actual dates)
        if (a.dueDate.includes("Today")) return -1
        if (b.dueDate.includes("Today")) return 1
        if (a.dueDate.includes("Tomorrow")) return -1
        if (b.dueDate.includes("Tomorrow")) return 1
        return a.dueDate.localeCompare(b.dueDate)
      }
      if (sortBy === "course") return a.course.localeCompare(b.course)
      if (sortBy === "title") return a.title.localeCompare(b.title)
      if (sortBy === "status") {
        const statusOrder = {
          "due-soon": 0,
          "in-progress": 1,
          upcoming: 2,
          late: 3,
          completed: 4,
        }
        return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder]
      }
      return 0
    })

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "due-soon":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            <Clock4 className="w-3 h-3 mr-1" />
            Due Soon
          </Badge>
        )
      case "in-progress":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            <Clock className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        )
      case "upcoming":
        return (
          <Badge className="bg-blue-600 hover:bg-blue-700">
            <CalendarClock className="w-3 h-3 mr-1" />
            Upcoming
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-green-600 hover:bg-green-700">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )
      case "late":
        return (
          <Badge className="bg-red-600 hover:bg-red-700">
            <AlertCircle className="w-3 h-3 mr-1" />
            Late
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Helper function to get course badge color
  const getCourseBadgeClass = (color: string) => {
    const baseClasses = "border bg-opacity-15 text-opacity-90"
    switch (color) {
      case "blue":
        return `${baseClasses} border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300`
      case "green":
        return `${baseClasses} border-green-200 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300`
      case "purple":
        return `${baseClasses} border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300`
      case "amber":
        return `${baseClasses} border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300`
      case "indigo":
        return `${baseClasses} border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300`
      case "pink":
        return `${baseClasses} border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-700 dark:bg-pink-900/30 dark:text-pink-300`
      case "red":
        return `${baseClasses} border-red-200 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300`
      case "yellow":
        return `${baseClasses} border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300`
      default:
        return `${baseClasses} border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900/30 dark:text-gray-300`
    }
  }

  return (
    <div className="flex min-h-screen">
      <StudentSidebar
        active="courses"
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <header className="sticky top-0 z-40 flex h-16 items-center border-b bg-white px-4 dark:border-slate-800 dark:bg-slate-950 lg:px-6">
        <Button variant="ghost" size="icon" className="mr-2 lg:hidden" onClick={() => setIsSidebarOpen(true)}>
          <Menu className="w-5 h-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        <div className="flex items-center w-full gap-2 md:ml-auto md:gap-4 lg:ml-0">
          <form className="flex-1 ml-auto md:flex-initial">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-blue-300/70" />
              <Input
                type="search"
                placeholder="Search assignments..."
                className="w-full rounded-lg bg-blue-50 pl-8 md:w-[240px] lg:w-[280px] dark:bg-blue-800/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 p-6">
        <div className="space-y-6 max-w-6xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text">
              Assignments
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Manage and track all your assignments</p>
          </div>

          {/* Tabs */}
          <Tabs
            defaultValue="all"
            className="mb-6"
            value={selectedTab}
            onValueChange={(value) => setSelectedTab(value)}
          >
            <TabsList className="grid w-full grid-cols-4 lg:w-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="late">Late</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filters and View Controls */}
          <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px] bg-white dark:bg-blue-900/60">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="due-soon">Due Soon</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCourse} onValueChange={setFilterCourse}>
                <SelectTrigger className="w-[180px] bg-white dark:bg-blue-900/60">
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-white dark:bg-blue-900/60">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="due-date">Due Date</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                  <SelectItem value="title">Title (A-Z)</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                <Grid className="w-4 h-4" />
                <span className="sr-only">Grid view</span>
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                <List className="w-4 h-4" />
                <span className="sr-only">List view</span>
              </Button>
            </div>
          </div>

          {/* Assignments Grid View */}
          {viewMode === "grid" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredAssignments.map((assignment) => (
                <Card key={assignment.id} className="overflow-hidden transition-all duration-300 hover:shadow-md">
                  <div
                    className={`h-2 ${assignment.status === "completed" ? "bg-green-600" : assignment.status === "late" ? "bg-red-600" : assignment.status === "due-soon" ? "bg-yellow-500" : "bg-blue-600"}`}
                  ></div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={getCourseBadgeClass(assignment.courseColor)}>
                        {assignment.course}
                      </Badge>
                      {getStatusBadge(assignment.status)}
                    </div>
                    <CardTitle className="mt-2 line-clamp-1">{assignment.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{assignment.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-blue-300/70">Progress</span>
                        <span className="font-medium">{assignment.progress}%</span>
                      </div>
                      <Progress value={assignment.progress} className="h-2" />

                      <div className="pt-2 space-y-2">
                        <div className="flex items-center text-sm">
                          <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                          <span>Due: {assignment.dueDate}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <FileText className="w-4 h-4 mr-2 text-blue-600" />
                          <span>
                            {assignment.type} • {assignment.points} points
                          </span>
                        </div>
                        {assignment.grade && (
                          <div className="flex items-center text-sm font-medium text-green-600 dark:text-green-400">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            <span>Grade: {assignment.grade}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="px-6 py-3 border-t bg-blue-50/50 dark:bg-blue-900/40">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        if (assignment.status === "completed") {
                          // View submission logic
                        } else {
                          // Redirect to the assignment page
                          window.location.href = `/dashboard/assignments/${assignment.id}`
                        }
                      }}
                    >
                      {assignment.status === "completed" ? "View Submission" : "Open Assignment"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* Assignments List View */}
          {viewMode === "list" && (
            <div className="space-y-4">
              {filteredAssignments.map((assignment) => (
                <Card key={assignment.id} className="overflow-hidden transition-all duration-300 hover:shadow-md">
                  <div className="flex flex-col md:flex-row">
                    <div
                      className={`w-full md:w-2 ${assignment.status === "completed" ? "bg-green-600" : assignment.status === "late" ? "bg-red-600" : assignment.status === "due-soon" ? "bg-yellow-500" : "bg-blue-600"}`}
                    ></div>
                    <div className="flex flex-col flex-1">
                      <CardHeader>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getCourseBadgeClass(assignment.courseColor)}>
                                {assignment.course}
                              </Badge>
                              {getStatusBadge(assignment.status)}
                            </div>
                            <CardTitle className="mt-2">{assignment.title}</CardTitle>
                            <CardDescription className="line-clamp-2">{assignment.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500 dark:text-blue-300/70">Progress</span>
                              <span className="font-medium">{assignment.progress}%</span>
                            </div>
                            <Progress value={assignment.progress} className="h-2" />

                            <div className="pt-2 space-y-2">
                              <div className="flex items-center text-sm">
                                <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                                <span>Due: {assignment.dueDate}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                                <span>
                                  {assignment.type} • {assignment.points} points
                                </span>
                              </div>
                              {assignment.grade && (
                                <div className="flex items-center text-sm font-medium text-green-600 dark:text-green-400">
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  <span>Grade: {assignment.grade}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="space-y-2">
                              <div className="flex items-center text-sm">
                                <User className="w-4 h-4 mr-2 text-blue-600" />
                                <span>Instructor: {assignment.instructor}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <Clock className="w-4 h-4 mr-2 text-blue-600" />
                                <span>Last modified: {assignment.lastModified}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
                                <span>Submission type: {assignment.submissionType}</span>
                              </div>
                              {assignment.attachments > 0 && (
                                <div className="flex items-center text-sm">
                                  <FileCheck className="w-4 h-4 mr-2 text-blue-600" />
                                  <span>
                                    {assignment.attachments} attachment{assignment.attachments !== 1 ? "s" : ""}
                                  </span>
                                </div>
                              )}
                            </div>

                            {assignment.feedback && (
                              <div className="p-3 mt-3 text-sm border border-green-200 rounded-lg bg-green-50 dark:border-green-900/30 dark:bg-green-900/20">
                                <p className="font-medium text-green-800 dark:text-green-300">Feedback:</p>
                                <p className="text-green-700 dark:text-green-400">{assignment.feedback}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="px-6 py-3 border-t bg-blue-50/50 dark:bg-blue-900/40">
                        <div className="flex flex-col w-full gap-2 sm:flex-row sm:justify-between">
                          <Button variant="outline" className="sm:w-auto">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button
                            className="bg-blue-600 hover:bg-blue-700 sm:w-auto"
                            onClick={() => {
                              if (assignment.status === "completed") {
                                // View submission logic
                              } else if (assignment.status === "late") {
                                // Submit late logic
                                window.location.href = `/dashboard/assignments/${assignment.id}`
                              } else {
                                // Open assignment
                                window.location.href = `/dashboard/assignments/${assignment.id}`
                              }
                            }}
                          >
                            {assignment.status === "completed"
                              ? "View Submission"
                              : assignment.status === "late"
                                ? "Submit Late"
                                : "Open Assignment"}
                          </Button>
                        </div>
                      </CardFooter>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredAssignments.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-gray-300 border-dashed rounded-lg dark:border-blue-800/30 dark:bg-blue-900/20">
              <FileText className="w-12 h-12 text-gray-400 dark:text-blue-300/50" />
              <h3 className="mt-4 text-lg font-medium">No assignments found</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-blue-300/70">
                Try adjusting your search or filter to find what you're looking for.
              </p>
              <Button
                className="mt-6 bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  setSearchQuery("")
                  setFilterStatus("all")
                  setFilterCourse("all")
                  setSortBy("due-date")
                  setSelectedTab("all")
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}

          {/* Assignment Stats */}
          <div className="mt-8">
            <h2 className="mb-4 text-xl font-bold">Assignment Overview</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-t-4 border-t-blue-600">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{assignments.length}</div>
                  <p className="text-xs text-gray-500 dark:text-blue-300/70">Across all your courses</p>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-yellow-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{assignments.filter((a) => a.status === "due-soon").length}</div>
                  <p className="text-xs text-gray-500 dark:text-blue-300/70">Assignments due within 24 hours</p>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-green-600">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{assignments.filter((a) => a.status === "completed").length}</div>
                  <p className="text-xs text-gray-500 dark:text-blue-300/70">Successfully submitted assignments</p>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-red-600">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Late</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{assignments.filter((a) => a.status === "late").length}</div>
                  <p className="text-xs text-gray-500 dark:text-blue-300/70">Past due assignments</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
