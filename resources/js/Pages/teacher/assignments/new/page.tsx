// "use client"

// import type React from "react"

// import { useState } from "react"
// import { Link, router } from "@inertiajs/react"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import { z } from "zod"
// import { format } from "date-fns"
// import { CalendarIcon, ChevronLeft, Clock, FileUp, Info, Loader2, Save, Send, Users } from "lucide-react"

// import { Button } from "@/Components/ui/button"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/Components/ui/card"
// import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/Components/ui/form"
// import { Input } from "@/Components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
// import { Textarea } from "@/Components/ui/textarea"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
// import { Calendar } from "@/Components/ui/calendar"
// import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover"
// import { Switch } from "@/Components/ui/switch"
// import { Checkbox } from "@/Components/ui/checkbox"
// import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group"
// import { Separator } from "@/Components/ui/separator"
// import { cn } from "@/lib/utils"
// import { Badge } from "@/Components/ui/badge"
// import { Alert, AlertDescription } from "@/Components/ui/alert"

// const assignmentFormSchema = z.object({
//   title: z.string().min(3, { message: "Title must be at least 3 characters" }),
//   description: z.string().min(10, { message: "Description must be at least 10 characters" }),
//   courseId: z.string({ required_error: "Please select a course" }),
//   dueDate: z.date({ required_error: "Please select a due date" }),
//   dueTime: z.string().optional(),
//   points: z.coerce
//     .number()
//     .min(1, { message: "Points must be at least 1" })
//     .max(100, { message: "Points cannot exceed 100" }),
//   assignmentType: z.string({ required_error: "Please select an assignment type" }),
//   allowLateSubmissions: z.boolean().default(false),
//   latePenalty: z.coerce.number().min(0).max(100).optional(),
//   visibleToStudents: z.boolean().default(true),
//   gradingType: z.enum(["points", "percentage", "letter", "complete_incomplete"]),
//   groupAssignment: z.boolean().default(false),
//   attachments: z.array(z.string()).optional(),
//   instructions: z.string().optional(),
// })

// type AssignmentFormValues = z.infer<typeof assignmentFormSchema>

// const defaultValues: Partial<AssignmentFormValues> = {
//   title: "",
//   description: "",
//   points: 10,
//   allowLateSubmissions: false,
//   visibleToStudents: true,
//   gradingType: "points",
//   groupAssignment: false,
//   attachments: [],
// }

// export default function CreateAssignmentPage() {
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [activeTab, setActiveTab] = useState("details")
//   const [files, setFiles] = useState<File[]>([])

//   const form = useForm<AssignmentFormValues>({
//     resolver: zodResolver(assignmentFormSchema),
//     defaultValues,
//     mode: "onChange",
//   })

//   async function onSubmit(data: AssignmentFormValues, isDraft = false) {
//     setIsSubmitting(true)

//     try {
//       // Simulate API call


//       // Wait for 1 second to simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 1000))

//       // Redirect to assignments page
//       router.visit("/teacher/assignments")
//     } catch (error) {

//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const newFiles = Array.from(e.target.files)
//       setFiles(newFiles)
//       form.setValue('attachments', newFiles.map(file => file.name))
//     }
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           <Button variant="ghost" size="icon" asChild className="rounded-full">
//             <Link href="/teacher/assignments">
//               <ChevronLeft className="w-5 h-5" />
//               <span className="sr-only">Back</span>
//             </Link>
//           </Button>
//           <h1 className="text-2xl font-bold tracking-tight">Create New Assignment</h1>
//         </div>
//         <div className="flex items-center gap-2">
//           <Button
//             variant="outline"
//             onClick={() => onSubmit(form.getValues(), true)}
//             disabled={isSubmitting || !form.formState.isValid}
//           >
//             {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
//             Save as Draft
//           </Button>
//           <Button
//             onClick={form.handleSubmit((data) => onSubmit(data, false))}
//             disabled={isSubmitting || !form.formState.isValid}
//             className="bg-blue-600 hover:bg-blue-700"
//           >
//             {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
//             Publish Assignment
//           </Button>
//         </div>
//       </div>

//       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//         <TabsList className="grid w-full grid-cols-3 mb-6">
//           <TabsTrigger value="details">Assignment Details</TabsTrigger>
//           <TabsTrigger value="settings">Settings & Options</TabsTrigger>
//           <TabsTrigger value="preview">Preview</TabsTrigger>
//         </TabsList>

