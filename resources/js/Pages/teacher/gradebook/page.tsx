// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Badge } from "@/components/ui/badge"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// import { Progress } from "@/components/ui/progress"
// import {
//   ArrowUpDown,
//   BookOpen,
//   Download,
//   FileText,
//   Filter,
//   MoreHorizontal,
//   Pencil,
//   Search,
//   SlidersHorizontal,
//   Upload,
// } from "lucide-react"

// export default function GradebookPage() {
//   const [selectedCourse, setSelectedCourse] = useState("cs101")
//   const [selectedAssignment, setSelectedAssignment] = useState("all")

//   // Filter students based on selected course
//   const filteredStudents = students.filter((student) => selectedCourse === "all" || student.courseId === selectedCourse)

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Gradebook</h1>
//           <p className="text-slate-500 dark:text-slate-400">Manage and track student grades across your courses</p>
//         </div>
//         <div className="flex items-center gap-2">
//           <Button variant="outline" className="rounded-xl">
//             <Upload className="w-4 h-4 mr-2" />
//             Import Grades
//           </Button>
//           <Button variant="outline" className="rounded-xl">
//             <Download className="w-4 h-4 mr-2" />
//             Export
//           </Button>
//           <Button className="bg-blue-600 shadow-sm hover:bg-blue-700 rounded-xl">
//             <Pencil className="w-4 h-4 mr-2" />
//             Grade Assignments
//           </Button>
//         </div>
//       </div>

//       <div className="grid gap-6 md:grid-cols-3">
//         <Card className="overflow-hidden border-0 shadow-md rounded-xl">
//           <div className="h-1.5 w-full bg-blue-600"></div>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium">Class Average</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold">84.2%</div>
//             <p className="text-xs text-slate-500 dark:text-slate-400">
//               <span className="text-green-500">+2.5%</span> from last semester
//             </p>
//             <div className="mt-4">
//               <Progress
//                 value={84.2}
//                 className="h-1.5 bg-blue-100 dark:bg-blue-900"
//                 indicatorClassName="bg-blue-600 dark:bg-blue-500"
//               />
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="overflow-hidden border-0 shadow-md rounded-xl">
//           <div className="h-1.5 w-full bg-amber-600"></div>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium">Assignments Graded</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold">78%</div>
//             <p className="text-xs text-slate-500 dark:text-slate-400">
//               <span className="text-red-500">12</span> assignments pending
//             </p>
//             <div className="mt-4">
//               <Progress
//                 value={78}
//                 className="h-1.5 bg-amber-100 dark:bg-amber-900"
//                 indicatorClassName="bg-amber-600 dark:bg-amber-500"
//               />
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="overflow-hidden border-0 shadow-md rounded-xl">
//           <div className="h-1.5 w-full bg-green-600"></div>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium">Grade Distribution</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-5 gap-1 mt-2">
//               <div className="space-y-1">
//                 <div className="h-16 bg-green-500 rounded-t-sm" style={{ height: `${60}px` }}></div>
//                 <p className="text-xs font-medium text-center">A</p>
//               </div>
//               <div className="space-y-1">
//                 <div className="h-16 bg-blue-500 rounded-t-sm" style={{ height: `${45}px` }}></div>
//                 <p className="text-xs font-medium text-center">B</p>
//               </div>
//               <div className="space-y-1">
//                 <div className="h-16 bg-yellow-500 rounded-t-sm" style={{ height: `${30}px` }}></div>
//                 <p className="text-xs font-medium text-center">C</p>
//               </div>
//               <div className="space-y-1">
//                 <div className="h-16 bg-orange-500 rounded-t-sm" style={{ height: `${15}px` }}></div>
//                 <p className="text-xs font-medium text-center">D</p>
//               </div>
//               <div className="space-y-1">
//                 <div className="h-16 bg-red-500 rounded-t-sm" style={{ height: `${10}px` }}></div>
//                 <p className="text-xs font-medium text-center">F</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="flex flex-col gap-4 md:flex-row md:items-center">
//         <div className="relative flex-1">
//           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
//           <Input
//             type="search"
//             placeholder="Search students..."
//             className="w-full pl-8 bg-background border-slate-200 dark:border-slate-800 rounded-xl"
//           />
//         </div>
//         <div className="flex items-center gap-2">
//           <Select value={selectedCourse} onValueChange={setSelectedCourse}>
//             <SelectTrigger className="w-[180px] border-slate-200 dark:border-slate-800 rounded-xl">
//               <SelectValue placeholder="Select course" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Courses</SelectItem>
//               <SelectItem value="cs101">Intro to Computer Science</SelectItem>
//               <SelectItem value="ds201">Data Structures</SelectItem>
//               <SelectItem value="web101">Web Development</SelectItem>
//             </SelectContent>
//           </Select>

//           <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
//             <SelectTrigger className="w-[180px] border-slate-200 dark:border-slate-800 rounded-xl">
//               <SelectValue placeholder="Select assignment" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Assignments</SelectItem>
//               <SelectItem value="midterm">Midterm Exam</SelectItem>
//               <SelectItem value="final-project">Final Project</SelectItem>
//               <SelectItem value="quiz-1">Quiz 1</SelectItem>
//             </SelectContent>
//           </Select>

//           <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl">
//             <SlidersHorizontal className="w-4 h-4" />
//             <span className="sr-only">Adjust columns</span>
//           </Button>

//           <Button variant="outline" size="sm" className="h-9 rounded-xl">
//             <Filter className="w-4 h-4 mr-2" />
//             Filter
//           </Button>
//         </div>
//       </div>

