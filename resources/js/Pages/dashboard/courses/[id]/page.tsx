"use client"

import { useState, useEffect } from "react"
import { Head, Link, router } from "@inertiajs/react"
import {
  Book,
  ChevronLeft,
  FileText,
  Play,
  Video,
  FileQuestion,
  Clock,
  CheckCircle2,
  BookOpen,
  Users,
  Menu,
} from "lucide-react"

import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Progress } from "@/Components/ui/progress"
import { toast } from "sonner"
import { getFirstMessage } from "@/lib/api-messages"
import axios from "axios"
import { Badge } from "@/Components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import StudentSidebar from "@/Components/StudentSidebar"

interface Course {
  id: number
  id_mapel: number
  judul_kursus: string
  deskripsi_kursus: string
  url_thumbnail: string
  created_at: string
  mapel: {
    id: number
    nama_mapel: string
  }
  contents: Array<{
    id: number
    type: 'video' | 'quiz' | 'pdf'
    title: string
    description?: string
    url?: string
    duration?: number
    quiz_data?: string
    order: number
    completed?: boolean
  }>
}

const CourseDetailsPage = ({ params }: { params: { id: string } }) => {
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeContent, setActiveContent] = useState<Course['contents'][0] | null>(null)
  const [progress, setProgress] = useState(0)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const renderLayout = (content: JSX.Element) => (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <StudentSidebar
        active="courses"
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-40 flex h-14 items-center border-b bg-white px-4 dark:border-slate-800 dark:bg-slate-950 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Course</h1>
        </header>
        <main className="flex-1 overflow-auto">
          {content}
        </main>
      </div>
    </div>
  )

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await axios.get(`/api/getDataCourseku/${params.id}`)

        if (response.data && Array.isArray(response.data.kursus)) {
          const courseData = response.data.kursus.find((c: Course) => c.id === parseInt(params.id))
          if (courseData) {
            setCourse(courseData)
            if (courseData.contents && courseData.contents.length > 0) {
              setActiveContent(courseData.contents[0])
              // Calculate progress based on completed content
              const completedContent = courseData.contents.filter((content : any) => content.completed).length
              setProgress((completedContent / courseData.contents.length) * 100)
            }
          } else {
            toast.error(getFirstMessage(response.data, 'Course not found'))
          }
        } else {
          toast.error(getFirstMessage(response.data, 'Invalid course data received'))
        }
      } catch (error) {
        
        if (axios.isAxiosError(error)) {
          toast.error(getFirstMessage(error.response?.data, 'Failed to load course details'))
        } else {
          toast.error('Failed to load course details')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchCourseDetails()
  }, [params.id])

  const renderContent = () => {
    if (!activeContent) return null

    switch (activeContent.type) {
      case 'video':
        return (
          <div className="space-y-4">
            <div className="w-full overflow-hidden bg-black rounded-lg aspect-video">
              <iframe
                src={activeContent.url}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{activeContent.duration} minutes</span>
            </div>
          </div>
        )
      case 'quiz':
        return (
          <Card>
            <CardHeader>
              <CardTitle>{activeContent.title}</CardTitle>
              {activeContent.description && (
                <CardDescription>{activeContent.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {JSON.parse(activeContent.quiz_data || '[]').map((question: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <p className="mb-2 font-medium">{question.question}</p>
                    <div className="space-y-2">
                      {question.options.map((option: string, optIndex: number) => (
                        <label key={optIndex} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={option}
                            className="form-radio"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <Button className="w-full">Submit Quiz</Button>
              </div>
            </CardContent>
          </Card>
        )
      case 'pdf':
        return (
          <div className="space-y-4">
            <div className="h-[600px] w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              <iframe
                src={activeContent.url}
                className="w-full h-full"
              />
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(activeContent.url, '_blank')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Open PDF in New Tab
            </Button>
          </div>
        )
      default:
        return <div>Unsupported content type</div>
    }
  }

  if (loading) {
    return renderLayout(
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading course details...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return renderLayout(
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold">Course Not Found</h2>
          <p className="mb-4 text-muted-foreground">The course you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.get('/dashboard/courses')}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    )
  }

  return renderLayout(
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head title={course.judul_kursus} />

      {/* Course Header */}
      <div className="relative">
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/50 to-transparent" />
        <img
          src={course.url_thumbnail}
          alt={course.judul_kursus}
          className="w-full h-[300px] object-cover"
        />
        <div className="absolute inset-0 z-20 flex items-end">
          <div className="container px-4 py-8 mx-auto">
            <Button
              variant="ghost"
              className="mb-4 text-white hover:text-white hover:bg-white/20"
              onClick={() => router.get('/dashboard/courses')}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Button>
            <div className="space-y-2">
              <Badge variant="secondary" className="mb-2">
                {course.mapel.nama_mapel}
              </Badge>
              <h1 className="text-4xl font-bold text-white">{course.judul_kursus}</h1>
              <p className="max-w-3xl text-white/80">
                {course.deskripsi_kursus}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-4 py-8 mx-auto">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Course Content List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Course Content</CardTitle>
                  <Badge variant="secondary">
                    {progress.toFixed(0)}% Complete
                  </Badge>
                </div>
                <Progress value={progress} className="mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {course.contents.map((content: Course['contents'][0]) => (
                    <button
                      key={content.id}
                      onClick={() => setActiveContent(content)}
                      className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 transition-colors ${
                        activeContent?.id === content.id
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {content.type === 'video' ? (
                        <Video className="w-5 h-5" />
                      ) : content.type === 'quiz' ? (
                        <FileQuestion className="w-5 h-5" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{content.title}</p>
                        {content.duration && (
                          <p className="text-sm text-muted-foreground">
                            {content.duration} minutes
                          </p>
                        )}
                      </div>
                      {content.completed && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Course Stats */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Course Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Total Lessons</span>
                    </div>
                    <span className="font-medium">{course.contents.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Total Duration</span>
                    </div>
                    <span className="font-medium">
                      {course.contents.reduce((acc, content) => acc + (content.duration || 0), 0)} minutes
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Enrolled Students</span>
                    </div>
                    <span className="font-medium">0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Content */}
          <div className="lg:col-span-3">
            {activeContent ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      {activeContent.type === 'video' ? (
                        <Video className="w-5 h-5 text-primary" />
                      ) : activeContent.type === 'quiz' ? (
                        <FileQuestion className="w-5 h-5 text-primary" />
                      ) : (
                        <FileText className="w-5 h-5 text-primary" />
                      )}
                      <CardTitle>{activeContent.title}</CardTitle>
                    </div>
                    {activeContent.description && (
                      <CardDescription>{activeContent.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {renderContent()}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">Select a content to begin</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetailsPage
