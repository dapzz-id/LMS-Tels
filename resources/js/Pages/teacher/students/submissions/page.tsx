// import { useState } from "react"
// import { Link } from "@inertiajs/react"
// import { ChevronLeft, Download, Filter, Search, Clock, Calendar, FileText } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/Components/ui/card"
// import { Input } from "@/Components/ui/input"
// import { Tabs, TabsList, TabsTrigger } from "@/Components/ui/tabs"
// import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
// import { Badge } from "@/Components/ui/badge"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
// import { Textarea } from "@/Components/ui/textarea"

// interface Assignment {
//   id: string;
//   title: string;
//   dueDate: string;
//   maxPoints: number;
// }

// interface Submission {
//   assignmentId: string;
//   status: 'early' | 'on-time' | 'late' | 'excused' | 'missing';
//   submittedDate: string;
//   timeBeforeDue: string;
//   score: number;
// }

// interface Student {
//   id: string;
//   name: string;
//   email: string;
//   avatar: string;
//   course: string;
//   submissions: Submission[];
//   stats?: {
//     submissionRate: number;
//     averageScore: number;
//     earlySubmissions: number;
//     onTimeSubmissions: number;
//     lateSubmissions: number;
//     excusedSubmissions: number;
//     missingSubmissions: number;
//     submissionPattern: string;
//   };
// }

// interface ExtensionRequest {
//   id: string;
//   studentId: string;
//   assignmentId: string;
//   requestDate: string;
//   reason: string;
//   status: 'pending' | 'approved' | 'denied';
//   teacherNotes: string;
// }

// // Mock assignment data
// const assignments = [
//   { id: "A1", title: "Introduction to Programming", dueDate: "2023-09-10", maxPoints: 100 },
//   { id: "A2", title: "Variables and Data Types", dueDate: "2023-09-17", maxPoints: 100 },
//   { id: "A3", title: "Control Structures", dueDate: "2023-09-24", maxPoints: 100 },
//   { id: "A4", title: "Functions and Methods", dueDate: "2023-10-01", maxPoints: 100 },
//   { id: "A5", title: "Arrays and Lists", dueDate: "2023-10-08", maxPoints: 100 },
//   { id: "A6", title: "Object-Oriented Programming", dueDate: "2023-10-15", maxPoints: 100 },
//   { id: "A7", title: "Error Handling", dueDate: "2023-10-22", maxPoints: 100 },
//   { id: "A8", title: "File I/O", dueDate: "2023-10-29", maxPoints: 100 },
//   { id: "A9", title: "Data Structures", dueDate: "2023-11-05", maxPoints: 100 },
//   { id: "A10", title: "Algorithms", dueDate: "2023-11-12", maxPoints: 100 },
//   { id: "A11", title: "Web Development Basics", dueDate: "2023-11-19", maxPoints: 100 },
//   { id: "A12", title: "Final Project", dueDate: "2023-11-26", maxPoints: 200 },
// ]

