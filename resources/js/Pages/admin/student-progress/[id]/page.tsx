"use client"

import { Head, Link } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Clock,
  FileText,
  Play,
  User,
  Calendar,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdminPageLayout from "../../layout";
import { Toaster } from "sonner";

interface Student {
  id: number;
  nama_lengkap: string;
  email: string;
  class: string;
  created_at: string;
}

interface CourseProgress {
  course: {
    id: number;
    judul_kursus: string;
    url_thumbnail: string;
  };
  total_content: number;
  completed_content: number;
  progress_percentage: number;
  is_completed: boolean;
  completion_status: string;
  quiz_submissions: Array<{
    id: number;
    score: number;
    submitted_at: string;
    quizContent: {
      title: string;
      kursus: {
        judul_kursus: string;
      };
    };
  }>;
}

interface Activity {
  id: number;
  activity_type: string;
  last_activity: string;
  course?: {
    judul_kursus: string;
  };
  quiz?: {
    title: string;
  };
}

interface Props {
  student?: Student;
  courseProgress?: CourseProgress[];
  recentActivity?: Activity[];
}

export default function StudentProgressDetailPage({ student, courseProgress = [], recentActivity = [] }: Props) {
  // Safe access to student data
  const safeStudent: Partial<Student> = student || {};
  const safeCourseProgress = courseProgress || [];
  const safeRecentActivity = recentActivity || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case 'almost_completed': return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case 'in_progress': return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case 'started': return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'login': return <User className="h-4 w-4" />;
      case 'course_view': return <BookOpen className="h-4 w-4" />;
      case 'video_play': return <Play className="h-4 w-4" />;
      case 'pdf_download': return <FileText className="h-4 w-4" />;
      case 'quiz_start': return <Clock className="h-4 w-4" />;
      case 'quiz_submit': return <CheckCircle className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.activity_type) {
      case 'login': return "Logged in to the system";
      case 'course_view': return `Viewed course: ${activity.course?.judul_kursus || 'Unknown Course'}`;
      case 'video_play': return "Started watching a video";
      case 'pdf_download': return "Downloaded a PDF";
      case 'quiz_start': return "Started a quiz";
      case 'quiz_submit': return `Submitted quiz: ${activity.quiz?.title || 'Unknown Quiz'}`;
      default: return activity.activity_type;
    }
  };

  // Calculate overall statistics
  const totalCourses = safeCourseProgress.length;
  const completedCourses = safeCourseProgress.filter(cp => cp.is_completed).length;
  const inProgressCourses = safeCourseProgress.filter(cp => !cp.is_completed && cp.progress_percentage > 0).length;
  const notStartedCourses = safeCourseProgress.filter(cp => cp.progress_percentage === 0).length;

  const totalQuizzes = safeCourseProgress.reduce((sum, cp) => sum + (cp.quiz_submissions?.length || 0), 0);
  const passedQuizzes = safeCourseProgress.reduce(
    (sum, cp) => sum + (cp.quiz_submissions?.filter(qs => qs.score >= 70).length || 0),
    0
  );

  return (
    <AdminPageLayout>
      <Head title={`Student Progress - ${safeStudent.nama_lengkap || 'Student'}`} />
      <Toaster position="top-right" />

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="rounded-lg">
            <Link href="/admin/student-progress">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-red-700 to-red-500 bg-clip-text">
              Student Progress
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Detailed progress report for {safeStudent.nama_lengkap || 'Student'}
            </p>
          </div>
        </div>

        {/* Student Info */}
        <Card className="border-0 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>Basic information about the student</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">{safeStudent.nama_lengkap || 'Unknown Student'}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{safeStudent.email || ''}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Class</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{safeStudent.class || "Not assigned"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Member Since</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {safeStudent.created_at ? new Date(safeStudent.created_at).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Courses</CardTitle>
              <CardDescription>Total assigned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{totalCourses}</div>
                <BookOpen className="w-4 h-4 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CardDescription>Courses finished</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{completedCourses}</div>
                <CheckCircle className="w-4 h-4 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <CardDescription>Courses started</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{inProgressCourses}</div>
                <Clock className="w-4 h-4 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Quiz Pass Rate</CardTitle>
              <CardDescription>{passedQuizzes}/{totalQuizzes} passed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {totalQuizzes > 0 ? Math.round((passedQuizzes / totalQuizzes) * 100) : 0}%
                </div>
                <Award className="w-4 h-4 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Progress */}
        <Card className="border-0 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle>Course Progress</CardTitle>
            <CardDescription>Progress across all assigned courses</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Quizzes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeCourseProgress.length > 0 ? (
                  safeCourseProgress.map((cp) => (
                    <TableRow key={cp.course?.id || Math.random()}>
                      <TableCell className="font-medium">{cp.course?.judul_kursus || 'Unknown Course'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(cp.completion_status || '')}>
                          {cp.completion_status?.replace('_', ' ') || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${cp.progress_percentage || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">
                            {cp.completed_content || 0}/{cp.total_content || 0} ({cp.progress_percentage || 0}%)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{cp.quiz_submissions?.length || 0} quizzes</span>
                          {cp.quiz_submissions && cp.quiz_submissions.length > 0 && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              ({cp.quiz_submissions.filter(qs => qs.score >= 70).length || 0} passed)
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500 dark:text-slate-400">
                      No course progress data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest student interactions with the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {safeRecentActivity.length > 0 ? (
                safeRecentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      {getActivityIcon(activity.activity_type || '')}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{getActivityText(activity)}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {activity.last_activity ? new Date(activity.last_activity).toLocaleString() : 'Unknown time'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  );
}
