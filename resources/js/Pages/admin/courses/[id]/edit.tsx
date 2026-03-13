"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Head, router } from "@inertiajs/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Textarea } from "@/Components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import AdminPageLayout from "../../layout"
import { toast } from "sonner"
import { ArrowLeft, Loader2, SaveIcon, Trash2, Plus, Video, FileText, Brain, BookOpen, X, Check, Upload } from "lucide-react"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/Components/ui/form"
import { useForm, type FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import axios from "axios"
import { getFirstMessage } from "@/lib/api-messages"
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group"
import { Badge } from "@/Components/ui/badge"
import { cn, toAbsoluteAssetUrl } from "@/lib/utils"

interface Mapel {
  id: number
  nama_mapel: string
}

interface CourseContent {
  id: number
  type: "video" | "quiz" | "pdf"
  title: string
  description?: string
  url?: string | any
  quiz_data?: {
    timeLimit?: number;
    passingScore?: number;
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
    }>;
  };
  one_submission_only?: boolean;
  order: number
}

interface SubPembahasan {
  id: number
  title: string
  description: string
  video_title?: string
  video_description?: string
  url_video_sub_pembahasan?: string
  pdf_title?: string
  pdf_description?: string
  url_materi_pdf_sub_pembahasan?: string
  quiz_title?: string
  quiz_description?: string
  order: number
  contents: CourseContent[]
}

interface Course {
  id: number
  id_mapel: number
  judul_kursus: string
  deskripsi_kursus: string
  url_thumbnail: string
  created_at: string
  mapel: Mapel
  status: string
  is_featured: boolean
  class?: string[]
  sub_pembahasan: SubPembahasan[]
}

interface Props {
  course: Course
  mapel: Mapel[]
  availableClasses?: string[]
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  imageUrl?: string; // Keep this line for image support
  optionImages?: (string | null)[]; // Add this line for option images support
}

interface QuizData {
  timeLimit?: number;
  passingScore?: number;
  questions: QuizQuestion[];
}

const courseFormSchema = z.object({
  id_mapel: z.string({
    required_error: "Please select a subject.",
  }),
  judul_kursus: z
    .string()
    .min(3, {
      message: "Course title must be at least 3 characters.",
    })
    .max(255, {
      message: "Course title must not exceed 255 characters.",
    }),
  deskripsi_kursus: z
    .string()
    .min(10, {
      message: "Course description must be at least 10 characters.",
    })
    .max(1000, {
      message: "Course description must not exceed 1000 characters.",
    }),
  thumbnail: z.any().optional(),
  url_thumbnail: z.any().optional(),
  keep_existing_thumbnail: z.boolean().default(true),
  status: z.enum(["draft", "published"]).default("draft"),
  contentTypes: z.array(z.enum(["video", "pdf", "quiz"])).default(["video", "pdf", "quiz"]),
  prerequisites: z.array(z.string()).optional(),
  learning_objectives: z.array(z.string()).optional(),
  target_audience: z.array(z.string()).optional(),
  class: z.array(z.string()).optional(),
  is_featured: z.boolean().default(false),
  pembahasan: z
    .array(
      z.object({
        title: z.string().min(3, {
          message: "Section title must be at least 3 characters.",
        }),
        description: z.string().min(10, {
          message: "Section description must be at least 10 characters.",
        }),
        contents: z.array(
          z.object({
            type: z.enum(["video", "pdf", "quiz"]),
            title: z.string().min(3, {
              message: "Content title must be at least 3 characters.",
            }).optional(), // Make title optional to fix validation issue
            description: z.string().min(10, {
              message: "Content description must be at least 10 characters.",
            }).optional(), // Make description optional to fix validation issue
            url: z.any().optional(),
            is_required: z.boolean().default(true),
            points: z.number().optional(),
            passing_score: z.number().optional(),
            quiz_data: z.object({
              timeLimit: z.number().optional(),
              passingScore: z.number().optional(),
              questions: z.array(
                z.object({
                  question: z.string().optional(),
                  options: z.array(z.string()).length(4, {
                    message: "Quiz must have exactly 4 options.",
                  }),
                  correctAnswer: z.number().min(0).max(3),
                  imageUrl: z.string().optional(), // Keep this line for image support
                  optionImages: z.array(z.string().nullable()).optional(), // Add this line for option images support
                }),
              )
            }).optional(),
            one_submission_only: z.boolean().default(false).optional(),
            show_grades: z.boolean().default(true).optional(),
          }),
        ),
      }),
    )
    .optional(),
})

type CourseFormValues = z.infer<typeof courseFormSchema>
type EditTab = "details" | "content" | "preview"