// // Mock student submission data
// const studentSubmissions = [
//   {
//     id: "1",
//     name: "Emma Wilson",
//     email: "emma.wilson@example.com",
//     avatar: "/placeholder.svg?height=40&width=40",
//     course: "Computer Science",
//     submissions: [
//       { assignmentId: "A1", status: "early", submittedDate: "2023-09-08", timeBeforeDue: "2 days early", score: 95 },
//       { assignmentId: "A2", status: "early", submittedDate: "2023-09-15", timeBeforeDue: "2 days early", score: 98 },
//       { assignmentId: "A3", status: "early", submittedDate: "2023-09-22", timeBeforeDue: "2 days early", score: 92 },
//       { assignmentId: "A4", status: "on-time", submittedDate: "2023-10-01", timeBeforeDue: "on due date", score: 88 },
//       { assignmentId: "A5", status: "early", submittedDate: "2023-10-05", timeBeforeDue: "3 days early", score: 94 },
//       { assignmentId: "A6", status: "early", submittedDate: "2023-10-12", timeBeforeDue: "3 days early", score: 97 },
//       { assignmentId: "A7", status: "on-time", submittedDate: "2023-10-22", timeBeforeDue: "on due date", score: 91 },
//       { assignmentId: "A8", status: "early", submittedDate: "2023-10-27", timeBeforeDue: "2 days early", score: 93 },
//       { assignmentId: "A9", status: "early", submittedDate: "2023-11-03", timeBeforeDue: "2 days early", score: 96 },
//       { assignmentId: "A10", status: "on-time", submittedDate: "2023-11-12", timeBeforeDue: "on due date", score: 90 },
//       { assignmentId: "A11", status: "early", submittedDate: "2023-11-17", timeBeforeDue: "2 days early", score: 94 },
//       { assignmentId: "A12", status: "early", submittedDate: "2023-11-24", timeBeforeDue: "2 days early", score: 188 },
//     ],
//   },
//   {
//     id: "2",
//     name: "Ryan Lee",
//     email: "ryan.lee@example.com",
//     avatar: "/placeholder.svg?height=40&width=40",
//     course: "Web Development",
//     submissions: [
//       { assignmentId: "A1", status: "early", submittedDate: "2023-09-07", timeBeforeDue: "3 days early", score: 97 },
//       { assignmentId: "A2", status: "early", submittedDate: "2023-09-14", timeBeforeDue: "3 days early", score: 99 },
//       { assignmentId: "A3", status: "early", submittedDate: "2023-09-21", timeBeforeDue: "3 days early", score: 96 },
//       { assignmentId: "A4", status: "early", submittedDate: "2023-09-28", timeBeforeDue: "3 days early", score: 95 },
//       { assignmentId: "A5", status: "early", submittedDate: "2023-10-05", timeBeforeDue: "3 days early", score: 98 },
//       { assignmentId: "A6", status: "early", submittedDate: "2023-10-12", timeBeforeDue: "3 days early", score: 97 },
//       { assignmentId: "A7", status: "early", submittedDate: "2023-10-19", timeBeforeDue: "3 days early", score: 96 },
//       { assignmentId: "A8", status: "early", submittedDate: "2023-10-26", timeBeforeDue: "3 days early", score: 98 },
//       { assignmentId: "A9", status: "early", submittedDate: "2023-11-02", timeBeforeDue: "3 days early", score: 99 },
//       { assignmentId: "A10", status: "early", submittedDate: "2023-11-09", timeBeforeDue: "3 days early", score: 97 },
//       { assignmentId: "A11", status: "early", submittedDate: "2023-11-16", timeBeforeDue: "3 days early", score: 98 },
//       { assignmentId: "A12", status: "early", submittedDate: "2023-11-23", timeBeforeDue: "3 days early", score: 195 },
//     ],
//   },
//   {
//     id: "3",
//     name: "Sarah Parker",
//     email: "sarah.parker@example.com",
//     avatar: "/placeholder.svg?height=40&width=40",
//     course: "Data Structures",
//     submissions: [
//       { assignmentId: "A1", status: "on-time", submittedDate: "2023-09-10", timeBeforeDue: "on due date", score: 92 },
//       { assignmentId: "A2", status: "on-time", submittedDate: "2023-09-17", timeBeforeDue: "on due date", score: 90 },
//       { assignmentId: "A3", status: "on-time", submittedDate: "2023-09-24", timeBeforeDue: "on due date", score: 88 },
//       { assignmentId: "A4", status: "on-time", submittedDate: "2023-10-01", timeBeforeDue: "on due date", score: 91 },
//       { assignmentId: "A5", status: "on-time", submittedDate: "2023-10-08", timeBeforeDue: "on due date", score: 89 },
//       { assignmentId: "A6", status: "on-time", submittedDate: "2023-10-15", timeBeforeDue: "on due date", score: 90 },
//       { assignmentId: "A7", status: "on-time", submittedDate: "2023-10-22", timeBeforeDue: "on due date", score: 87 },
//       { assignmentId: "A8", status: "on-time", submittedDate: "2023-10-29", timeBeforeDue: "on due date", score: 92 },
//       { assignmentId: "A9", status: "on-time", submittedDate: "2023-11-05", timeBeforeDue: "on due date", score: 90 },
//       { assignmentId: "A10", status: "on-time", submittedDate: "2023-11-12", timeBeforeDue: "on due date", score: 88 },
//       { assignmentId: "A11", status: "on-time", submittedDate: "2023-11-19", timeBeforeDue: "on due date", score: 91 },
//       { assignmentId: "A12", status: "on-time", submittedDate: "2023-11-26", timeBeforeDue: "on due date", score: 180 },
//     ],
//   },
//   {
//     id: "4",
//     name: "Michael Johnson",
//     email: "michael.j@example.com",
//     avatar: "/placeholder.svg?height=40&width=40",
//     course: "Computer Science",
//     submissions: [
//       { assignmentId: "A1", status: "late", submittedDate: "2023-09-12", timeBeforeDue: "2 days late", score: 85 },
//       { assignmentId: "A2", status: "late", submittedDate: "2023-09-19", timeBeforeDue: "2 days late", score: 82 },
//       { assignmentId: "A3", status: "late", submittedDate: "2023-09-26", timeBeforeDue: "2 days late", score: 80 },
//       { assignmentId: "A4", status: "on-time", submittedDate: "2023-10-01", timeBeforeDue: "on due date", score: 88 },
//       { assignmentId: "A5", status: "late", submittedDate: "2023-10-10", timeBeforeDue: "2 days late", score: 78 },
//       { assignmentId: "A6", status: "late", submittedDate: "2023-10-17", timeBeforeDue: "2 days late", score: 75 },
//       { assignmentId: "A7", status: "missing", submittedDate: "", timeBeforeDue: "", score: 0 },
//       { assignmentId: "A8", status: "late", submittedDate: "2023-10-31", timeBeforeDue: "2 days late", score: 70 },
//       { assignmentId: "A9", status: "late", submittedDate: "2023-11-07", timeBeforeDue: "2 days late", score: 72 },
//       { assignmentId: "A10", status: "missing", submittedDate: "", timeBeforeDue: "", score: 0 },
//       { assignmentId: "A11", status: "missing", submittedDate: "", timeBeforeDue: "", score: 0 },
//       { assignmentId: "A12", status: "missing", submittedDate: "", timeBeforeDue: "", score: 0 },
//     ],
//   },
//   {
//     id: "5",
//     name: "Jessica Brown",
//     email: "jessica.b@example.com",
//     avatar: "/placeholder.svg?height=40&width=40",
//     course: "Web Development",
//     submissions: [
//       { assignmentId: "A1", status: "on-time", submittedDate: "2023-09-10", timeBeforeDue: "on due date", score: 88 },
//       { assignmentId: "A2", status: "late", submittedDate: "2023-09-19", timeBeforeDue: "2 days late", score: 75 },
//       { assignmentId: "A3", status: "late", submittedDate: "2023-09-27", timeBeforeDue: "3 days late", score: 70 },
//       { assignmentId: "A4", status: "missing", submittedDate: "", timeBeforeDue: "", score: 0 },
//       { assignmentId: "A5", status: "missing", submittedDate: "", timeBeforeDue: "", score: 0 },
//       { assignmentId: "A6", status: "missing", submittedDate: "", timeBeforeDue: "", score: 0 },
//       { assignmentId: "A7", status: "missing", submittedDate: "", timeBeforeDue: "", score: 0 },
//       { assignmentId: "A8", status: "missing", submittedDate: "", timeBeforeDue: "", score: 0 },
//       { assignmentId: "A9", status: "missing", submittedDate: "", timeBeforeDue: "", score: 0 },
//       { assignmentId: "A10", status: "missing", submittedDate: "", timeBeforeDue: "", score: 0 },
//       { assignmentId: "A11", status: "missing", submittedDate: "", timeBeforeDue: "", score: 0 },
//       { assignmentId: "A12", status: "missing", submittedDate: "", timeBeforeDue: "", score: 0 },
//     ],
//   },
//   {
//     id: "6",
//     name: "David Kim",
//     email: "david.kim@example.com",
//     avatar: "/placeholder.svg?height=40&width=40",
//     course: "Data Structures",
//     submissions: [
//       { assignmentId: "A1", status: "early", submittedDate: "2023-09-08", timeBeforeDue: "2 days early", score: 90 },
//       { assignmentId: "A2", status: "on-time", submittedDate: "2023-09-17", timeBeforeDue: "on due date", score: 85 },
//       { assignmentId: "A3", status: "late", submittedDate: "2023-09-26", timeBeforeDue: "2 days late", score: 78 },
//       { assignmentId: "A4", status: "late", submittedDate: "2023-10-03", timeBeforeDue: "2 days late", score: 75 },
//       { assignmentId: "A5", status: "on-time", submittedDate: "2023-10-08", timeBeforeDue: "on due date", score: 82 },
//       { assignmentId: "A6", status: "early", submittedDate: "2023-10-13", timeBeforeDue: "2 days early", score: 88 },
//       { assignmentId: "A7", status: "on-time", submittedDate: "2023-10-22", timeBeforeDue: "on due date", score: 84 },
//       { assignmentId: "A8", status: "late", submittedDate: "2023-10-31", timeBeforeDue: "2 days late", score: 76 },
//       { assignmentId: "A9", status: "on-time", submittedDate: "2023-11-05", timeBeforeDue: "on due date", score: 83 },
//       { assignmentId: "A10", status: "early", submittedDate: "2023-11-10", timeBeforeDue: "2 days early", score: 89 },
//       { assignmentId: "A11", status: "on-time", submittedDate: "2023-11-19", timeBeforeDue: "on due date", score: 85 },
//       { assignmentId: "A12", status: "late", submittedDate: "2023-11-28", timeBeforeDue: "2 days late", score: 160 },
//     ],
//   },
// ]

