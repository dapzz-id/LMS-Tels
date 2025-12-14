// import Link from "@inertiajs/react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Badge } from "@/components/ui/badge"
// import { CheckSquare, Copy, Edit, FileText, Filter, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// export default function RubricsPage() {
//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Rubrics</h1>
//           <p className="text-slate-500 dark:text-slate-400">Create and manage grading rubrics for your assignments</p>
//         </div>
//         <div className="flex items-center gap-2">
//           <Button asChild className="bg-blue-600 shadow-sm hover:bg-blue-700 rounded-xl">
//             <Link href="/teacher/rubrics/new">
//               <Plus className="w-4 h-4 mr-2" />
//               Create Rubric
//             </Link>
//           </Button>
//         </div>
//       </div>

//       <div className="flex flex-col gap-4 md:flex-row md:items-center">
//         <div className="relative flex-1">
//           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
//           <Input
//             type="search"
//             placeholder="Search rubrics..."
//             className="w-full pl-8 bg-background border-slate-200 dark:border-slate-800 rounded-xl"
//           />
//         </div>
//         <div className="flex items-center gap-2">
//           <Button variant="outline" size="sm" className="h-9 rounded-xl">
//             <Filter className="w-4 h-4 mr-2" />
//             Filter
//           </Button>
//         </div>
//       </div>

//       <Tabs defaultValue="all" className="w-full">
//         <TabsList className="mb-4">
//           <TabsTrigger value="all">All Rubrics</TabsTrigger>
//           <TabsTrigger value="recent">Recently Used</TabsTrigger>
//           <TabsTrigger value="shared">Shared Rubrics</TabsTrigger>
//         </TabsList>

//         <TabsContent value="all" className="mt-0">
//           <Card className="border-0 shadow-md rounded-xl">
//             <CardHeader className="px-6 py-4">
//               <CardTitle>Rubric Library</CardTitle>
//               <CardDescription>Manage and reuse your grading rubrics across assignments</CardDescription>
//             </CardHeader>
//             <CardContent className="p-0">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Rubric Name</TableHead>
//                     <TableHead>Criteria</TableHead>
//                     <TableHead>Associated Courses</TableHead>
//                     <TableHead>Last Used</TableHead>
//                     <TableHead className="text-right">Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {rubrics.map((rubric) => (
//                     <TableRow key={rubric.id}>
//                       <TableCell>
//                         <div className="flex items-center gap-2">
//                           <FileText className="w-4 h-4 text-blue-600" />
//                           <span className="font-medium">{rubric.name}</span>
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex items-center gap-1">
//                           <CheckSquare className="w-4 h-4 text-slate-500" />
//                           <span>{rubric.criteriaCount} criteria</span>
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex flex-wrap gap-1">
//                           {rubric.courses.map((course, i) => (
//                             <Badge
//                               key={i}
//                               variant="outline"
//                               className="rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
//                             >
//                               {course}
//                             </Badge>
//                           ))}
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <span className="text-sm text-slate-500">{rubric.lastUsed}</span>
//                       </TableCell>
//                       <TableCell className="text-right">
//                         <div className="flex items-center justify-end gap-2">
//                           <Button variant="outline" size="sm" className="h-8 rounded-lg">
//                             <Copy className="w-4 h-4" />
//                             <span className="ml-2">Use</span>
//                           </Button>
//                           <DropdownMenu>
//                             <DropdownMenuTrigger asChild>
//                               <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
//                                 <MoreHorizontal className="w-4 h-4" />
//                                 <span className="sr-only">Actions</span>
//                               </Button>
//                             </DropdownMenuTrigger>
//                             <DropdownMenuContent align="end" className="w-48 rounded-xl">
//                               <DropdownMenuItem className="rounded-lg cursor-pointer">
//                                 <Edit className="w-4 h-4 mr-2" />
//                                 <span>Edit Rubric</span>
//                               </DropdownMenuItem>
//                               <DropdownMenuItem className="rounded-lg cursor-pointer">
//                                 <Copy className="w-4 h-4 mr-2" />
//                                 <span>Duplicate</span>
//                               </DropdownMenuItem>
//                               <DropdownMenuItem className="text-red-600 rounded-lg cursor-pointer dark:text-red-400">
//                                 <Trash2 className="w-4 h-4 mr-2" />
//                                 <span>Delete</span>
//                               </DropdownMenuItem>
//                             </DropdownMenuContent>
//                           </DropdownMenu>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </CardContent>
//             <CardFooter className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-900">
//               <div className="text-sm text-slate-500">
//                 Showing {rubrics.length} of {rubrics.length} rubrics
//               </div>
//               <div className="flex items-center gap-2">
//                 <Button variant="outline" size="sm" disabled>
//                   Previous
//                 </Button>
//                 <Button variant="outline" size="sm" disabled>
//                   Next
//                 </Button>
//               </div>
//             </CardFooter>
//           </Card>
//         </TabsContent>
//       </Tabs>

