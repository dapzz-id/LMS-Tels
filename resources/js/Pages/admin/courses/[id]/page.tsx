"use client"

import { Head, router } from "@inertiajs/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Badge } from "@/Components/ui/badge"
import AdminPageLayout from "../../layout"
import {
  ArrowLeft,
  Edit,
  Download,
  Play,
  FileText,
  HelpCircle,
  BookOpen,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"
import { toAbsoluteAssetUrl } from "@/lib/utils"

interface Mapel {
  id: number
  nama_mapel: string
}

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
}

interface CourseContent {
  id: number
  type: "video" | "quiz" | "pdf"
  title: string
  description?: string
  url?: string
  quiz_data?: string | QuizQuestion[]
  order: number
}

interface SubPembahasan {
  id: number
  id_kursus: number
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
  id_kuis?: number
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
  sub_pembahasan: SubPembahasan[]
  contents?: CourseContent[] // Keep for backward compatibility
}

interface Props {
  course: Course
}

export default function ViewCoursePage({ course }: Props) {
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({})

  // Helper function to construct thumbnail URL safely
  const getThumbnailUrl = (course: Course) => {
    return toAbsoluteAssetUrl(course.url_thumbnail, '/placeholder.svg?height=192&width=384')
  }



  const parseQuizData = (quizData: string | QuizQuestion[] | undefined): QuizQuestion[] => {
    if (!quizData) return []

    // If it's already an array, return it
    if (Array.isArray(quizData)) {
      return quizData
    }

    // If it's a string, try to parse it
    if (typeof quizData === "string") {
      try {
        const parsed = JSON.parse(quizData)
        return Array.isArray(parsed) ? parsed : []
      } catch (error) {

        return []
      }
    }

    return []
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="w-5 h-5 text-red-600" />
      case "pdf":
        return <FileText className="w-5 h-5 text-blue-600" />
      case "quiz":
        return <HelpCircle className="w-5 h-5 text-green-600" />
      default:
        return null
    }
  }

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case "video":
        return "Video"
      case "pdf":
        return "PDF Document"
      case "quiz":
        return "Quiz"
      default:
        return type
    }
  }

  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  const getTotalContentCount = () => {
    return course.sub_pembahasan?.reduce((total, section) => total + (section.contents?.length || 0), 0) || 0
  }

  return (
    <AdminPageLayout>
      <Head title={`Course: ${course.judul_kursus}`} />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="outline" onClick={() => router.visit("/admin/courses")} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Button>
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-red-700 to-red-500 bg-clip-text">
              {course.judul_kursus}
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Course Details</p>
          </div>
          <Button
            onClick={() => router.visit(`/admin/courses/${course.id}/edit`)}
            className="bg-red-600 hover:bg-red-700"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Course
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
              <CardDescription>Details about this course</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-1 text-sm font-medium text-slate-500 dark:text-slate-400">Subject</h3>
                    <p className="font-medium">{course.mapel.nama_mapel}</p>
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-medium text-slate-500 dark:text-slate-400">Created At</h3>
                    <p>
                      {new Date(course.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-medium text-slate-500 dark:text-slate-400">Sub Topics</h3>
                    <p className="font-medium">{course.sub_pembahasan?.length || 0} sections</p>
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-medium text-slate-500 dark:text-slate-400">Total Content Items</h3>
                    <p className="font-medium">{getTotalContentCount()} items</p>
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">Thumbnail</h3>
                  <div className="relative">
                    <img
                      src={getThumbnailUrl(course)}
                      alt={course.judul_kursus}
                      className="object-cover w-full h-48 border rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement

                        target.src = "/placeholder.svg?height=192&width=384"
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">Description</h3>
                <p className="leading-relaxed whitespace-pre-wrap">{course.deskripsi_kursus}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Course Content by Sub Topics
                <Badge variant="secondary">{course.sub_pembahasan?.length || 0} sections</Badge>
              </CardTitle>
              <CardDescription>
                Course content organized by sub-topics with {getTotalContentCount()} total items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(course.sub_pembahasan) && course.sub_pembahasan.length > 0 ? (
                  course.sub_pembahasan.map((section, sectionIndex) => (
                    <Card key={section.id} className="border-l-4 border-l-red-500">
                      <CardHeader className="pb-3">
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => toggleSection(section.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              {expandedSections[section.id] ? (
                                <ChevronDown className="w-5 h-5 text-slate-500" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-slate-500" />
                              )}
                              <BookOpen className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <CardTitle className="text-xl">{section.title}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">Section {sectionIndex + 1}</Badge>
                                <Badge variant="secondary">{section.contents?.length || 0} items</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        {section.description && (
                          <CardDescription className="mt-2 ml-10">{section.description}</CardDescription>
                        )}
                      </CardHeader>

                      {expandedSections[section.id] && (
                        <CardContent className="pt-0">
                          <div className="ml-10 space-y-4">
                            {Array.isArray(section.contents) && section.contents.length > 0 ? (
                              section.contents.map((content, contentIndex) => (
                                <Card key={content.id} className="border border-slate-200 dark:border-slate-700">
                                  <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-center gap-3">
                                        {getContentIcon(content.type)}
                                        <div>
                                          <CardTitle className="text-lg">{content.title}</CardTitle>
                                          <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="text-xs">
                                              {getContentTypeLabel(content.type)}
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>
                                      <Badge variant="secondary" className="text-sm">
                                        #{contentIndex + 1}
                                      </Badge>
                                    </div>
                                    {content.description && (
                                      <CardDescription className="mt-2">{content.description}</CardDescription>
                                    )}
                                  </CardHeader>

                                  <CardContent className="pt-0">
                                    {content.type === "video" && content.url && (
                                      <div className="space-y-3">
                                        <div className="overflow-hidden rounded-lg aspect-video bg-slate-100 dark:bg-slate-800">
                                          {content.url.includes("youtube.com") || content.url.includes("embed") ? (
                                            <iframe
                                              src={content.url}
                                              title={content.title}
                                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                              allowFullScreen
                                              className="w-full h-full"
                                            />
                                          ) : (
                                            <video
                                              src={content.url}
                                              controls
                                              className="object-cover w-full h-full"
                                              preload="metadata"
                                            />
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {content.type === "pdf" && content.url && (
                                      <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                                        <FileText className="w-8 h-8 text-blue-600" />
                                        <div className="flex-1">
                                          <p className="font-medium">PDF Document</p>
                                          <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Click to download or view
                                          </p>
                                        </div>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => window.open(content.url, "_blank")}
                                        >
                                          <Download className="w-4 h-4 mr-2" />
                                          Download
                                        </Button>
                                      </div>
                                    )}

                                    {content.type === "quiz" && content.quiz_data && (
                                      <div className="space-y-4">
                                        {parseQuizData(content.quiz_data).map((question, qIndex) => (
                                          <div key={qIndex} className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                                            <p className="mb-3 font-medium text-green-900 dark:text-green-100">
                                              Question {qIndex + 1}: {question.question}
                                            </p>
                                            <div className="space-y-2">
                                              {question.options?.map((option, optIndex) => (
                                                <div
                                                  key={optIndex}
                                                  className={`p-3 rounded-md border ${optIndex === question.correctAnswer
                                                      ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-900 dark:text-green-100"
                                                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                                    }`}
                                                >
                                                  <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-slate-500">
                                                      {String.fromCharCode(65 + optIndex)}.
                                                    </span>
                                                    <span>{option}</span>
                                                    {optIndex === question.correctAnswer && (
                                                      <span className="ml-auto text-xs font-medium text-green-600 dark:text-green-400">
                                                        ✓ Correct
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              ))
                            ) : (
                              <div className="py-6 text-center text-slate-500">
                                <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No content available for this section</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No sub-topics available for this course</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminPageLayout>
  )
}