// // Add these new extension request examples after the existing student submissions data
// const extensionRequests = [
//   {
//     id: "ext1",
//     studentId: "4", // Michael Johnson
//     assignmentId: "A7",
//     requestDate: "2023-10-21",
//     reason: "Family emergency - house fire on October 20th. All documentation provided to student services.",
//     status: "pending", // pending, approved, denied
//     teacherNotes: "",
//   },
//   {
//     id: "ext2",
//     studentId: "4", // Michael Johnson
//     assignmentId: "A10",
//     requestDate: "2023-11-11",
//     reason: "Grandmother passed away. Funeral was on the assignment due date. Obituary provided.",
//     status: "approved",
//     teacherNotes: "Approved - documentation verified with student services.",
//   },
//   {
//     id: "ext3",
//     studentId: "5", // Jessica Brown
//     assignmentId: "A4",
//     requestDate: "2023-09-30",
//     reason: "Medical emergency - hospitalized for 3 days. Doctor's note provided.",
//     status: "approved",
//     teacherNotes: "Approved based on medical documentation.",
//   },
//   {
//     id: "ext4",
//     studentId: "5", // Jessica Brown
//     assignmentId: "A5",
//     requestDate: "2023-10-07",
//     reason: "Still recovering from medical procedure. Follow-up appointment documentation provided.",
//     status: "approved",
//     teacherNotes: "Extended deadline to October 15th.",
//   },
//   {
//     id: "ext5",
//     studentId: "6", // David Kim
//     assignmentId: "A8",
//     requestDate: "2023-10-28",
//     reason: "Home flooded due to burst pipe. Repair company documentation provided.",
//     status: "pending",
//     teacherNotes: "",
//   },
// ]

// // Update the studentSubmissions array to reflect excused late submissions
// // For Michael Johnson (id: "4"), update the A10 submission to be excused
// // For Jessica Brown (id: "5"), update the A4 submission to be excused
// // Find the student with id "4" and update their A10 submission
// studentSubmissions[3].submissions.find((s) => s.assignmentId === "A10").status = "excused"
// studentSubmissions[3].submissions.find((s) => s.assignmentId === "A10").score = 85
// studentSubmissions[3].submissions.find((s) => s.assignmentId === "A10").submittedDate = "2023-11-14"
// studentSubmissions[3].submissions.find((s) => s.assignmentId === "A10").timeBeforeDue = "excused (2 days late)"

// // Find the student with id "5" and update their A4 submission
// studentSubmissions[4].submissions.find((s) => s.assignmentId === "A4").status = "excused"
// studentSubmissions[4].submissions.find((s) => s.assignmentId === "A4").score = 82
// studentSubmissions[4].submissions.find((s) => s.assignmentId === "A4").submittedDate = "2023-10-05"
// studentSubmissions[4].submissions.find((s) => s.assignmentId === "A4").timeBeforeDue = "excused (4 days late)"

// // Add a new state for extension requests
// const StudentSubmissionsPage = () => {
//   const [showExtensionRequests, setShowExtensionRequests] = useState<boolean>(false)
//   const [selectedRequest, setSelectedRequest] = useState<ExtensionRequest | null>(null)
//   const [requestNotes, setRequestNotes] = useState<string>('')

