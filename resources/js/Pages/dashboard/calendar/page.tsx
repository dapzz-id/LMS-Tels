"use client"

import { useState } from "react"
import {
  Book,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  Sparkles,
  User,
  X,
  Filter,
  CalendarDays,
  CalendarRange,
  CalendarClock,
  BookOpen,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  LucideBarChart,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  Award,
  MoreHorizontal,
  Star,
  StarHalf,
  Users,
} from "lucide-react"

import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Input } from "@/Components/ui/input"
import StudentSidebar from "@/Components/StudentSidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/Components/ui/tabs"

// Helper function to get days in month
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate()
}

// Helper function to get day of week (0-6) for first day of month
const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay()
}

// Generate calendar days for current month view
const generateCalendarDays = (year: number, month: number) => {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)
  const days = []

  // Add empty cells for days before the first day of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push({ day: 0, isCurrentMonth: false })
  }

  // Add days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, isCurrentMonth: true })
  }

  // Add empty cells to complete the grid (optional)
  const remainingCells = 42 - days.length // 6 rows of 7 days
  for (let i = 0; i < remainingCells; i++) {
    days.push({ day: 0, isCurrentMonth: false })
  }

  return days
}

// Mock data for events
const events = [
  {
    id: 1,
    title: "Mathematics Quiz",
    date: new Date(2023, 9, 15), // October 15, 2023
    time: "10:30 AM - 11:15 AM",
    course: "Mathematics",
    courseColor: "blue",
    type: "quiz",
    location: "Room 101",
    description: "Chapter 4: Derivatives and Applications",
  },
  {
    id: 2,
    title: "Literature Discussion",
    date: new Date(2023, 9, 15), // October 15, 2023
    time: "1:00 PM - 2:30 PM",
    course: "Literature",
    courseColor: "purple",
    type: "class",
    location: "Room 203",
    description: "The Great Gatsby: Themes and Symbolism",
  },
  {
    id: 3,
    title: "Science Lab Report Due",
    date: new Date(2023, 9, 16), // October 16, 2023
    time: "11:59 PM",
    course: "Science",
    courseColor: "green",
    type: "assignment",
    location: "Online Submission",
    description: "Chemical Reactions Experiment - Write-up and Analysis",
  },
  {
    id: 4,
    title: "Mathematics Class",
    date: new Date(2023, 9, 16), // October 16, 2023
    time: "9:00 AM - 10:30 AM",
    course: "Mathematics",
    courseColor: "blue",
    type: "class",
    location: "Room 101",
    description: "Integration Techniques and Applications",
  },
  {
    id: 5,
    title: "History Essay Due",
    date: new Date(2023, 9, 18), // October 18, 2023
    time: "11:59 PM",
    course: "History",
    courseColor: "amber",
    type: "assignment",
    location: "Online Submission",
    description: "World War II: Causes and Global Impact",
  },
  {
    id: 6,
    title: "Computer Science Lab",
    date: new Date(2023, 9, 19), // October 19, 2023
    time: "2:00 PM - 3:30 PM",
    course: "Computer Science",
    courseColor: "indigo",
    type: "lab",
    location: "Computer Lab 3",
    description: "Python Programming: Data Structures Implementation",
  },
  {
    id: 7,
    title: "Art Project Presentation",
    date: new Date(2023, 9, 20), // October 20, 2023
    time: "10:00 AM - 12:00 PM",
    course: "Art",
    courseColor: "pink",
    type: "presentation",
    location: "Art Studio",
    description: "Digital Art Portfolio Showcase",
  },
  {
    id: 8,
    title: "Physical Education",
    date: new Date(2023, 9, 20), // October 20, 2023
    time: "1:30 PM - 3:00 PM",
    course: "Physical Education",
    courseColor: "red",
    type: "class",
    location: "Gymnasium",
    description: "Team Sports: Basketball Fundamentals",
  },
  {
    id: 9,
    title: "Spanish Oral Exam",
    date: new Date(2023, 9, 22), // October 22, 2023
    time: "11:00 AM - 12:30 PM",
    course: "Foreign Language",
    courseColor: "yellow",
    type: "exam",
    location: "Language Lab",
    description: "Conversational Spanish Assessment",
  },
  {
    id: 10,
    title: "Science Midterm Exam",
    date: new Date(2023, 9, 25), // October 25, 2023
    time: "9:00 AM - 11:00 AM",
    course: "Science",
    courseColor: "green",
    type: "exam",
    location: "Room 105",
    description: "Comprehensive exam covering Chapters 1-5",
  },
  {
    id: 11,
    title: "Parent-Teacher Conference",
    date: new Date(2023, 9, 27), // October 27, 2023
    time: "4:00 PM - 7:00 PM",
    course: "School Event",
    courseColor: "gray",
    type: "event",
    location: "Main Hall",
    description: "Semester progress review with teachers",
  },
  {
    id: 12,
    title: "Fall Break Begins",
    date: new Date(2023, 9, 30), // October 30, 2023
    time: "All Day",
    course: "School Event",
    courseColor: "gray",
    type: "holiday",
    location: "N/A",
    description: "No classes - Fall Break (Oct 30 - Nov 3)",
  },
]

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
    case "gray":
      return `${baseClasses} border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900/30 dark:text-gray-300`
    default:
      return `${baseClasses} border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900/30 dark:text-gray-300`
  }
}