//       <Tabs defaultValue="grades" className="w-full">
//         <TabsList className="mb-4">
//           <TabsTrigger value="grades">Grades</TabsTrigger>
//           <TabsTrigger value="assignments">Assignments</TabsTrigger>
//           <TabsTrigger value="analytics">Analytics</TabsTrigger>
//         </TabsList>

//         <TabsContent value="grades" className="mt-0">
//           <Card className="border-0 shadow-md rounded-xl">
//             <CardHeader className="px-6 py-4">
//               <CardTitle>Student Grades</CardTitle>
//               <CardDescription>View and manage grades for all students</CardDescription>
//             </CardHeader>
//             <CardContent className="p-0">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead className="w-[250px]">Student</TableHead>
//                     <TableHead>
//                       <div className="flex items-center gap-1">
//                         <span>Overall Grade</span>
//                         <ArrowUpDown className="w-3 h-3" />
//                       </div>
//                     </TableHead>
//                     <TableHead>Midterm</TableHead>
//                     <TableHead>Final Project</TableHead>
//                     <TableHead>Assignments</TableHead>
//                     <TableHead>Participation</TableHead>
//                     <TableHead className="text-right">Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {filteredStudents.map((student) => (
//                     <TableRow key={student.id}>
//                       <TableCell>
//                         <div className="flex items-center gap-3">
//                           <Avatar>
//                             <AvatarImage src={student.avatar} alt={student.name} />
//                             <AvatarFallback className="text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400">
//                               {student.initials}
//                             </AvatarFallback>
//                           </Avatar>
//                           <div>
//                             <p className="font-medium">{student.name}</p>
//                             <p className="text-sm text-slate-500">{student.email}</p>
//                           </div>
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex items-center gap-2">
//                           <Badge
//                             variant={
//                               student.grade >= 90
//                                 ? "default"
//                                 : student.grade >= 80
//                                   ? "outline"
//                                   : student.grade >= 70
//                                     ? "secondary"
//                                     : "destructive"
//                             }
//                             className={
//                               student.grade >= 90
//                                 ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
//                                 : student.grade >= 80
//                                   ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
//                                   : student.grade >= 70
//                                     ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
//                                     : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
//                             }
//                           >
//                             {student.grade}%
//                           </Badge>
//                           <span className="text-sm text-slate-500">{student.letterGrade}</span>
//                         </div>
//                       </TableCell>
//                       <TableCell>{student.midterm}%</TableCell>
//                       <TableCell>{student.finalProject}%</TableCell>
//                       <TableCell>{student.assignments}%</TableCell>
//                       <TableCell>{student.participation}%</TableCell>
//                       <TableCell className="text-right">
//                         <DropdownMenu>
//                           <DropdownMenuTrigger asChild>
//                             <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
//                               <MoreHorizontal className="w-4 h-4" />
//                               <span className="sr-only">Actions</span>
//                             </Button>
//                           </DropdownMenuTrigger>
//                           <DropdownMenuContent align="end" className="w-48 rounded-xl">
//                             <DropdownMenuItem className="rounded-lg cursor-pointer">
//                               <Pencil className="w-4 h-4 mr-2" />
//                               <span>Edit Grades</span>
//                             </DropdownMenuItem>
//                             <DropdownMenuItem className="rounded-lg cursor-pointer">
//                               <FileText className="w-4 h-4 mr-2" />
//                               <span>View Details</span>
//                             </DropdownMenuItem>
//                             <DropdownMenuItem className="rounded-lg cursor-pointer">
//                               <BookOpen className="w-4 h-4 mr-2" />
//                               <span>Student Profile</span>
//                             </DropdownMenuItem>
//                           </DropdownMenuContent>
//                         </DropdownMenu>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   )
// }

// const students = [
//   {
//     id: "STU001",
//     name: "Emma Wilson",
//     email: "emma.w@example.com",
//     avatar: "/placeholder.svg?height=40&width=40",
//     initials: "EW",
//     grade: 95,
//     letterGrade: "A",
//     midterm: 92,
//     finalProject: 98,
//     assignments: 94,
//     participation: 96,
//     courseId: "cs101",
//   },
//   {
//     id: "STU002",
//     name: "Ryan Lee",
//     email: "ryan.l@example.com",
//     avatar: "/placeholder.svg?height=40&width=40",
//     initials: "RL",
//     grade: 88,
//     letterGrade: "B+",
//     midterm: 85,
//     finalProject: 92,
//     assignments: 87,
//     participation: 90,
//     courseId: "web101",
//   },
//   {
//     id: "STU003",
//     name: "Sarah Parker",
//     email: "sarah.p@example.com",
//     avatar: "/placeholder.svg?height=40&width=40",
//     initials: "SP",
//     grade: 76,
//     letterGrade: "C",
//     midterm: 72,
//     finalProject: 78,
//     assignments: 80,
//     participation: 75,
//     courseId: "ds201",
//   },
//   {
//     id: "STU004",
//     name: "Michael Brown",
//     email: "michael.b@example.com",
//     avatar: "/placeholder.svg?height=40&width=40",
//     initials: "MB",
//     grade: 65,
//     letterGrade: "D",
//     midterm: 60,
//     finalProject: 72,
//     assignments: 68,
//     participation: 60,
//     courseId: "cs101",
//   },
//   {
//     id: "STU005",
//     name: "Jessica Taylor",
//     email: "jessica.t@example.com",
//     avatar: "/placeholder.svg?height=40&width=40",
//     initials: "JT",
//     grade: 82,
//     letterGrade: "B",
//     midterm: 78,
//     finalProject: 85,
//     assignments: 84,
//     participation: 80,
//     courseId: "web101",
//   },
// ]