//   const [searchQuery, setSearchQuery] = useState<string>('')
//   const [selectedCourse, setSelectedCourse] = useState<string>('all')
//   const [selectedStatus, setSelectedStatus] = useState<string>('all')
//   const [sortBy, setSortBy] = useState<string>('name')
//   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
//   const [selectedAssignment, setSelectedAssignment] = useState<string>('all')
//   const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary') // "summary" or "detailed"

//   // Add a function to handle extension request approval/denial
//   const handleExtensionRequest = (requestId: string, action: 'approve' | 'deny') => {
//     // In a real application, this would make an API call to update the database

//     setSelectedRequest(null);
//     setRequestNotes('');
//   }

//   // Update the calculateSubmissionStatistics function to account for excused submissions
//   // Modify the studentsWithStats calculation to include excused submissions

//   // Calculate submission statistics for each student
//   const studentsWithStats = studentSubmissions.map((student) => {
//     const totalAssignments = assignments.length
//     const submittedAssignments = student.submissions.filter((s) => s.status !== "missing").length
//     const earlySubmissions = student.submissions.filter((s) => s.status === "early").length
//     const onTimeSubmissions = student.submissions.filter((s) => s.status === "on-time").length
//     const lateSubmissions = student.submissions.filter((s) => s.status === "late").length
//     const excusedSubmissions = student.submissions.filter((s) => s.status === "excused").length
//     const missingSubmissions = student.submissions.filter((s) => s.status === "missing").length

//     const submissionRate = (submittedAssignments / totalAssignments) * 100
//     const averageScore = student.submissions.reduce((sum, s) => sum + s.score, 0) / totalAssignments

//     // Determine overall submission pattern
//     let submissionPattern = "mixed"
//     if (earlySubmissions > onTimeSubmissions && earlySubmissions > lateSubmissions) {
//       submissionPattern = "mostly-early"
//     } else if (onTimeSubmissions > earlySubmissions && onTimeSubmissions > lateSubmissions) {
//       submissionPattern = "mostly-on-time"
//     } else if (lateSubmissions > earlySubmissions && lateSubmissions > onTimeSubmissions) {
//       submissionPattern = "mostly-late"
//     }

//     if (missingSubmissions > totalAssignments / 2) {
//       submissionPattern = "mostly-missing"
//     }

//     return {
//       ...student,
//       stats: {
//         submissionRate,
//         averageScore,
//         earlySubmissions,
//         onTimeSubmissions,
//         lateSubmissions,
//         excusedSubmissions,
//         missingSubmissions,
//         submissionPattern,
//       },
//     }
//   })

//   // Filter students based on search, course, and submission status
//   // Update the filter function to handle the new "has-excused" filter option
//   // Filter students based on search, course, and submission status
//   const filteredStudents = studentsWithStats.filter((student) => {
//     const matchesSearch =
//       student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       student.email.toLowerCase().includes(searchQuery.toLowerCase())

//     const matchesCourse = selectedCourse === "all" || student.course === selectedCourse

//     let matchesStatus = selectedStatus === "all" || student.stats.submissionPattern === selectedStatus

//     // Special case for excused submissions
//     if (selectedStatus === "has-excused") {
//       matchesStatus = student.stats.excusedSubmissions > 0
//     }

//     return matchesSearch && matchesCourse && matchesStatus
//   })

//   // Sort students
//   const sortedStudents = [...filteredStudents].sort((a, b) => {
//     let comparison = 0

//     switch (sortBy) {
//       case "name":
//         comparison = a.name.localeCompare(b.name)
//         break
//       case "submissionRate":
//         comparison = a.stats.submissionRate - b.stats.submissionRate
//         break
//       case "averageScore":
//         comparison = a.stats.averageScore - b.stats.averageScore
//         break
//       case "earlySubmissions":
//         comparison = a.stats.earlySubmissions - b.stats.earlySubmissions
//         break
//       case "onTimeSubmissions":
//         comparison = a.stats.onTimeSubmissions - b.stats.onTimeSubmissions
//         break
//       case "lateSubmissions":
//         comparison = a.stats.lateSubmissions - b.stats.lateSubmissions
//         break
//       case "missingSubmissions":
//         comparison = a.stats.missingSubmissions - b.stats.missingSubmissions
//         break
//       default:
//         comparison = 0
//     }

//     return sortOrder === "asc" ? comparison : -comparison
//   })

//   // Get sort indicator
//   const getSortIndicator = (column) => {
//     if (sortBy !== column) return null
//     return sortOrder === "asc" ? "↑" : "↓"
//   }

//   // Handle sort
//   const handleSort = (column) => {
//     if (sortBy === column) {
//       setSortOrder(sortOrder === "asc" ? "desc" : "asc")
//     } else {
//       setSortBy(column)
//       setSortOrder("asc")
//     }
//   }

//   // Modify the getStatusBadge function to include excused status
//   const getStatusBadge = (status) => {
//     switch (status) {
//       case "early":
//         return (
//           <Badge
//             variant="outline"
//             className="text-green-700 bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/50"
//           >
//             Early
//           </Badge>
//         )
//       case "on-time":
//         return (
//           <Badge
//             variant="outline"
//             className="text-blue-700 bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50"
//           >
//             On Time
//           </Badge>
//         )
//       case "late":
//         return (
//           <Badge
//             variant="outline"
//             className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50"
//           >
//             Late
//           </Badge>
//         )
//       case "excused":
//         return (
//           <Badge
//             variant="outline"
//             className="text-purple-700 bg-purple-100 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/50"
//           >
//             Excused
//           </Badge>
//         )
//       case "missing":
//         return (
//           <Badge
//             variant="outline"
//             className="text-red-700 bg-red-100 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/50"
//           >
//             Missing
//           </Badge>
//         )
//       default:
//         return null
//     }
//   }

