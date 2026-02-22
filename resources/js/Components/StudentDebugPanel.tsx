"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { usePage } from "@inertiajs/react"
import axios from "axios"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import {
  Activity,
  BookOpen,
  Bug,
  CheckCircle,
  Eye,
  FileText,
  RefreshCw,
  TestTube,
  Wifi,
  XCircle,
} from "lucide-react"
import type { User } from "@/types"

type DebugPageProps = {
  auth: {
    user: User
  }
}

type ActivityStatus = "success" | "error" | "pending"
type ActivityMetadata = Record<string, unknown>

interface DebugActivity {
  id: string
  type: string
  timestamp: string
  status: ActivityStatus
  details?: string
}

declare global {
  interface Window {
    checkInertiaStatus?: () => {
      userId: number | null
      userType: string | null
      url: string
    }
  }
}

const MAX_LOG_ITEMS = 10

const safeStringify = (value: unknown): string => {
  try {
    return JSON.stringify(value)
  } catch {
    return "Unable to serialize response"
  }
}

const extractAxiosErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiMessage =
      typeof error.response?.data === "object" &&
      error.response?.data !== null &&
      "message" in error.response.data
        ? String((error.response.data as { message?: unknown }).message ?? "")
        : ""

    return apiMessage || error.message || "Request failed"
  }

  if (error instanceof Error) {
    return error.message
  }

  return "Unknown error"
}