function mapCourseToFormValues(course: Props["course"]): CourseFormValues {


  // Map from sub_pembahasan structure to form values
  const pembahasan =
    course.sub_pembahasan?.map((sub) => {


      // Map contents from the contents array
      const contents =
        sub.contents?.map((content) => {


          let quiz_data = undefined

          // Handle quiz data parsing - FIXED to properly handle the JSON structure
          if (content.type === "quiz" && content.quiz_data) {
            try {
              if (typeof content.quiz_data === "string") {
                const parsedData = JSON.parse(content.quiz_data)
                // Handle the new structure with timeLimit, passingScore, and questions
                if (parsedData.questions) {
                  quiz_data = {
                    timeLimit: parsedData.timeLimit || 30,
                    passingScore: parsedData.passingScore || 70,
                    questions: parsedData.questions.map((q: any) => ({
                      question: q.question || "",
                      options: q.options || ["", "", "", ""],
                      correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
                      imageUrl: q.imageUrl || undefined, // Keep this line for image support
                      optionImages: q.optionImages || [null, null, null, null], // Add this line for option images support
                    }))
                  }
                } else {
                  // Handle legacy format
                  const legacyQuestions = Array.isArray(parsedData) ? parsedData : [parsedData]
                  quiz_data = {
                    timeLimit: 30,
                    passingScore: 70,
                    questions: legacyQuestions.map((q: any) => ({
                      question: q.question || "",
                      options: q.options || ["", "", "", ""],
                      correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
                      imageUrl: q.imageUrl || undefined, // Keep this line for image support
                      optionImages: q.optionImages || [null, null, null, null], // Add this line for option images support
                    }))
                  }
                }
              } else if (typeof content.quiz_data === "object" && content.quiz_data !== null) {
                // Handle object format directly
                if ((content.quiz_data as any).questions) {
                  quiz_data = {
                    timeLimit: (content.quiz_data as any).timeLimit || 30,
                    passingScore: (content.quiz_data as any).passingScore || 70,
                    questions: (content.quiz_data as any).questions.map((q: any) => ({
                      question: q.question || "",
                      options: q.options || ["", "", "", ""],
                      correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
                      imageUrl: q.imageUrl || undefined, // Keep this line for image support
                      optionImages: q.optionImages || [null, null, null, null], // Add this line for option images support
                    }))
                  }
                } else {
                  // Handle legacy format
                  const legacyQuestions = Array.isArray(content.quiz_data) ? content.quiz_data : [content.quiz_data]
                  quiz_data = {
                    timeLimit: 30,
                    passingScore: 70,
                    questions: legacyQuestions.map((q: any) => ({
                      question: q.question || "",
                      options: q.options || ["", "", "", ""],
                      correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
                      imageUrl: q.imageUrl || undefined, // Keep this line
                      optionImages: q.optionImages || [null, null, null, null], // Add this line for option images support
                    }))
                  }
                }
              }
            } catch (error) {

              quiz_data = {
                timeLimit: 30,
                passingScore: 70,
                questions: [
                  {
                    question: "",
                    options: ["", "", "", ""],
                    correctAnswer: 0,
                    imageUrl: undefined, // Add this line for image support
                    optionImages: [null, null, null, null], // Add this line for option images support
                  },
                ]
              }
            }
          }

          return {
            type: content.type,
            title: content.title || `${content.type} Title`,
            description: content.description || `${content.type} description here`,
            url: content.url || "",
            is_required: true,
            points: 0,
            passing_score: 0,
            one_submission_only: content.one_submission_only || false,
            quiz_data: quiz_data,
          }
        }) || []

      // If no contents exist, create default structure
      if (contents.length === 0) {
        contents.push(
          {
            type: "video" as const,
            title: "Video Title",
            description: "Video description here",
            url: "",
            is_required: true,
            points: 0,
            passing_score: 0,
            one_submission_only: false,
            quiz_data: undefined,
          },
          {
            type: "pdf" as const,
            title: "PDF Title",
            description: "PDF description here",
            url: "",
            is_required: true,
            points: 0,
            passing_score: 0,
            one_submission_only: false,
            quiz_data: undefined,
          },
          {
            type: "quiz" as const,
            title: "Quiz Title",
            description: "Quiz description here",
            url: "",
            is_required: true,
            points: 0,
            passing_score: 0,
            one_submission_only: false,
            quiz_data: {
              timeLimit: 30,
              passingScore: 70,
              questions: [
                {
                  question: "",
                  options: ["", "", "", ""],
                  correctAnswer: 0,
                  imageUrl: undefined,
                  optionImages: [null, null, null, null],
                },
              ],
            },
          },
        )
      }

      return {
        title: sub.title,
        description: sub.description,
        contents: contents,
      }
    }) || []

  return {
    id_mapel: course.id_mapel.toString(),
    judul_kursus: course.judul_kursus,
    deskripsi_kursus: course.deskripsi_kursus,
    url_thumbnail: course.url_thumbnail,
    keep_existing_thumbnail: true,
    status: course.status === "published" ? "published" : "draft",
    contentTypes: ["video", "pdf", "quiz"],
    class: course.class || [],
    is_featured: course.is_featured || false,
    pembahasan: pembahasan,
  }
}