//   // Add a function to get the extension request status badge
//   const getExtensionRequestStatusBadge = (status) => {
//     switch (status) {
//       case "pending":
//         return (
//           <Badge
//             variant="outline"
//             className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50"
//           >
//             Pending
//           </Badge>
//         )
//       case "approved":
//         return (
//           <Badge
//             variant="outline"
//             className="text-green-700 bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/50"
//           >
//             Approved
//           </Badge>
//         )
//       case "denied":
//         return (
//           <Badge
//             variant="outline"
//             className="text-red-700 bg-red-100 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/50"
//           >
//             Denied
//           </Badge>
//         )
//       default:
//         return null
//     }
//   }

//   const getPatternBadge = (pattern) => {
//     switch (pattern) {
//       case "mostly-early":
//         return (
//           <Badge
//             variant="outline"
//             className="text-green-700 bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/50"
//           >
//             Mostly Early
//           </Badge>
//         )
//       case "mostly-on-time":
//         return (
//           <Badge
//             variant="outline"
//             className="text-blue-700 bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50"
//           >
//             Mostly On Time
//           </Badge>
//         )
//       case "mostly-late":
//         return (
//           <Badge
//             variant="outline"
//             className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50"
//           >
//             Mostly Late
//           </Badge>
//         )
//       case "mostly-missing":
//         return (
//           <Badge
//             variant="outline"
//             className="text-red-700 bg-red-100 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/50"
//           >
//             Mostly Missing
//           </Badge>
//         )
//       case "mixed":
//         return (
//           <Badge
//             variant="outline"
//             className="bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-800/50"
//           >
//             Mixed
//           </Badge>
//         )
//       default:
//         return null
//     }
//   }

//   return (
//     <div className="container py-6 space-y-6">
//       <div className="flex items-center gap-2">
//         <Button variant="ghost" size="icon" asChild className="rounded-full">
//           <Link href="/teacher/students">
//             <ChevronLeft className="w-5 h-5" />
//             <span className="sr-only">Back</span>
//           </Link>
//         </Button>
//         <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-green-700 to-green-500 bg-clip-text">
//           Student Submissions
//         </h1>
//       </div>
//       <p className="ml-10 text-slate-500 dark:text-slate-400">
//         Track and analyze student submission patterns across all assignments.
//       </p>

//       <Card className="border-0 shadow-md rounded-xl">
//         <CardHeader>
//           <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//             <div>
//               <CardTitle>Submission Analysis</CardTitle>
//               <CardDescription>View detailed submission patterns for all students</CardDescription>
//             </div>
//             <div className="flex items-center gap-2">
//               <Button variant="outline" className="h-9">
//                 <Download className="w-4 h-4 mr-2" />
//                 Export Report
//               </Button>
//               <Button
//                 variant="outline"
//                 className={`h-9 rounded-lg ${showExtensionRequests ? "bg-amber-50 border-amber-200 text-amber-700" : ""}`}
//                 onClick={() => setShowExtensionRequests(!showExtensionRequests)}
//               >
//                 {extensionRequests.filter((req) => req.status === "pending").length > 0 && (
//                   <span className="mr-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-medium text-white">
//                     {extensionRequests.filter((req) => req.status === "pending").length}
//                   </span>
//                 )}
//                 Extension Requests
//               </Button>
//               <Tabs value={viewMode} onValueChange={setViewMode} className="w-[200px]">
//                 <TabsList className="grid w-full grid-cols-2">
//                   <TabsTrigger value="summary">Summary</TabsTrigger>
//                   <TabsTrigger value="detailed">Detailed</TabsTrigger>
//                 </TabsList>
//               </Tabs>
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//               <div className="relative w-full md:w-96">
//                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
//                 <Input
//                   type="search"
//                   placeholder="Search students..."
//                   className="w-full rounded-lg pl-9"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//               </div>
//               <div className="flex flex-wrap items-center gap-2">
//                 <Select value={selectedCourse} onValueChange={setSelectedCourse}>
//                   <SelectTrigger className="w-[180px] h-9 rounded-lg">
//                     <SelectValue placeholder="Filter by course" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Courses</SelectItem>
//                     <SelectItem value="Computer Science">Computer Science</SelectItem>
//                     <SelectItem value="Web Development">Web Development</SelectItem>
//                     <SelectItem value="Data Structures">Data Structures</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 <Select value={selectedStatus} onValueChange={setSelectedStatus}>
//                   <SelectTrigger className="w-[180px] h-9 rounded-lg">
//                     <SelectValue placeholder="Submission pattern" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Patterns</SelectItem>
//                     <SelectItem value="mostly-early">Mostly Early</SelectItem>
//                     <SelectItem value="mostly-on-time">Mostly On Time</SelectItem>
//                     <SelectItem value="mostly-late">Mostly Late</SelectItem>
//                     <SelectItem value="mostly-missing">Mostly Missing</SelectItem>
//                     <SelectItem value="mixed">Mixed Pattern</SelectItem>
//                     <SelectItem value="has-excused">Has Excused Submissions</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 {viewMode === "detailed" && (
//                   <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
//                     <SelectTrigger className="w-[180px] h-9 rounded-lg">
//                       <SelectValue placeholder="Select assignment" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">All Assignments</SelectItem>
//                       {assignments.map((assignment) => (
//                         <SelectItem key={assignment.id} value={assignment.id}>
//                           {assignment.title}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 )}
//                 <Button variant="outline" size="icon" className="rounded-lg h-9 w-9">
//                   <Filter className="w-4 h-4" />
//                 </Button>
//               </div>
//             </div>

