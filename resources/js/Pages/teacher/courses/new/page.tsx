// "use client"

// import { Badge } from "@/components/ui/badge"

// import { useState } from "react"
// import { useNavigate, Link } from "react-router-dom"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import { z } from "zod"
// import { CalendarIcon, ChevronLeft, ImagePlus, Loader2, Save } from "lucide-react"
// import { format } from "date-fns"
// import YouTube from 'react-youtube'

// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Textarea } from "@/components/ui/textarea"
// import { Calendar } from "@/Components/ui/calendar"
// import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover"
// import { Switch } from "@/Components/ui/switch"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
// import { toast } from "@/Components/ui/use-toast"

// const courseFormSchema = z.object({
//   title: z.string().min(3, {
//     message: "Course title must be at least 3 characters.",
//   }),
//   description: z.string().min(10, {
//     message: "Course description must be at least 10 characters.",
//   }),
//   category: z.string({
//     required_error: "Please select a category.",
//   }),
//   level: z.string({
//     required_error: "Please select a difficulty level.",
//   }),
//   startDate: z.date({
//     required_error: "A start date is required.",
//   }),
//   endDate: z.date({
//     required_error: "An end date is required.",
//   }),
//   enrollmentLimit: z.string().optional(),
//   isPublic: z.boolean().default(true),
//   allowSelfEnrollment: z.boolean().default(true),
//   tags: z.string().optional(),
//   contentTypes: z.array(z.enum(['video', 'quiz', 'pdf'])).min(1, {
//     message: "Please select at least one content type.",
//   }),
// })

// type CourseFormValues = z.infer<typeof courseFormSchema>

// const defaultValues: Partial<CourseFormValues> = {
//   title: "",
//   description: "",
//   isPublic: true,
//   allowSelfEnrollment: true,
// }