export default function EditCoursePage({ course, mapel, availableClasses = [] }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<EditTab>("details")
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [thumbnailStatus, setThumbnailStatus] = useState<"existing" | "new" | "removed">("existing")

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema) as any,
    defaultValues: mapCourseToFormValues(course),
  })

  // Helper function to get thumbnail URL
  const getThumbnailUrl = (course: Course) => {
    return toAbsoluteAssetUrl(course.url_thumbnail, '/placeholder.svg?height=128&width=192')
  }

  // Handle thumbnail change
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string)
        setThumbnailStatus("new")
      }
      reader.readAsDataURL(file)
      form.setValue('thumbnail', file)
      form.setValue('keep_existing_thumbnail', false)
    }
  }

  // Handle file upload for PDF content
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf', pembahasanIndex: number, contentIndex: number) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (10MB for PDF)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('PDF file size must be less than 10MB')
      return
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file')
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post('/admin/courses/upload-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })

      if (response.data.status === 'success') {
        // Convert the storage path to a full URL
        const fullUrl = toAbsoluteAssetUrl(response.data.url)
        form.setValue(`pembahasan.${pembahasanIndex}.contents.${contentIndex}.url`, fullUrl)
        toast.success(getFirstMessage(response.data, 'PDF uploaded successfully'))
      } else {
        toast.error(getFirstMessage(response.data, 'Failed to upload PDF'))
      }
    } catch (error: any) {

      toast.error(getFirstMessage(error.response?.data, 'Failed to upload PDF'))
    }
  }

  const handleSubmit = async (values: CourseFormValues) => {
    setIsSubmitting(true)

    try {


      const formData = new FormData()
      formData.append("_method", "PUT")
      formData.append("id_mapel", String(values.id_mapel))
      formData.append("judul_kursus", String(values.judul_kursus))
      formData.append("deskripsi_kursus", String(values.deskripsi_kursus))
      formData.append("status", String(values.status))

      // Handle boolean values properly for Laravel
      formData.append("keep_existing_thumbnail", values.keep_existing_thumbnail ? "1" : "0")
      formData.append("is_featured", values.is_featured ? "1" : "0")

      if (values.thumbnail instanceof File) {
        formData.append("thumbnail", values.thumbnail)
      }

      // Process pembahasan data to ensure quiz_data is properly formatted
      const processedPembahasan = (values.pembahasan ?? []).map(pembahasan => ({
        ...pembahasan,
        contents: pembahasan.contents.map(content => {
          if (content.type === "quiz" && content.quiz_data) {
            // Format quiz data to match the expected structure
            return {
              ...content,
              quiz_data: {
                timeLimit: content.quiz_data.timeLimit || 30,
                passingScore: content.quiz_data.passingScore || 70,
                questions: content.quiz_data.questions.map((q) => ({
                  question: q.question,
                  options: q.options,
                  correctAnswer: q.correctAnswer,
                  imageUrl: q.imageUrl || undefined, // Keep this line for image support
                  optionImages: q.optionImages || [null, null, null, null], // Add this line for option images support
                }))
              }
            }
          }
          return content
        })
      }))

      formData.append("pembahasan", JSON.stringify(processedPembahasan))

      // Add class data
      const classData = form.getValues("class") || [];
      formData.append("class", JSON.stringify(classData))

      const response = await axios.post(`/admin/courses/${course.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.status === "success") {
        toast.success(getFirstMessage(response.data, "Course updated successfully"))
        router.visit(`/admin/courses/${course.id}`)
      } else {
        toast.error(getFirstMessage(response.data, "Failed to update course"))
      }
    } catch (error: any) {

      if (error.response?.data?.errors) {

        // Show specific validation errors in a more user-friendly way
        let errorCount = 0
        Object.keys(error.response.data.errors).forEach((field) => {
          const messages = error.response.data.errors[field]
          messages.forEach((message: any) => {
            // Limit the number of toast notifications to avoid overwhelming the user
            if (errorCount < 5) {
              toast.error(`${field}: ${message}`, {
                duration: 5000,
              })
              errorCount++
            }
          })
        })

        // Log the full error response for debugging


        // If there are more than 5 errors, show a summary message
        if (errorCount >= 5) {
          toast.error(`There are ${Object.keys(error.response.data.errors).length} validation errors. Please check the form and try again.`)
        }

        // Scroll to the first error field
        const firstErrorField = Object.keys(error.response.data.errors)[0]
        const element = document.querySelector(`[name="${firstErrorField}"]`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // Add a temporary highlight effect
          element.classList.add('ring-2', 'ring-red-500')
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-red-500')
          }, 2000)
        }
      } else {
        toast.error(getFirstMessage(error.response?.data, "Error updating course"))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const findFirstErrorPath = (errors: Record<string, unknown>, prefix = ""): string | null => {
    for (const [key, value] of Object.entries(errors)) {
      if (!value) {
        continue
      }

      const path = prefix ? `${prefix}.${key}` : key

      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i += 1) {
          const item = value[i]
          if (item && typeof item === "object") {
            const nestedPath = findFirstErrorPath(item as Record<string, unknown>, `${path}.${i}`)
            if (nestedPath) {
              return nestedPath
            }
          }
        }
        continue
      }

      if (typeof value === "object") {
        const maybeFieldError = value as { message?: unknown }
        if (typeof maybeFieldError.message === "string" && maybeFieldError.message.length > 0) {
          return path
        }

        const nestedPath = findFirstErrorPath(value as Record<string, unknown>, path)
        if (nestedPath) {
          return nestedPath
        }
      }
    }

    return null
  }

  const handleInvalidSubmit = (errors: FieldErrors<CourseFormValues>) => {
    const firstErrorPath = findFirstErrorPath(errors as Record<string, unknown>)

    if (firstErrorPath?.startsWith("pembahasan")) {
      setActiveTab("content")
    } else {
      setActiveTab("details")
    }

    toast.error("Form belum valid. Periksa field yang wajib diisi sebelum update.")
  }

  useEffect(() => {

  }, [form.formState.errors])


  return (
    <AdminPageLayout>
      <Head title={`Edit Course: ${course.judul_kursus}`} />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="outline" onClick={() => router.visit(`/admin/courses/${course.id}`)} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Course
            </Button>
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-red-700 to-red-500 bg-clip-text">
              Edit Course
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Update course information and content</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as EditTab)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="details">Course Details</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit, handleInvalidSubmit)} className="space-y-8">
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Update the basic details about your course.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="id_mapel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a subject" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mapel.map((item) => (
                                <SelectItem key={item.id} value={item.id.toString()}>
                                  {item.nama_mapel}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="judul_kursus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter course title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deskripsi_kursus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter course description" className="min-h-[100px]" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Enhanced Thumbnail Section */}
                    <div className="space-y-4">
                      <FormLabel>Thumbnail</FormLabel>

                      {/* Current Thumbnail Display */}
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <img
                            src={thumbnailPreview || getThumbnailUrl(course)}
                            alt={course.judul_kursus}
                            className="object-cover w-48 h-32 rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;

                              target.src = '/placeholder.svg?height=128&width=192';
                            }}
                          />
                          <div className="absolute top-2 right-2">
                            <Badge
                              variant={
                                thumbnailStatus === "existing"
                                  ? "default"
                                  : thumbnailStatus === "new"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {thumbnailStatus === "existing"
                                ? "Existing"
                                : thumbnailStatus === "new"
                                  ? "New"
                                  : "Removed"}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex-1 space-y-4">
                          <FormField
                            control={form.control}
                            name="keep_existing_thumbnail"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={(e) => {
                                      field.onChange(e.target.checked);
                                      if (!e.target.checked) {
                                        setThumbnailStatus("removed");
                                      } else if (thumbnailPreview) {
                                        setThumbnailStatus("new");
                                      } else {
                                        setThumbnailStatus("existing");
                                      }
                                    }}
                                    className="w-4 h-4 border-gray-300 rounded text-slate-600 focus:ring-slate-500"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Keep existing thumbnail</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />

                          <div className="space-y-2">
                            <FormLabel>Upload new thumbnail</FormLabel>
                            <div className="flex items-center gap-2">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleThumbnailChange}
                                className="flex-1"
                                disabled={!form.watch("keep_existing_thumbnail")}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  form.setValue("keep_existing_thumbnail", false);
                                  setThumbnailStatus("removed");
                                  setThumbnailPreview(null);
                                }}
                                disabled={thumbnailStatus === "removed"}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Class Assignment Section */}
                    {availableClasses && availableClasses.length > 0 && (
                      <div className="space-y-4">
                        <FormLabel>Assign Classes</FormLabel>
                        <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                            {availableClasses.map((className: string) => (
                              <div key={className} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`class-${className}`}
                                  checked={form.watch("class")?.includes(className) || false}
                                  onChange={(e) => {
                                    const currentClasses = form.watch("class") || [];
                                    if (e.target.checked) {
                                      form.setValue("class", [...currentClasses, className]);
                                    } else {
                                      form.setValue(
                                        "class",
                                        currentClasses.filter((c: string) => c !== className)
                                      );
                                    }
                                  }}
                                  className="w-4 h-4 border-gray-300 rounded text-slate-600 focus:ring-slate-500"
                                />
                                <label
                                  htmlFor={`class-${className}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {className}
                                </label>
                              </div>
                            ))}
                          </div>
                          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Select the classes that should have access to this course.
                          </p>
                        </div>
                      </div>
                    )}

                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Content</CardTitle>
                    <CardDescription>Organize your course content by sub-topics and learning materials.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {form.watch("pembahasan")?.map((pembahasan, pembahasanIndex) => (
                      <Card key={pembahasanIndex} className="border-l-4 border-l-red-500">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-red-100 rounded-md dark:bg-red-900/20">
                                <BookOpen className="w-5 h-5 text-red-600" />
                              </div>
                              <div>
                                <CardTitle>
                                  Sub-Topic {pembahasanIndex + 1}: {pembahasan.title}
                                </CardTitle>
                                <CardDescription>{pembahasan.description}</CardDescription>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const current = form.getValues("pembahasan") || []
                                current.splice(pembahasanIndex, 1)
                                form.setValue("pembahasan", current)
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FormField
                              control={form.control}
                              name={`pembahasan.${pembahasanIndex}.title`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Sub-Topic Title</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter sub-topic title" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`pembahasan.${pembahasanIndex}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="Enter sub-topic description" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-lg font-medium">Learning Materials</h4>
                            {pembahasan.contents.map((content, contentIndex) => (
                              <Card key={contentIndex} className="border-l-4 border-l-blue-500">
                                <CardHeader>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      {content.type === "video" && <Video className="w-5 h-5 text-blue-600" />}
                                      {content.type === "pdf" && <FileText className="w-5 h-5 text-blue-600" />}
                                      {content.type === "quiz" && <Brain className="w-5 h-5 text-blue-600" />}
                                      <div>
                                        <CardTitle className="text-lg capitalize">
                                          {content.type} Content
                                        </CardTitle>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary" className="capitalize">
                                        {content.type}
                                      </Badge>
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                          const currentContents =
                                            form.getValues(`pembahasan.${pembahasanIndex}.contents`) || []
                                          currentContents.splice(contentIndex, 1)
                                          form.setValue(`pembahasan.${pembahasanIndex}.contents`, currentContents)
                                        }}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <FormField
                                      control={form.control}
                                      name={`pembahasan.${pembahasanIndex}.contents.${contentIndex}.title`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Title</FormLabel>
                                          <FormControl>
                                            <Input placeholder="Enter content title" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`pembahasan.${pembahasanIndex}.contents.${contentIndex}.description`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Description</FormLabel>
                                          <FormControl>
                                            <Textarea placeholder="Enter content description" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>

                                  {/* URL or file upload for video/pdf */}
                                  {(content.type === "video" || content.type === "pdf") && (
                                    <FormField
                                      control={form.control}
                                      name={`pembahasan.${pembahasanIndex}.contents.${contentIndex}.url`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>
                                            {content.type === "video" ? "YouTube URL" : "PDF File"}
                                          </FormLabel>
                                          <FormControl>
                                            {content.type === "video" ? (
                                              <Input
                                                placeholder="Enter YouTube video URL"
                                                value={field.value || ""}
                                                onChange={field.onChange}
                                              />
                                            ) : (
                                              <div className="space-y-2">
                                                <FormControl>
                                                  <Input
                                                    type="file"
                                                    accept=".pdf"
                                                    onChange={(e) => {
                                                      handleFileChange(e, "pdf", pembahasanIndex, contentIndex)
                                                    }}
                                                  />
                                                </FormControl>
                                                {field.value && (
                                                  <div className="flex items-center gap-2 p-2 border border-green-200 rounded-md bg-green-50">
                                                    <FileText className="w-4 h-4 text-green-600" />
                                                    <span className="text-sm text-green-700">
                                                      PDF uploaded successfully
                                                    </span>
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  )}


                                  {/* Quiz data for quiz */}
                                  {content.type === "quiz" && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <FormField
                                          control={form.control}
                                          name={`pembahasan.${pembahasanIndex}.contents.${contentIndex}.title`}
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Quiz Title</FormLabel>
                                              <FormControl>
                                                <Input placeholder="Enter quiz title" {...field} />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                        <FormField
                                          control={form.control}
                                          name={`pembahasan.${pembahasanIndex}.contents.${contentIndex}.description`}
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Quiz Description</FormLabel>
                                              <FormControl>
                                                <Textarea placeholder="Enter quiz description" {...field} />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                      </div>

                                      <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium">Quiz Questions</h4>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            const currentQuizData =
                                              form.getValues(
                                                `pembahasan.${pembahasanIndex}.contents.${contentIndex}.quiz_data`,
                                              )

                                            if (currentQuizData) {
                                              const updatedQuestions = [...(currentQuizData.questions || [])]
                                              updatedQuestions.push({
                                                question: "",
                                                options: ["", "", "", ""],
                                                correctAnswer: 0,
                                                imageUrl: undefined,
                                                optionImages: [null, null, null, null],
                                              })

                                              const updatedQuizData = {
                                                ...currentQuizData,
                                                questions: updatedQuestions,
                                              }

                                              form.setValue(
                                                `pembahasan.${pembahasanIndex}.contents.${contentIndex}.quiz_data`,
                                                updatedQuizData,
                                              )
                                            }
                                          }}
                                        >
                                          <Plus className="w-4 h-4 mr-2" />
                                          Add Question
                                        </Button>
                                      </div>

                                      {form
                                        .watch(`pembahasan.${pembahasanIndex}.contents.${contentIndex}.quiz_data`)?.questions
                                        ?.map((question: any, questionIndex: number) => (
                                          <Card key={questionIndex} className="p-4">
                                            <div className="flex items-center justify-between mb-4">
                                              <h5 className="font-medium">Question {questionIndex + 1}</h5>
                                              <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => {
                                                  const currentQuizData =
                                                    form.getValues(
                                                      `pembahasan.${pembahasanIndex}.contents.${contentIndex}.quiz_data`,
                                                    )

                                                  if (currentQuizData) {
                                                    const updatedQuestions = [...(currentQuizData.questions || [])]
                                                    updatedQuestions.splice(questionIndex, 1)

                                                    const updatedQuizData = {
                                                      ...currentQuizData,
                                                      questions: updatedQuestions,
                                                    }

                                                    form.setValue(
                                                      `pembahasan.${pembahasanIndex}.contents.${contentIndex}.quiz_data`,
                                                      updatedQuizData,
                                                    )
                                                  }
                                                }}
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </Button>
                                            </div>
                                            <div className="space-y-4">
                                              {/* Image Upload for Question */}
                                              <div className="space-y-2">
                                                <FormLabel>Question Image (Optional)</FormLabel>
                                                {question.imageUrl ? (
                                                  <div className="relative">
                                                    <img
                                                      src={question.imageUrl}
                                                      alt="Question"
                                                      className="object-contain max-h-48 rounded-lg"
                                                    />
                                                    <Button
                                                      type="button"
                                                      variant="destructive"
                                                      size="sm"
                                                      className="absolute top-2 right-2"
                                                      onClick={() => {
                                                        const currentQuizData = form.getValues(`pembahasan.${pembahasanIndex}.contents.${contentIndex}.quiz_data`);
                                                        if (currentQuizData) {
                                                          const updatedQuestions = [...currentQuizData.questions];
                                                          updatedQuestions[questionIndex] = {
                                                            ...updatedQuestions[questionIndex],
                                                            imageUrl: undefined
                                                          } as QuizQuestion;
                                                          form.setValue(`pembahasan.${pembahasanIndex}.contents.${contentIndex}.quiz_data`, {
                                                            ...currentQuizData,
                                                            questions: updatedQuestions
                                                          });
                                                        }
                                                      }}
                                                    >
                                                      Remove
                                                    </Button>
                                                  </div>
                                                ) : (
                                                  <div className="flex items-center justify-center w-full">
                                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-slate-300 hover:border-blue-500">
                                                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <Upload className="w-8 h-8 mb-2 text-slate-500" />
                                                        <p className="text-sm text-slate-500">
                                                          <span className="font-semibold">Click to upload</span> an image
                                                        </p>
                                                      </div>
                                                      <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={async (e) => {
                                                          const file = e.target.files?.[0];
                                                          if (!file) return;

                                                          // Validate file type
                                                          if (!file.type.startsWith('image/')) {
                                                            toast.error("Please upload an image file (JPEG, PNG, GIF, or WebP)");
                                                            return;
                                                          }

                                                          // Validate file size (max 5MB)
                                                          if (file.size > 5 * 1024 * 1024) {
                                                            toast.error("Image size must be less than 5MB");
                                                            return;
                                                          }

                                                          try {
                                                            const formData = new FormData();
                                                            formData.append('file', file);

                                                            // Use the new image upload endpoint
                                                            const response = await axios.post('/admin/courses/upload-image', formData, {
                                                              headers: {
                                                                'Content-Type': 'multipart/form-data',
                                                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                                                              }
                                                            });

                                                            if (response.data.status === 'success') {
                                                              const fullUrl = toAbsoluteAssetUrl(response.data.url);
                                                              const currentQuizData = form.getValues(`pembahasan.${pembahasanIndex}.contents.${contentIndex}.quiz_data`);
                                                              if (currentQuizData) {
                                                                const updatedQuestions = [...currentQuizData.questions];
                                                                updatedQuestions[questionIndex] = {
                                                                  ...updatedQuestions[questionIndex],
                                                                  imageUrl: fullUrl
                                                                };
                                                                form.setValue(`pembahasan.${pembahasanIndex}.contents.${contentIndex}.quiz_data`, {
                                                                  ...currentQuizData,
                                                                  questions: updatedQuestions
                                                                });
                                                              }
                                                              toast.success(getFirstMessage(response.data, 'Image uploaded successfully'));
                                                            } else {
                                                              toast.error(getFirstMessage(response.data, 'Failed to upload image'));
                                                            }
                                                          } catch (error: any) {

                                                            toast.error(getFirstMessage(error.response?.data, 'Failed to upload image'));
                                                          }
                                                        }}
                                                      />
                                                    </label>
                                                  </div>
                                                )}
                                              </div>

                                              <FormField
                                                control={form.control}
                                                name={`pembahasan.${pembahasanIndex}.contents.${contentIndex}.quiz_data.questions.${questionIndex}.question`}
                                                render={({ field }) => (
                                                  <FormItem>
                                                    <FormLabel>Question Text</FormLabel>
                                                    <div className="space-y-2">
                                                      <div className="flex gap-2">
                                                        <FormControl>
                                                          <Textarea
                                                            placeholder="Enter your question"
                                                            className="min-h-[80px]"
                                                            {...field}
                                                          />
                                                        </FormControl>
                                                      </div>
                                                    </div>
                                                    <FormMessage />
                                                  </FormItem>
                                                )}
                                              />
                                              <div className="space-y-2">
                                                <FormLabel>Options</FormLabel>
                                                {(question.options || []).map((_: any, optionIndex: number) => (
                                                  <div key={optionIndex}>
                                                    <div className="flex items-center gap-2">
                                                      <FormField
                                                        control={form.control}
                                                        name={`pembahasan.${pembahasanIndex}.contents.${contentIndex}.quiz_data.questions.${questionIndex}.options.${optionIndex}`}
                                                        render={({ field }) => (
                                                          <FormItem className="flex-1">
                                                            <div className="space-y-2">
                                                              <FormControl>
                                                                <Input
                                                                  placeholder={`Option ${optionIndex + 1}`}
                                                                  {...field}
                                                                />
                                                              </FormControl>
                                                            </div>
                                                            <FormMessage />
                                                          </FormItem>
                                                        )}
                                                      />
                                                      <FormField
                                                        control={form.control}
                                                        name={`pembahasan.${pembahasanIndex}.contents.${contentIndex}.quiz_data.questions.${questionIndex}.correctAnswer`}
                                                        render={({ field }) => (
                                                          <FormItem>
                                                            <FormControl>
                                                              <RadioGroup
                                                                value={field.value?.toString() ?? ''}
                                                                onValueChange={(value) =>
                                                                  field.onChange(Number.parseInt(value))
                                                                }
                                                                className="flex items-center"
                                                              >
                                                                <RadioGroupItem value={optionIndex.toString()} />
                                                              </RadioGroup>
                                                            </FormControl>
                                                          </FormItem>
                                                        )}
                                                      />
                                                    </div>
                                                    <div className="ml-8 mt-2">
                                                      <FormLabel className="text-xs">Option Image (Optional)</FormLabel>
                                                      {question.optionImages?.[optionIndex] ? (
                                                        <div className="relative mt-1">
                                                          <img
                                                            src={question.optionImages[optionIndex] || ""}
                                                            alt={`Option ${optionIndex + 1}`}
                                                            className="object-contain max-h-32 rounded-lg"
                                                          />
                                                          <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="sm"
                                                            className="absolute top-1 right-1"
                                                            onClick={() => {
                                                              const currentQuizData = form.getValues(`pembahasan.${pembahasanIndex}.contents.${contentIndex}.quiz_data`)
                                                              if (currentQuizData) {
                                                                const updatedQuestions = [...currentQuizData.questions]
                                                                const updatedOptionImages = [...(updatedQuestions[questionIndex].optionImages || [null, null, null, null])]
                                                                updatedOptionImages[optionIndex] = null
                                                                updatedQuestions[questionIndex] = {
                                                                  ...updatedQuestions[questionIndex],
                                                                  optionImages: updatedOptionImages
                                                                }
                                                                form.setValue(`pembahasan.${pembahasanIndex}.contents.${contentIndex}.quiz_data`, {
                                                                  ...currentQuizData,
                                                                  questions: updatedQuestions
                                                                })
                                                              }
                                                            }}
                                                          >
                                                            Remove
                                                          </Button>
                                                        </div>
                                                      ) : (
                                                        <div className="flex items-center justify-center w-full mt-1">
                                                          <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed rounded-lg cursor-pointer border-slate-300 hover:border-blue-500">
                                                            <div className="flex flex-col items-center justify-center pt-2 pb-2">
                                                              <Upload className="w-6 h-6 text-slate-500" />
                                                              <p className="text-xs text-slate-500">
                                                                <span className="font-semibold">Upload</span> image
                                                              </p>
                                                            </div>
                                                            <input
                                                              type="file"
                                                              className="hidden"
                                                              accept="image/*"
                                                              onChange={async (e) => {
                                                                const file = e.target.files?.[0]
                                                                if (!file) return

                                                                if (!file.type.startsWith('image/')) {
                                                                  toast.error("Please upload an image file (JPEG, PNG, GIF, or WebP)")
                                                                  return
                                                                }

                                                                if (file.size > 5 * 1024 * 1024) {
                                                                  toast.error("Image size must be less than 5MB")
                                                                  return
                                                                }

                                                                try {
                                                                  const formData = new FormData()
                                                                  formData.append('file', file)

                                                                  const response = await axios.post('/admin/courses/upload-image', formData, {
                                                                    headers: {
                                                                      'Content-Type': 'multipart/form-data',
                                                                      'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                                                                    }
                                                                  })

                                                                  if (response.data.status === 'success') {
                                                                    const fullUrl = toAbsoluteAssetUrl(response.data.url)
                                                                    const currentQuizData = form.getValues(`pembahasan.${pembahasanIndex}.contents.${contentIndex}.quiz_data`)
                                                                    if (currentQuizData) {
                                                                      const updatedQuestions = [...currentQuizData.questions]
                                                                      const updatedOptionImages = [...(updatedQuestions[questionIndex].optionImages || [null, null, null, null])]
                                                                      updatedOptionImages[optionIndex] = fullUrl
                                                                      updatedQuestions[questionIndex] = {
                                                                        ...updatedQuestions[questionIndex],
                                                                        optionImages: updatedOptionImages
                                                                      }
                                                                      form.setValue(`pembahasan.${pembahasanIndex}.contents.${contentIndex}.quiz_data`, {
                                                                        ...currentQuizData,
                                                                        questions: updatedQuestions
                                                                      })
                                                                    }
                                                                    toast.success(getFirstMessage(response.data, 'Image uploaded successfully'))
                                                                  } else {
                                                                    toast.error(getFirstMessage(response.data, 'Failed to upload image'))
                                                                  }
                                                                } catch (error: any) {
                                                                  toast.error(getFirstMessage(error.response?.data, 'Failed to upload image'))
                                                                }
                                                              }}
                                                            />
                                                          </label>
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          </Card>
                                        ))}
                                    </div>
                                  )}

                                  {/* Time Limit and One Submission Only fields for quiz */}
                                  {content.type === "quiz" && (
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                      <FormField
                                        control={form.control}
                                        name={`pembahasan.${pembahasanIndex}.contents.${contentIndex}.quiz_data.timeLimit`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Quiz Time Limit (minutes)</FormLabel>
                                            <FormControl>
                                              <Input
                                                type="number"
                                                min="1"
                                                max="60"
                                                {...field}
                                                value={field.value ?? 30}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                placeholder="Enter time limit for the entire quiz"
                                              />
                                            </FormControl>
                                            <FormDescription>Set time limit for the entire quiz between 1 and 60 minutes</FormDescription>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />

                                      <FormField
                                        control={form.control}
                                        name={`pembahasan.${pembahasanIndex}.contents.${contentIndex}.one_submission_only`}
                                        render={({ field }) => (
                                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                              <input
                                                type="checkbox"
                                                checked={field.value}
                                                onChange={field.onChange}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                              />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                              <FormLabel>One Submission Only</FormLabel>
                                              <FormDescription>
                                                If enabled, students can only take this quiz once
                                              </FormDescription>
                                            </div>
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`pembahasan.${pembahasanIndex}.contents.${contentIndex}.show_grades`}
                                        render={({ field }) => (
                                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                              <input
                                                type="checkbox"
                                                checked={field.value}
                                                onChange={field.onChange}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                              />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                              <FormLabel>Show Grades</FormLabel>
                                              <FormDescription>
                                                If enabled, students will see their grades immediately after submitting the quiz
                                              </FormDescription>
                                            </div>
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const currentContents = form.getValues(`pembahasan.${pembahasanIndex}.contents`) || []
                                const newContent = {
                                  type: "video" as const,
                                  title: "New Content",
                                  description: "Content description here",
                                  url: "",
                                  is_required: true,
                                  points: 0,
                                  passing_score: 0,
                                  one_submission_only: false,
                                  show_grades: true,
                                  quiz_data: undefined,
                                }
                                form.setValue(`pembahasan.${pembahasanIndex}.contents`, [
                                  ...currentContents,
                                  newContent,
                                ])
                              }}
                              className="w-full"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Content to This Section
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        const currentPembahasan = form.getValues("pembahasan") || [];
                        const newIndex = currentPembahasan.length + 1;
                        const updated = [
                          ...currentPembahasan,
                          {
                            title: `Section ${newIndex}`,
                            description: `Description for section ${newIndex}`,
                            contents: [
                              {
                                type: "video" as const,
                                title: "Video Title",
                                description: "Video description here",
                                url: "",
                                duration: 0,
                                is_required: true,
                                points: 0,
                                passing_score: 0,
                                one_submission_only: false,
                                quiz_data: undefined,
                              },
                              {
                                type: "pdf" as const,
                                title: "PDF Title",
                                description: "PDF description here",
                                url: "",
                                is_required: true,
                                points: 0,
                                passing_score: 0,
                                one_submission_only: false,
                                show_grades: true,
                                quiz_data: undefined,
                                duration: 0,
                              },
                              {
                                type: "quiz" as const,
                                title: "Quiz Title",
                                description: "Quiz description here",
                                is_required: true,
                                points: 0,
                                passing_score: 0,
                                one_submission_only: false,
                                show_grades: true,
                                quiz_data: {
                                  timeLimit: 30,
                                  passingScore: 70,
                                  questions: [
                                    {
                                      question: "",
                                      options: ["", "", "", ""],
                                      correctAnswer: 0,
                                      imageUrl: undefined,
                                      optionImages: [null, null, null, null],
                                    },
                                  ],
                                },
                                duration: 0,
                              },
                            ],
                          },
                        ]
                        form.setValue("pembahasan", updated)
                      }}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Sub-Topic
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preview">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Preview</CardTitle>
                    <CardDescription>Preview your course content organized by sub-topics.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Basic Information</h3>
                      <div className="grid gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-slate-500">Subject</h4>
                          <p>{mapel.find((m) => m.id.toString() === form.watch("id_mapel"))?.nama_mapel}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-slate-500">Course Title</h4>
                          <p>{form.watch("judul_kursus")}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-slate-500">Description</h4>
                          <p className="whitespace-pre-wrap">{form.watch("deskripsi_kursus")}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-slate-500">Thumbnail</h4>
                          <img
                            src={thumbnailPreview || getThumbnailUrl(course)}
                            alt="Course thumbnail"
                            className="object-cover w-48 h-32 mt-2 rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;

                              target.src = '/placeholder.svg?height=128&width=192';
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Content by Sub-Topics</h3>
                      <div className="grid gap-4">
                        {form.watch("pembahasan")?.map((pembahasan, pembahasanIndex) => (
                          <Card key={pembahasanIndex} className="border-l-4 border-l-red-500">
                            <CardHeader>
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-md dark:bg-red-900/20">
                                  <BookOpen className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                  <CardTitle>
                                    Sub-Topic {pembahasanIndex + 1}: {pembahasan.title}
                                  </CardTitle>
                                  <CardDescription>{pembahasan.description}</CardDescription>
                                </div>
                                <Badge variant="outline" className="ml-auto">
                                  {pembahasan.contents?.length || 0} items
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {pembahasan.contents.map((content, contentIndex) => (
                                <div key={contentIndex} className="p-4 ml-4 border rounded-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    {content.type === "video" && <Video className="w-4 h-4" />}
                                    {content.type === "pdf" && <FileText className="w-4 h-4" />}
                                    {content.type === "quiz" && <Brain className="w-4 h-4" />}
                                    <h4 className="font-medium capitalize">{content.type} Content</h4>
                                    <Badge variant="secondary" className="text-xs">
                                      {content.type}
                                    </Badge>
                                  </div>

                                  <div className="space-y-2">
                                    <p>
                                      <strong>Title:</strong> {content.title}
                                    </p>
                                    <p>
                                      <strong>Description:</strong> {content.description}
                                    </p>
                                    {content.type === "video" && (
                                      <>
                                        <p>
                                          <strong>URL:</strong> {content.url}
                                        </p>
                                      </>
                                    )}
                                    {content.type === "pdf" && (
                                      <p>
                                        <strong>File:</strong>{" "}
                                        {content.url ? (
                                          <span className="text-green-600">PDF uploaded</span>
                                        ) : (
                                          <span className="text-slate-500">No file uploaded</span>
                                        )}
                                      </p>
                                    )}
                                    {content.type === "quiz" && content.quiz_data && (
                                      <div className="mt-4 space-y-4">
                                        <p>
                                          <strong>Time Limit:</strong> {content.quiz_data.timeLimit} minutes
                                        </p>
                                        <p>
                                          <strong>Passing Score:</strong> {content.quiz_data.passingScore}%
                                        </p>
                                        <p>
                                          <strong>Questions:</strong>
                                        </p>
                                        {content.quiz_data.questions.map((question, qIndex) => (
                                          <div key={qIndex} className="pl-4 ml-4 border-l-2">
                                            <p className="font-medium">
                                              Question {qIndex + 1}: {question.question}
                                            </p>
                                            <div className="mt-2">
                                              <p className="text-sm text-slate-500">Options:</p>
                                              <ul className="ml-4 list-disc list-inside">
                                                {question.options.map((option, oIndex) => (
                                                  <li
                                                    key={oIndex}
                                                    className={
                                                      oIndex === question.correctAnswer
                                                        ? "text-green-600 font-medium"
                                                        : ""
                                                    }
                                                  >
                                                    {option} {oIndex === question.correctAnswer && "(Correct)"}
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <div className="flex justify-end">
                <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <SaveIcon className="w-4 h-4 mr-2" />
                      Update Course
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </div>
    </AdminPageLayout>
  )
}