export default function StudentDebugPanel() {
  const { auth } = usePage<DebugPageProps>().props
  const user = auth.user

  const isStudent = useMemo(() => user?.tipe_user === "siswa", [user?.tipe_user])

  const [isVisible, setIsVisible] = useState(false)
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  )
  const [activities, setActivities] = useState<DebugActivity[]>([])
  const [customActivity, setCustomActivity] = useState("")
  const [customMetadata, setCustomMetadata] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [lastPing, setLastPing] = useState("")

  const addActivity = useCallback((status: ActivityStatus, message: string, details?: string) => {
    const activity: DebugActivity = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type: message,
      timestamp: new Date().toLocaleTimeString(),
      status,
      details,
    }

    setActivities((previous) => [activity, ...previous].slice(0, MAX_LOG_ITEMS))
  }, [])

  const sendActivity = useCallback(
    async (
      activityType: string,
      metadata: ActivityMetadata = {},
      options: { silent?: boolean } = {},
    ): Promise<boolean> => {
      if (!isStudent) {
        if (!options.silent) {
          addActivity("error", "Debug panel is available for student users only")
        }

        return false
      }

      if (!options.silent) {
        addActivity("pending", `Sending ${activityType}...`)
      }

      try {
        const response = await axios.post("/api/student/activity", {
          activity_type: activityType,
          page_url: window.location.href,
          course_id: metadata.course_id ?? null,
          quiz_id: metadata.quiz_id ?? null,
          metadata,
        })

        const responseText = safeStringify(response.data).slice(0, 240)
        setIsOnline(true)
        setLastPing(new Date().toLocaleTimeString())

        if (!options.silent) {
          addActivity("success", `${activityType} tracked`, responseText)
        }

        return true
      } catch (error) {
        const message = extractAxiosErrorMessage(error)
        setIsOnline(false)

        if (!options.silent) {
          addActivity("error", `${activityType} failed`, message)
        }

        return false
      }
    },
    [addActivity, isStudent],
  )

  const checkOnlineStatus = useCallback(async () => {
    setIsLoading(true)

    if (!navigator.onLine) {
      setIsOnline(false)
      addActivity("error", "Browser is offline")
      setIsLoading(false)
      return
    }

    const isReachable = await sendActivity(
      "heartbeat",
      { source: "debug-panel", mode: "manual" },
      { silent: true },
    )

    if (isReachable) {
      addActivity("success", "Connection check passed")
    } else {
      addActivity("error", "Connection check failed")
    }

    setIsLoading(false)
  }, [addActivity, sendActivity])

  const testCustomActivity = () => {
    if (!customActivity.trim()) {
      addActivity("error", "Activity type cannot be empty")
      return
    }

    let metadata: ActivityMetadata = {}

    if (customMetadata.trim()) {
      try {
        const parsed = JSON.parse(customMetadata) as unknown

        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
          addActivity("error", "Metadata must be a JSON object")
          return
        }

        metadata = parsed as ActivityMetadata
      } catch {
        addActivity("error", "Invalid JSON metadata")
        return
      }
    }

    void sendActivity(customActivity.trim(), {
      ...metadata,
      source: "debug-panel",
      debug: true,
    })
  }

  useEffect(() => {
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)

    window.addEventListener("online", onOnline)
    window.addEventListener("offline", onOffline)

    return () => {
      window.removeEventListener("online", onOnline)
      window.removeEventListener("offline", onOffline)
    }
  }, [])

  useEffect(() => {
    if (!isVisible || !isStudent) {
      return
    }

    void sendActivity("heartbeat", { source: "debug-panel", mode: "auto" }, { silent: true })

    const intervalId = window.setInterval(() => {
      void sendActivity("heartbeat", { source: "debug-panel", mode: "auto" }, { silent: true })
    }, 10000)

    return () => window.clearInterval(intervalId)
  }, [isVisible, isStudent, sendActivity])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    window.checkInertiaStatus = () => ({
      userId: user?.id ?? null,
      userType: user?.tipe_user ?? null,
      url: window.location.href,
    })

    return () => {
      delete window.checkInertiaStatus
    }
  }, [user?.id, user?.tipe_user])

  if (!isStudent) {
    return null
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible((current) => !current)}
        className="fixed bottom-4 right-4 z-50 border-red-300 bg-red-100 text-red-800 shadow-lg hover:bg-red-200"
      >
        <Bug className="mr-2 h-4 w-4" />
        Debug Panel
      </Button>

      {isVisible && (
        <div className="fixed bottom-20 right-4 z-50 max-h-96 w-96 overflow-hidden">
          <Card className="border-2 border-yellow-300 bg-white shadow-lg">
            <CardHeader className="bg-yellow-50 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Bug className="h-4 w-4" />
                  Student Activity Debug
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={isOnline ? "default" : "secondary"} className="text-xs">
                    <Wifi className="mr-1 h-3 w-3" />
                    {isOnline ? "ONLINE" : "OFFLINE"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void checkOnlineStatus()}
                    disabled={isLoading}
                    className="h-6 w-6 p-0"
                  >
                    <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 p-3">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  onClick={() => void sendActivity("login", { debug: true })}
                  variant="outline"
                  className="text-xs"
                >
                  <Activity className="mr-1 h-3 w-3" />
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => void sendActivity("logout", { debug: true })}
                  variant="outline"
                  className="text-xs"
                >
                  <Wifi className="mr-1 h-3 w-3" />
                  Logout
                </Button>
                <Button
                  size="sm"
                  onClick={() => void sendActivity("page_view", { debug: true })}
                  variant="outline"
                  className="text-xs"
                >
                  <Eye className="mr-1 h-3 w-3" />
                  Page View
                </Button>
                <Button
                  size="sm"
                  onClick={() => void sendActivity("course_view", { course_id: 123, debug: true })}
                  variant="outline"
                  className="text-xs"
                >
                  <BookOpen className="mr-1 h-3 w-3" />
                  Course View
                </Button>
                <Button
                  size="sm"
                  onClick={() => void sendActivity("quiz_start", { quiz_id: 456, debug: true })}
                  variant="outline"
                  className="text-xs"
                >
                  <FileText className="mr-1 h-3 w-3" />
                  Quiz Start
                </Button>
                <Button
                  size="sm"
                  onClick={() => void sendActivity("quiz_submit", { quiz_id: 456, score: 85, debug: true })}
                  variant="outline"
                  className="text-xs"
                >
                  <TestTube className="mr-1 h-3 w-3" />
                  Quiz Submit
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Custom Activity Test</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Activity type"
                    value={customActivity}
                    onChange={(event) => setCustomActivity(event.target.value)}
                    className="text-xs"
                  />
                  <Button size="sm" onClick={testCustomActivity} disabled={!customActivity.trim()}>
                    Test
                  </Button>
                </div>
                <Input
                  placeholder='{"key": "value"} (optional metadata)'
                  value={customMetadata}
                  onChange={(event) => setCustomMetadata(event.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Activity Log</Label>
                  <Button size="sm" variant="ghost" onClick={() => setActivities([])} className="text-xs">
                    Clear
                  </Button>
                </div>
                <div className="max-h-32 space-y-1 overflow-y-auto">
                  {activities.map((activity) => (
                    <div key={activity.id} className="rounded border bg-gray-50 p-2 text-xs">
                      <div className="flex items-center gap-2">
                        {activity.status === "success" && <CheckCircle className="h-3 w-3 text-green-500" />}
                        {activity.status === "error" && <XCircle className="h-3 w-3 text-red-500" />}
                        {activity.status === "pending" && (
                          <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
                        )}
                        <span className="font-medium">{activity.type}</span>
                        <span className="text-gray-500">{activity.timestamp}</span>
                      </div>
                      {activity.details ? <div className="mt-1 text-gray-600">{activity.details}</div> : null}
                    </div>
                  ))}
                  {activities.length === 0 ? (
                    <div className="py-2 text-center text-xs text-gray-500">No activities yet</div>
                  ) : null}
                </div>
              </div>

              <div className="space-y-1 text-xs text-gray-600">
                <div>Last ping: {lastPing || "Never"}</div>
                <div>User ID: {user?.id ?? "Unknown"}</div>
                <div>User Type: {user?.tipe_user ?? "Unknown"}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
