// "use client"

// import { useState } from "react"
// import { router } from "@inertiajs/react"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import { z } from "zod"
// import { Loader2, Send } from "lucide-react"

// import toast from "sonner"

// import { Button } from "@/Components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
// import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/Components/ui/form"
// import { Input } from "@/Components/ui/input"
// import { Textarea } from "@/Components/ui/textarea"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
// import { Switch } from "@/Components/ui/switch"
// import { Checkbox } from "@/Components/ui/checkbox"

// const announcementFormSchema = z.object({
//   title: z.string().min(3, {
//     message: "Announcement title must be at least 3 characters.",
//   }),
//   message: z.string().min(10, {
//     message: "Announcement message must be at least 10 characters.",
//   }),
//   audience: z.string({
//     required_error: "Please select an audience.",
//   }),
//   courses: z.array(z.string()).optional(),
//   sendEmail: z.boolean().default(false),
//   sendPush: z.boolean().default(false),
//   pinToTop: z.boolean().default(false),
// }).strict();

// type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;

// const defaultValues: AnnouncementFormValues = {
//   title: "",
//   message: "",
//   audience: "",
//   courses: [],
//   sendEmail: false,
//   sendPush: false,
//   pinToTop: false,
// }

// const courses = [
//   { id: "cs101", name: "Introduction to Computer Science" },
//   { id: "ds201", name: "Data Structures and Algorithms" },
//   { id: "web301", name: "Web Development Fundamentals" },
//   { id: "db401", name: "Database Design" },
//   { id: "ai501", name: "Artificial Intelligence" },
// ]

// export default function NewAnnouncementPage() {
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [audienceType, setAudienceType] = useState("all")

// //   const form = useForm<AnnouncementFormValues>({
// //     resolver: zodResolver(announcementFormSchema),
// //     defaultValues,
// //   })

//   function onSubmit(data: AnnouncementFormValues) {
//     setIsSubmitting(true)

//     // Simulate API call
//     setTimeout(() => {

//       setIsSubmitting(false)
//     //   toast(
//     //     message: "Announcement sent successfully",
//     //     description: `Your announcement "${data.title}" has been sent to ${data.audience === "all" ? "all students" : "selected courses"}.`,
//     //   )
//       router.visit("/teacher")
//     }, 1500)
//   }

//   return (
//     <div className="container py-6 space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text">
//           Send Announcement
//         </h1>
//         <p className="text-slate-500 dark:text-slate-400">Create and send an announcement to your students.</p>
//       </div>

//       <Card className="border-0 shadow-md rounded-xl">
//         <CardHeader>
//           <CardTitle>New Announcement</CardTitle>
//           <CardDescription>
//             Your announcement will be displayed in the student dashboard and can be sent via email or push notification.
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//               <FormField
//                 control={form.control}
//                 name="title"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Announcement Title</FormLabel>
//                     <FormControl>
//                       <Input placeholder="Important course update" {...field} />
//                     </FormControl>
//                     <FormDescription>A clear, concise title for your announcement.</FormDescription>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="message"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Announcement Message</FormLabel>
//                     <FormControl>
//                       <Textarea placeholder="Write your announcement message here..." className="min-h-32" {...field} />
//                     </FormControl>
//                     <FormDescription>
//                       The main content of your announcement. You can use basic formatting.
//                     </FormDescription>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="audience"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Audience</FormLabel>
//                     <Select
//                       onValueChange={(value) => {
//                         field.onChange(value)
//                         setAudienceType(value)
//                       }}
//                       defaultValue={field.value}
//                     >
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select audience" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         <SelectItem value="all">All Students</SelectItem>
//                         <SelectItem value="specific">Specific Courses</SelectItem>
//                       </SelectContent>
//                     </Select>
//                     <FormDescription>Choose who will receive this announcement.</FormDescription>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {audienceType === "specific" && (
//                 <FormField
//                   control={form.control}
//                   name="courses"
//                   render={() => (
//                     <FormItem>
//                       <div className="mb-4">
//                         <FormLabel>Select Courses</FormLabel>
//                         <FormDescription>Choose which courses will receive this announcement.</FormDescription>
//                       </div>
//                       <div className="space-y-2">
//                         {courses.map((course) => (
//                           <FormField
//                             key={course.id}
//                             control={form.control}
//                             name="courses"
//                             render={({ field }) => {
//                               return (
//                                 <FormItem key={course.id} className="flex flex-row items-start space-x-3 space-y-0">
//                                   <FormControl>
//                                     <Checkbox
//                                       checked={field.value?.includes(course.id)}
//                                       onCheckedChange={(checked) => {
//                                         const updatedCourses = checked
//                                           ? [...(field.value || []), course.id]
//                                           : (field.value || []).filter((value) => value !== course.id)
//                                         field.onChange(updatedCourses)
//                                       }}
//                                     />
//                                   </FormControl>
//                                   <FormLabel className="font-normal cursor-pointer">{course.name}</FormLabel>
//                                 </FormItem>
//                               )
//                             }}
//                           />
//                         ))}
//                       </div>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               )}

//               <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
//                 <FormField
//                   control={form.control}
//                   name="sendEmail"
//                   render={({ field }) => (
//                     <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
//                       <div className="space-y-0.5">
//                         <FormLabel className="text-base">Email Notification</FormLabel>
//                         <FormDescription>Send this announcement via email.</FormDescription>
//                       </div>
//                       <FormControl>
//                         <Switch checked={field.value} onCheckedChange={field.onChange} />
//                       </FormControl>
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="sendPush"
//                   render={({ field }) => (
//                     <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
//                       <div className="space-y-0.5">
//                         <FormLabel className="text-base">Push Notification</FormLabel>
//                         <FormDescription>Send as a push notification.</FormDescription>
//                       </div>
//                       <FormControl>
//                         <Switch checked={field.value} onCheckedChange={field.onChange} />
//                       </FormControl>
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="pinToTop"
//                   render={({ field }) => (
//                     <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
//                       <div className="space-y-0.5">
//                         <FormLabel className="text-base">Pin to Top</FormLabel>
//                         <FormDescription>Pin this announcement to the top.</FormDescription>
//                       </div>
//                       <FormControl>
//                         <Switch checked={field.value} onCheckedChange={field.onChange} />
//                       </FormControl>
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               <div className="flex justify-end gap-4">
//                 <Button type="button" variant="outline" onClick={() => router.back()}>
//                   Cancel
//                 </Button>
//                 <Button type="submit" className="text-white bg-amber-600 hover:bg-amber-700" disabled={isSubmitting}>
//                   {isSubmitting ? (
//                     <>
//                       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                       Sending...
//                     </>
//                   ) : (
//                     <>
//                       <Send className="w-4 h-4 mr-2" />
//                       Send Announcement
//                     </>
//                   )}
//                 </Button>
//               </div>
//             </form>
//           </Form>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