//             {viewMode === "summary" ? (
//               <div className="overflow-hidden border rounded-lg">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
//                         Student {getSortIndicator("name")}
//                       </TableHead>
//                       <TableHead>Course</TableHead>
//                       <TableHead className="cursor-pointer" onClick={() => handleSort("submissionRate")}>
//                         Submission Rate {getSortIndicator("submissionRate")}
//                       </TableHead>
//                       <TableHead className="cursor-pointer" onClick={() => handleSort("averageScore")}>
//                         Average Score {getSortIndicator("averageScore")}
//                       </TableHead>
//                       <TableHead>Submission Pattern</TableHead>
//                       <TableHead className="cursor-pointer" onClick={() => handleSort("earlySubmissions")}>
//                         Early {getSortIndicator("earlySubmissions")}
//                       </TableHead>
//                       <TableHead className="cursor-pointer" onClick={() => handleSort("onTimeSubmissions")}>
//                         On Time {getSortIndicator("onTimeSubmissions")}
//                       </TableHead>
//                       <TableHead className="cursor-pointer" onClick={() => handleSort("lateSubmissions")}>
//                         Late {getSortIndicator("lateSubmissions")}
//                       </TableHead>
//                       <TableHead className="cursor-pointer" onClick={() => handleSort("missingSubmissions")}>
//                         Missing {getSortIndicator("missingSubmissions")}
//                       </TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {sortedStudents.length > 0 ? (
//                       sortedStudents.map((student) => (
//                         <TableRow key={student.id}>
//                           <TableCell>
//                             <div className="flex items-center gap-3">
//                               <Avatar className="w-8 h-8">
//                                 <AvatarImage src={student.avatar} alt={student.name} />
//                                 <AvatarFallback>
//                                   {student.name.charAt(0)}
//                                   {student.name.split(" ")[1]?.charAt(0)}
//                                 </AvatarFallback>
//                               </Avatar>
//                               <div>
//                                 <div className="font-medium">{student.name}</div>
//                                 <div className="text-xs text-slate-500">{student.email}</div>
//                               </div>
//                             </div>
//                           </TableCell>
//                           <TableCell>{student.course}</TableCell>
//                           <TableCell>
//                             <div className="flex items-center gap-2">
//                               <div className="w-full h-2 rounded-full max-w-24 bg-slate-100 dark:bg-slate-700">
//                                 <div
//                                   className={`h-full rounded-full ${
//                                     student.stats.submissionRate >= 90
//                                       ? "bg-green-500"
//                                       : student.stats.submissionRate >= 70
//                                         ? "bg-blue-500"
//                                         : student.stats.submissionRate >= 50
//                                           ? "bg-amber-500"
//                                           : "bg-red-500"
//                                   }`}
//                                   style={{ width: `${student.stats.submissionRate}%` }}
//                                 ></div>
//                               </div>
//                               <span className="text-xs">{student.stats.submissionRate.toFixed(0)}%</span>
//                             </div>
//                           </TableCell>
//                           <TableCell>
//                             <div className="font-medium">{student.stats.averageScore.toFixed(1)}</div>
//                           </TableCell>
//                           <TableCell>{getPatternBadge(student.stats.submissionPattern)}</TableCell>
//                           <TableCell>
//                             <span className="font-medium text-green-600">{student.stats.earlySubmissions}</span>
//                           </TableCell>
//                           <TableCell>
//                             <span className="font-medium text-blue-600">{student.stats.onTimeSubmissions}</span>
//                           </TableCell>
//                           <TableCell>
//                             <span className="font-medium text-amber-600">{student.stats.lateSubmissions}</span>
//                           </TableCell>
//                           <TableCell>
//                             <span className="font-medium text-red-600">{student.stats.missingSubmissions}</span>
//                           </TableCell>
//                         </TableRow>
//                       ))
//                     ) : (
//                       <TableRow>
//                         <TableCell colSpan={9} className="py-8 text-center text-slate-500">
//                           No students found matching your filters.
//                         </TableCell>
//                       </TableRow>
//                     )}
//                   </TableBody>
//                 </Table>
//               </div>
//             ) : (
//               <div className="space-y-6">
//                 {sortedStudents.map((student) => {
//                   // Filter submissions based on selected assignment
//                   const filteredSubmissions =
//                     selectedAssignment === "all"
//                       ? student.submissions
//                       : student.submissions.filter((s) => s.assignmentId === selectedAssignment)