// Helper function to get event type badge
const getEventTypeBadge = (type: string) => {
  switch (type) {
    case "quiz":
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600">
          <FileText className="w-3 h-3 mr-1" />
          Quiz
        </Badge>
      )
    case "class":
      return (
        <Badge className="bg-blue-600 hover:bg-blue-700">
          <BookOpen className="w-3 h-3 mr-1" />
          Class
        </Badge>
      )
    case "assignment":
      return (
        <Badge className="bg-green-600 hover:bg-green-700">
          <Bookmark className="w-3 h-3 mr-1" />
          Assignment
        </Badge>
      )
    case "exam":
      return (
        <Badge className="bg-red-600 hover:bg-red-700">
          <AlertCircle className="w-3 h-3 mr-1" />
          Exam
        </Badge>
      )
    case "lab":
      return (
        <Badge className="bg-indigo-600 hover:bg-indigo-700">
          <BookOpen className="w-3 h-3 mr-1" />
          Lab
        </Badge>
      )
    case "presentation":
      return (
        <Badge className="bg-purple-600 hover:bg-purple-700">
          <BookOpen className="w-3 h-3 mr-1" />
          Presentation
        </Badge>
      )
    case "event":
      return (
        <Badge className="bg-gray-600 hover:bg-gray-700">
          <Calendar className="w-3 h-3 mr-1" />
          Event
        </Badge>
      )
    case "holiday":
      return (
        <Badge className="bg-blue-600 hover:bg-blue-700">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Holiday
        </Badge>
      )
    default:
      return <Badge>{type}</Badge>
  }
}

