"use client"

import { Head, Link } from '@inertiajs/react'
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import {
  BookOpen,
  Calendar,
  Clock,
  Download,
  Edit,
  FileText,
  MessageSquare,
  Users,
  Video,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import TeacherLayout from "../../layout"
import { Toaster } from "sonner"

interface Course {
  id: number;
  judul_kursus: string;
  deskripsi_kursus: string;
  url_thumbnail: string;
  created_at: string;
  mapel?: {
    nama_mapel: string;
  };
  sub_pembahasan: Array<{
    id: number;
    title: string;
    description: string;
    contents: Array<{
      id: number;
      type: string;
      title: string;
      description: string;
      url: string;
    }>;
  }>;
}

interface Props {
  course: Course;
}

export default function TeacherCourseDetailPage({ course }: Props) {
  // Calculate total content count
  const totalContent = course.sub_pembahasan.reduce((total, sub) => {
    return total + (sub.contents ? sub.contents.length : 0);
  }, 0);

  // Count content types
  const contentTypeCounts = course.sub_pembahasan.reduce((counts, sub) => {
    if (sub.contents) {
      sub.contents.forEach(content => {
        counts[content.type] = (counts[content.type] || 0) + 1;
      });
    }
    return counts;
  }, {} as Record<string, number>);

  return (
    <TeacherLayout>
      <Head title={`Course Details - ${course.judul_kursus}`} />
      <Toaster position="top-right" />

      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text">
                {course.judul_kursus}
              </h1>
              <Badge>Active</Badge>
            </div>
            <p className="text-slate-500 dark:text-slate-400">{course.deskripsi_kursus}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/teacher/courses/${course.id}/edit`}>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit Course
              </Button>
            </Link>
            <Link href={`/teacher/courses/${course.id}/student-progress`}>
              <Button>
                <Users className="w-4 h-4 mr-2" />
                Student Progress
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Content</CardTitle>
              <BookOpen className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalContent}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {contentTypeCounts.video || 0} videos, {contentTypeCounts.pdf || 0} PDFs, {contentTypeCounts.quiz || 0} quizzes
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Subject</CardTitle>
              <FileText className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{course.mapel?.nama_mapel || "Not assigned"}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Course subject</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Created</CardTitle>
              <Calendar className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(course.created_at).toLocaleDateString()}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Course creation date</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle>Course Modules</CardTitle>
            <CardDescription>Manage your course content and materials</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {course.sub_pembahasan && course.sub_pembahasan.length > 0 ? (
                course.sub_pembahasan.map((sub, index) => (
                  <div key={sub.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">{sub.title}</h3>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{sub.description}</p>
                    {sub.contents && sub.contents.length > 0 ? (
                      <div className="border rounded-md">
                        {sub.contents.map((content, contentIndex) => (
                          <div key={content.id} className="flex items-center justify-between p-4 border-b last:border-0">
                            <div className="flex items-center gap-3">
                              {content.type === "video" ? (
                                <Video className="w-5 h-5 text-slate-500" />
                              ) : content.type === "pdf" ? (
                                <FileText className="w-5 h-5 text-slate-500" />
                              ) : (
                                <BookOpen className="w-5 h-5 text-slate-500" />
                              )}
                              <div>
                                <p className="font-medium">{content.title}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  {content.type === "video" ? "YouTube Video" :
                                    content.type === "pdf" ? "PDF Document" :
                                      "Quiz"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="default">
                                {content.type}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400">No content in this module</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500 dark:text-slate-400">No modules found for this course</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </TeacherLayout>
  );
}

const courses = [
  {
    id: "cs101",
    title: "Introduction to Computer Science",
    description: "Fundamental concepts of computer science and programming",
    image: "/placeholder.svg?height=180&width=320",
    status: "Active",
    students: 92,
    activeStudents: 78,
    lessons: 24,
    completedLessons: 24,
    completion: 85,
    modules: [
      {
        title: "Module 1: Introduction to Programming",
        lessons: [
          {
            title: "What is Computer Science?",
            type: "video",
            status: "Published",
          },
          {
            title: "History of Computing",
            type: "reading",
            status: "Published",
          },
          {
            title: "Basic Programming Concepts",
            type: "video",
            status: "Published",
          },
        ],
      },
      {
        title: "Module 2: Variables and Data Types",
        lessons: [
          {
            title: "Understanding Variables",
            type: "video",
            status: "Published",
          },
          {
            title: "Data Types in Programming",
            type: "video",
            status: "Published",
          },
          {
            title: "Working with Strings and Numbers",
            type: "video",
            status: "Published",
          },
        ],
      },
    ],
  },
  {
    id: "ds201",
    title: "Data Structures and Algorithms",
    description: "Advanced data structures and algorithm design",
    image: "/placeholder.svg?height=180&width=320",
    status: "Active",
    students: 64,
    activeStudents: 52,
    lessons: 18,
    completedLessons: 18,
    completion: 72,
    modules: [],
  },
  {
    id: "web101",
    title: "Web Development Fundamentals",
    description: "HTML, CSS, and JavaScript basics for web development",
    image: "/placeholder.svg?height=180&width=320",
    status: "Active",
    students: 78,
    activeStudents: 70,
    lessons: 32,
    completedLessons: 28,
    completion: 91,
    modules: [],
  },
]

const students = [
  {
    id: "STU001",
    name: "Emma Wilson",
    email: "emma.w@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "EW",
    progress: 92,
    lastActivity: "Today, 10:30 AM",
    grade: 95,
  },
  {
    id: "STU002",
    name: "Ryan Lee",
    email: "ryan.l@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "RL",
    progress: 88,
    lastActivity: "Today, 9:15 AM",
    grade: 92,
  },
  {
    id: "STU003",
    name: "Sarah Parker",
    email: "sarah.p@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "SP",
    progress: 76,
    lastActivity: "Yesterday, 3:45 PM",
    grade: 85,
  },
  {
    id: "STU004",
    name: "Michael Brown",
    email: "michael.b@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "MB",
    progress: 45,
    lastActivity: "3 days ago",
    grade: 68,
  },
  {
    id: "STU005",
    name: "Jessica Taylor",
    email: "jessica.t@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "JT",
    progress: 32,
    lastActivity: "5 days ago",
    grade: 62,
  },
]

const courseAssignments = [
  {
    id: "assign-001",
    title: "Final Project Submission",
    dueDate: "May 15, 2023",
    status: "Active",
    submissions: 45,
    totalStudents: 78,
  },
  {
    id: "assign-003",
    title: "Lab Assignment #4",
    dueDate: "May 22, 2023",
    status: "Upcoming",
    submissions: 0,
    totalStudents: 92,
  },
  {
    id: "assign-004",
    title: "Database Design Project",
    dueDate: "May 10, 2023",
    status: "Past",
    submissions: 38,
    totalStudents: 42,
  },
]
