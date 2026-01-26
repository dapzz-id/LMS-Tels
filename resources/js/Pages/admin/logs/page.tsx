"use client"

import { useState } from "react"
import {
  Search,
  Download,
  AlertTriangle,
  Info,
  Shield,
  Database,
  User,
  FileText,
  Settings,
  Calendar,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Badge } from "@/Components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/Components/ui/collapsible"

// Sample log data
const logs = [
  {
    id: 1,
    timestamp: "2025-03-21T14:32:45Z",
    level: "error",
    category: "security",
    message: "Failed login attempt for user admin@example.com",
    source: "Authentication Service",
    ip: "192.168.1.105",
    user: "admin@example.com",
    details: {
      attempts: 3,
      browser: "Chrome 120.0.0",
      os: "Windows 11",
      location: "New York, USA",
    },
  },
  {
    id: 2,
    timestamp: "2025-03-21T14:15:22Z",
    level: "info",
    category: "system",
    message: "System backup completed successfully",
    source: "Backup Service",
    ip: "internal",
    user: "system",
    details: {
      size: "2.4 GB",
      duration: "45 seconds",
      files: 1240,
      location: "Cloud Storage",
    },
  },
  {
    id: 3,
    timestamp: "2025-03-21T13:45:10Z",
    level: "warning",
    category: "database",
    message: "High database load detected",
    source: "Database Monitor",
    ip: "internal",
    user: "system",
    details: {
      cpu: "78%",
      memory: "4.2 GB",
      connections: 156,
      queries: "450/sec",
    },
  },
  {
    id: 4,
    timestamp: "2025-03-21T13:22:05Z",
    level: "info",
    category: "user",
    message: "New user registered",
    source: "User Service",
    ip: "203.0.113.42",
    user: "sarah.johnson@example.com",
    details: {
      method: "Email",
      role: "Student",
      referrer: "Direct",
      device: "Mobile",
    },
  },
  {
    id: 5,
    timestamp: "2025-03-21T12:58:30Z",
    level: "info",
    category: "content",
    message: "New course published",
    source: "Content Management",
    ip: "198.51.100.73",
    user: "professor.smith@example.com",
    details: {
      course: "Advanced Machine Learning",
      modules: 12,
      visibility: "Public",
      students: 0,
    },
  },
  {
    id: 6,
    timestamp: "2025-03-21T12:45:18Z",
    level: "error",
    category: "payment",
    message: "Payment processing failed",
    source: "Payment Gateway",
    ip: "203.0.113.28",
    user: "john.doe@example.com",
    details: {
      amount: "$199.99",
      method: "Credit Card",
      error: "Insufficient funds",
      transaction: "tx_12345678",
    },
  },
  {
    id: 7,
    timestamp: "2025-03-21T12:30:05Z",
    level: "info",
    category: "system",
    message: "Scheduled maintenance completed",
    source: "System Service",
    ip: "internal",
    user: "system",
    details: {
      duration: "15 minutes",
      components: ["Database", "Cache", "Storage"],
      status: "Success",
    },
  },
  {
    id: 8,
    timestamp: "2025-03-21T12:15:42Z",
    level: "warning",
    category: "security",
    message: "Multiple failed login attempts detected",
    source: "Security Monitor",
    ip: "Various",
    user: "Various",
    details: {
      count: 15,
      timeframe: "10 minutes",
      pattern: "Distributed",
      action: "Rate limiting applied",
    },
  },
  {
    id: 9,
    timestamp: "2025-03-21T11:58:20Z",
    level: "info",
    category: "user",
    message: "User role changed",
    source: "User Management",
    ip: "192.168.1.105",
    user: "admin@example.com",
    details: {
      target: "emily.williams@example.com",
      oldRole: "Teacher",
      newRole: "Subject Head",
      reason: "Promotion",
    },
  },
  {
    id: 10,
    timestamp: "2025-03-21T11:45:10Z",
    level: "info",
    category: "content",
    message: "Course materials updated",
    source: "Content Management",
    ip: "198.51.100.73",
    user: "professor.smith@example.com",
    details: {
      course: "Introduction to Computer Science",
      files: 5,
      size: "24 MB",
      type: "Lecture Slides",
    },
  },
]

