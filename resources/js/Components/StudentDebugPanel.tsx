"use client"

import { useState, useEffect } from 'react'
import { usePage } from '@inertiajs/react'
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import {
  Bug,
  Wifi,
  Activity,
  TestTube,
  Eye,
  BookOpen,
  FileText,
  RefreshCw,
  CheckCircle,
  XCircle
} from "lucide-react"
import axios from 'axios'

interface DebugActivity {
  id: string
  type: string
  timestamp: string
  status: 'success' | 'error' | 'pending'
  response?: any
  error?: string
}

export default function StudentDebugPanel() {
  const [isVisible, setIsVisible] = useState(false)
  const [isOnline, setIsOnline] = useState(false)
  const [activities, setActivities] = useState<DebugActivity[]>([])
  const [customActivity, setCustomActivity] = useState('')
  const [customMetadata, setCustomMetadata] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [lastPing, setLastPing] = useState<string>('')
    // Get user from Inertia props (same as settings page)
  const { auth } = usePage().props as any
  const user = auth?.user

  // console.log('StudentDebugPanel: User from usePage:', user)

    // Debug logging
  // console.log('StudentDebugPanel: Component rendered')
  // console.log('User from props:', user)

  // Add global function for debugging
  if (typeof window !== 'undefined') {
    (window as any).checkInertiaStatus = () => {
      // console.log('=== Inertia Status Check ===')
      // console.log('User from props:', user)
      // console.log('Auth from props:', auth)
      // console.log('Is student:', isStudent())
    }
  }

  // Check if user is a student
  const isStudent = () => {
    // Use the user from usePage props (same as settings page)
    const isStudentUser = user && user.tipe_user === 'siswa'
    // console.log('StudentDebugPanel: Is student check:', { user, isStudentUser })
    return isStudentUser
  }

  // Test activity tracking
  const testActivity = async (activityType: string, metadata: any = {}) => {
    if (!isStudent()) {
      addActivity('error', 'Not a student user')
      return
    }

    const activityId = Date.now().toString()
    addActivity('pending', `Testing ${activityType}...`)

    try {
      const response = await axios.post('/api/student/activity', {
        activity_type: activityType,
        page_url: window.location.href,
        course_id: metadata.course_id || null,
        quiz_id: metadata.quiz_id || null,
        metadata: metadata
      })

      addActivity('success', `${activityType} tracked successfully`, response.data)
      setLastPing(new Date().toLocaleTimeString())
    } catch (error: any) {
      addActivity('error', `Failed to track ${activityType}`, null, error.message)
    }
  }

  // Add activity to the list
  const addActivity = (status: 'success' | 'error' | 'pending', message: string, response?: any, error?: string) => {
    const activity: DebugActivity = {
      id: Date.now().toString(),
      type: message,
      timestamp: new Date().toLocaleTimeString(),
      status,
      response,
      error
    }

    setActivities(prev => [activity, ...prev.slice(0, 9)]) // Keep last 10 activities
  }

  // Test different activity types
  const testLogin = () => testActivity('login', { debug: true })
  const testLogout = () => testActivity('logout', { debug: true })
  const testPageView = () => testActivity('page_view', { debug: true })
  const testCourseView = () => testActivity('course_view', { course_id: '123', debug: true })
  const testQuizStart = () => testActivity('quiz_start', { quiz_id: '456', debug: true })
  const testQuizSubmit = () => testActivity('quiz_submit', { quiz_id: '456', score: 85, debug: true })
  const testHeartbeat = () => testActivity('heartbeat', { debug: true })

  // Test custom activity
  const testCustomActivity = () => {
    try {
      const metadata = customMetadata ? JSON.parse(customMetadata) : {}
      testActivity(customActivity, { ...metadata, debug: true })
    } catch (error) {
      addActivity('error', 'Invalid JSON in metadata')
    }
  }

  // Clear activities
  const clearActivities = () => setActivities([])

  // Check online status
  const checkOnlineStatus = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get('/api/admin/student-monitoring/live-data')
      const onlineStudents = response.data.data.onlineStudents
      const currentUser = (window as any).Inertia?.props?.auth?.user

      const isUserOnline = onlineStudents.some((student: any) =>
        student.user.id === currentUser?.id
      )

      setIsOnline(isUserOnline)
      addActivity('success', `Online status: ${isUserOnline ? 'ONLINE' : 'OFFLINE'}`)
    } catch (error: any) {
      addActivity('error', 'Failed to check online status', null, error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-check online status every 10 seconds
  useEffect(() => {
    if (isVisible) {
      checkOnlineStatus()
      const interval = setInterval(checkOnlineStatus, 10000)
      return () => clearInterval(interval)
    }
  }, [isVisible])

  // Only show for students
  if (!isStudent()) {
    // console.log('StudentDebugPanel: Not showing - user is not a student')
    // console.log('User:', (window as any).Inertia?.props?.auth?.user)
    // console.log('User type:', (window as any).Inertia?.props?.auth?.user?.tipe_user)
    // Temporarily force show for testing
    // console.log('StudentDebugPanel: FORCING SHOW FOR TESTING')
  } else {
    // console.log('StudentDebugPanel: Rendering debug panel for student')
  }

  return (
    <>
      {/* Debug Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-red-100 border-red-400 text-red-800 hover:bg-red-200 shadow-lg"
      >
        <Bug className="w-4 h-4 mr-2" />
        Debug Panel
      </Button>

      {/* Debug Panel */}
      {isVisible && (
        <div className="fixed bottom-20 right-4 z-50 w-96 max-h-96 overflow-hidden">
          <Card className="bg-white border-2 border-yellow-300 shadow-lg">
            <CardHeader className="pb-3 bg-yellow-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bug className="w-4 h-4" />
                  Student Activity Debug
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={isOnline ? "default" : "secondary"} className="text-xs">
                    <Wifi className="w-3 h-3 mr-1" />
                    {isOnline ? 'ONLINE' : 'OFFLINE'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={checkOnlineStatus}
                    disabled={isLoading}
                    className="h-6 w-6 p-0"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-3 space-y-3">
              {/* Quick Test Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" onClick={testLogin} variant="outline" className="text-xs">
                  <Activity className="w-3 h-3 mr-1" />
                  Login
                </Button>
                <Button size="sm" onClick={testLogout} variant="outline" className="text-xs">
                  <Wifi className="w-3 h-3 mr-1" />
                  Logout
                </Button>
                <Button size="sm" onClick={testPageView} variant="outline" className="text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  Page View
                </Button>
                <Button size="sm" onClick={testCourseView} variant="outline" className="text-xs">
                  <BookOpen className="w-3 h-3 mr-1" />
                  Course View
                </Button>
                <Button size="sm" onClick={testQuizStart} variant="outline" className="text-xs">
                  <FileText className="w-3 h-3 mr-1" />
                  Quiz Start
                </Button>
                <Button size="sm" onClick={testQuizSubmit} variant="outline" className="text-xs">
                  <TestTube className="w-3 h-3 mr-1" />
                  Quiz Submit
                </Button>
              </div>

              {/* Custom Activity Test */}
              <div className="space-y-2">
                <Label className="text-xs">Custom Activity Test</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Activity type"
                    value={customActivity}
                    onChange={(e) => setCustomActivity(e.target.value)}
                    className="text-xs"
                  />
                  <Button size="sm" onClick={testCustomActivity} disabled={!customActivity}>
                    Test
                  </Button>
                </div>
                <Input
                  placeholder='{"key": "value"} (optional metadata)'
                  value={customMetadata}
                  onChange={(e) => setCustomMetadata(e.target.value)}
                  className="text-xs"
                />
              </div>

              {/* Activity Log */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Activity Log</Label>
                  <Button size="sm" variant="ghost" onClick={clearActivities} className="text-xs">
                    Clear
                  </Button>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {activities.map((activity) => (
                    <div key={activity.id} className="text-xs p-2 bg-gray-50 rounded border">
                      <div className="flex items-center gap-2">
                        {activity.status === 'success' && <CheckCircle className="w-3 h-3 text-green-500" />}
                        {activity.status === 'error' && <XCircle className="w-3 h-3 text-red-500" />}
                        {activity.status === 'pending' && <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />}
                        <span className="font-medium">{activity.type}</span>
                        <span className="text-gray-500">{activity.timestamp}</span>
                      </div>
                      {activity.error && (
                        <div className="text-red-500 mt-1">{activity.error}</div>
                      )}
                    </div>
                  ))}
                  {activities.length === 0 && (
                    <div className="text-xs text-gray-500 text-center py-2">
                      No activities yet
                    </div>
                  )}
                </div>
              </div>

              {/* Status Info */}
              <div className="text-xs text-gray-600 space-y-1">
                <div>Last ping: {lastPing || 'Never'}</div>
                <div>User ID: {(window as any).Inertia?.props?.auth?.user?.id || 'Unknown'}</div>
                <div>User Type: {(window as any).Inertia?.props?.auth?.user?.tipe_user || 'Unknown'}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
