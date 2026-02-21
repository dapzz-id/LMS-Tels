"use client"

import { useState, useEffect } from "react"
import { Head, router } from '@inertiajs/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Badge } from "@/Components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/Components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import {
  Users,
  Eye,
  Clock,
  BookOpen,
  FileText,
  Activity,
  Wifi,
  WifiOff,
  Monitor,
  RefreshCw,
  TrendingUp,
  Calendar,
  BarChart3,
  Filter,
  SortAsc,
  SortDesc
} from "lucide-react"
import AdminPageLayout from "../layout"
import axios from "axios"

interface OnlineStudent {
  id: number
  user: {
    id: number
    nama_lengkap: string
    email: string
    tipe_user: string
    class?: string
  }
  activity_type: string
  page_url: string
  course_id: string | null
  quiz_id: string | null
  last_activity: string
  is_online: boolean
}

interface RecentActivity {
  id: number
  user: {
    id: number
    nama_lengkap: string
    email: string
    class?: string
  }
  activity_type: string
  page_url: string
  course_id: string | null
  quiz_id: string | null
  last_activity: string
  course?: {
    id: number
    judul_kursus: string
  }
}

interface Stats {
  total_online: number
  total_students: number
  active_courses: number
  active_quizzes: number
}

interface ActivitySummary {
  today: {
    total_activities: number
    unique_students: number
    login_count: number
    course_views: number
    quiz_submissions: number
  }
  this_week: {
    total_activities: number
    unique_students: number
    most_active_day: {
      date: string
      count: number
    }
  }
  this_month: {
    total_activities: number
    unique_students: number
  }
}

interface ClassStats {
  class: string
  total_students: number
  online_students: number
  online_percentage: number
}

interface Filters {
  selectedClass: string
  sortBy: string
  sortOrder: string
  availableClasses: string[]
}

interface Props {
  onlineStudents: OnlineStudent[]
  recentActivity: RecentActivity[]
  stats: Stats
  filters: Filters
}