export default function SystemLogsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [timeRange, setTimeRange] = useState("today")
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null)

  const filteredLogs = logs.filter((log) => {
    // Search filter
    const searchMatch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase())

    // Level filter
    const levelMatch = selectedLevel === "all" || log.level === selectedLevel

    // Category filter
    const categoryMatch = selectedCategory === "all" || log.category === selectedCategory

    return searchMatch && levelMatch && categoryMatch
  })

  const formatDate = (dateString : any) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getLevelIcon = (level : any) => {
    switch (level) {
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
      case "info":
        return <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      default:
        return <Info className="w-4 h-4 text-slate-600 dark:text-slate-400" />
    }
  }

  const getCategoryIcon = (category : any) => {
    switch (category) {
      case "security":
        return <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
      case "database":
        return <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
      case "user":
        return <User className="w-4 h-4 text-green-600 dark:text-green-400" />
      case "content":
        return <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      case "system":
        return <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
      case "payment":
        return <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
      default:
        return <Info className="w-4 h-4 text-slate-600 dark:text-slate-400" />
    }
  }

  const getLevelBadge = (level : any) => {
    switch (level) {
      case "error":
        return (
          <Badge className="text-red-800 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800">
            Error
          </Badge>
        )
      case "warning":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-300 dark:hover:bg-amber-800">
            Warning
          </Badge>
        )
      case "info":
        return (
          <Badge className="text-blue-800 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800">
            Info
          </Badge>
        )
      default:
        return (
          <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
            Unknown
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text">
            System Logs
          </h1>
          <p className="text-slate-500 dark:text-slate-400">View and analyze system events and activities</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            <span>Export Logs</span>
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-md rounded-xl">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>Event Logs</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full max-w-[220px]">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
                <Input
                  placeholder="Search logs..."
                  className="pl-8 rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-[120px] rounded-lg">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[140px] rounded-lg">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="content">Content</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[140px] rounded-lg">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Time</TableHead>
                  <TableHead className="w-[100px]">Level</TableHead>
                  <TableHead className="w-[120px]">Category</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="w-[150px]">Source</TableHead>
                  <TableHead className="w-[150px]">User</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <Collapsible
                    key={log.id}
                    open={expandedLogId === log.id}
                    onOpenChange={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                  >
                    <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-900">
                      <TableCell className="font-mono text-xs">{formatDate(log.timestamp)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getLevelIcon(log.level)}
                          {getLevelBadge(log.level)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(log.category)}
                          <span className="text-sm capitalize">{log.category}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{log.message}</TableCell>
                      <TableCell className="text-sm text-slate-600 dark:text-slate-400">{log.source}</TableCell>
                      <TableCell className="text-sm text-slate-600 dark:text-slate-400">{log.user}</TableCell>
                      <TableCell>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                            {expandedLogId === log.id ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </TableCell>
                    </TableRow>
                    <CollapsibleContent>
                      <TableRow className="border-t-0 bg-slate-50 dark:bg-slate-900">
                        <TableCell colSpan={7} className="p-4">
                          <div className="space-y-4">
                            <div>
                              <h4 className="mb-2 text-sm font-medium">Log Details</h4>
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div className="space-y-1">
                                  <p className="text-xs text-slate-500 dark:text-slate-400">Timestamp</p>
                                  <p className="font-mono text-sm">{new Date(log.timestamp).toLocaleString()}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs text-slate-500 dark:text-slate-400">IP Address</p>
                                  <p className="font-mono text-sm">{log.ip}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs text-slate-500 dark:text-slate-400">User</p>
                                  <p className="text-sm">{log.user}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs text-slate-500 dark:text-slate-400">Source</p>
                                  <p className="text-sm">{log.source}</p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="mb-2 text-sm font-medium">Additional Information</h4>
                              <div className="p-3 bg-white border rounded-lg dark:bg-slate-950">
                                <pre className="overflow-auto text-xs whitespace-pre-wrap">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
                {filteredLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No logs found matching your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Showing {filteredLogs.length} of {logs.length} logs
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