//         <Form {...form}>
//           <form className="space-y-6">
//             <TabsContent value="details" className="space-y-6">
//               <Card className="border-0 shadow-md rounded-xl">
//                 <CardHeader>
//                   <CardTitle>Basic Information</CardTitle>
//                   <CardDescription>Enter the basic details of your assignment</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <FormField
//                     control={form.control}
//                     name="title"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Assignment Title</FormLabel>
//                         <FormControl>
//                           <Input
//                             placeholder="e.g., Midterm Project: Data Visualization"
//                             {...field}
//                             className="border-slate-200 dark:border-slate-800"
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="courseId"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Course</FormLabel>
//                         <Select onValueChange={field.onChange} value={field.value}>
//                           <FormControl>
//                             <SelectTrigger className="border-slate-200 dark:border-slate-800">
//                               <SelectValue placeholder="Select a course" />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             <SelectItem value="cs101">Introduction to Computer Science</SelectItem>
//                             <SelectItem value="ds201">Data Structures and Algorithms</SelectItem>
//                             <SelectItem value="web101">Web Development Fundamentals</SelectItem>
//                           </SelectContent>
//                         </Select>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//                     <FormField
//                       control={form.control}
//                       name="dueDate"
//                       render={({ field }) => (
//                         <FormItem className="flex flex-col">
//                           <FormLabel>Due Date</FormLabel>
//                           <Popover>
//                             <PopoverTrigger asChild>
//                               <FormControl>
//                                 <Button
//                                   variant={"outline"}
//                                   className={cn(
//                                     "w-full pl-3 text-left font-normal border-slate-200 dark:border-slate-800",
//                                     !field.value && "text-muted-foreground",
//                                   )}
//                                 >
//                                   {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
//                                   <CalendarIcon className="w-4 h-4 ml-auto opacity-50" />
//                                 </Button>
//                               </FormControl>
//                             </PopoverTrigger>
//                             <PopoverContent className="w-auto p-0" align="start">
//                               <Calendar
//                                 mode="single"
//                                 selected={field.value}
//                                 onSelect={field.onChange}
//                                 disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
//                                 initialFocus
//                               />
//                             </PopoverContent>
//                           </Popover>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />

//                     <FormField
//                       control={form.control}
//                       name="dueTime"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Due Time</FormLabel>
//                           <div className="flex items-center gap-2">
//                             <FormControl>
//                               <Input type="time" {...field} className="border-slate-200 dark:border-slate-800" />
//                             </FormControl>
//                             <Clock className="w-4 h-4 text-slate-400" />
//                           </div>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </div>

//                   <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//                     <FormField
//                       control={form.control}
//                       name="points"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Points</FormLabel>
//                           <FormControl>
//                             <Input
//                               type="number"
//                               min={1}
//                               max={100}
//                               {...field}
//                               className="border-slate-200 dark:border-slate-800"
//                             />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />

//                     <FormField
//                       control={form.control}
//                       name="assignmentType"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Assignment Type</FormLabel>
//                           <Select onValueChange={field.onChange} value={field.value}>
//                             <FormControl>
//                               <SelectTrigger className="border-slate-200 dark:border-slate-800">
//                                 <SelectValue placeholder="Select type" />
//                               </SelectTrigger>
//                             </FormControl>
//                             <SelectContent>
//                               <SelectItem value="homework">Homework</SelectItem>
//                               <SelectItem value="quiz">Quiz</SelectItem>
//                               <SelectItem value="project">Project</SelectItem>
//                               <SelectItem value="exam">Exam</SelectItem>
//                               <SelectItem value="discussion">Discussion</SelectItem>
//                               <SelectItem value="other">Other</SelectItem>
//                             </SelectContent>
//                           </Select>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card className="border-0 shadow-md rounded-xl">
//                 <CardHeader>
//                   <CardTitle>Assignment Content</CardTitle>
//                   <CardDescription>Provide detailed instructions for your students</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <FormField
//                     control={form.control}
//                     name="description"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Brief Description</FormLabel>
//                         <FormControl>
//                           <Textarea
//                             placeholder="Provide a brief overview of the assignment"
//                             className="min-h-[100px] border-slate-200 dark:border-slate-800"
//                             {...field}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="instructions"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Detailed Instructions</FormLabel>
//                         <FormControl>
//                           <Textarea
//                             placeholder="Provide detailed instructions, requirements, and expectations"
//                             className="min-h-[200px] border-slate-200 dark:border-slate-800"
//                             {...field}
//                           />
//                         </FormControl>
//                         <FormDescription>
//                           Use clear and concise language. You can format text using markdown.
//                         </FormDescription>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="attachments"
//                     render={() => (
//                       <FormItem>
//                         <FormLabel>Attachments</FormLabel>
//                         <div className="flex items-center gap-2 mt-2">
//                           <label htmlFor="file-upload" className="cursor-pointer">
//                             <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-900">
//                               <FileUp className="w-5 h-5 text-slate-500" />
//                               <span className="text-sm text-slate-600 dark:text-slate-400">Upload Files</span>
//                             </div>
//                             <input
//                               id="file-upload"
//                               type="file"
//                               multiple
//                               className="hidden"
//                               onChange={handleFileChange}
//                             />
//                           </label>
//                           <p className="text-xs text-slate-500">
//                             Supported formats: PDF, DOCX, PPTX, JPG, PNG (max 10MB)
//                           </p>
//                         </div>