// export default function NewCoursePage() {
//   const navigate = useNavigate()
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   const form = useForm<CourseFormValues>({
//     resolver: zodResolver(courseFormSchema),
//     defaultValues,
//   })

//   function onSubmit(data: CourseFormValues) {
//     setIsSubmitting(true)

//     // Simulate API call
//     setTimeout(() => {

//       setIsSubmitting(false)
//       toast({
//         title: "Course created successfully",
//         description: `${data.title} has been created and is ready to use.`,
//       })
//       navigate("/teacher")
//     }, 1500)
//   }

//   return (
//     <div className="container py-6 space-y-6">
//       <div className="flex items-center gap-2">
//         <Button variant="ghost" size="icon" asChild className="rounded-full">
//           <Link to="/teacher">
//             <ChevronLeft className="w-5 h-5" />
//             <span className="sr-only">Back</span>
//           </Link>
//         </Button>
//         <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text">
//           Create New Course
//         </h1>
//       </div>
//       <p className="ml-10 text-slate-500 dark:text-slate-400">
//         Fill in the details below to create a new course for your students.
//       </p>

//       <Tabs defaultValue="details" className="w-full">
//         <TabsList className="grid w-full grid-cols-3 mb-6">
//           <TabsTrigger value="details">Course Details</TabsTrigger>
//           <TabsTrigger value="settings">Settings</TabsTrigger>
//           <TabsTrigger value="preview">Preview</TabsTrigger>
//         </TabsList>

//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
//             <TabsContent value="details">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Basic Information</CardTitle>
//                   <CardDescription>Enter the basic details about your course.</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-6">
//                   <div className="flex flex-col gap-6 md:flex-row">
//                     <div className="w-full space-y-6 md:w-2/3">
//                       <FormField
//                         control={form.control}
//                         name="title"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Course Title</FormLabel>
//                             <FormControl>
//                               <Input placeholder="Introduction to Computer Science" {...field} />
//                             </FormControl>
//                             <FormDescription>
//                               This is the name of your course as it will appear to students.
//                             </FormDescription>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />

//                       <FormField
//                         control={form.control}
//                         name="description"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Course Description</FormLabel>
//                             <FormControl>
//                               <Textarea
//                                 placeholder="Provide a detailed description of your course..."
//                                 className="min-h-32"
//                                 {...field}
//                               />
//                             </FormControl>
//                             <FormDescription>Describe what students will learn in this course.</FormDescription>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />

//                       <FormField
//                         control={form.control}
//                         name="contentTypes"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Content Types</FormLabel>
//                             <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
//                               <div className="flex items-center space-x-2">
//                                 <input
//                                   type="checkbox"
//                                   id="video"
//                                   checked={field.value?.includes('video')}
//                                   onChange={(e) => {
//                                     const newValue = e.target.checked
//                                       ? [...(field.value || []), 'video']
//                                       : (field.value || []).filter((type) => type !== 'video')
//                                     field.onChange(newValue)
//                                   }}
//                                   className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                                 />
//                                 <label htmlFor="video" className="text-sm font-medium">
//                                   Video Lessons
//                                 </label>
//                               </div>
//                               <div className="flex items-center space-x-2">
//                                 <input
//                                   type="checkbox"
//                                   id="quiz"
//                                   checked={field.value?.includes('quiz')}
//                                   onChange={(e) => {
//                                     const newValue = e.target.checked
//                                       ? [...(field.value || []), 'quiz']
//                                       : (field.value || []).filter((type) => type !== 'quiz')
//                                     field.onChange(newValue)
//                                   }}
//                                   className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                                 />
//                                 <label htmlFor="quiz" className="text-sm font-medium">
//                                   Quizzes
//                                 </label>
//                               </div>
//                               <div className="flex items-center space-x-2">
//                                 <input
//                                   type="checkbox"
//                                   id="pdf"
//                                   checked={field.value?.includes('pdf')}
//                                   onChange={(e) => {
//                                     const newValue = e.target.checked
//                                       ? [...(field.value || []), 'pdf']
//                                       : (field.value || []).filter((type) => type !== 'pdf')
//                                     field.onChange(newValue)
//                                   }}
//                                   className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                                 />
//                                 <label htmlFor="pdf" className="text-sm font-medium">
//                                   PDF Materials
//                                 </label>
//                               </div>
//                             </div>
//                             <FormDescription>
//                               Select the types of content you plan to include in this course.
//                             </FormDescription>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                     </div>

//                     <div className="w-full space-y-6 md:w-1/3">
//                       <div className="flex flex-col items-center justify-center h-48 p-6 text-center border-2 border-dashed rounded-lg border-slate-200 dark:border-slate-700">
//                         <ImagePlus className="w-10 h-10 mb-2 text-slate-400" />
//                         <p className="text-sm text-slate-500 dark:text-slate-400">Upload course thumbnail</p>
//                         <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Recommended size: 1280x720px</p>
//                         <Button variant="outline" size="sm" className="mt-4">
//                           Select Image
//                         </Button>
//                       </div>

//                       <FormField
//                         control={form.control}
//                         name="tags"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Tags</FormLabel>
//                             <FormControl>
//                               <Input placeholder="programming, computer science" {...field} />
//                             </FormControl>
//                             <FormDescription>Comma-separated tags to help categorize your course.</FormDescription>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                     <FormField
//                       control={form.control}
//                       name="category"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Category</FormLabel>
//                           <Select onValueChange={field.onChange} defaultValue={field.value}>
//                             <FormControl>
//                               <SelectTrigger>
//                                 <SelectValue placeholder="Select a category" />
//                               </SelectTrigger>
//                             </FormControl>
//                             <SelectContent>
//                               <SelectItem value="computer-science">Computer Science</SelectItem>
//                               <SelectItem value="mathematics">Mathematics</SelectItem>
//                               <SelectItem value="science">Science</SelectItem>
//                               <SelectItem value="humanities">Humanities</SelectItem>
//                               <SelectItem value="business">Business</SelectItem>
//                               <SelectItem value="arts">Arts</SelectItem>
//                               <SelectItem value="language">Language</SelectItem>
//                               <SelectItem value="other">Other</SelectItem>
//                             </SelectContent>
//                           </Select>
//                           <FormDescription>Select the main category for your course.</FormDescription>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />

//                     <FormField
//                       control={form.control}
//                       name="level"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Difficulty Level</FormLabel>
//                           <Select onValueChange={field.onChange} defaultValue={field.value}>
//                             <FormControl>
//                               <SelectTrigger>
//                                 <SelectValue placeholder="Select a level" />
//                               </SelectTrigger>
//                             </FormControl>
//                             <SelectContent>
//                               <SelectItem value="beginner">Beginner</SelectItem>
//                               <SelectItem value="intermediate">Intermediate</SelectItem>
//                               <SelectItem value="advanced">Advanced</SelectItem>
//                               <SelectItem value="all-levels">All Levels</SelectItem>
//                             </SelectContent>
//                           </Select>
//                           <FormDescription>Indicate the difficulty level of your course.</FormDescription>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </div>

//                   <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                     <FormField
//                       control={form.control}
//                       name="startDate"
//                       render={({ field }) => (
//                         <FormItem className="flex flex-col">
//                           <FormLabel>Start Date</FormLabel>
//                           <Popover>
//                             <PopoverTrigger asChild>
//                               <FormControl>
//                                 <Button
//                                   variant={"outline"}
//                                   className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
//                                 >
//                                   {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
//                                   <CalendarIcon className="w-4 h-4 ml-auto opacity-50" />
//                                 </Button>
//                               </FormControl>
//                             </PopoverTrigger>
//                             <PopoverContent className="w-auto p-0" align="start">
//                               <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
//                             </PopoverContent>
//                           </Popover>
//                           <FormDescription>When will the course be available to students?</FormDescription>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />

//                     <FormField
//                       control={form.control}
//                       name="endDate"
//                       render={({ field }) => (
//                         <FormItem className="flex flex-col">
//                           <FormLabel>End Date</FormLabel>
//                           <Popover>
//                             <PopoverTrigger asChild>
//                               <FormControl>
//                                 <Button
//                                   variant={"outline"}
//                                   className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
//                                 >
//                                   {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
//                                   <CalendarIcon className="w-4 h-4 ml-auto opacity-50" />
//                                 </Button>
//                               </FormControl>
//                             </PopoverTrigger>
//                             <PopoverContent className="w-auto p-0" align="start">
//                               <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
//                             </PopoverContent>
//                           </Popover>
//                           <FormDescription>When will the course end?</FormDescription>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             <TabsContent value="settings">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Course Settings</CardTitle>
//                   <CardDescription>Configure additional settings for your course.</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-6">
//                   <FormField
//                     control={form.control}
//                     name="enrollmentLimit"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Enrollment Limit</FormLabel>
//                         <FormControl>
//                           <Input type="number" placeholder="e.g., 50" {...field} />
//                         </FormControl>
//                         <FormDescription>
//                           Maximum number of students who can enroll (leave empty for unlimited).
//                         </FormDescription>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                     <FormField
//                       control={form.control}
//                       name="isPublic"
//                       render={({ field }) => (
//                         <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
//                           <div className="space-y-0.5">
//                             <FormLabel className="text-base">Public Course</FormLabel>
//                             <FormDescription>Make this course visible in the course catalog.</FormDescription>
//                           </div>
//                           <FormControl>
//                             <Switch checked={field.value} onCheckedChange={field.onChange} />
//                           </FormControl>
//                         </FormItem>
//                       )}
//                     />

//                     <FormField
//                       control={form.control}
//                       name="allowSelfEnrollment"
//                       render={({ field }) => (
//                         <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
//                           <div className="space-y-0.5">
//                             <FormLabel className="text-base">Self Enrollment</FormLabel>
//                             <FormDescription>Allow students to enroll themselves in this course.</FormDescription>
//                           </div>
//                           <FormControl>
//                             <Switch checked={field.value} onCheckedChange={field.onChange} />
//                           </FormControl>
//                         </FormItem>
//                       )}
//                     />
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             <TabsContent value="preview">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Course Preview</CardTitle>
//                   <CardDescription>This is how your course will appear to students.</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="overflow-hidden border rounded-lg">
//                     <div className="flex items-center justify-center h-48 bg-slate-100 dark:bg-slate-800">
//                       <p className="text-slate-400 dark:text-slate-500">Course thumbnail preview</p>
//                     </div>
//                     <div className="p-6 space-y-4">
//                       <h3 className="text-xl font-semibold">{form.watch("title") || "Course Title"}</h3>
//                       <div className="flex flex-wrap gap-2">
//                         {form.watch("category") && (
//                           <Badge
//                             variant="outline"
//                             className="text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800"
//                           >
//                             {form.watch("category").replace("-", " ")}
//                           </Badge>
//                         )}
//                         {form.watch("level") && (
//                           <Badge
//                             variant="outline"
//                             className="text-green-600 border-green-200 bg-green-50 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
//                           >
//                             {form.watch("level")}
//                           </Badge>
//                         )}
//                         {form.watch("tags") &&
//                           form
//                             .watch("tags")
//                             .split(",")
//                             .map((tag, index) => (
//                               <Badge
//                                 key={index}
//                                 variant="outline"
//                                 className="bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-950 dark:text-slate-400 dark:border-slate-800"
//                               >
//                                 {tag.trim()}
//                               </Badge>
//                             ))}
//                       </div>
//                       <p className="text-slate-600 dark:text-slate-300">
//                         {form.watch("description") || "Course description will appear here."}
//                       </p>
//                       <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
//                         {form.watch("startDate") && (
//                           <div>
//                             <span className="font-medium">Starts:</span> {format(form.watch("startDate"), "PPP")}
//                           </div>
//                         )}
//                         {form.watch("endDate") && (
//                           <div>
//                             <span className="font-medium">Ends:</span> {format(form.watch("endDate"), "PPP")}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             <div className="flex justify-end gap-4">
//               <Button type="button" variant="outline" onClick={() => navigate("/teacher")}>
//                 Cancel
//               </Button>
//               <Button type="submit" className="text-white bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
//                 {isSubmitting ? (
//                   <>
//                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                     Creating...
//                   </>
//                 ) : (
//                   <>
//                     <Save className="w-4 h-4 mr-2" />
//                     Create Course
//                   </>
//                 )}
//               </Button>
//             </div>
//           </form>
//         </Form>
//       </Tabs>
//     </div>
//   )
// }