export default function CalendarPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"month" | "week" | "day" | "agenda">("month")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterCourse, setFilterCourse] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  // Get current month and year
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  const today = new Date()
  const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear
  const todayDate = today.getDate()

  // Month names for display
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  // Day names for display
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Generate calendar days
  const calendarDays = generateCalendarDays(currentYear, currentMonth)

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
    setSelectedDay(null)
  }

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
    setSelectedDay(null)
  }

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDay(isCurrentMonth ? todayDate : null)
  }

  // Get unique courses for filter dropdown
  const courses = [...new Set(events.map((event) => event.course))].sort()

  // Get unique event types for filter dropdown
  const eventTypes = [...new Set(events.map((event) => event.type))].sort()

  // Filter events based on selected filters and search query
  const filteredEvents = events.filter((event) => {
    // Filter by event type
    if (filterType !== "all" && event.type !== filterType) return false

    // Filter by course
    if (filterCourse !== "all" && event.course !== filterCourse) return false

    // Filter by search query
    if (
      searchQuery &&
      !event.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !event.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !event.course.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false

    // Filter by selected day in month view
    if (viewMode === "month" && selectedDay) {
      return (
        event.date.getDate() === selectedDay &&
        event.date.getMonth() === currentMonth &&
        event.date.getFullYear() === currentYear
      )
    }

    // Filter by current month in month view
    if (viewMode === "month" && !selectedDay) {
      return event.date.getMonth() === currentMonth && event.date.getFullYear() === currentYear
    }

    // For agenda view, show all filtered events
    return true
  })

  // Get events for a specific day (used in calendar grid)
  const getEventsForDay = (day: number) => {
    return events.filter(
      (event) =>
        event.date.getDate() === day &&
        event.date.getMonth() === currentMonth &&
        event.date.getFullYear() === currentYear,
    )
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
                placeholder="Search events..."
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
              Calendar
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Manage your schedule and upcoming events</p>
          </div>

          {/* Calendar Controls */}
          <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goToPreviousMonth} aria-label="Previous month">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-lg font-medium">
                {monthNames[currentMonth]} {currentYear}
              </div>
              <Button variant="outline" size="icon" onClick={goToNextMonth} aria-label="Next month">
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday} className="ml-2">
                Today
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Tabs defaultValue="month" value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                <TabsList>
                  <TabsTrigger value="month">
                    <CalendarDays className="w-4 h-4 mr-1" />
                    Month
                  </TabsTrigger>
                  <TabsTrigger value="week">
                    <CalendarRange className="w-4 h-4 mr-1" />
                    Week
                  </TabsTrigger>
                  <TabsTrigger value="day">
                    <CalendarClock className="w-4 h-4 mr-1" />
                    Day
                  </TabsTrigger>
                  <TabsTrigger value="agenda">
                    <FileText className="w-4 h-4 mr-1" />
                    Agenda
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px] bg-white dark:bg-blue-900/60">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {eventTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
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

            <Button
              variant="outline"
              className="gap-1"
              onClick={() => {
                setFilterType("all")
                setFilterCourse("all")
                setSearchQuery("")
              }}
            >
              <Filter className="w-4 h-4" />
              Clear Filters
            </Button>

            <Button className="gap-1 ml-auto bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Add Event
            </Button>
          </div>

          {/* Month View */}
          {viewMode === "month" && (
            <Card className="mb-6 overflow-hidden">
              <CardContent className="p-0">
                {/* Calendar Grid Header */}
                <div className="grid grid-cols-7 border-b bg-blue-50/50 dark:bg-blue-900/20">
                  {dayNames.map((day, index) => (
                    <div
                      key={index}
                      className="p-2 text-sm font-medium text-center text-gray-700 dark:text-blue-300/90"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 divide-x divide-y">
                  {calendarDays.map((day, index) => {
                    const dayEvents = day.isCurrentMonth ? getEventsForDay(day.day) : []
                    const isToday = isCurrentMonth && day.day === todayDate
                    const isSelected = selectedDay === day.day && day.isCurrentMonth

                    return (
                      <div
                        key={index}
                        className={`min-h-[100px] p-1 transition-colors ${!day.isCurrentMonth
                          ? "bg-gray-50/50 text-gray-400 dark:bg-gray-900/10 dark:text-gray-600"
                          : isSelected
                            ? "bg-blue-50 dark:bg-blue-900/30"
                            : "hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                          } ${isToday ? "ring-2 ring-inset ring-blue-500" : ""}`}
                        onClick={() => day.isCurrentMonth && setSelectedDay(day.day === selectedDay ? null : day.day)}
                      >
                        {day.isCurrentMonth ? (
                          <>
                            <div className="flex justify-between p-1">
                              <span
                                className={`flex h-6 w-6 items-center justify-center rounded-full text-sm ${isToday
                                  ? "bg-blue-600 font-medium text-white"
                                  : "font-medium text-gray-700 dark:text-gray-300"
                                  }`}
                              >
                                {day.day}
                              </span>
                              {dayEvents.length > 0 && (
                                <span className="flex items-center justify-center w-5 h-5 text-xs font-medium text-blue-700 bg-blue-100 rounded-full dark:bg-blue-900/50 dark:text-blue-300">
                                  {dayEvents.length}
                                </span>
                              )}
                            </div>
                            <div className="mt-1 space-y-1">
                              {dayEvents.slice(0, 2).map((event, eventIndex) => (
                                <div
                                  key={eventIndex}
                                  className={`truncate rounded px-1 py-0.5 text-xs ${event.courseColor === "blue"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                                    : event.courseColor === "green"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
                                      : event.courseColor === "purple"
                                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200"
                                        : event.courseColor === "amber"
                                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"
                                          : event.courseColor === "indigo"
                                            ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200"
                                            : event.courseColor === "pink"
                                              ? "bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-200"
                                              : event.courseColor === "red"
                                                ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                                                : event.courseColor === "yellow"
                                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200"
                                                  : "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200"
                                    }`}
                                >
                                  {event.title}
                                </div>
                              ))}
                              {dayEvents.length > 2 && (
                                <div className="px-1 text-xs text-gray-500 dark:text-gray-400">
                                  +{dayEvents.length - 2} more
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="p-1 text-sm">{day.day !== 0 ? day.day : ""}</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Week View */}
          {viewMode === "week" && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Week View</CardTitle>
                <CardDescription>Coming soon</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64 border border-gray-300 border-dashed rounded-lg bg-gray-50 dark:border-gray-700 dark:bg-gray-900/20">
                  <p className="text-gray-500 dark:text-gray-400">Week view is under development</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Day View */}
          {viewMode === "day" && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Day View</CardTitle>
                <CardDescription>Coming soon</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64 border border-gray-300 border-dashed rounded-lg bg-gray-50 dark:border-gray-700 dark:bg-gray-900/20">
                  <p className="text-gray-500 dark:text-gray-400">Day view is under development</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Events List */}
          <div className="mb-6">
            <h2 className="mb-4 text-xl font-bold">
              {selectedDay
                ? `Events for ${monthNames[currentMonth]} ${selectedDay}, ${currentYear}`
                : viewMode === "agenda"
                  ? "All Events"
                  : `Events for ${monthNames[currentMonth]} ${currentYear}`}
            </h2>

            {filteredEvents.length > 0 ? (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <Card key={event.id} className="overflow-hidden transition-all duration-300 hover:shadow-md">
                    <div className="flex flex-col md:flex-row">
                      <div
                        className={`w-full md:w-2 ${event.courseColor === "blue"
                          ? "bg-blue-600"
                          : event.courseColor === "green"
                            ? "bg-green-600"
                            : event.courseColor === "purple"
                              ? "bg-purple-600"
                              : event.courseColor === "amber"
                                ? "bg-amber-600"
                                : event.courseColor === "indigo"
                                  ? "bg-indigo-600"
                                  : event.courseColor === "pink"
                                    ? "bg-pink-600"
                                    : event.courseColor === "red"
                                      ? "bg-red-600"
                                      : event.courseColor === "yellow"
                                        ? "bg-yellow-600"
                                        : "bg-gray-600"
                          }`}
                      ></div>
                      <div className="flex flex-col flex-1">
                        <CardHeader>
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={getCourseBadgeClass(event.courseColor)}>
                                  {event.course}
                                </Badge>
                                {getEventTypeBadge(event.type)}
                              </div>
                              <CardTitle className="mt-2">{event.title}</CardTitle>
                              <CardDescription>{event.description}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <div className="flex items-center text-sm">
                                <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                                <span>
                                  {event.date.toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center text-sm">
                                <Clock className="w-4 h-4 mr-2 text-blue-600" />
                                <span>{event.time}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
                                <span>{event.location}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="px-6 py-3 border-t bg-blue-50/50 dark:bg-blue-900/40">
                          <div className="flex flex-col w-full gap-2 sm:flex-row sm:justify-between">
                            <Button variant="outline" className="sm:w-auto">
                              <Calendar className="w-4 h-4 mr-2" />
                              Add to My Calendar
                            </Button>
                            <Button className="bg-blue-600 hover:bg-blue-700 sm:w-auto">View Details</Button>
                          </div>
                        </CardFooter>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-gray-300 border-dashed rounded-lg dark:border-blue-800/30 dark:bg-blue-900/20">
                <Calendar className="w-12 h-12 text-gray-400 dark:text-blue-300/50" />
                <h3 className="mt-4 text-lg font-medium">No events found</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-blue-300/70">
                  {selectedDay
                    ? `There are no events scheduled for ${monthNames[currentMonth]} ${selectedDay}, ${currentYear}`
                    : "Try adjusting your search or filter to find events"}
                </p>
                <Button
                  className="mt-6 bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setSearchQuery("")
                    setFilterType("all")
                    setFilterCourse("all")
                    setSelectedDay(null)
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </div>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>Important dates and assignments due soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events
                  .filter((event) => event.type === "assignment" || event.type === "exam")
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .slice(0, 3)
                  .map((event, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 transition-all duration-200 border rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full ${event.type === "assignment"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                            }`}
                        >
                          {event.type === "assignment" ? (
                            <FileText className="w-6 h-6" />
                          ) : (
                            <AlertCircle className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{event.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-blue-300/70">{event.course}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {event.date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-blue-300/70">{event.time}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
            <CardFooter className="px-6 py-3 border-t bg-blue-50/50 dark:bg-blue-900/40">
              <Button variant="outline" className="w-full">
                View All Deadlines
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