//                         {files.length > 0 && (
//                           <div className="mt-3 space-y-2">
//                             {files.map((file, index) => (
//                               <div
//                                 key={index}
//                                 className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900"
//                               >
//                                 <div className="flex items-center gap-2">
//                                   <FileUp className="w-4 h-4 text-blue-600" />
//                                   <span className="text-sm font-medium">{file.name}</span>
//                                   <span className="text-xs text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
//                                 </div>
//                                 <Button
//                                   variant="ghost"
//                                   size="sm"
//                                   onClick={() => setFiles(files.filter((_, i) => i !== index))}
//                                   className="w-8 h-8 p-0 rounded-full"
//                                 >
//                                   <span className="sr-only">Remove</span>
//                                   <span aria-hidden="true">×</span>
//                                 </Button>
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                       </FormItem>
//                     )}
//                   />
//                 </CardContent>
//               </Card>

//               <div className="flex justify-end">
//                 <Button
//                   type="button"
//                   onClick={() => setActiveTab("settings")}
//                   className="bg-blue-600 hover:bg-blue-700"
//                 >
//                   Continue to Settings
//                 </Button>
//               </div>
//             </TabsContent>

//             <TabsContent value="settings" className="space-y-6">
//               <Card className="border-0 shadow-md rounded-xl">
//                 <CardHeader>
//                   <CardTitle>Assignment Settings</CardTitle>
//                   <CardDescription>Configure how this assignment will be managed</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-6">
//                   <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                     <div className="space-y-4">
//                       <h3 className="text-sm font-medium">Submission Settings</h3>

//                       <FormField
//                         control={form.control}
//                         name="allowLateSubmissions"
//                         render={({ field }) => (
//                           <FormItem className="flex flex-row items-center justify-between p-3 border rounded-lg shadow-sm border-slate-200 dark:border-slate-800">
//                             <div className="space-y-0.5">
//                               <FormLabel className="text-base">Allow Late Submissions</FormLabel>
//                               <FormDescription>Students can submit after the due date</FormDescription>
//                             </div>
//                             <FormControl>
//                               <Switch checked={field.value} onCheckedChange={field.onChange} />
//                             </FormControl>
//                           </FormItem>
//                         )}
//                       />

//                       {form.watch("allowLateSubmissions") && (
//                         <FormField
//                           control={form.control}
//                           name="latePenalty"
//                           render={({ field }) => (
//                             <FormItem>
//                               <FormLabel>Late Submission Penalty (%)</FormLabel>
//                               <FormControl>
//                                 <Input
//                                   type="number"
//                                   min={0}
//                                   max={100}
//                                   placeholder="e.g., 10"
//                                   {...field}
//                                   className="border-slate-200 dark:border-slate-800"
//                                 />
//                               </FormControl>
//                               <FormDescription>Percentage deducted from the total score</FormDescription>
//                               <FormMessage />
//                             </FormItem>
//                           )}
//                         />
//                       )}