export default function StudentMonitoringPage({
  onlineStudents: initialOnlineStudents,
  recentActivity: initialRecentActivity,
  stats: initialStats,
  filters: initialFilters
}: Props) {
  const [onlineStudents, setOnlineStudents] = useState<OnlineStudent[]>(initialOnlineStudents)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>(initialRecentActivity)
  const [stats, setStats] = useState<Stats>(initialStats)
  const [filters, setFilters] = useState<Filters>({
    selectedClass: initialFilters?.selectedClass || 'all',
    sortBy: initialFilters?.sortBy || 'last_activity',
    sortOrder: initialFilters?.sortOrder || 'desc',
    availableClasses: initialFilters?.availableClasses || []
  })
  const [activitySummary, setActivitySummary] = useState<ActivitySummary | null>(null)
  const [classStats, setClassStats] = useState<ClassStats[]>([])
  const [isPolling, setIsPolling] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toISOString())
  const [selectedStudent, setSelectedStudent] = useState<OnlineStudent | null>(null)
  const [studentDetails, setStudentDetails] = useState<any>(null)
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)

  // Load activity summary and class stats
  useEffect(() => {
    loadActivitySummary()
    loadClassStats()
  }, [filters.selectedClass])

  const loadActivitySummary = async () => {
    setIsLoadingSummary(true)
    try {
      const response = await axios.get('/api/admin/student-monitoring/summary', {
        params: { class: filters.selectedClass }
      })
      setActivitySummary(response.data.data)
    } catch (error) {
      
    } finally {
      setIsLoadingSummary(false)
    }
  }

  const loadClassStats = async () => {
    try {
      const response = await axios.get('/api/admin/student-monitoring/class-stats')
      setClassStats(response.data.data)
    } catch (error) {
      
    }
  }

  // Handle filter changes
  const handleClassChange = (classValue: string) => {
    const newFilters = { ...filters, selectedClass: classValue }
    setFilters(newFilters)

    // Update URL with new filters
    router.get('/admin/student-monitoring', newFilters, {
      preserveState: true,
      replace: true
    })
  }

  const handleSortChange = (sortBy: string) => {
    const newFilters = { ...filters, sortBy }
    setFilters(newFilters)

    router.get('/admin/student-monitoring', newFilters, {
      preserveState: true,
      replace: true
    })
  }

  const handleSortOrderChange = () => {
    const newSortOrder = filters.sortOrder === 'asc' ? 'desc' : 'asc'
    const newFilters = { ...filters, sortOrder: newSortOrder }
    setFilters(newFilters)

    router.get('/admin/student-monitoring', newFilters, {
      preserveState: true,
      replace: true
    })
  }

  // Long polling for real-time updates
  useEffect(() => {
    let pollInterval: NodeJS.Timeout

    const pollForUpdates = async () => {
      if (!isPolling) return

      try {
        const response = await axios.get('/api/admin/student-monitoring/live-data', {
          params: {
            class: filters.selectedClass,
            sort_by: filters.sortBy,
            sort_order: filters.sortOrder
          }
        })
        const data = response.data.data

        setOnlineStudents(data.onlineStudents)
        setRecentActivity(data.recentActivity)
        setStats(data.stats)
        setLastUpdate(data.lastUpdate)
      } catch (error) {
        
      }
    }

    // Poll every 3 seconds
    pollInterval = setInterval(pollForUpdates, 3000)

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [isPolling, filters.selectedClass, filters.sortBy, filters.sortOrder])

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'login':
        return <Wifi className="w-4 h-4 text-green-500" />
      case 'logout':
        return <WifiOff className="w-4 h-4 text-red-500" />
      case 'course_view':
        return <BookOpen className="w-4 h-4 text-blue-500" />
      case 'quiz_start':
        return <FileText className="w-4 h-4 text-purple-500" />
      case 'quiz_submit':
        return <FileText className="w-4 h-4 text-green-500" />
      case 'page_view':
        return <Eye className="w-4 h-4 text-gray-500" />
      case 'course_navigation':
        return <BookOpen className="w-4 h-4 text-blue-500" />
      case 'quiz_navigation':
        return <FileText className="w-4 h-4 text-purple-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getActivityLabel = (activityType: string) => {
    switch (activityType) {
      case 'login':
        return 'Logged In'
      case 'logout':
        return 'Logged Out'
      case 'course_view':
        return 'Viewing Course'
      case 'quiz_start':
        return 'Started Quiz'
      case 'quiz_submit':
        return 'Submitted Quiz'
      case 'page_view':
        return 'Browsing'
      case 'course_navigation':
        return 'Navigated to Course'
      case 'quiz_navigation':
        return 'Navigated to Quiz'
      default:
        return activityType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case 'login':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'logout':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'course_view':
      case 'course_navigation':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'quiz_start':
      case 'quiz_navigation':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'quiz_submit':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const handleViewStudent = async (student: OnlineStudent) => {
    setSelectedStudent(student)
    try {
      const response = await axios.get(`/api/admin/student-monitoring/student/${student.user.id}`)
      setStudentDetails(response.data.data)
    } catch (error) {
      
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    return `${Math.floor(diffInSeconds / 3600)}h ago`
  }

  return (
    <AdminPageLayout>
      <Head title="Student Monitoring" />
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-red-700 to-red-500 bg-clip-text">
              Student Monitoring
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Real-time monitoring of student activities</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsPolling(!isPolling)}
              className={isPolling ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isPolling ? 'animate-spin' : ''}`} />
              {isPolling ? 'Live' : 'Paused'}
            </Button>
            <Button
              variant="outline"
              onClick={loadActivitySummary}
              disabled={isLoadingSummary}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Refresh Stats
            </Button>
            <Badge variant="outline" className="text-xs">
              Last update: {formatTimeAgo(lastUpdate)}
            </Badge>
          </div>
        </div>

        {/* Activity Summary Cards */}
        {activitySummary && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 shadow-sm rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Today's Activities</CardTitle>
                <CardDescription className="text-emerald-600/80 dark:text-emerald-400/80">Total activities today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{activitySummary.today.total_activities}</div>
                  <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="mt-2 text-xs text-emerald-600/80 dark:text-emerald-400/80">
                  {activitySummary.today.unique_students} active students
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Course Views</CardTitle>
                <CardDescription className="text-blue-600/80 dark:text-blue-400/80">Today's course interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{activitySummary.today.course_views}</div>
                  <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Quiz Submissions</CardTitle>
                <CardDescription className="text-purple-600/80 dark:text-purple-400/80">Today's quiz completions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{activitySummary.today.quiz_submissions}</div>
                  <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">This Week</CardTitle>
                <CardDescription className="text-amber-600/80 dark:text-amber-400/80">Weekly activity total</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{activitySummary.this_week.total_activities}</div>
                  <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="mt-2 text-xs text-amber-600/80 dark:text-amber-400/80">
                  {activitySummary.this_week.unique_students} students
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="border-0 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters & Sorting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Class:</span>
                  <Select value={filters.selectedClass} onValueChange={handleClassChange}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {(filters.availableClasses || [])
                        .filter(className => className && className.trim() !== '')
                        .map((className) => (
                          <SelectItem key={className} value={className}>
                            {className}
                          </SelectItem>
                        ))}
                      {(filters.availableClasses || []).filter(className => className && className.trim() !== '').length === 0 && (
                        <SelectItem value="no-classes" disabled>
                          No classes available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Sort by:</span>
                  <Select value={filters.sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last_activity">Last Activity</SelectItem>
                      <SelectItem value="activity_type">Activity Type</SelectItem>
                      <SelectItem value="user_id">User ID</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSortOrderChange}
                  className="flex items-center gap-2"
                >
                  {filters.sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  {filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </Button>
              </div>
              <div className="text-sm text-slate-500">
                Showing {onlineStudents.length} online students
                {filters.selectedClass !== 'all' && ` from ${filters.selectedClass}`}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different views */}
        <Tabs defaultValue="online" className="w-full">
          <TabsList className="p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
            <TabsTrigger
              value="online"
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400 data-[state=active]:shadow-sm"
            >
              <Wifi className="w-4 h-4 mr-2" />
              Online Students ({onlineStudents.length})
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400 data-[state=active]:shadow-sm"
            >
              <Activity className="w-4 h-4 mr-2" />
              Recent Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="online" className="mt-6">
            <Card className="border-0 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle>Currently Online Students</CardTitle>
                <CardDescription>Students who are actively using the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {onlineStudents.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Current Activity</TableHead>
                        <TableHead>Page</TableHead>
                        <TableHead>Last Activity</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {onlineStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src="/placeholder.svg" alt={student.user.nama_lengkap} />
                                <AvatarFallback className="text-xs">
                                  {student.user.nama_lengkap.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{student.user.nama_lengkap}</p>
                                <p className="text-xs text-slate-500">{student.user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {student.user.class || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getActivityIcon(student.activity_type)}
                              <Badge className={getActivityColor(student.activity_type)}>
                                {getActivityLabel(student.activity_type)}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-xs">
                              {student.page_url || 'N/A'}
                            </p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-slate-500">
                              {formatTimeAgo(student.last_activity)}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewStudent(student)}
                                >
                                  <Monitor className="w-4 h-4 mr-1" />
                                  Monitor
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Student Activity Details</DialogTitle>
                                </DialogHeader>
                                {studentDetails && (
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                      <Avatar className="w-12 h-12">
                                        <AvatarImage src="/placeholder.svg" alt={studentDetails.student.nama_lengkap} />
                                        <AvatarFallback>
                                          {studentDetails.student.nama_lengkap.split(' ').map((n: string) => n[0]).join('')}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <h3 className="font-semibold">{studentDetails.student.nama_lengkap}</h3>
                                        <p className="text-sm text-slate-500">{studentDetails.student.email}</p>
                                        {studentDetails.student.class && (
                                          <Badge variant="outline" className="mt-1">
                                            {studentDetails.student.class}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>

                                    {studentDetails.currentActivity && (
                                      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                        <h4 className="font-medium mb-2">Current Activity</h4>
                                        <p className="text-sm">
                                          <strong>Type:</strong> {getActivityLabel(studentDetails.currentActivity.activity_type)}
                                        </p>
                                        <p className="text-sm">
                                          <strong>Page:</strong> {studentDetails.currentActivity.page_url || 'N/A'}
                                        </p>
                                        <p className="text-sm">
                                          <strong>Last Activity:</strong> {formatTimeAgo(studentDetails.currentActivity.last_activity)}
                                        </p>
                                      </div>
                                    )}

                                    {studentDetails.activityStats && (
                                      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                                        <h4 className="font-medium mb-2">Activity Statistics</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                          <div>
                                            <strong>Total Activities:</strong> {studentDetails.activityStats.total_activities}
                                          </div>
                                          <div>
                                            <strong>Today:</strong> {studentDetails.activityStats.today_activities}
                                          </div>
                                          <div>
                                            <strong>This Week:</strong> {studentDetails.activityStats.this_week_activities}
                                          </div>
                                          <div>
                                            <strong>Most Active Course:</strong> {studentDetails.activityStats.most_active_course?.course_id || 'N/A'}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    <div>
                                      <h4 className="font-medium mb-2">Recent Activity History</h4>
                                      <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {studentDetails.activities.map((activity: any) => (
                                          <div key={activity.id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                                            {getActivityIcon(activity.activity_type)}
                                            <span className="text-sm">{getActivityLabel(activity.activity_type)}</span>
                                            <span className="text-xs text-slate-500 ml-auto">
                                              {formatTimeAgo(activity.last_activity)}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <WifiOff className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500">No students are currently online</p>
                    <p className="text-sm text-slate-400 mt-1">Students will appear here when they log in and become active</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <Card className="border-0 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle>Recent Student Activity</CardTitle>
                <CardDescription>All student activities in the last 30 minutes</CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Activity</TableHead>
                        <TableHead>Course/Quiz</TableHead>
                        <TableHead>Page</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentActivity.map((activity) => (
                        <TableRow key={activity.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src="/placeholder.svg" alt={activity.user.nama_lengkap} />
                                <AvatarFallback className="text-xs">
                                  {activity.user.nama_lengkap.split(' ').map((n: string) => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{activity.user.nama_lengkap}</p>
                                <p className="text-xs text-slate-500">{activity.user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {activity.user.class || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getActivityIcon(activity.activity_type)}
                              <Badge className={getActivityColor(activity.activity_type)}>
                                {getActivityLabel(activity.activity_type)}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {activity.course ? (
                              <p className="text-sm font-medium">{activity.course.judul_kursus}</p>
                            ) : (
                              <p className="text-sm text-slate-500">N/A</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-xs">
                              {activity.page_url || 'N/A'}
                            </p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-slate-500">
                              {formatTimeAgo(activity.last_activity)}
                            </p>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500">No recent activity found</p>
                    <p className="text-sm text-slate-400 mt-1">Student activities will appear here when they use the platform</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageLayout>
  )
}
