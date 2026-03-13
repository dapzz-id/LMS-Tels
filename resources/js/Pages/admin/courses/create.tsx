"use client"

import { useState, useRef, useCallback } from "react"
import { Head, router } from '@inertiajs/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Textarea } from "@/Components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import AdminPageLayout from "../layout"
import { toast, Toaster } from "sonner"
import { ArrowLeft, ImagePlus, Loader2, SaveIcon, Upload, LinkIcon, Trash2, Plus, Timer, Video, FileText, Brain } from 'lucide-react'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/Components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group"
import axios, { AxiosProgressEvent } from "axios"
import { extractMessages, getFirstMessage } from "@/lib/api-messages"


interface Mapel {
  id: number
  nama_mapel: string
}

interface Props {
  mapel: Mapel[]
}

interface QuizData {
  question: string;
  options: string[];
  correctAnswer: number;
  imageUrl?: string; // Keep this line for image support
  optionImages?: (string | null)[]; // Add this line for option image support
}

interface QuizConfig {
  timeLimit?: number;
  passingScore?: number;
  questions: QuizData[];
}

const courseFormSchema = z.object({
  id_mapel: z.string().min(1, {
    message: "Please select a subject.",
  }),
  judul_kursus: z.string().min(3, {
    message: "Course title must be at least 3 characters.",
  }).max(255, {
    message: "Course title must not exceed 255 characters.",
  }),
  deskripsi_kursus: z.string().min(10, {
    message: "Course description must be at least 10 characters.",
  }).max(1000, {
    message: "Course description must not exceed 1000 characters.",
  }),
  thumbnail: z.any().optional(),
  url_thumbnail: z.string().optional(),
  contentTypes: z.array(z.enum(['video', 'pdf', 'quiz'])).default(['video', 'pdf', 'quiz']),
  prerequisites: z.array(z.string()).optional(),
  learning_objectives: z.array(z.string()).optional(),
  target_audience: z.array(z.string()).optional(),
  is_featured: z.boolean().default(false),
  pembahasan: z.array(z.object({
    title: z.string().min(3, { message: "Section title must be at least 3 characters." }),
    description: z.string().min(10, { message: "Section description must be at least 10 characters." }),
    contents: z.array(z.object({
      type: z.enum(['video', 'pdf', 'quiz']),
      title: z.string().min(3, { message: "Content title must be at least 3 characters." }).optional(), // Make optional
      description: z.string().min(10, { message: "Content description must be at least 10 characters." }).optional(), // Make optional
      url: z.string().optional(),
      is_required: z.boolean().default(true),
      points: z.number().optional(),
      passing_score: z.number().optional(),
      quiz_data: z.object({
        timeLimit: z.number().optional(),
        passingScore: z.number().optional(),
        questions: z.array(z.object({
          question: z.string().optional(),
          options: z.array(z.string()).length(4, { message: "Quiz must have exactly 4 options." }),
          correctAnswer: z.number().min(0).max(3),
          imageUrl: z.string().optional(), // Keep this line for image support
          optionImages: z.array(z.string().nullable()).optional(), // Add this line for option image support
        }))
      }).optional(),
      one_submission_only: z.boolean().default(false).optional(),
      show_grades: z.boolean().default(true).optional(),
    })),
  })).optional(),
}).refine((data) => {
  return data.thumbnail || data.url_thumbnail;
}, {
  message: "Please upload a thumbnail image or provide a URL",
  path: ["thumbnail"]
});

type CourseFormValues = z.infer<typeof courseFormSchema>