//                       <FormField
//                         control={form.control}
//                         name="groupAssignment"
//                         render={({ field }) => (
//                           <FormItem className="flex flex-row items-center justify-between p-3 border rounded-lg shadow-sm border-slate-200 dark:border-slate-800">
//                             <div className="space-y-0.5">
//                               <FormLabel className="text-base">Group Assignment</FormLabel>
//                               <FormDescription>Students can work in groups</FormDescription>
//                             </div>
//                             <FormControl>
//                               <Switch checked={field.value} onCheckedChange={field.onChange} />
//                             </FormControl>
//                           </FormItem>
//                         )}
//                       />
//                     </div>

//                     <div className="space-y-4">
//                       <h3 className="text-sm font-medium">Grading Settings</h3>

//                       <FormField
//                         control={form.control}
//                         name="gradingType"
//                         render={({ field }) => (
//                           <FormItem className="space-y-3">
//                             <FormLabel>Grading Method</FormLabel>
//                             <FormControl>
//                               <RadioGroup
//                                 onValueChange={field.onChange}
//                                 value={field.value}
//                                 className="flex flex-col space-y-1"
//                               >
//                                 <FormItem className="flex items-center space-x-3 space-y-0">
//                                   <FormControl>
//                                     <RadioGroupItem value="points" />
//                                   </FormControl>
//                                   <FormLabel className="font-normal">Points (e.g., 0-100)</FormLabel>
//                                 </FormItem>
//                                 <FormItem className="flex items-center space-x-3 space-y-0">
//                                   <FormControl>
//                                     <RadioGroupItem value="percentage" />
//                                   </FormControl>
//                                   <FormLabel className="font-normal">Percentage (0-100%)</FormLabel>
//                                 </FormItem>
//                                 <FormItem className="flex items-center space-x-3 space-y-0">
//                                   <FormControl>
//                                     <RadioGroupItem value="letter" />
//                                   </FormControl>
//                                   <FormLabel className="font-normal">Letter Grade (A, B, C, D, F)</FormLabel>
//                                 </FormItem>
//                                 <FormItem className="flex items-center space-x-3 space-y-0">
//                                   <FormControl>
//                                     <RadioGroupItem value="complete_incomplete" />
//                                   </FormControl>
//                                   <FormLabel className="font-normal">Complete/Incomplete</FormLabel>
//                                 </FormItem>
//                               </RadioGroup>
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />

//                       <FormField
//                         control={form.control}
//                         name="visibleToStudents"
//                         render={({ field }) => (
//                           <FormItem className="flex flex-row items-center justify-between p-3 border rounded-lg shadow-sm border-slate-200 dark:border-slate-800">
//                             <div className="space-y-0.5">
//                               <FormLabel className="text-base">Visible to Students</FormLabel>
//                               <FormDescription>Students can see this assignment</FormDescription>
//                             </div>
//                             <FormControl>
//                               <Switch checked={field.value} onCheckedChange={field.onChange} />
//                             </FormControl>
//                           </FormItem>
//                         )}
//                       />
//                     </div>
//                   </div>

//                   <Separator />

//                   <div className="space-y-4">
//                     <h3 className="text-sm font-medium">Notification Settings</h3>

//                     <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//                       <div className="flex items-center space-x-2">
//                         <Checkbox id="notify-publish" />
//                         <span className="text-sm font-medium">Notify students when published</span>
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <Checkbox id="notify-due" />
//                         <span className="text-sm font-medium">Send reminder before due date</span>
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               <div className="flex justify-between">
//                 <Button type="button" variant="outline" onClick={() => setActiveTab("details")}>
//                   Back to Details
//                 </Button>
//                 <Button type="button" onClick={() => setActiveTab("preview")} className="bg-blue-600 hover:bg-blue-700">
//                   Preview Assignment
//                 </Button>
//               </div>
//             </TabsContent>