//       <div className="mt-8">
//         <h2 className="mb-4 text-xl font-semibold">Rubric Templates</h2>
//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//           {rubricTemplates.map((template) => (
//             <Card
//               key={template.id}
//               className="overflow-hidden transition-shadow border-0 shadow-md hover:shadow-lg rounded-xl"
//             >
//               <div className={`h-1.5 w-full ${template.colorClass}`}></div>
//               <CardHeader className="p-4">
//                 <CardTitle className="text-lg">{template.name}</CardTitle>
//                 <CardDescription className="mt-1">{template.description}</CardDescription>
//               </CardHeader>
//               <CardContent className="p-4 pt-0">
//                 <div className="flex flex-wrap gap-2 mb-4">
//                   {template.tags.map((tag, i) => (
//                     <Badge
//                       key={i}
//                       variant="secondary"
//                       className="rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
//                     >
//                       {tag}
//                     </Badge>
//                   ))}
//                 </div>
//                 <div className="text-sm text-slate-500">
//                   <div className="flex items-center gap-1 mb-1">
//                     <CheckSquare className="w-4 h-4" />
//                     <span>{template.criteriaCount} criteria</span>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <span>Levels: {template.levels}</span>
//                   </div>
//                 </div>
//               </CardContent>
//               <CardFooter className="flex justify-end p-4 bg-slate-50 dark:bg-slate-900">
//                 <Button className="bg-blue-600 rounded-lg hover:bg-blue-700">
//                   <Copy className="w-4 h-4 mr-2" />
//                   Use Template
//                 </Button>
//               </CardFooter>
//             </Card>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

// const rubrics = [
//   {
//     id: "rubric-001",
//     name: "Research Paper Evaluation",
//     criteriaCount: 5,
//     courses: ["Academic Writing", "Research Methods"],
//     lastUsed: "2 days ago",
//   },
//   {
//     id: "rubric-002",
//     name: "Presentation Skills Assessment",
//     criteriaCount: 4,
//     courses: ["Public Speaking", "Business Communication"],
//     lastUsed: "1 week ago",
//   },
//   {
//     id: "rubric-003",
//     name: "Programming Project Grading",
//     criteriaCount: 6,
//     courses: ["Intro to Programming", "Web Development"],
//     lastUsed: "2 weeks ago",
//   },
//   {
//     id: "rubric-004",
//     name: "Lab Report Evaluation",
//     criteriaCount: 5,
//     courses: ["Chemistry", "Biology"],
//     lastUsed: "3 weeks ago",
//   },
//   {
//     id: "rubric-005",
//     name: "Group Project Participation",
//     criteriaCount: 3,
//     courses: ["Team Leadership", "Project Management"],
//     lastUsed: "1 month ago",
//   },
// ]

// const rubricTemplates = [
//   {
//     id: "template-001",
//     name: "Essay Writing Rubric",
//     description: "Comprehensive evaluation of academic essays",
//     tags: ["Writing", "Essays", "Academic"],
//     criteriaCount: 5,
//     levels: "4 (Excellent, Good, Fair, Poor)",
//     colorClass: "bg-blue-600",
//   },
//   {
//     id: "template-002",
//     name: "STEM Project Rubric",
//     description: "Evaluation criteria for science and engineering projects",
//     tags: ["STEM", "Projects", "Technical"],
//     criteriaCount: 6,
//     levels: "5 (Exemplary to Unsatisfactory)",
//     colorClass: "bg-green-600",
//   },
//   {
//     id: "template-003",
//     name: "Participation & Engagement",
//     description: "Assess student participation and classroom engagement",
//     tags: ["Participation", "Classroom", "Engagement"],
//     criteriaCount: 3,
//     levels: "3 (Exceeds, Meets, Below Expectations)",
//     colorClass: "bg-amber-600",
//   },
// ]

