// import { Link, router } from "@inertiajs/react";
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { BookOpen, Calendar, FileText, Filter, MoreHorizontal, Plus, Search, Edit, Trash2, Users, CheckCircle2, XCircle } from "lucide-react"
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// export default function AssignmentsPage() {
//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text">
//             Assignments
//           </h1>
//           <p className="text-slate-500 dark:text-slate-400">Manage and track student assignments</p>
//         </div>
//         <div className="flex items-center gap-2">
//           <Button className="text-white bg-blue-600 shadow-md hover:bg-blue-700 rounded-xl shadow-blue-200 dark:shadow-blue-900/20">
//             <Plus className="w-4 h-4 mr-2" />
//             Create Assignment
//           </Button>
//         </div>
//       </div>

//       <div className="flex flex-col gap-4 md:flex-row md:items-center">
//         <div className="relative flex-1">
//           <Search className="absolute w-4 h-4 left-3 top-3 text-slate-400" />
//           <Input
//             type="search"
//             placeholder="Search assignments..."
//             className="w-full h-12 pl-10 bg-white dark:bg-slate-900 rounded-xl border-slate-200 dark:border-slate-800"
//           />
//         </div>
//         <div className="flex items-center gap-2">
//           <Button variant="outline" size="sm" className="h-12 rounded-xl border-slate-200 dark:border-slate-800">
//             <Filter className="w-4 h-4 mr-2" />
//             Filter
//           </Button>
//           <Select defaultValue="all-courses">
//             <SelectTrigger className="h-9 w-[180px]">
//               <SelectValue placeholder="Select course" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all-courses">All Courses</SelectItem>
//               <SelectItem value="cs101">Intro to Computer Science</SelectItem>
//               <SelectItem value="ds201">Data Structures</SelectItem>
//               <SelectItem value="web101">Web Development</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </div>

//       <Tabs defaultValue="all" className="w-full">
//         <TabsList>
//           <TabsTrigger value="all">All Assignments</TabsTrigger>
//           <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
//           <TabsTrigger value="active">Active</TabsTrigger>
//           <TabsTrigger value="past">Past</TabsTrigger>
//           <TabsTrigger value="drafts">Drafts</TabsTrigger>
//         </TabsList>
//         <TabsContent value="all" className="mt-4">
//           <Card className="border-0 shadow-md rounded-xl">
//             <CardHeader>
//               <CardTitle>All Assignments</CardTitle>
//               <CardDescription>View and manage all your course assignments</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Title</TableHead>
//                     <TableHead>Course</TableHead>
//                     <TableHead>Due Date</TableHead>
//                     <TableHead>Students</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead className="text-right">Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {assignments.map((assignment) => (
//                     <TableRow key={assignment.id}>
//                       <TableCell className="font-medium">
//                         <div className="flex items-center gap-2">
//                           <FileText className="w-4 h-4 text-slate-500" />
//                           {assignment.title}
//                         </div>
//                       </TableCell>
//                       <TableCell>{assignment.course}</TableCell>
//                       <TableCell>
//                         <div className="flex items-center gap-2">
//                           <Calendar className="w-4 h-4 text-slate-500" />
//                           {assignment.dueDate}
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex items-center gap-2">
//                           <Users className="w-4 h-4 text-slate-500" />
//                           {assignment.students}
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <Badge
//                           variant={assignment.status === "Active" ? "default" : "secondary"}
//                           className="rounded-full"
//                         >
//                           {assignment.status}
//                         </Badge>
//                       </TableCell>
//                       <TableCell className="text-right">
//                         <DropdownMenu>
//                           <DropdownMenuTrigger asChild>
//                             <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
//                               <MoreHorizontal className="w-4 h-4" />
//                               <span className="sr-only">Actions</span>
//                             </Button>
//                           </DropdownMenuTrigger>
//                           <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl">
//                             <DropdownMenuItem className="rounded-lg cursor-pointer">
//                               <Edit className="w-4 h-4 mr-2" />
//                               Edit Assignment
//                             </DropdownMenuItem>
//                             <DropdownMenuItem className="rounded-lg cursor-pointer">
//                               <FileText className="w-4 h-4 mr-2" />
//                               View Submissions
//                             </DropdownMenuItem>
//                             <DropdownMenuItem className="text-red-600 rounded-lg cursor-pointer dark:text-red-400">
//                               <Trash2 className="w-4 h-4 mr-2" />
//                               Delete Assignment
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

// const assignments = [
//   {
//     id: "1",
//     title: "Midterm Project",
//     course: "Introduction to Computer Science",
//     dueDate: "May 15, 2024",
//     students: "45/50",
//     status: "Active",
//   },
//   {
//     id: "2",
//     title: "Final Exam",
//     course: "Data Structures and Algorithms",
//     dueDate: "June 10, 2024",
//     students: "60/60",
//     status: "Active",
//   },
//   {
//     id: "3",
//     title: "Research Paper",
//     course: "Web Development",
//     dueDate: "April 30, 2024",
//     students: "35/40",
//     status: "Active",
//   },
// ]