//             <TabsContent value="preview" className="space-y-6">
//               <Card className="border-0 shadow-md rounded-xl">
//                 <CardHeader className="flex flex-row items-center justify-between">
//                   <div>
//                     <CardTitle>Assignment Preview</CardTitle>
//                     <CardDescription>Review how your assignment will appear to students</CardDescription>
//                   </div>
//                   <Badge variant={form.watch("visibleToStudents") ? "default" : "secondary"} className="rounded-full">
//                     {form.watch("visibleToStudents") ? "Visible to Students" : "Hidden from Students"}
//                   </Badge>
//                 </CardHeader>
//                 <CardContent className="space-y-6">
//                   <div className="space-y-2">
//                     <h2 className="text-2xl font-bold">{form.watch("title") || "Assignment Title"}</h2>
//                     <div className="flex flex-wrap gap-2 text-sm text-slate-500">
//                       <div className="flex items-center gap-1">
//                         <CalendarIcon className="w-4 h-4" />
//                         <span>
//                           Due: {form.watch("dueDate") ? format(form.watch("dueDate"), "PPP") : "Not set"}{" "}
//                           {form.watch("dueTime") ? `at ${form.watch("dueTime")}` : ""}
//                         </span>
//                       </div>
//                       <div>•</div>
//                       <div>{form.watch("points") || 0} points</div>
//                       <div>•</div>
//                       <div>
//                         {form.watch("assignmentType")
//                           ? form.watch("assignmentType").charAt(0).toUpperCase() + form.watch("assignmentType").slice(1)
//                           : "Assignment Type"}
//                       </div>
//                     </div>
//                   </div>

//                   <Separator />

//                   <div className="space-y-4">
//                     <div>
//                       <h3 className="text-lg font-semibold">Description</h3>
//                       <p className="mt-2 text-slate-700 dark:text-slate-300">
//                         {form.watch("description") || "No description provided."}
//                       </p>
//                     </div>

//                     {form.watch("instructions") && (
//                       <div>
//                         <h3 className="text-lg font-semibold">Instructions</h3>
//                         <p className="mt-2 whitespace-pre-line text-slate-700 dark:text-slate-300">
//                           {form.watch("instructions")}
//                         </p>
//                       </div>
//                     )}

//                     {files.length > 0 && (
//                       <div>
//                         <h3 className="text-lg font-semibold">Attachments</h3>
//                         <div className="mt-2 space-y-2">
//                           {files.map((file, index) => (
//                             <div
//                               key={index}
//                               className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900"
//                             >
//                               <FileUp className="w-4 h-4 text-blue-600" />
//                               <span className="text-sm font-medium">{file.name}</span>
//                               <span className="text-xs text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
//                     <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
//                     <AlertDescription className="text-blue-700 dark:text-blue-300">
//                       {form.watch("allowLateSubmissions")
//                         ? `Late submissions are allowed with a ${form.watch("latePenalty") || 0}% penalty.`
//                         : "Late submissions are not allowed for this assignment."}
//                     </AlertDescription>
//                   </Alert>

//                   {form.watch("groupAssignment") && (
//                     <Alert className="border-indigo-200 bg-indigo-50 dark:bg-indigo-950 dark:border-indigo-800">
//                       <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
//                       <AlertDescription className="text-indigo-700 dark:text-indigo-300">
//                         This is a group assignment. You can work with other students.
//                       </AlertDescription>
//                     </Alert>
//                   )}
//                 </CardContent>
//                 <CardFooter className="flex justify-between border-t bg-slate-50 dark:bg-slate-900">
//                   <p className="text-sm text-slate-500">Created by: Dr. Smith</p>
//                   <Button disabled className="bg-blue-600 hover:bg-blue-700">
//                     Submit Assignment
//                   </Button>
//                 </CardFooter>
//               </Card>

//               <div className="flex justify-between">
//                 <Button type="button" variant="outline" onClick={() => setActiveTab("settings")}>
//                   Back to Settings
//                 </Button>
//                 <div className="flex items-center gap-2">
//                   <Button
//                     variant="outline"
//                     onClick={() => onSubmit(form.getValues(), true)}
//                     disabled={isSubmitting || !form.formState.isValid}
//                   >
//                     {isSubmitting ? (
//                       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                     ) : (
//                       <Save className="w-4 h-4 mr-2" />
//                     )}
//                     Save as Draft
//                   </Button>
//                   <Button
//                     onClick={form.handleSubmit((data) => onSubmit(data, false))}
//                     disabled={isSubmitting || !form.formState.isValid}
//                     className="bg-blue-600 hover:bg-blue-700"
//                   >
//                     {isSubmitting ? (
//                       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                     ) : (
//                       <Send className="w-4 h-4 mr-2" />
//                     )}
//                     Publish Assignment
//                   </Button>
//                 </div>
//               </div>
//             </TabsContent>
//           </form>
//         </Form>
//       </Tabs>
//     </div>
//   )
// }