export default function CreateCoursePage({ mapel }: Props) {
  const API_BASE_URL = import.meta.env.VITE_APP_URL;
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({})

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema) as any,
    defaultValues: {
      id_mapel: "", // This will be invalid until user selects a subject
      judul_kursus: "",
      deskripsi_kursus: "",
      url_thumbnail: "",
      contentTypes: ['video', 'pdf', 'quiz'],
      pembahasan: [{
        title: "Section 1",
        description: "Section description here",
        contents: [
          {
            type: 'video',
            title: "Video Title",
            description: "Video description here",
            url: "",
            is_required: true,
            points: 0,
            passing_score: 0,
            one_submission_only: false,
            show_grades: true,
            quiz_data: undefined
          },
          {
            type: 'pdf',
            title: "PDF Title",
            description: "PDF description here",
            url: "",
            is_required: true,
            points: 0,
            passing_score: 0,
            one_submission_only: false,
            show_grades: true,
            quiz_data: undefined
          },
          {
            type: 'quiz',
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
              questions: [{
                question: '',
                options: ['', '', '', ''],
                correctAnswer: 0,
                imageUrl: undefined,
                optionImages: [null, null, null, null] // Add this line
              }]
            }
          }
        ]
      }]
    },
  })

  // Add these refs for file inputs
  const videoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Store the file object directly
    form.setValue('thumbnail', file);
    toast.success("Thumbnail selected successfully");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf', pembahasanIndex: number, contentIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB for PDF)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('PDF file size must be less than 10MB');
      return;
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/admin/courses/upload-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return;
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prev => ({
            ...prev,
            [`${pembahasanIndex}-${contentIndex}`]: percentCompleted
          }));
        }
      });

      if (response.data.status === 'success') {
        // Use the storage path directly since it's already absolute
        form.setValue(`pembahasan.${pembahasanIndex}.contents.${contentIndex}.url`, response.data.url);
        toast.success(getFirstMessage(response.data, 'PDF uploaded successfully'));
      } else {
        toast.error(getFirstMessage(response.data, 'Failed to upload PDF'));
      }
    } catch (error: any) {

      toast.error(getFirstMessage(error.response?.data, 'Failed to upload PDF'));
    } finally {
      setUploadProgress(prev => ({
        ...prev,
        [`${pembahasanIndex}-${contentIndex}`]: 0
      }));
    }
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      const data = form.getValues();

      // Debug log


      // Trigger validation
      const isValid = await form.trigger();
      if (!isValid) {
        const errors = form.formState.errors;


        // Show specific error messages
        let errorMessage = 'Please fix the validation errors';

        if (errors.id_mapel) {
          errorMessage = errors.id_mapel.message as string || 'Please select a subject';
        } else if (errors.judul_kursus) {
          errorMessage = errors.judul_kursus.message as string || 'Please enter a valid course title';
        } else if (errors.deskripsi_kursus) {
          errorMessage = errors.deskripsi_kursus.message as string || 'Please enter a valid course description';
        } else {
          // Show all errors
          Object.entries(errors).forEach(([field, error]) => {
            if (error?.message) {
              toast.error(error.message as string, {
                position: 'bottom-right',
              });
            }
          });
        }

        if (errorMessage) {
          toast.error(errorMessage, {
            position: 'bottom-right',
          });
        }

        setIsSubmitting(false);
        return;
      }

      // Prepare form data
      formData.append('id_mapel', data.id_mapel);
      formData.append('judul_kursus', data.judul_kursus);
      formData.append('deskripsi_kursus', data.deskripsi_kursus);

      // Handle thumbnail
      if (data.thumbnail instanceof File) {
        formData.append('thumbnail', data.thumbnail);
      } else if (data.url_thumbnail) {
        formData.append('url_thumbnail', data.url_thumbnail);
      }

      // Always send these as arrays (even if empty)
      formData.append('prerequisites', JSON.stringify(data.prerequisites ?? []));
      formData.append('learning_objectives', JSON.stringify(data.learning_objectives ?? []));
      formData.append('target_audience', JSON.stringify(data.target_audience ?? []));

      // Convert duration to number if it exists and handle image data
      if (data.pembahasan) {
        data.pembahasan.forEach((pembahasan, index) => {
          if (pembahasan.contents) {
            pembahasan.contents.forEach((content, contentIndex) => {

              // Ensure quiz data is properly formatted with image support
              if (content.type === 'quiz' && content.quiz_data) {
                // Make sure timeLimit and passingScore are numbers
                if (content.quiz_data.timeLimit !== undefined) {
                  content.quiz_data.timeLimit = Number(content.quiz_data.timeLimit);
                }
                if (content.quiz_data.passingScore !== undefined) {
                  content.quiz_data.passingScore = Number(content.quiz_data.passingScore);
                }

                // Ensure questions have proper structure with image support
                content.quiz_data.questions = content.quiz_data.questions.map(question => ({
                  question: question.question,
                  options: question.options,
                  correctAnswer: Number(question.correctAnswer),
                  imageUrl: question.imageUrl || undefined,
                  optionImages: question.optionImages || [null, null, null, null] // Add this line
                }));
              }
            });
          }
        });
      }

      formData.append('pembahasan', JSON.stringify(data.pembahasan));

      // Create/Update course
      const url = `/admin/courses`;


      // Debug CSRF token
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');


      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-CSRF-TOKEN': csrfToken || '',
        }
      });

      if (response.data.status === 'success') {
        toast.success(getFirstMessage(response.data, 'Course created successfully'), {
          position: 'bottom-right',
        });
        router.visit('/admin/courses');
      } else {

        const messages = extractMessages(response.data);
        if (messages.length > 0) {
          messages.slice(0, 5).forEach((message) => {
            toast.error(message, { position: 'bottom-right' });
          });
        } else {
          toast.error('Failed to create course. Please check the console for details.', {
            position: 'bottom-right',
          });
        }
      }
    } catch (error) {

      if (axios.isAxiosError(error)) {

        const messages = extractMessages(error.response?.data);
        if (messages.length > 0) {
          messages.slice(0, 5).forEach((message) => {
            toast.error(message, { position: 'bottom-right' });
          });
        } else {
          toast.error(`Error: ${getFirstMessage(error.response?.data, 'Failed to create course')}`, {
            position: 'bottom-right',
          });
        }
      } else {

        toast.error('An unexpected error occurred', {
          position: 'bottom-right',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const addPembahasan = () => {
    const currentPembahasan = form.getValues('pembahasan') || [];
    form.setValue('pembahasan', [
      ...currentPembahasan,
      {
        title: `Section ${currentPembahasan.length + 1}`,
        description: `Description for section ${currentPembahasan.length + 1}`,
        contents: [
          {
            type: 'video' as const,
            title: "Video Title",
            description: "Video description here",
            url: "",
            is_required: true,
            points: 0,
            passing_score: 0,
            quiz_data: undefined,
          },
          {
            type: 'pdf' as const,
            title: "PDF Title",
            description: "PDF description here",
            url: "",
            is_required: true,
            points: 0,
            passing_score: 0,
            quiz_data: undefined,
          },
          {
            type: 'quiz' as const,
            title: "Quiz Title",
            description: "Quiz description here",
            is_required: true,
            points: 0,
            passing_score: 0,
            quiz_data: {
              timeLimit: 30,
              passingScore: 70,
              questions: [{
                question: '',
                options: ['', '', '', ''],
                correctAnswer: 0,
                imageUrl: undefined,
                optionImages: [null, null, null, null]
              }]
            }
          }
        ]
      }
    ]);

  };

  const removePembahasan = (index: number) => {
    const currentPembahasan = form.getValues('pembahasan') ?? [];
    form.setValue('pembahasan', currentPembahasan.filter((_, i) => i !== index));
  };

  const addQuizQuestion = (pembahasanIndex: number) => {
    const currentPembahasan = form.getValues('pembahasan') ?? []
    const updatedPembahasan = currentPembahasan.map((section, index) => {
      if (index !== pembahasanIndex) {
        return section
      }

      return {
        ...section,
        contents: section.contents.map((content) => {
          if (content.type !== 'quiz' || !content.quiz_data) {
            return content
          }

          return {
            ...content,
            quiz_data: {
              ...content.quiz_data,
              questions: [
                ...(content.quiz_data.questions || []),
                {
                  question: '',
                  options: ['', '', '', ''],
                  correctAnswer: 0,
                  imageUrl: undefined,
                  optionImages: [null, null, null, null]
                }
              ]
            }
          }
        })
      }
    })

    form.setValue('pembahasan', updatedPembahasan, { shouldDirty: true, shouldTouch: true })
  };

  const removeQuizQuestion = (pembahasanIndex: number, questionIndex: number) => {
    const currentPembahasan = form.getValues('pembahasan') ?? []
    const updatedPembahasan = currentPembahasan.map((section, index) => {
      if (index !== pembahasanIndex) {
        return section
      }

      return {
        ...section,
        contents: section.contents.map((content) => {
          if (content.type !== 'quiz' || !content.quiz_data) {
            return content
          }

          if ((content.quiz_data.questions || []).length <= 1) {
            return content
          }

          return {
            ...content,
            quiz_data: {
              ...content.quiz_data,
              questions: content.quiz_data.questions.filter((_: any, i: number) => i !== questionIndex),
            }
          }
        })
      }
    })

    form.setValue('pembahasan', updatedPembahasan, { shouldDirty: true, shouldTouch: true })
  };

  const canProceedToNext = (tab: string) => {
    const formValues = form.getValues();

    if (tab === 'details') {
      // Check if id_mapel is selected (not empty string)
      if (!formValues.id_mapel || formValues.id_mapel === "") {
        toast.error('Please select a subject');
        return false;
      }

      const hasRequiredFields = !!(
        formValues.judul_kursus &&
        formValues.judul_kursus.length >= 3 &&
        formValues.deskripsi_kursus &&
        formValues.deskripsi_kursus.length >= 10 &&
        (formValues.url_thumbnail || formValues.thumbnail)
      );

      if (!hasRequiredFields) {
        toast.error('Please fill in all required fields');
        return false;
      }

      return true;
    }

    if (tab === 'content') {
      if (!formValues.pembahasan || formValues.pembahasan.length === 0) {
        toast.error('At least one section is required');
        return false;
      }

      return formValues.pembahasan.every((pembahasan, index) => {
        if (!pembahasan.title || pembahasan.title.length < 3) {
          toast.error(`Section ${index + 1}: Title must be at least 3 characters`);
          return false;
        }

        if (!pembahasan.description || pembahasan.description.length < 10) {
          toast.error(`Section ${index + 1}: Description must be at least 10 characters`);
          return false;
        }

        if (!pembahasan.contents || pembahasan.contents.length < 3) {
          toast.error(`Section ${index + 1}: Must have at least 3 contents (video, PDF, and quiz)`);
          return false;
        }

        return pembahasan.contents.every((content, contentIndex) => {
          if (!content.title || content.title.length < 3) {
            toast.error(`Section ${index + 1}, Content ${contentIndex + 1}: Title must be at least 3 characters`);
            return false;
          }

          if (!content.description || content.description.length < 10) {
            toast.error(`Section ${index + 1}, Content ${contentIndex + 1}: Description must be at least 10 characters`);
            return false;
          }

          if (content.type === 'video') {
            if (!content.url) {
              toast.error(`Section ${index + 1}, Video ${contentIndex + 1}: URL is required`);
              return false;
            }
          }

          if (content.type === 'pdf') {
            if (!content.url) {
              toast.error(`Section ${index + 1}, PDF ${contentIndex + 1}: URL is required`);
              return false;
            }
          }

          if (content.type === 'quiz') {
            // For quizzes, we need to validate the quiz data structure
            if (!content.quiz_data || !content.quiz_data.questions || content.quiz_data.questions.length === 0) {
              toast.error(`Section ${index + 1}, Quiz ${contentIndex + 1}: At least one question is required`);
              return false;
            }

            // Validate quiz questions
            const questionsValid = content.quiz_data.questions.every((question: any, qIndex: number) => {
              const questionText = (question.question ?? "").toString().trim();
              const questionImage = (question.imageUrl ?? "").toString().trim();
              if (!questionText && !questionImage) {
                toast.error(`Section ${index + 1}, Quiz ${contentIndex + 1}, Question ${qIndex + 1}: Question text or image is required`);
                return false;
              }

              if (!question.options || question.options.length !== 4) {
                toast.error(`Section ${index + 1}, Quiz ${contentIndex + 1}, Question ${qIndex + 1}: Must have exactly 4 options`);
                return false;
              }

              for (let optionIndex = 0; optionIndex < 4; optionIndex++) {
                const optionText = (question.options?.[optionIndex] ?? "").toString().trim();
                const optionImage = (question.optionImages?.[optionIndex] ?? "").toString().trim();
                if (!optionText && !optionImage) {
                  toast.error(`Section ${index + 1}, Quiz ${contentIndex + 1}, Question ${qIndex + 1}, Option ${optionIndex + 1}: Option text or image is required`);
                  return false;
                }
              }

              if (question.correctAnswer === undefined || question.correctAnswer < 0 || question.correctAnswer > 3) {
                toast.error(`Section ${index + 1}, Quiz ${contentIndex + 1}, Question ${qIndex + 1}: Must select a correct answer`);
                return false;
              }

              return true;
            });

            if (!questionsValid) {
              return false;
            }

            // Validate quiz time limit if present
            if (content.quiz_data.timeLimit !== undefined) {
              if (content.quiz_data.timeLimit < 1 || content.quiz_data.timeLimit > 60) {
                toast.error(`Section ${index + 1}, Quiz ${contentIndex + 1}: Quiz time limit must be between 1 and 60 minutes`);
                return false;
              }
            }

            // Quiz title and description are not required for validation, only content is
            return true;
          }

          return true;
        });
      });
    }

    return true;
  };

  const handleNext = () => {
    if (activeTab === 'details') {
      form.trigger(['id_mapel', 'judul_kursus', 'deskripsi_kursus', 'url_thumbnail', 'thumbnail']).then(isValid => {
        if (isValid && canProceedToNext('details')) {
          setActiveTab('content');
        } else {
          const errors = form.formState.errors;
          Object.entries(errors).forEach(([field, error]) => {
            if (error?.message) {
              toast.error(error.message as string);
            }
          });
        }
      });
    } else if (activeTab === 'content') {
      form.trigger().then(isValid => {
        if (isValid && canProceedToNext('content')) {
          setActiveTab('preview');
        } else {
          const errors = form.formState.errors;
          Object.entries(errors).forEach(([field, error]) => {
            if (error?.message) {
              toast.error(error.message as string);
            }
          });
        }
      });
    }
  };

  const handlePrevious = () => {
    if (activeTab === 'content') {
      setActiveTab('details');
    } else if (activeTab === 'preview') {
      setActiveTab('content');
    }
  };

  return (
    <AdminPageLayout>
      <Head title="Create New Course" />
      <Toaster position="bottom-right" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="outline"
              onClick={() => router.visit('/admin/courses')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Button>
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-red-700 to-red-500 bg-clip-text">
              Create New Course
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Fill in the details below to create a new course.
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="details">Course Details</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-8">
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Enter the basic details about your course.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col gap-6 md:flex-row">
                      <div className="w-full space-y-6 md:w-2/3">
                        <FormField
                          control={form.control}
                          name="id_mapel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                              <FormDescription>Select the subject this course belongs to.</FormDescription>
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
                              <FormDescription>This is the name of your course as it will appear to students.</FormDescription>
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
                                <Textarea
                                  placeholder="Enter course description"
                                  className="min-h-32"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>Describe what students will learn in this course.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />


                      </div>

                      <div className="w-full space-y-6 md:w-1/3">
                        <div
                          className="flex flex-col items-center justify-center h-48 p-6 text-center transition-colors border-2 border-dashed rounded-lg cursor-pointer border-slate-200 dark:border-slate-700 hover:border-red-500"
                          onClick={() => document.getElementById('thumbnail-upload')?.click()}
                        >
                          {thumbnailPreview ? (
                            <img
                              src={thumbnailPreview || "/placeholder.svg"}
                              alt="Course thumbnail"
                              className="object-cover w-full h-full rounded-lg"
                            />
                          ) : (
                            <>
                              <ImagePlus className="w-10 h-10 mb-2 text-slate-400" />
                              <p className="text-sm text-slate-500 dark:text-slate-400">Click to upload thumbnail</p>
                              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Recommended size: 1280x720px</p>
                            </>
                          )}
                        </div>
                        <input
                          id="thumbnail-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleThumbnailChange}
                        />
                        {uploadProgress.thumbnail > 0 && (
                          <div className="w-full bg-slate-200 rounded-full h-2.5">
                            <div
                              className="bg-red-600 h-2.5 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress.thumbnail}%` }}
                            ></div>
                          </div>
                        )}


                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Content</CardTitle>
                    <CardDescription>Add content to your course.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {form.watch('pembahasan')?.map((pembahasan, pembahasanIndex) => (
                      <Card key={pembahasanIndex}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle>Sub Pembahasan {pembahasanIndex + 1}</CardTitle>
                              <CardDescription>Manage content for this section</CardDescription>
                            </div>
                            {pembahasanIndex > 0 && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removePembahasan(pembahasanIndex)}
                              >
                                Remove Section
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <FormField
                            control={form.control}
                            name={`pembahasan.${pembahasanIndex}.title`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Section Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter section title" {...field} />
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
                                <FormLabel>Section Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Enter section description"
                                    className="min-h-20"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">Content Items</h4>
                            </div>

                            {pembahasan.contents.map((content, contentIndex) => (
                              <Card key={contentIndex} className="border border-dashed">
                                <CardHeader>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="p-2 rounded-md bg-slate-100 dark:bg-slate-800">
                                        {content.type === 'video' && <Video className="w-4 h-4" />}
                                        {content.type === 'pdf' && <FileText className="w-4 h-4" />}
                                        {content.type === 'quiz' && <Brain className="w-4 h-4" />}
                                      </div>
                                      <div>
                                        <CardTitle className="text-sm">
                                          {content.type.charAt(0).toUpperCase() + content.type.slice(1)} Content
                                        </CardTitle>
                                        <CardDescription>
                                          {content.type === 'video' && 'YouTube video lesson'}
                                          {content.type === 'pdf' && 'PDF material (file upload only)'}
                                          {content.type === 'quiz' && 'Quiz assessment'}
                                        </CardDescription>
                                      </div>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  {content.type === 'video' && (
                                    <div className="space-y-4">
                                      <FormField
                                        control={form.control}
                                        name={`pembahasan.${pembahasanIndex}.contents.${contentIndex}.title`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Video Title</FormLabel>
                                            <FormControl>
                                              <Input {...field} placeholder="Enter video title" />
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
                                            <FormLabel>Video Description</FormLabel>
                                            <FormControl>
                                              <Textarea {...field} placeholder="Enter video description" />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`pembahasan.${pembahasanIndex}.contents.${contentIndex}.url`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>YouTube Video URL</FormLabel>
                                            <FormControl>
                                              <Input {...field} placeholder="Enter YouTube video URL" />
                                            </FormControl>
                                            <FormDescription>
                                              Only YouTube video links are allowed
                                            </FormDescription>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                  )}

                                  {content.type === 'pdf' && (
                                    <div className="space-y-4">
                                      <FormField
                                        control={form.control}
                                        name={`pembahasan.${pembahasanIndex}.contents.${contentIndex}.title`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>PDF Title</FormLabel>
                                            <FormControl>
                                              <Input {...field} placeholder="Enter PDF title" />
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
                                            <FormLabel>PDF Description</FormLabel>
                                            <FormControl>
                                              <Textarea {...field} placeholder="Enter PDF description" />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormItem>
                                        <FormLabel>PDF File</FormLabel>
                                        <FormControl>
                                          <Input
                                            type="file"
                                            accept=".pdf"
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                handleFileChange(e, 'pdf', pembahasanIndex, contentIndex);
                                              }
                                            }}
                                          />
                                        </FormControl>
                                        <FormDescription>
                                          Only PDF file uploads are allowed
                                        </FormDescription>
                                        <FormMessage />
                                      </FormItem>
                                    </div>
                                  )}

                                  {content.type === 'quiz' && (
                                    <div className="space-y-4">
                                      <FormField
                                        control={form.control}
                                        name={`pembahasan.${pembahasanIndex}.contents.${contentIndex}.title`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Quiz Title</FormLabel>
                                            <FormControl>
                                              <Input {...field} placeholder="Enter quiz title" />
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
                                              <Textarea {...field} placeholder="Enter quiz description" />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />

                                      <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium">Quiz Questions</h4>
                                      </div>

                                      {form.watch(`pembahasan.${pembahasanIndex}.contents.${contentIndex}.quiz_data.questions`)?.map((question: any, questionIndex: number) => (
                                        <Card key={questionIndex} className="p-4">
                                          <div className="flex items-center justify-between mb-4">
                                            <h5 className="font-medium">Question {questionIndex + 1}</h5>
                                            <Button
                                              type="button"
                                              variant="destructive"
                                              size="sm"
                                              onClick={() => removeQuizQuestion(pembahasanIndex, questionIndex)}
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
                                                        } as QuizData;
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
                                                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-slate-300 hover:border-red-500">
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
                                                            // Fix: Do not prepend API_BASE_URL to image URLs returned by backend
                                                            const fullUrl = response.data.url; // The response already includes the proper path
                                                            const currentQuizData = form.getValues(`pembahasan.${pembahasanIndex}.contents.${contentIndex}.quiz_data`);
                                                            if (currentQuizData) {
                                                              const updatedQuestions = [...currentQuizData.questions];
                                                              updatedQuestions[questionIndex] = {
                                                                ...updatedQuestions[questionIndex],
                                                                imageUrl: fullUrl
                                                              } as QuizData;
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
                                                    <FormControl>
                                                      <Textarea
                                                        placeholder="Enter your question"
                                                        className="min-h-[80px]"
                                                        {...field}
                                                      />
                                                    </FormControl>
                                                  </div>
                                                  <FormMessage />
                                                </FormItem>
                                              )}
                                            />

                                            <div className="space-y-2">
                                              <FormLabel>Options</FormLabel>
                                              {question.options.map((_: any, optionIndex: number) => (
                                                <div key={optionIndex} className="space-y-2">
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
                                                              onValueChange={(value) => field.onChange(parseInt(value))}
                                                              className="flex items-center"
                                                            >
                                                              <RadioGroupItem value={optionIndex.toString()} />
                                                            </RadioGroup>
                                                          </FormControl>
                                                        </FormItem>
                                                      )}
                                                    />
                                                  </div>

                                                  {/* Option Image Upload - Enhanced version */}
                                                  <div className="ml-8">
                                                    <FormLabel className="text-xs">Option Image (Optional)</FormLabel>
                                                    {question.optionImages?.[optionIndex] ? (
                                                      <div className="relative mt-1">
                                                        <img
                                                          src={question.optionImages[optionIndex]}
                                                          alt={`Option ${optionIndex + 1}`}
                                                          className="object-contain max-h-32 rounded-lg"
                                                        />
                                                        <Button
                                                          type="button"
                                                          variant="destructive"
                                                          size="sm"
                                                          className="absolute top-1 right-1"
                                                          onClick={() => {
                                                            const currentQuizData = form.getValues(`pembahasan.${pembahasanIndex}.contents.${contentIndex}.quiz_data`);
                                                            if (currentQuizData) {
                                                              const updatedQuestions = [...currentQuizData.questions];
                                                              const updatedOptionImages = [...(updatedQuestions[questionIndex].optionImages || [null, null, null, null])];
                                                              updatedOptionImages[optionIndex] = null;
                                                              updatedQuestions[questionIndex] = {
                                                                ...updatedQuestions[questionIndex],
                                                                optionImages: updatedOptionImages
                                                              } as QuizData;
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
                                                      <div className="flex items-center justify-center w-full mt-1">
                                                        <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed rounded-lg cursor-pointer border-slate-300 hover:border-red-500">
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
                                                                  // Fix: Do not prepend API_BASE_URL to image URLs returned by backend
                                                                  const fullUrl = response.data.url; // The response already includes the proper path
                                                                  const currentQuizData = form.getValues(`pembahasan.${pembahasanIndex}.contents.${contentIndex}.quiz_data`);
                                                                  if (currentQuizData) {
                                                                    const updatedQuestions = [...currentQuizData.questions];
                                                                    const updatedOptionImages = [...(updatedQuestions[questionIndex].optionImages || [null, null, null, null])];
                                                                    updatedOptionImages[optionIndex] = fullUrl;
                                                                    updatedQuestions[questionIndex] = {
                                                                      ...updatedQuestions[questionIndex],
                                                                      optionImages: updatedOptionImages
                                                                    } as QuizData;
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
                                                </div>
                                              ))}
                                            </div>

                                          </div>
                                        </Card>
                                      ))}

                                      <div className="flex justify-center pt-4">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => addQuizQuestion(pembahasanIndex)}
                                        >
                                          <Plus className="w-4 h-4 mr-2" /> Add Question
                                        </Button>
                                      </div>

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
                                                onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    <div className="flex justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addPembahasan()}
                        className="w-full max-w-sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Section
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preview">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Preview</CardTitle>
                    <CardDescription>Review your course details before publishing.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <h3 className="mb-2 text-lg font-semibold">Basic Information</h3>
                        <div className="space-y-4">
                          <div>
                            <Label>Subject</Label>
                            <p className="text-slate-600 dark:text-slate-300">
                              {mapel.find(m => m.id.toString() === form.getValues('id_mapel'))?.nama_mapel}
                            </p>
                          </div>
                          <div>
                            <Label>Course Title</Label>
                            <p className="text-slate-600 dark:text-slate-300">{form.getValues('judul_kursus')}</p>
                          </div>
                          <div>
                            <Label>Description</Label>
                            <p className="text-slate-600 dark:text-slate-300">{form.getValues('deskripsi_kursus')}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="mb-2 text-lg font-semibold">Thumbnail</h3>
                        {thumbnailPreview ? (
                          <img
                            src={thumbnailPreview || "/placeholder.svg"}
                            alt="Course thumbnail"
                            className="object-cover w-full h-48 rounded-lg"
                          />
                        ) : form.getValues('url_thumbnail') ? (
                          <img
                            src={form.getValues('url_thumbnail') || "/placeholder.svg"}
                            alt="Course thumbnail"
                            className="object-cover w-full h-48 rounded-lg"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-48 rounded-lg bg-slate-100">
                            <p className="text-slate-400">No thumbnail uploaded</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-8 space-y-6">
                      <h3 className="text-lg font-semibold">Course Content</h3>
                      {form.getValues('pembahasan')?.map((pembahasan, pembahasanIndex) => (
                        <Card key={pembahasanIndex}>
                          <CardHeader>
                            <CardTitle>Section {pembahasanIndex + 1}: {pembahasan.title}</CardTitle>
                            <CardDescription>{pembahasan.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {pembahasan.contents.map((content, contentIndex) => (
                              <div key={contentIndex} className="p-4 border rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  {content.type === 'video' && <Video className="w-4 h-4" />}
                                  {content.type === 'pdf' && <FileText className="w-4 h-4" />}
                                  {content.type === 'quiz' && <Brain className="w-4 h-4" />}
                                  <h4 className="font-medium capitalize">{content.type} Content</h4>
                                </div>
                                <div className="space-y-2">
                                  <p><strong>Title:</strong> {content.title}</p>
                                  <p><strong>Description:</strong> {content.description}</p>
                                  {content.type === 'video' && (
                                    <>
                                      <p><strong>URL:</strong> {content.url}</p>
                                    </>
                                  )}
                                  {content.type === 'pdf' && (
                                    <p><strong>URL:</strong> {content.url}</p>
                                  )}
                                  {content.type === 'quiz' && content.quiz_data && (
                                    <div className="mt-4 space-y-4">
                                      <p><strong>Time Limit:</strong> {content.quiz_data.timeLimit} minutes</p>
                                      <p><strong>Passing Score:</strong> {content.quiz_data.passingScore}%</p>
                                      <p><strong>Questions:</strong></p>
                                      {content.quiz_data.questions.map((question: any, qIndex: number) => (
                                        <div key={qIndex} className="pl-4 ml-4 border-l-2">
                                          {/* Question Image Preview - Enhanced version */}
                                          {question.imageUrl && (
                                            <div className="mb-3">
                                              <img
                                                src={question.imageUrl}
                                                alt="Question"
                                                className="object-contain max-h-48 rounded-lg border border-gray-200"
                                              />
                                            </div>
                                          )}
                                          <p className="font-medium">Question {qIndex + 1}: {question.question}</p>
                                          <div className="mt-2">
                                            <p className="text-sm text-slate-500">Options:</p>
                                            <ul className="ml-4 list-disc list-inside">
                                              {question.options.map((option: any, oIndex: number) => (
                                                <li
                                                  key={oIndex}
                                                  className={oIndex === question.correctAnswer ? 'text-green-600 font-medium' : ''}
                                                >
                                                  {option} {oIndex === question.correctAnswer && '(Correct)'}
                                                  {/* Option Image Preview - Enhanced version */}
                                                  {question.optionImages?.[oIndex] && (
                                                    <div className="mt-2">
                                                      <img
                                                        src={question.optionImages[oIndex]}
                                                        alt={`Option ${oIndex + 1}`}
                                                        className="object-contain max-h-32 rounded-lg border border-gray-200"
                                                      />
                                                    </div>
                                                  )}
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
                  </CardContent>
                </Card>
              </TabsContent>

              <div className="flex justify-between mt-6">
                {activeTab === 'preview' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                  >
                    Previous
                  </Button>
                )}

                <div className="flex gap-2 ml-auto">
                  {activeTab === 'preview' && (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          <span>Publishing...</span>
                        </>
                      ) : (
                        <>
                          <SaveIcon className="w-4 h-4 mr-2" />
                          <span>Publish Course</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </Tabs>
      </div>
    </AdminPageLayout>
  )
}
