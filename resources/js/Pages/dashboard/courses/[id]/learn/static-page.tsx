"use client"

import { useState, useEffect } from "react"
import { Link, router, usePage } from "@inertiajs/react"
import { ArrowLeft, BookOpen, Clock, FileText, Layers, Menu } from "lucide-react"

import { Button } from "@/Components/ui/button"
import { Badge } from "@/Components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Progress } from "@/Components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import StudentSidebar from "@/Components/StudentSidebar"

// Simplified course data
const courseData: Record<number, {
  title: string;
  lessons: {
    id: number;
    title: string;
    description: string;
    videoId: string;
  }[];
}> = {
  101: {
    title: "Administrasi Sistem Jaringan",
    lessons: [
      {
        id: 101,
        title: "Apa itu Administrasi Sistem?",
        description: "Pengenalan tentang peran dan tanggung jawab administrator sistem dalam organisasi IT.",
        videoId: "1DvTwuByjo0",
      },
      {
        id: 102,
        title: "Dasar-dasar Sistem Operasi Linux",
        description: "Pengenalan sistem operasi Linux dan komponen-komponen utamanya untuk administrasi sistem.",
        videoId: "ROjZy1WbCIA",
      },
    ],
  },
  102: {
    title: "Cyber Security Dasar",
    lessons: [
      {
        id: 101,
        title: "Apa itu Keamanan Siber?",
        description: "Pengenalan tentang konsep dasar keamanan siber dan pentingnya dalam dunia digital saat ini.",
        videoId: "inWWhr5tnEA",
      },
    ],
  },
  103: {
    title: "Belajar Linux",
    lessons: [
      {
        id: 101,
        title: "Pengenalan Linux",
        description: "Pengenalan tentang sistem operasi Linux dan sejarahnya.",
        videoId: "ROjZy1WbCIA",
      },
    ],
  },
  104: {
    title: "Cisco Dasar",
    lessons: [
      {
        id: 101,
        title: "Pengenalan Jaringan Cisco",
        description: "Pengenalan tentang perangkat jaringan Cisco dan konsep dasar jaringan.",
        videoId: "H8W9oMNSuwo",
      },
    ],
  },
}

export default function StaticCoursePage() {
  const {props} = usePage();
  const courseId : number = props.id as number
  const searchParams = new URLSearchParams(window.location.search)
  const lessonId = searchParams.get('lesson')

  // Get course data
  const course = courseData[courseId] || {
    title: "Course Not Found",
    lessons: [
      {
        id: 101,
        title: "Default Lesson",
        description: "This is a default lesson for when course data is not found.",
        videoId: "3QhU9jd03a0",
      },
    ],
  }

  // Find the current lesson
  const currentLesson = course.lessons.find((l) => l.id === Number(lessonId)) || course.lessons[0]

  // State for loading
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const renderLayout = (content: JSX.Element) => (
    <div className="flex min-h-screen bg-gray-50 dark:bg-blue-950/90">
      <StudentSidebar
        active="courses"
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 lg:pl-64">
        {content}
      </div>
    </div>
  )

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return renderLayout(
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-8 h-8 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
      </div>
    )
  }

  return renderLayout(
    <div className="min-h-screen bg-gray-50 dark:bg-blue-950/90">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center px-4 bg-white border-b border-blue-100 h-14 dark:border-blue-800/30 dark:bg-blue-900/90 lg:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 lg:hidden"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu className="w-5 h-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <Button variant="ghost" size="icon" className="mr-2" asChild>
          <Link href={`/dashboard/courses/${courseId}`}>
            <ArrowLeft className="w-5 h-5" />
            <span className="sr-only">Back to course</span>
          </Link>
        </Button>

        <div className="flex-1 truncate">
          <h1 className="text-lg font-semibold truncate">
            {course.title}: {currentLesson.title}
          </h1>
        </div>

        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/courses/${courseId}`}>
            <BookOpen className="w-4 h-4 mr-2" />
            <span>Course Home</span>
          </Link>
        </Button>
      </header>

      <div className="container p-4 mx-auto lg:p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Main content */}
          <div className="md:col-span-2">
            <div className="p-6 bg-white border rounded-lg dark:bg-blue-900/20 dark:border-blue-800/30">
              <h2 className="mb-4 text-xl font-bold">{currentLesson.title}</h2>

              {/* Video */}
              <div className="mb-6 overflow-hidden bg-black rounded-lg aspect-video">
                {currentLesson.videoId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${currentLesson.videoId}`}
                    title={currentLesson.title}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  ></iframe>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-white">Video not available for this lesson</p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-blue-700 bg-blue-50 dark:bg-blue-900/50 dark:text-blue-300">
                    Video Lesson
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>45 minutes</span>
                  </div>
                </div>
                <h3 className="mb-2 font-medium">Lesson Description</h3>
                <p className="text-gray-700 dark:text-gray-300">{currentLesson.description}</p>
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between mt-6">
                <Button variant="outline" disabled={course.lessons.indexOf(currentLesson) === 0}>
                  Previous Lesson
                </Button>
                <Button disabled={course.lessons.indexOf(currentLesson) === course.lessons.length - 1}>
                  Next Lesson
                </Button>
              </div>
            </div>
          </div>

          {/* Lesson list */}
          <div>
            <div className="p-6 bg-white border rounded-lg dark:bg-blue-900/20 dark:border-blue-800/30">
              <h2 className="mb-4 text-lg font-bold">Course Content</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full dark:bg-blue-900/50">
                      <Layers className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-medium">Lessons</h3>
                  </div>

                  <div className="ml-8 space-y-2">
                    {course.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg p-2 transition-colors ${
                          lesson.id === currentLesson.id
                            ? "bg-blue-100 dark:bg-blue-900/50"
                            : "hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        }`}
                        onClick={() => router.visit(`/dashboard/courses/${courseId}/learn?lesson=${lesson.id}`)}
                      >
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full ${
                            lesson.id === currentLesson.id
                              ? "bg-blue-200 text-blue-700 dark:bg-blue-800 dark:text-blue-300"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          <FileText className="w-3 h-3" />
                        </div>
                        <div className="flex-1 text-sm">
                          <p className={`${lesson.id === currentLesson.id ? "font-medium" : ""}`}>{lesson.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