//                   return (
//                     <Card key={student.id} className="overflow-hidden">
//                       <CardHeader className="pb-2 bg-slate-50 dark:bg-slate-800/50">
//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center gap-3">
//                             <Avatar className="w-10 h-10">
//                               <AvatarImage src={student.avatar} alt={student.name} />
//                               <AvatarFallback>
//                                 {student.name.charAt(0)}
//                                 {student.name.split(" ")[1]?.charAt(0)}
//                               </AvatarFallback>
//                             </Avatar>
//                             <div>
//                               <CardTitle className="text-lg">{student.name}</CardTitle>
//                               <CardDescription>
//                                 {student.email} • {student.course}
//                               </CardDescription>
//                             </div>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             {getPatternBadge(student.stats.submissionPattern)}
//                             <div className="text-sm">
//                               <span className="font-medium">{student.stats.submissionRate.toFixed(0)}%</span> submission
//                               rate
//                             </div>
//                           </div>
//                         </div>
//                       </CardHeader>
//                       <CardContent className="pt-4">
//                         <div className="flex flex-wrap gap-2 mb-4">
//                           <div className="flex items-center gap-1 px-2 py-1 text-sm text-green-700 rounded-md bg-green-50 dark:bg-green-900/20 dark:text-green-300">
//                             <Clock className="w-4 h-4" />
//                             <span>{student.stats.earlySubmissions} early</span>
//                           </div>
//                           <div className="flex items-center gap-1 px-2 py-1 text-sm text-blue-700 rounded-md bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300">
//                             <Clock className="w-4 h-4" />
//                             <span>{student.stats.onTimeSubmissions} on time</span>
//                           </div>
//                           <div className="flex items-center gap-1 px-2 py-1 text-sm rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">
//                             <Clock className="w-4 h-4" />
//                             <span>{student.stats.lateSubmissions} late</span>
//                           </div>
//                           {student.submissions.filter((s) => s.status === "excused").length > 0 && (
//                             <div className="flex items-center gap-1 px-2 py-1 text-sm text-purple-700 rounded-md bg-purple-50 dark:bg-purple-900/20 dark:text-purple-300">
//                               <Clock className="w-4 h-4" />
//                               <span>{student.submissions.filter((s) => s.status === "excused").length} excused</span>
//                             </div>
//                           )}
//                           <div className="flex items-center gap-1 px-2 py-1 text-sm text-red-700 rounded-md bg-red-50 dark:bg-red-900/20 dark:text-red-300">
//                             <FileText className="w-4 h-4" />
//                             <span>{student.stats.missingSubmissions} missing</span>
//                           </div>
//                         </div>

//                         <div className="overflow-hidden border rounded-lg">
//                           <Table>
//                             <TableHeader>
//                               <TableRow>
//                                 <TableHead>Assignment</TableHead>
//                                 <TableHead>Due Date</TableHead>
//                                 <TableHead>Submitted</TableHead>
//                                 <TableHead>Status</TableHead>
//                                 <TableHead>Time</TableHead>
//                                 <TableHead>Score</TableHead>
//                               </TableRow>
//                             </TableHeader>
//                             <TableBody>
//                               {filteredSubmissions.map((submission) => {
//                                 const assignment =
//                                   assignments.find((a) => a.id === submission.assignmentId) ||
//                                   assignments.find((a) => a.id === submission.assignmentId)

//                                 return (
//                                   <TableRow key={`${student.id}-${submission.assignmentId}`}>
//                                     <TableCell className="font-medium">
//                                       {assignment?.title || submission.assignmentId}
//                                     </TableCell>
//                                     <TableCell>
//                                       <div className="flex items-center gap-1">
//                                         <Calendar className="w-4 h-4 text-slate-400" />
//                                         <span>{assignment?.dueDate}</span>
//                                       </div>
//                                     </TableCell>
//                                     <TableCell>
//                                       {submission.submittedDate ? (
//                                         <div className="flex items-center gap-1">
//                                           <Calendar className="w-4 h-4 text-slate-400" />
//                                           <span>{submission.submittedDate}</span>
//                                         </div>
//                                       ) : (
//                                         <span className="text-slate-400">Not submitted</span>
//                                       )}
//                                     </TableCell>
//                                     <TableCell>{getStatusBadge(submission.status)}</TableCell>
//                                     <TableCell>
//                                       {submission.timeBeforeDue ? (
//                                         <span
//                                           className={
//                                             submission.status === "early"
//                                               ? "text-green-600"
//                                               : submission.status === "on-time"
//                                                 ? "text-blue-600"
//                                                 : submission.status === "late"
//                                                   ? "text-amber-600"
//                                                   : "text-purple-600"
//                                           }
//                                         >
//                                           {submission.timeBeforeDue}
//                                         </span>
//                                       ) : (
//                                         <span className="text-slate-400">—</span>
//                                       )}
//                                     </TableCell>
//                                     <TableCell>
//                                       <div className="flex items-center gap-1">
//                                         <span
//                                           className={
//                                             submission.score >= (assignment?.maxPoints || 100) * 0.9
//                                               ? "text-green-600 font-medium"
//                                               : submission.score >= (assignment?.maxPoints || 100) * 0.7
//                                                 ? "text-blue-600 font-medium"
//                                                 : submission.score >= (assignment?.maxPoints || 100) * 0.6
//                                                   ? "text-amber-600 font-medium"
//                                                   : "text-red-600 font-medium"
//                                           }
//                                         >
//                                           {submission.score}
//                                         </span>
//                                         <span className="text-slate-400">/ {assignment?.maxPoints || 100}</span>
//                                       </div>
//                                     </TableCell>
//                                   </TableRow>
//                                 )
//                               })}
//                             </TableBody>
//                           </Table>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   )
//                 })}

//                 {sortedStudents.length === 0 && (
//                   <div className="py-8 text-center text-slate-500">No students found matching your filters.</div>
//                 )}
//               </div>
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       {showExtensionRequests && (
//         <Card className="mt-6 border-0 shadow-md rounded-xl">
//           <CardHeader className="border-b bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/30">
//             <div className="flex items-center justify-between">
//               <div>
//                 <CardTitle>Extension Requests</CardTitle>
//                 <CardDescription>Review and manage student extension requests for late submissions</CardDescription>
//               </div>
//               <Button variant="ghost" size="sm" onClick={() => setShowExtensionRequests(false)}>
//                 ✕
//               </Button>
//             </div>
//           </CardHeader>
//           <CardContent className="p-0">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Student</TableHead>
//                   <TableHead>Assignment</TableHead>
//                   <TableHead>Request Date</TableHead>
//                   <TableHead>Reason</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {extensionRequests.map((request) => {
//                   const student = studentSubmissions.find((s) => s.id === request.studentId)
//                   const assignment = assignments.find((a) => a.id === request.assignmentId)

//                   return (
//                     <TableRow key={request.id}>
//                       <TableCell>
//                         <div className="flex items-center gap-3">
//                           <Avatar className="w-8 h-8">
//                             <AvatarImage src={student?.avatar} alt={student?.name} />
//                             <AvatarFallback>
//                               {student?.name.charAt(0)}
//                               {student?.name.split(" ")[1]?.charAt(0)}
//                             </AvatarFallback>
//                           </Avatar>
//                           <div>
//                             <div className="font-medium">{student?.name}</div>
//                             <div className="text-xs text-slate-500">{student?.email}</div>
//                           </div>
//                         </div>
//                       </TableCell>
//                       <TableCell>{assignment?.title}</TableCell>
//                       <TableCell>{request.requestDate}</TableCell>
//                       <TableCell>
//                         <div className="max-w-xs truncate" title={request.reason}>
//                           {request.reason}
//                         </div>
//                       </TableCell>
//                       <TableCell>{getExtensionRequestStatusBadge(request.status)}</TableCell>
//                       <TableCell className="text-right">
//                         {request.status === "pending" ? (
//                           <div className="flex justify-end gap-2">
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               className="h-8 text-green-700 border-green-200 bg-green-50 hover:bg-green-100 hover:text-green-800"
//                               onClick={() => {
//                                 setSelectedRequest(request)
//                                 setRequestNotes("")
//                               }}
//                             >
//                               Review
//                             </Button>
//                           </div>
//                         ) : (
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => {
//                               setSelectedRequest(request)
//                               setRequestNotes(request.teacherNotes)
//                             }}
//                           >
//                             View Details
//                           </Button>
//                         )}
//                       </TableCell>
//                     </TableRow>
//                   )
//                 })}

//                 {extensionRequests.length === 0 && (
//                   <TableRow>
//                     <TableCell colSpan={6} className="py-8 text-center text-slate-500">
//                       No extension requests found.
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </CardContent>
//         </Card>
//       )}

//       {selectedRequest && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
//           <Card className="w-full max-w-md">
//             <CardHeader>
//               <CardTitle>Extension Request</CardTitle>
//               <CardDescription>
//                 {selectedRequest.status === "pending" ? "Review this extension request" : "Extension request details"}
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div>
//                 <h3 className="mb-1 text-sm font-medium">Student</h3>
//                 <div className="flex items-center gap-2">
//                   <Avatar className="w-6 h-6">
//                     <AvatarImage
//                       src={studentSubmissions.find((s) => s.id === selectedRequest.studentId)?.avatar}
//                       alt={studentSubmissions.find((s) => s.id === selectedRequest.studentId)?.name}
//                     />
//                     <AvatarFallback>
//                       {studentSubmissions.find((s) => s.id === selectedRequest.studentId)?.name.charAt(0)}
//                     </AvatarFallback>
//                   </Avatar>
//                   <span>{studentSubmissions.find((s) => s.id === selectedRequest.studentId)?.name}</span>
//                 </div>
//               </div>

//               <div>
//                 <h3 className="mb-1 text-sm font-medium">Assignment</h3>
//                 <p>{assignments.find((a) => a.id === selectedRequest.assignmentId)?.title}</p>
//               </div>

//               <div>
//                 <h3 className="mb-1 text-sm font-medium">Request Date</h3>
//                 <p>{selectedRequest.requestDate}</p>
//               </div>

//               <div>
//                 <h3 className="mb-1 text-sm font-medium">Reason for Extension</h3>
//                 <p className="p-3 text-sm border rounded-md bg-slate-50 dark:bg-slate-800">{selectedRequest.reason}</p>
//               </div>

//               <div>
//                 <h3 className="mb-1 text-sm font-medium">Status</h3>
//                 <div>{getExtensionRequestStatusBadge(selectedRequest.status)}</div>
//               </div>

//               <div>
//                 <h3 className="mb-1 text-sm font-medium">
//                   {selectedRequest.status === "pending" ? "Add Notes (Optional)" : "Teacher Notes"}
//                 </h3>
//                 {selectedRequest.status === "pending" ? (
//                   <Textarea
//                     placeholder="Add notes about this extension request..."
//                     value={requestNotes}
//                     onChange={(e) => setRequestNotes(e.target.value)}
//                     className="h-20"
//                   />
//                 ) : (
//                   <p className="p-3 text-sm border rounded-md bg-slate-50 dark:bg-slate-800">
//                     {selectedRequest.teacherNotes || "No notes provided."}
//                   </p>
//                 )}
//               </div>
//             </CardContent>
//             <CardFooter className="flex justify-between px-6 py-4 border-t bg-slate-50 dark:bg-slate-800/50">
//               <Button variant="ghost" onClick={() => setSelectedRequest(null)}>
//                 {selectedRequest.status === "pending" ? "Cancel" : "Close"}
//               </Button>

//               {selectedRequest.status === "pending" && (
//                 <div className="flex gap-2">
//                   <Button
//                     variant="outline"
//                     className="text-red-700 border-red-200 bg-red-50 hover:bg-red-100 hover:text-red-800"
//                     onClick={() => handleExtensionRequest(selectedRequest.id, "deny")}
//                   >
//                     Deny
//                   </Button>
//                   <Button
//                     className="bg-green-600 hover:bg-green-700"
//                     onClick={() => handleExtensionRequest(selectedRequest.id, "approve")}
//                   >
//                     Approve
//                   </Button>
//                 </div>
//               )}
//             </CardFooter>
//           </Card>
//         </div>
//       )}
//     </div>
//   )
// }

// export default StudentSubmissionsPage

