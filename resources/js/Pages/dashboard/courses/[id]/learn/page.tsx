"use client"

import { useState, useEffect, useRef } from "react"
import { Head, router, usePage } from "@inertiajs/react"
import axios from "axios"
import { toast } from "sonner"
import { getFirstMessage } from "@/lib/api-messages"
import { toAbsoluteAssetUrl } from "@/lib/utils"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import {
  ArrowLeft,
  Book,
  Calendar,
  FileText,
  Video,
  Play,
  FileIcon,
  Clock,
  ChevronDown,
  ChevronRight,
  Award,
  Maximize2,
  Minimize2
} from "lucide-react"
import { Dialog } from "@/Components/ui/dialog"
import { DialogContent } from "@radix-ui/react-dialog"

interface SubPembahasan {
  id: number
  title: string
  description: string
}

interface QuizSubmission {
  id: number
  quiz_content_id: number
  quiz_title: string
  score: number
  submitted_at: string
  passed: boolean
}

interface Course {
  id: number
  judul_kursus: string
  deskripsi_kursus: string
  url_thumbnail: string
  mapel: {
    id: number
    nama_mapel: string
  }
  sub_pembahasan: SubPembahasan[]
  contents: Array<{
    id: number
    sub_pembahasan_id: number
    type: "video" | "quiz" | "pdf"
    title: string
    description?: string
    url?: string
    duration?: number
    quiz_data?: string | any[] | null
    one_submission_only?: boolean
    order: number
  }>
}

interface GroupedContent {
  subPembahasan: SubPembahasan
  contents: Course["contents"]
}

interface ParsedQuizData {
  questions: any[]
  timeLimit?: number
}

const CourseLearnPage = ({ id }: { id: string }) => {
  const { auth } = usePage().props as any;
  const user = auth?.user;
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeContent, setActiveContent] = useState<Course["contents"][0] | null>(null)
  const [quizDialogOpen, setQuizDialogOpen] = useState(false)
  const [quizLoading, setQuizLoading] = useState(false)
  const [quizError, setQuizError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set())
  const [trackedVideos, setTrackedVideos] = useState<Set<string>>(new Set())
  const [quizSubmissions, setQuizSubmissions] = useState<QuizSubmission[]>([])
  const [certificateEligible, setCertificateEligible] = useState(false)
  const [certificateChecked, setCertificateChecked] = useState(false)
  const [courseCompleted, setCourseCompleted] = useState(false)
  const [completedVideos, setCompletedVideos] = useState<Set<string>>(new Set()) // Track completed videos
  const [downloadedPDFs, setDownloadedPDFs] = useState<Set<string>>(new Set()) // Track downloaded PDFs
  const [videoWatchTime, setVideoWatchTime] = useState<Map<string, number>>(new Map()) // Track watch time
  const [videoDuration, setVideoDuration] = useState<number>(0)
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0)
  const [isQuizCompleted, setIsQuizCompleted] = useState(false) // Add this line
  const [isVideoZoomed, setIsVideoZoomed] = useState(false)
  const completedVideosRef = useRef<Set<string>>(new Set())
  const completingVideosRef = useRef<Set<string>>(new Set())

  const renderLayout = (content: JSX.Element) => (
    <div className="flex min-h-screen bg-gray-50 dark:bg-blue-950/90">
      <div className="flex-1">
        {content}
      </div>
    </div>
  )

  // Helper function to extract YouTube video ID
  const extractYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getStoredWatchProgress = (courseId: string, videoId: string): number => {
    try {
      const raw = localStorage.getItem(`video-watch-seconds-${courseId}`);
      if (!raw) return 0;
      const parsed = JSON.parse(raw) as Record<string, number>;
      const value = parsed?.[videoId];
      return Number.isFinite(value) ? Math.max(0, value) : 0;
    } catch {
      return 0;
    }
  };

  const persistWatchProgress = (courseId: string, progress: Map<string, number>) => {
    try {
      const payload: Record<string, number> = {};
      progress.forEach((value, key) => {
        payload[key] = Math.max(0, Math.floor(value));
      });
      localStorage.setItem(`video-watch-seconds-${courseId}`, JSON.stringify(payload));
    } catch {
      // no-op
    }
  };

  const fetchQuizSubmissions = async (courseId: string) => {
    try {
      const response = await axios.get(`/api/quiz-submissions/${courseId}`)
      if (response.data && response.data.submissions) {
        setQuizSubmissions(response.data.submissions)
      }
    } catch (error) {

    }
  }

  const getQuizSubmission = (contentId: number) => {
    return quizSubmissions.find(submission => submission.quiz_content_id === contentId)
  }

  // Save video completion to database
  const saveVideoCompletion = async (courseId: string, contentId: number, videoId: string, duration: number) => {
    try {
      const response = await axios.post('/api/progress/video-completion', {
        course_id: courseId,
        content_id: contentId,
        video_id: videoId,
        duration: duration
      });

      if (response.data.status === 'success') {


        // Also update progress in the main progress table
        await updateMainProgress(courseId, contentId, 1); // 1 for video completion
      }

      return response.data;
    } catch (error) {

      if (axios.isAxiosError(error)) {
        return error.response?.data;
      }
    }
    return null;
  };

  // Save PDF download to database
  const savePDFDownload = async (courseId: string, contentId: number, pdfFilename: string) => {
    try {
      const response = await axios.post('/api/progress/pdf-download', {
        course_id: courseId,
        content_id: contentId,
        pdf_filename: pdfFilename
      });

      if (response.data.status === 'success') {


        // Also update progress in the main progress table
        await updateMainProgress(courseId, contentId, 2); // 2 for PDF download
      }

      return response.data;
    } catch (error) {

      if (axios.isAxiosError(error)) {
        return error.response?.data;
      }
    }
    return null;
  };

  // Save quiz completion to database
  const saveQuizCompletion = async (courseId: string, contentId: number, quizId: number, score: number) => {
    try {
      const response = await axios.post('/api/progress/quiz-completion', {
        course_id: courseId,
        content_id: contentId,
        quiz_id: quizId,
        score: score
      });

      if (response.data.status === 'success') {


        // Also update progress in the main progress table
        await updateMainProgress(courseId, contentId, 3); // 3 for quiz completion
      }

      return response.data;
    } catch (error) {

      if (axios.isAxiosError(error)) {
        return error.response?.data;
      }
    }
    return null;
  };

  // Update main progress table
  const updateMainProgress = async (courseId: string, contentId: number, progressPerSubbab: number) => {
    try {
      // Get content details to get sub_pembahasan_id
      const content = course?.contents.find(c => c.id === contentId);
      if (!content) return;

      const response = await axios.post('/api/updateProgress', {
        siswa_id: user.id,
        kursus_id: courseId,
        id_sub_pembahasan: content.sub_pembahasan_id,
        status: 'selesai',
        progress_per_subbab: progressPerSubbab
      });


    } catch (error) {

    }
  };

  // Load progress from database
  const loadProgressFromDatabase = async (courseId: string) => {
    try {
      // Load completed videos
      const completedVideosResponse = await axios.get(`/api/progress/completed-videos/${courseId}`);
      if (completedVideosResponse.data && completedVideosResponse.data.completedVideos) {
        const videoIds = new Set<string>(completedVideosResponse.data.completedVideos);
        setCompletedVideos(videoIds);
        // Also save to localStorage for immediate UI update
        localStorage.setItem(`completed-videos-${courseId}`, JSON.stringify(Array.from(videoIds)));
      }

      // Load downloaded PDFs
      const downloadedPDFsResponse = await axios.get(`/api/progress/downloaded-pdfs/${courseId}`);
      if (downloadedPDFsResponse.data && downloadedPDFsResponse.data.downloadedPDFs) {
        const pdfNames = new Set<string>(downloadedPDFsResponse.data.downloadedPDFs);
        setDownloadedPDFs(pdfNames);
        // Also save to localStorage for immediate UI update
        localStorage.setItem(`downloaded-pdfs-${courseId}`, JSON.stringify(Array.from(pdfNames)));
      }
    } catch (error) {

    }
  };

  const markVideoAsCompleted = (videoId: string, content: Course["contents"][0]) => {
    if (!course || content.type !== "video") return;
    if (completedVideosRef.current.has(videoId) || completingVideosRef.current.has(videoId)) return;

    completingVideosRef.current.add(videoId);

    const newCompletedVideos = new Set(completedVideosRef.current);
    newCompletedVideos.add(videoId);
    completedVideosRef.current = newCompletedVideos;
    setCompletedVideos(newCompletedVideos);
    localStorage.setItem(`completed-videos-${course.id}`, JSON.stringify(Array.from(newCompletedVideos)));

    if (window.studentActivityTracker) {
      window.studentActivityTracker.trackVideoPlay(videoId, content.url || "");
    }

    saveVideoCompletion(course.id.toString(), content.id, videoId, content.duration || 0)
      .then((data) => {
        if (data?.status === "success") {
          toast.success(getFirstMessage(data, "Video completed! You can now navigate to the next content."));
        } else {
          toast.error(getFirstMessage(data, "Failed to save video completion. Please try again."));
        }
      })
      .finally(() => {
        completingVideosRef.current.delete(videoId);
      });
  };

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        if (!id) {

          toast.error("Invalid course ID")
          router.get(route("student.courses"))
          return
        }


        const response = await axios.get(`/api/getDataCourseku/${id}`)




        if (response.data && response.data.kursus && response.data.kursus.length > 0) {
          const courseData = response.data.kursus[0] // Get the first course from the array


          // Ensure contents is an array and has valid quiz data
          if (!Array.isArray(courseData.contents)) {

            courseData.contents = []
          } else {
            // Validate quiz data in contents
            courseData.contents = courseData.contents.map((content: Course["contents"][0]) => {

              if (content.type === "quiz" && content.quiz_data) {

                try {
                  // Ensure quiz_data is properly parsed
                  if (typeof content.quiz_data === "string") {

                    const parsedData = JSON.parse(content.quiz_data)

                    content.quiz_data = parsedData
                  }
                } catch (e) {

                  content.quiz_data = null
                }
              }
              return content
            })

          }


          setCourse(courseData)

          // Set first content as active if available
          if (courseData.contents.length > 0) {

            setActiveContent(courseData.contents[0])
          } else {

          }

          // Auto-expand all sections initially
          if (courseData.sub_pembahasan && courseData.sub_pembahasan.length > 0) {
            const allSectionIds: Set<number> = new Set(courseData.sub_pembahasan.map((sp: SubPembahasan) => sp.id))
            setExpandedSections(allSectionIds)
          }

          // Fetch quiz submissions for this course
          await fetchQuizSubmissions(id)

          // Load progress from database
          await loadProgressFromDatabase(id)
        } else {

          toast.error("Course not found")
          router.get(route("student.courses"))
        }
      } catch (error) {

        if (axios.isAxiosError(error)) {

        }
        toast.error("Failed to load course details")
        router.get(route("student.courses"))
      } finally {
        setLoading(false)
      }
    }

    fetchCourseDetails()
  }, [id])

  useEffect(() => {
    // Initialize activity tracker with user data from page props
    if (user && (window as any).initializeActivityTracker) {
      (window as any).initializeActivityTracker(user);
    }

    // Track course view activity on page load
    if (window.studentActivityTracker && id) {
      window.studentActivityTracker.trackActivity('course_view', { course_id: id });
    }
  }, [id]);

  // Group contents by sub_pembahasan
  const groupedContents: GroupedContent[] = course
    ? course.sub_pembahasan
      ?.map((subPembahasan) => ({
        subPembahasan,
        contents: course.contents
          .filter((content) => content.sub_pembahasan_id === subPembahasan.id)
          .sort((a, b) => a.order - b.order),
      }))
      .filter((group) => group.contents.length > 0) || []
    : []

  const toggleSection = (sectionId: number) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const parseQuizData = (rawQuizData: Course["contents"][0]["quiz_data"]): ParsedQuizData => {
    try {
      const parsed = typeof rawQuizData === "string" ? JSON.parse(rawQuizData) : rawQuizData

      if (Array.isArray(parsed)) {
        return { questions: parsed }
      }

      if (parsed && typeof parsed === "object") {
        const structured = parsed as { questions?: any[]; timeLimit?: number; question?: string }
        const questions = Array.isArray(structured.questions)
          ? structured.questions
          : (structured.question !== undefined ? [structured] : [])
        const parsedTimeLimit = Number(structured.timeLimit)
        const timeLimit = Number.isFinite(parsedTimeLimit) && parsedTimeLimit > 0 ? parsedTimeLimit : undefined

        return { questions, timeLimit }
      }

      return { questions: [] }
    } catch {
      return { questions: [] }
    }
  }

  // Update the handleQuizStart function
  const handleQuizStart = async (content: Course["contents"][0]) => {
    setQuizLoading(true)
    setQuizError(null)
    try {


      // Parse quiz data - handle different possible formats
      const parsedQuizData = parseQuizData(content.quiz_data)
      const quizTimeLimit = content.duration && content.duration > 0
        ? content.duration
        : (parsedQuizData.timeLimit ?? 30)

      // Prepare quiz object with proper structure
      const quiz = {
        id: content.id,
        title: content.title,
        description: content.description || "",
        time_limit: quizTimeLimit,
        passing_score: 70, // Default passing score
        questions: parsedQuizData.questions
          .map((q, index) => ({
            id: index + 1,
            question: q.question || "",
            options: q.options || ["", "", "", ""],
            correct_answer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
            explanation: q.explanation || "",
            points: q.points || 10,
            timeLimit: q.timeLimit || 60,
          })),
      }



      // Validate that we have questions
      if (!quiz.questions || quiz.questions.length === 0) {
        throw new Error("No questions found in quiz data.")
      }

      // Store both quiz and course data in sessionStorage
      sessionStorage.setItem("currentQuiz", JSON.stringify(quiz))
      sessionStorage.setItem("currentCourseId", id)

      setQuizDialogOpen(false)

      // Create a custom event for quiz start
      const quizStartEvent = new CustomEvent("quizStart", {
        detail: {
          courseId: id,
          quizId: content.id,
          quiz: quiz,
        },
      })
      window.dispatchEvent(quizStartEvent)


      // Use the correct route with proper parameter names
      router.get(route("student.quiz.course", { courseId: id, id: content.id }))
    } catch (error: any) {

      setQuizError(error.message || "Invalid quiz data format")
    } finally {
      setQuizLoading(false)
    }
  }

  // Update the handleLogout function
  const handleLogout = () => {
    router.post(
      route("logout"),
      {},
      {
        onSuccess: () => {
          router.visit(route("login"))
        },
        onError: (errors) => {

          toast.error("Failed to logout. Please try again.")
        },
      },
    )
  }

  // Function to claim certificate
  const handleClaimCertificate = async () => {
    if (!course) return;

    try {
      const response = await axios.post(`/api/certificates/issue/${course.id}`);
      if (response.data.success) {
        toast.success(getFirstMessage(response.data, 'Certificate claimed successfully!'), {
          action: {
            label: 'View Certificate',
            onClick: () => router.visit(route('student.certificates'))
          }
        });
        setCertificateEligible(false); // Hide the button after claiming
        setCourseCompleted(true); // Mark course as completed

        // Clear saved progress when course is completed
        localStorage.removeItem(`completed-videos-${course.id}`);
        localStorage.removeItem(`downloaded-pdfs-${course.id}`);
      } else {
        toast.error(getFirstMessage(response.data, 'Failed to claim certificate'));
      }
    } catch (error) {

      if (axios.isAxiosError(error)) {
        toast.error(getFirstMessage(error.response?.data, 'Failed to claim certificate'));
      } else {
        toast.error('Failed to claim certificate');
      }
    }
  }

  // Update the handleBackToCourses function
  const handleBackToCourses = () => {
    const storedCourseId = sessionStorage.getItem("currentCourseId")


    if (storedCourseId) {

      router.get(route("student.courses.learn", { id: storedCourseId }))
    } else {

      router.get(route("student.courses"))
    }
  }

  // Update the handleQuizCompletion function
  const handleQuizCompletion = () => {
    const storedCourseId = sessionStorage.getItem("currentCourseId")


    if (storedCourseId) {

      // Navigate back to course first
      router.get(route("student.courses.learn", { id: storedCourseId }))
      // Clear stored data
      sessionStorage.removeItem("currentQuiz")
      sessionStorage.removeItem("currentCourseId")

      // Refresh quiz submissions to show updated scores after navigation
      setTimeout(() => {
        fetchQuizSubmissions(storedCourseId)
      }, 500)

      // Recheck certificate eligibility after quiz completion
      setTimeout(() => {
        if (course) {
          checkCertificateEligibility()
        }
      }, 1000)
    } else {

      router.get(route("student.courses"))
    }
  }

  // Update the useEffect for quiz completion
  useEffect(() => {
    const handleQuizComplete = (event: CustomEvent) => {
      const storedCourseId = sessionStorage.getItem("currentCourseId")



      // Track quiz completion with the new method
      if (window.studentActivityTracker && event.detail) {
        window.studentActivityTracker.trackQuizCompletionEvent(
          event.detail.quizId?.toString() || '',
          event.detail.courseId?.toString() || storedCourseId || '',
          event.detail.score || 0
        );
      }

      // Save quiz completion to database
      if (event.detail && event.detail.quizId && storedCourseId && activeContent) {
        saveQuizCompletion(storedCourseId, activeContent.id, event.detail.quizId, event.detail.score || 0)
          .then((data) => {
            if (!data || data.status !== 'success') {
              toast.error(getFirstMessage(data, 'Failed to save quiz completion.'));
            }
          });
      }

      if (storedCourseId) {

        router.get(route("student.courses.learn", { id: storedCourseId }))
        // Clear stored data
        sessionStorage.removeItem("currentQuiz")
        sessionStorage.removeItem("currentCourseId")

        // Refresh quiz submissions and check certificate eligibility after navigation
        setTimeout(() => {
          fetchQuizSubmissions(storedCourseId)
          if (course) {
            checkCertificateEligibility()
          }
        }, 500)
      } else {

        router.get(route("student.courses"))
      }
    }

    // Listen for quiz completion event
    window.addEventListener("quizComplete", handleQuizComplete as EventListener)
    return () => {
      window.removeEventListener("quizComplete", handleQuizComplete as EventListener)
    }
  }, [course, activeContent, saveQuizCompletion, fetchQuizSubmissions])

  // Update the useEffect for page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const storedCourseId = sessionStorage.getItem("currentCourseId")
        if (storedCourseId) {

          handleQuizCompletion()
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  // Add useEffect to handle cleanup
  useEffect(() => {
    return () => {
      // Clean up stored data when component unmounts
      sessionStorage.removeItem("currentQuiz")
      sessionStorage.removeItem("currentCourseId")
    }
  }, [])

  // Reset quiz dialog when content changes
  useEffect(() => {
    setQuizDialogOpen(false)
    setQuizError(null)
    setVideoCurrentTime(0)
    setVideoDuration(0)
  }, [activeContent])

  // Track video play when active content changes to a video
  useEffect(() => {
    if (activeContent?.type === "video" && activeContent.url && window.studentActivityTracker) {
      // Extract YouTube video ID
      const videoId = extractYouTubeVideoId(activeContent.url);
      if (videoId && !trackedVideos.has(videoId)) {
        // Track the video play
        window.studentActivityTracker.trackVideoPlay(videoId, activeContent.url);

        // Add to tracked videos to prevent duplicate tracking
        setTrackedVideos(prev => new Set(prev).add(videoId));
      }
    }
  }, [activeContent, trackedVideos]);

  // Initialize YouTube player API and track video completion
  useEffect(() => {
    // Only initialize for video content
    if (activeContent?.type !== "video") return;

    // Load YouTube IFrame API if not already loaded
    const loadYouTubeAPI = () => {
      if (!(window as any).YT) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.onload = () => {

          initializeYouTubePlayers();
        };
        document.body.appendChild(script);
      } else {
        // API already loaded, initialize players
        initializeYouTubePlayers();
      }
    };

    // Set up global callback for when API is ready
    (window as any).onYouTubeIframeAPIReady = () => {

      initializeYouTubePlayers();
    };

    // Load the API
    loadYouTubeAPI();

    return () => {
      // Clean up global handlers
      delete (window as any).onYouTubeIframeAPIReady;
      delete (window as any).onPlayerReady;
      delete (window as any).onPlayerStateChange;
    };
  }, [activeContent]);

  const getAttachedYouTubePlayer = (contentId: number) => {
    const players = (window as any).ytPlayers;
    const player = players?.[contentId];
    if (!player) return null;

    try {
      const iframe = typeof player.getIframe === "function" ? player.getIframe() : null;
      if (!iframe || !document.body.contains(iframe)) {
        if (typeof player.destroy === "function") {
          player.destroy();
        }
        delete players[contentId];
        return null;
      }
      return player;
    } catch {
      try {
        if (typeof player.destroy === "function") {
          player.destroy();
        }
      } catch {
        // no-op
      }
      if (players) {
        delete players[contentId];
      }
      return null;
    }
  };

  // Function to initialize YouTube players
  const initializeYouTubePlayers = () => {
    // Only initialize for video content
    if (activeContent?.type !== "video" || !activeContent.url) return;

    const videoId = extractYouTubeVideoId(activeContent.url);
    if (!videoId) return;

    // Wait for the iframe to be available
    const initializePlayer = () => {
      const iframe = document.getElementById(`youtube-player-${activeContent.id}`);
      if (iframe) {
        // Initialize players object if not exists
        if (!(window as any).ytPlayers) {
          (window as any).ytPlayers = {};
        }

        const currentPlayer = getAttachedYouTubePlayer(activeContent.id);

        // Only initialize if not already initialized and attached
        if (!currentPlayer) {
          try {
            (window as any).ytPlayers[activeContent.id] = new (window as any).YT.Player(`youtube-player-${activeContent.id}`, {
              playerVars: {
                controls: 0,
                disablekb: 1,
                fs: 0,
                rel: 0,
                modestbranding: 1,
                iv_load_policy: 3,
                playsinline: 1,
                origin: window.location.origin,
              },
              events: {
                'onReady': (window as any).onPlayerReady,
                'onStateChange': (window as any).onPlayerStateChange
              }
            });

          } catch (error) {

          }
        }
      }
    };

    // Try to initialize immediately, then again after a delay
    initializePlayer();
    setTimeout(initializePlayer, 1000);
  };

// Set up player ready handler
  (window as any).onPlayerReady = (event: any) => {
    try {
      const player = event?.target;
      const duration = player?.getDuration ? Number(player.getDuration()) : 0;
      if (Number.isFinite(duration) && duration > 0) {
        setVideoDuration(duration);
      }

      if (activeContent?.url && course) {
        const videoId = extractYouTubeVideoId(activeContent.url);
        if (videoId) {
          const lastWatched = videoWatchTime.get(videoId) ?? getStoredWatchProgress(course.id.toString(), videoId);
          if (lastWatched > 0 && player?.seekTo) {
            const isCompleted = completedVideosRef.current.has(videoId);
            const resumeAt = isCompleted ? 0 : lastWatched;
            player.seekTo(resumeAt, true);
            setVideoCurrentTime(resumeAt);
          }
        }
      }
    } catch {
      // no-op
    }
  };

  // Set up state change handler
  (window as any).onPlayerStateChange = (event: any) => {
    const videoId = extractYouTubeVideoId(activeContent?.url || '');
    if (!videoId) return;



    // Video has ended
    if (event.data === 0) {
      if (activeContent) {
        markVideoAsCompleted(videoId, activeContent);
      }
    }

    // Video is playing
    if (event.data === 1) {

    }
  };

  // Debug effect to log completed videos
  useEffect(() => {
    if (activeContent?.type === "video" && activeContent.url) {
      const videoId = extractYouTubeVideoId(activeContent.url);
      if (videoId) {
        // Log removed
      }
    }
  }, [completedVideos, activeContent]);

  useEffect(() => {
    completedVideosRef.current = completedVideos;
  }, [completedVideos]);

  useEffect(() => {
    if (activeContent?.type !== "video" && isVideoZoomed) {
      setIsVideoZoomed(false);
    }
  }, [activeContent, isVideoZoomed]);

  useEffect(() => {
    if (!isVideoZoomed) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isVideoZoomed]);

  // Initialize completed videos from localStorage
  useEffect(() => {
    const savedCompletedVideos = localStorage.getItem(`completed-videos-${id}`);
    if (savedCompletedVideos) {
      try {
        const parsed = JSON.parse(savedCompletedVideos);
        if (Array.isArray(parsed)) {
          setCompletedVideos(new Set(parsed));
        }
      } catch (e) {

      }
    }
  }, [id]);

  // Initialize watch progress (seconds) from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`video-watch-seconds-${id}`);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, number>;
        const next = new Map<string, number>();
        Object.entries(parsed || {}).forEach(([videoId, seconds]) => {
          const safeSeconds = Number.isFinite(seconds) ? Math.max(0, Number(seconds)) : 0;
          next.set(videoId, safeSeconds);
        });
        setVideoWatchTime(next);
      }
    } catch {
      setVideoWatchTime(new Map());
    }
  }, [id]);

  // Persist watch progress to localStorage
  useEffect(() => {
    persistWatchProgress(id, videoWatchTime);
  }, [id, videoWatchTime]);

  // Initialize downloaded PDFs from localStorage
  useEffect(() => {
    const savedDownloadedPDFs = localStorage.getItem(`downloaded-pdfs-${id}`);
    if (savedDownloadedPDFs) {
      try {
        const parsed = JSON.parse(savedDownloadedPDFs);
        if (Array.isArray(parsed)) {
          setDownloadedPDFs(new Set(parsed));
        }
      } catch (e) {

      }
    }
  }, [id]);

  // Save completed videos to localStorage
  useEffect(() => {
    if (completedVideos.size > 0) {
      localStorage.setItem(`completed-videos-${id}`, JSON.stringify(Array.from(completedVideos)));
    }
  }, [completedVideos, id]);

  // Save downloaded PDFs to localStorage
  useEffect(() => {
    if (downloadedPDFs.size > 0) {
      localStorage.setItem(`downloaded-pdfs-${id}`, JSON.stringify(Array.from(downloadedPDFs)));
    }
  }, [downloadedPDFs, id]);

  // Reset certificate state when course changes
  useEffect(() => {
    setCertificateChecked(false);
    setCertificateEligible(false);
  }, [id]);

  // Check if user is eligible for a certificate
  const checkCertificateEligibility = async () => {
    if (!course || !user) return;

    try {
      const response = await axios.get(`/api/certificates/eligibility/${course.id}`);
      setCertificateEligible(response.data.eligible);
      setCertificateChecked(true);
      setCourseCompleted(response.data.eligible); // Set course completed status

      // Clear saved progress when course is completed
      if (response.data.eligible) {
        localStorage.removeItem(`completed-videos-${course.id}`);
        localStorage.removeItem(`downloaded-pdfs-${course.id}`);
      }

      // Don't auto-claim, just check eligibility
    } catch (error) {

      setCertificateChecked(true);
    }
  };

  // Check certificate eligibility when course and submissions are loaded
  useEffect(() => {
    if (course && !certificateChecked) {
      checkCertificateEligibility();
    }
  }, [course, quizSubmissions, certificateChecked]);

  // Periodically enforce anti-skip and update custom progress bar
  useEffect(() => {
    // Only run for video content
    if (activeContent?.type !== "video" || !activeContent.url) return;

    const videoId = extractYouTubeVideoId(activeContent.url);
    if (!videoId) return;

    const initialWatched = videoWatchTime.get(videoId) ?? getStoredWatchProgress(id, videoId);
    if (initialWatched > 0) {
      const isCompleted = completedVideosRef.current.has(videoId);
      setVideoCurrentTime(isCompleted ? 0 : initialWatched);
    } else {
      setVideoCurrentTime(0);
    }

    let intervalId: NodeJS.Timeout | null = null;

    // Set up interval to periodically check video progress
    intervalId = setInterval(() => {
      const player = getAttachedYouTubePlayer(activeContent.id);
      if (!player) {
        initializeYouTubePlayers();
        return;
      }

      try {
        if (player.getCurrentTime && player.getDuration) {
          const currentTime = player.getCurrentTime();
          const duration = player.getDuration();
          const watchedLimit = videoWatchTime.get(videoId) ?? getStoredWatchProgress(id, videoId);
          const isAlreadyCompleted = completedVideosRef.current.has(videoId);

          if (duration > 0) {
            setVideoDuration(duration);
          }

          // Block forward seek beyond watched checkpoint + small tolerance.
          // This still allows seeking backward or jumping forward only up to last watched second.
          const hardLimit = watchedLimit + 1.5;
          if (!isAlreadyCompleted && currentTime > hardLimit) {
            player.seekTo(watchedLimit, true);
            setVideoCurrentTime(watchedLimit);
            return;
          }

          setVideoCurrentTime(currentTime);

          if (currentTime > watchedLimit) {
            setVideoWatchTime((prev) => {
              const next = new Map(prev);
              next.set(videoId, currentTime);
              return next;
            });
          }

          // If video is near the end (within 2 seconds), mark as completed
          if (!isAlreadyCompleted && duration > 0 && (duration - currentTime) <= 2) {
            markVideoAsCompleted(videoId, activeContent);
          }
        }
      } catch {
        initializeYouTubePlayers();
      }
    }, 1000); // Check every second

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activeContent, completedVideos, course, id, videoWatchTime]);

  // Periodically check PDF download status for better reliability
  useEffect(() => {
    // Only run for PDF content
    if (activeContent?.type !== "pdf" || !activeContent.url) return;

    const pdfFilename = activeContent.url ? activeContent.url.split("/").pop() : '';
    if (!pdfFilename) return;

    // Check if PDF is already marked as downloaded
    const isAlreadyDownloaded = downloadedPDFs.has(pdfFilename);
    if (isAlreadyDownloaded) return;

    // For PDFs, we can't automatically detect completion like videos
    // But we can periodically check the database to ensure consistency
    let intervalId: NodeJS.Timeout | null = null;

    // Set up interval to periodically check PDF download status
    intervalId = setInterval(() => {
      // Reload progress from database to ensure consistency
      if (course) {
        loadProgressFromDatabase(course.id.toString());
      }
    }, 5000); // Check every 5 seconds

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activeContent, downloadedPDFs, course]);

  if (loading) {
    return renderLayout(
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary"></div>
      </div>
    )
  }

  if (!course) {
    return renderLayout(
      <div className="flex items-center justify-center min-h-[70vh]">
        <p>Course not found</p>
      </div>
    )
  }

  const formatTime = (seconds: number): string => {
    const safe = Math.max(0, Math.floor(seconds || 0));
    const mm = Math.floor(safe / 60);
    const ss = safe % 60;
    return `${mm}:${ss.toString().padStart(2, "0")}`;
  };

  const handleVideoSeek = (contentId: number, nextTime: number) => {
    if (!activeContent?.url) return;

    const videoId = extractYouTubeVideoId(activeContent.url);
    if (!videoId) return;

    const player = getAttachedYouTubePlayer(contentId);
    if (!player?.seekTo) {
      initializeYouTubePlayers();
      return;
    }

    const watchedLimit = videoWatchTime.get(videoId) ?? getStoredWatchProgress(id, videoId);
    const isCompleted = completedVideosRef.current.has(videoId);
    const allowedTarget = isCompleted ? Math.max(0, nextTime) : Math.min(nextTime, watchedLimit);

    try {
      player.seekTo(allowedTarget, true);
      setVideoCurrentTime(allowedTarget);
    } catch {
      initializeYouTubePlayers();
    }
  };

  const renderContent = (content: Course["contents"][0]) => {
    switch (content.type) {
      case "video":
        // Modify YouTube URL to make it non-skippable
        let videoUrl = content.url || "";
        const youtubeId = extractYouTubeVideoId(videoUrl);

        if (youtubeId) {
          // Use minimal branding embed and custom controls in app.
          videoUrl = `https://www.youtube-nocookie.com/embed/${youtubeId}?controls=0&disablekb=1&fs=0&rel=0&modestbranding=1&playsinline=1&autoplay=0&loop=0&enablejsapi=1&iv_load_policy=3&origin=${window.location.origin}`;
        }

        // Check if this video has been completed - check both state and localStorage
        let isVideoCompleted = false;
        if (youtubeId) {
          // First check the current state directly
          const currentCompletedVideos = new Set(completedVideos);
          if (currentCompletedVideos.has(youtubeId)) {
            isVideoCompleted = true;
          } else {
            // Check localStorage as fallback
            const localStorageCompletedVideos = localStorage.getItem(`completed-videos-${id}`);
            if (localStorageCompletedVideos) {
              try {
                const parsed = JSON.parse(localStorageCompletedVideos);
                if (Array.isArray(parsed)) {
                  isVideoCompleted = parsed.includes(youtubeId);
                }
              } catch (e) {
                // If parsing fails, fall back to state check
                isVideoCompleted = currentCompletedVideos.has(youtubeId);
              }
            }
          }

          // Additional check: If we have the YouTube player API, we can check if the video is actually completed
          // This is a more reliable check than just localStorage
          const player = getAttachedYouTubePlayer(content.id);
          if (player) {
            try {
              // Get current time and duration to check if video is near the end
              const currentTime = player.getCurrentTime ? player.getCurrentTime() : 0;
              const duration = player.getDuration ? player.getDuration() : 0;

              // If video is within 5 seconds of the end, consider it completed
              if (duration > 0 && (duration - currentTime) <= 5) {
                isVideoCompleted = true;
              }
            } catch (e) {

            }
          }
        }

        const isZoomed = isVideoZoomed && activeContent?.id === content.id;
        const sliderInfoClass = isZoomed
          ? "flex flex-wrap items-center justify-between gap-1 text-xs text-slate-200 sm:gap-2"
          : "flex flex-wrap items-center justify-between gap-1 text-xs text-slate-600 dark:text-slate-300 sm:gap-2";
        const unlockedTime = (() => {
          const vid = content.url ? extractYouTubeVideoId(content.url) : null;
          if (!vid) return 0;
          return videoWatchTime.get(vid) ?? getStoredWatchProgress(id, vid);
        })();
        const sliderMax = isVideoCompleted
          ? Math.max(0, Math.floor(videoDuration || 0))
          : Math.max(0, Math.floor(unlockedTime));

        return (
          <div className={isZoomed ? "fixed inset-0 z-[70] overflow-y-auto bg-black/95 p-3 sm:p-4" : "w-full"}>
            <div className={isZoomed ? "mx-auto flex w-full max-w-6xl flex-col gap-3" : "w-full"}>
              {isZoomed && (
                <div className="flex items-center justify-between gap-2 px-3 py-2 text-white border rounded-lg border-white/15 bg-black/60">
                  <p className="text-sm font-medium truncate">{content.title}</p>
                  <Button
                    variant="outline"
                    className="h-8 px-2 text-white bg-transparent border-white/30 hover:bg-white/10"
                    onClick={() => setIsVideoZoomed(false)}
                  >
                    <Minimize2 className="w-4 h-4 mr-1" />
                    Exit Zoom
                  </Button>
                </div>
              )}

              <div className={isZoomed ? "rounded-lg border border-white/15 bg-black/60 p-2" : ""}>
                <div className="aspect-video">
                  <iframe
                    id={`youtube-player-${content.id}`}
                    src={videoUrl}
                    className="w-full h-full rounded-lg"
                    allowFullScreen={true}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    onLoad={() => {
                      // Track video play when iframe loads
                      if (window.studentActivityTracker && content.url) {
                        const videoId = extractYouTubeVideoId(content.url);
                        if (videoId && !trackedVideos.has(videoId)) {
                          window.studentActivityTracker.trackVideoPlay(videoId, content.url);
                          setTrackedVideos(prev => new Set(prev).add(videoId));
                        }
                      }

                      // Try to initialize YouTube player after iframe loads
                      setTimeout(() => {
                        if ((window as any).YT && (window as any).YT.Player) {
                          initializeYouTubePlayers();
                        }
                      }, 500);
                    }}
                  />
                </div>
              </div>

              <div className={isZoomed ? "space-y-2 rounded-lg border border-white/15 bg-black/60 p-3" : "mt-3 space-y-2"}>
                <input
                  type="range"
                  min={0}
                  max={sliderMax}
                  value={Math.min(Math.floor(videoCurrentTime), sliderMax)}
                  onChange={(event) => handleVideoSeek(content.id, Number(event.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 accent-blue-600 dark:bg-slate-700"
                />
                <div className={sliderInfoClass}>
                  <span>{formatTime(videoCurrentTime)}</span>
                  <span>Last unlocked: {formatTime(unlockedTime)}</span>
                  <span>{formatTime(videoDuration)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2 sm:flex-row sm:items-center sm:justify-between">
                {isVideoCompleted ? (
                  <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Video completed
                  </div>
                ) : (
                  <div className="text-sm leading-relaxed text-yellow-600 dark:text-yellow-400">
                    Progress bar hanya bisa maju sampai posisi terakhir yang sudah ditonton.
                  </div>
                )}
                <div className="flex items-center self-start gap-2 sm:self-auto">
                  <div className={isZoomed ? "text-xs text-slate-200" : "text-xs text-gray-500 dark:text-gray-400"}>
                    Status: {isVideoCompleted ? 'Completed' : 'In Progress'}
                  </div>
                  {!isZoomed && (
                    <Button
                      variant="outline"
                      className="h-8 px-2 text-xs"
                      onClick={() => setIsVideoZoomed(true)}
                    >
                      <Maximize2 className="mr-1 h-3.5 w-3.5" />
                      Zoom
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "pdf":
        // Extract filename from content.url (e.g., /storage/pdfs/filename.pdf)
        const pdfFilename = content.url ? content.url.split("/").pop() : '';

        // Check if this PDF has been downloaded - check both state and localStorage
        let isPDFDownloaded = false;
        if (pdfFilename) {
          // First check the current state directly
          const currentDownloadedPDFs = new Set(downloadedPDFs);
          if (currentDownloadedPDFs.has(pdfFilename)) {
            isPDFDownloaded = true;
          } else {
            // Check localStorage as fallback
            const localStorageDownloadedPDFs = localStorage.getItem(`downloaded-pdfs-${id}`);
            if (localStorageDownloadedPDFs) {
              try {
                const parsed = JSON.parse(localStorageDownloadedPDFs);
                if (Array.isArray(parsed)) {
                  isPDFDownloaded = parsed.includes(pdfFilename);
                }
              } catch (e) {
                // If parsing fails, fall back to state check
                isPDFDownloaded = currentDownloadedPDFs.has(pdfFilename);
              }
            }
          }
        }

        // Track PDF download when link is clicked
        const handlePDFDownload = (e: React.MouseEvent) => {
          e.preventDefault();

          // Extract filename from content.url (e.g., /storage/pdfs/filename.pdf)
          const pdfFilename = content.url ? content.url.split("/").pop() : '';

          // Track the download
          if (window.studentActivityTracker && pdfFilename) {
            window.studentActivityTracker.trackPDFDownload(pdfFilename, `/download/pdf/${pdfFilename}`);

            // Mark PDF as downloaded and update state immediately
            const newDownloadedPDFs = new Set(downloadedPDFs);
            newDownloadedPDFs.add(pdfFilename);
            setDownloadedPDFs(newDownloadedPDFs);

            // Also update localStorage immediately for UI consistency
            if (course) {
              localStorage.setItem(`downloaded-pdfs-${course.id}`, JSON.stringify(Array.from(newDownloadedPDFs)));
            }

            // Save PDF download to database and show feedback based on backend response
            if (course && content) {
              savePDFDownload(course.id.toString(), content.id, pdfFilename)
                .then((data) => {
                  if (data?.status === 'success') {
                    toast.success(getFirstMessage(data, 'PDF downloaded! You can now navigate to the next content.'));
                  } else {
                    toast.error(getFirstMessage(data, 'Failed to save PDF download. Please try again.'));
                  }
                });
            } else {
              toast.error('Failed to save PDF download. Please try again.');
            }
          }

          // Actually download the file
          if (content.url) {
            window.open(content.url, '_blank');
          }
        };
        return (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="flex flex-col items-center justify-center w-full h-full">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {isPDFDownloaded ? 'Downloaded' : 'Not Downloaded'}
              </div>
              <button
                className="px-4 py-2 mt-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                onClick={handlePDFDownload}
              >
                {isPDFDownloaded ? 'Open PDF' : 'Download PDF'}
              </button>
            </div>
          </div>
        );

      case "quiz":
        const parsedQuizData = parseQuizData(content.quiz_data)
        const questionCount = parsedQuizData.questions.length
        const quizTimeLimit = content.duration && content.duration > 0
          ? content.duration
          : (parsedQuizData.timeLimit ?? 30)
        const submission = getQuizSubmission(content.id);

        // Check if this is a one submission only quiz and user has already taken it
        const isOneSubmissionOnly = content.one_submission_only || false;
        const hasTakenQuiz = !!submission;

        // Track quiz start when button is clicked
        const handleStartQuiz = () => {
          // untuk debugging

          // Track quiz start
          if (window.studentActivityTracker) {
            window.studentActivityTracker.trackQuizStart(content.id.toString());
          }

          setQuizDialogOpen(true);
        };

        return (
          <div className="p-4">
            <h3 className="mb-1 text-lg font-semibold">Quiz: {content.title}</h3>
            <p className="mb-2 text-gray-600 dark:text-gray-300">{content.description}</p>
            <div className="flex flex-wrap items-center gap-2 mb-4 sm:gap-4">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{questionCount} Questions</span>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Time Limit: {quizTimeLimit} min</span>
            </div>

            {/* Quiz Score Display */}
            {submission && (
              <div className="p-3 mb-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-blue-900/50 dark:border-blue-800">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Score:</span>
                    <span className={`text-lg font-bold ${submission.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {submission.score}%
                    </span>
                  </div>
                  <Badge variant={submission.passed ? "default" : "destructive"} className="text-xs">
                    {submission.passed ? "PASSED" : "FAILED"}
                  </Badge>
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                </div>
                {isOneSubmissionOnly && (
                  <div className="mt-2 text-xs text-blue-600 dark:text-blue-300">
                    This quiz can only be taken once.
                  </div>
                )}
              </div>
            )}

            {quizError && <div className="mb-2 text-sm text-red-500">{quizError}</div>}
            {parsedQuizData.questions.length === 0 && <div className="mb-2 text-sm text-red-500">Quiz data is invalid or missing.</div>}

            {/* Show message if this is a one submission only quiz and user has already taken it */}
            {isOneSubmissionOnly && hasTakenQuiz ? (
              <div className="p-3 text-sm text-center text-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/50 dark:text-blue-300">
                You have already completed this quiz. Only one submission is allowed.
              </div>
            ) : (
                <Button
                  onClick={handleStartQuiz}
                  className="w-full"
                  disabled={quizLoading || parsedQuizData.questions.length === 0}
                >
                {quizLoading ? "Preparing Quiz..." : "Start Quiz"}
              </Button>
            )}

            {/* Quiz Dialog */}
            <Dialog open={quizDialogOpen} onOpenChange={setQuizDialogOpen}>
              <DialogContent className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="w-full max-w-md max-h-[90vh] mx-4 overflow-y-auto rounded-lg bg-white p-4 shadow-lg sm:p-6 dark:bg-blue-900">
                  <h2 className="mb-2 text-lg font-semibold">Start Quiz?</h2>
                  <p className="mb-4 text-gray-700 dark:text-gray-200">
                    You are about to start <b>{content.title}</b>.<br />
                    {isOneSubmissionOnly && (
                      <span className="font-bold text-red-600 dark:text-red-400">
                        This quiz can only be taken once.
                      </span>
                    )}
                    <br />
                    Once started, you cannot return until you finish. Are you ready?
                  </p>
                  <div className="flex flex-col-reverse gap-2 mt-4 sm:flex-row sm:justify-end">
                    <Button variant="outline" onClick={() => setQuizDialogOpen(false)} disabled={quizLoading} className="w-full sm:w-auto">
                      Cancel
                    </Button>
                    <Button onClick={() => handleQuizStart(content)} disabled={quizLoading} className="w-full sm:w-auto">
                      {quizLoading ? "Starting..." : "Yes, Start Quiz"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        );
      default:
        return <p>Unsupported content type</p>
    }
  }

  return renderLayout(
    <div className="min-h-screen bg-gray-50 dark:bg-blue-950/90">
      <Head title={`${course.judul_kursus} - Learning`} />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-blue-100 bg-white/80 backdrop-blur-sm dark:border-blue-800 dark:bg-blue-900/80">
        <div className="container px-3 py-2 mx-auto sm:px-4 sm:py-3 md:py-4">
          <div className="flex items-center justify-between gap-2 md:gap-3">
            <div className="flex min-w-0 items-center gap-1.5 md:gap-2">
              <Button
                variant="ghost"
                onClick={() => router.visit('/dashboard/courses')}
                className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Courses</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="hidden w-px h-6 bg-gray-200 md:block dark:bg-gray-700" />
              <div className="flex items-center min-w-0 gap-2 sm:gap-3">
                <div className="relative">
                  <img
                    src={toAbsoluteAssetUrl(course.url_thumbnail, "/placeholder.svg")}
                    alt={course.judul_kursus}
                    className="object-cover w-8 h-8 rounded-lg ring-2 ring-blue-100 sm:h-10 sm:w-10 dark:ring-blue-800"
                  />
                  <div className="absolute w-3 h-3 bg-green-500 border-2 border-white rounded-full -bottom-1 -right-1 sm:h-4 sm:w-4 dark:border-gray-900" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-sm font-semibold text-gray-900 line-clamp-1 sm:text-base dark:text-white">
                    {course.judul_kursus}
                  </h1>
                  <p className="hidden line-clamp-1 text-[11px] text-gray-500 sm:block sm:text-xs dark:text-gray-400">{course.mapel?.nama_mapel}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline" className="hidden text-xs text-blue-700 bg-blue-50 dark:bg-blue-800/50 dark:text-blue-200 sm:inline-flex sm:text-sm">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date().toLocaleDateString()}
              </Badge>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="h-8 px-2 text-xs text-red-600 hover:text-red-700 sm:h-9 sm:px-3 sm:text-sm dark:text-red-400 dark:hover:text-red-300"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6 mx-auto">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-blue-100 shadow-sm dark:border-blue-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Course Content</CardTitle>
                    <CardDescription>Available materials</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-800/50">
                    {course.contents.length} Lessons
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {groupedContents.map((group, groupIndex) => (
                    <div
                      key={group.subPembahasan.id}
                      className="border border-gray-100 rounded-lg dark:border-gray-800"
                    >
                      {/* Sub-section Header */}
                      <Button
                        variant="ghost"
                        className="justify-between w-full h-auto p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        onClick={() => {
                          // Check if current active content is completed
                          let isCurrentContentCompleted = true;
                          if (activeContent?.type === "video" && activeContent.url) {
                            const videoId = extractYouTubeVideoId(activeContent.url);
                            if (videoId) {
                              // Check both state and localStorage to ensure consistency
                              const localStorageCompletedVideos = localStorage.getItem(`completed-videos-${id}`);
                              if (localStorageCompletedVideos) {
                                try {
                                  const parsed = JSON.parse(localStorageCompletedVideos);
                                  if (Array.isArray(parsed)) {
                                    isCurrentContentCompleted = parsed.includes(videoId) || completedVideos.has(videoId);
                                  } else {
                                    isCurrentContentCompleted = completedVideos.has(videoId);
                                  }
                                } catch (e) {
                                  isCurrentContentCompleted = completedVideos.has(videoId);
                                }
                              } else {
                                isCurrentContentCompleted = completedVideos.has(videoId);
                              }
                            }
                          } else if (activeContent?.type === "pdf" && activeContent.url) {
                            const pdfFilename = activeContent.url.split("/").pop() || '';
                            if (pdfFilename) {
                              // Check both state and localStorage to ensure consistency
                              const localStorageDownloadedPDFs = localStorage.getItem(`downloaded-pdfs-${id}`);
                              if (localStorageDownloadedPDFs) {
                                try {
                                  const parsed = JSON.parse(localStorageDownloadedPDFs);
                                  if (Array.isArray(parsed)) {
                                    isCurrentContentCompleted = parsed.includes(pdfFilename) || downloadedPDFs.has(pdfFilename);
                                  } else {
                                    isCurrentContentCompleted = downloadedPDFs.has(pdfFilename);
                                  }
                                } catch (e) {
                                  isCurrentContentCompleted = downloadedPDFs.has(pdfFilename);
                                }
                              } else {
                                isCurrentContentCompleted = downloadedPDFs.has(pdfFilename);
                              }
                            }
                          } else if (activeContent?.type === "quiz") {
                            // For quizzes, check if there's a submission in the quizSubmissions array
                            const quizSubmission = getQuizSubmission(activeContent.id);
                            isCurrentContentCompleted = !!quizSubmission;
                          }

                          // Only restrict section toggling if current content is not completed
                          if ((activeContent?.type === "video" || activeContent?.type === "pdf" || activeContent?.type === "quiz") && !isCurrentContentCompleted) {
                            if (activeContent?.type === "video") {
                              toast.error("Please complete the current video before navigating to another section.");
                            } else if (activeContent?.type === "pdf") {
                              toast.error("Please download the PDF before navigating to another section.");
                            } else {
                              toast.error("Please complete the current quiz before navigating to another section.");
                            }
                          } else {
                            toggleSection(group.subPembahasan.id);
                          }
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate dark:text-white">
                            {group.subPembahasan.title}
                          </h4>
                          <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                            {group.contents.length} items
                          </p>
                        </div>
                        {expandedSections.has(group.subPembahasan.id) ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </Button>

                      {/* Content Items */}
                      {expandedSections.has(group.subPembahasan.id) && (
                        <div className="px-2 pb-2 space-y-1">
                          {group.contents.map((content, contentIndex) => (
                            <Button
                              key={content.id}
                              variant={activeContent?.id === content.id ? "default" : "ghost"}
                              className={`w-full justify-start gap-2 transition-all duration-200 group relative text-xs h-auto py-2 ${activeContent?.id === content.id
                                ? "bg-blue-50 dark:bg-blue-800/50 text-blue-700 dark:text-blue-200"
                                : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                }`}
                              onClick={() => {
                                // Check if current active content is completed
                                let isCurrentContentCompleted = true;
                                if (activeContent?.type === "video" && activeContent.url) {
                                  const videoId = extractYouTubeVideoId(activeContent.url);
                                  if (videoId) {
                                    // Check both state and localStorage to ensure consistency
                                    const localStorageCompletedVideos = localStorage.getItem(`completed-videos-${id}`);
                                    if (localStorageCompletedVideos) {
                                      try {
                                        const parsed = JSON.parse(localStorageCompletedVideos);
                                        if (Array.isArray(parsed)) {
                                          isCurrentContentCompleted = parsed.includes(videoId) || completedVideos.has(videoId);
                                        } else {
                                          isCurrentContentCompleted = completedVideos.has(videoId);
                                        }
                                      } catch (e) {
                                        isCurrentContentCompleted = completedVideos.has(videoId);
                                      }
                                    } else {
                                      isCurrentContentCompleted = completedVideos.has(videoId);
                                    }
                                  }
                                } else if (activeContent?.type === "pdf" && activeContent.url) {
                                  const pdfFilename = activeContent.url.split("/").pop() || '';
                                  if (pdfFilename) {
                                    // Check both state and localStorage to ensure consistency
                                    const localStorageDownloadedPDFs = localStorage.getItem(`downloaded-pdfs-${id}`);
                                    if (localStorageDownloadedPDFs) {
                                      try {
                                        const parsed = JSON.parse(localStorageDownloadedPDFs);
                                        if (Array.isArray(parsed)) {
                                          isCurrentContentCompleted = parsed.includes(pdfFilename) || downloadedPDFs.has(pdfFilename);
                                        } else {
                                          isCurrentContentCompleted = downloadedPDFs.has(pdfFilename);
                                        }
                                      } catch (e) {
                                        isCurrentContentCompleted = downloadedPDFs.has(pdfFilename);
                                      }
                                    } else {
                                      isCurrentContentCompleted = downloadedPDFs.has(pdfFilename);
                                    }
                                  }
                                } else if (activeContent?.type === "quiz") {
                                  // For quizzes, check if there's a submission in the quizSubmissions array
                                  const quizSubmission = getQuizSubmission(activeContent.id);
                                  isCurrentContentCompleted = !!quizSubmission;
                                }

                                // Only restrict navigation if current content is not completed
                                // and user is trying to navigate to a different content
                                if ((activeContent?.type === "video" || activeContent?.type === "pdf" || activeContent?.type === "quiz") &&
                                  !isCurrentContentCompleted &&
                                  activeContent?.id !== content.id) {
                                  if (activeContent?.type === "video") {
                                    toast.error("Please complete the current video before navigating to another content.");
                                  } else if (activeContent?.type === "pdf") {
                                    toast.error("Please download the PDF before navigating to another content.");
                                  } else {
                                    toast.error("Please complete the current quiz before navigating to another content.");
                                  }
                                } else {
                                  setActiveContent(content);
                                }
                              }}
                              title={content.title}
                            >
                              <div className="flex items-center flex-1 min-w-0 gap-2">
                                <span
                                  className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium transition-colors flex-shrink-0 ${activeContent?.id === content.id
                                    ? "bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-blue-200"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                    }`}
                                >
                                  {contentIndex + 1}
                                </span>
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                  {content.type === "video" && <Play className="flex-shrink-0 w-3 h-3" />}
                                  {content.type === "pdf" && <FileIcon className="flex-shrink-0 w-3 h-3" />}
                                  {content.type === "quiz" && <Book className="flex-shrink-0 w-3 h-3" />}
                                  <span className="block text-xs truncate" title={content.title}>
                                    {content.title}
                                  </span>
                                </div>
                              </div>
                              {activeContent?.id === content.id && (
                                <div className="absolute top-0 bottom-0 left-0 w-1 bg-blue-600 rounded-r-full dark:bg-blue-400" />
                              )}
                            </Button>
                          ))}
                        </div>
                      )}

                    </div>
                  ))}

                  {/* Certificate Claiming Section */}
                  {courseCompleted && (
                    <div className="mt-4 border border-gray-100 rounded-lg dark:border-gray-800">
                      <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <div>
                              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                Course Completed!
                              </p>
                              <p className="text-xs text-green-600 dark:text-green-400">
                                You're eligible for a certificate
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={handleClaimCertificate}
                          className="w-full mt-3 text-white bg-green-600 hover:bg-green-700"
                          disabled={certificateChecked && !certificateEligible}
                        >
                          <Award className="w-4 h-4 mr-2" />
                          Claim Certificate
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {activeContent ? (
              <Card className="border-blue-100 shadow-sm dark:border-blue-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    {activeContent.type === "video" && <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                    {activeContent.type === "pdf" && <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                    {activeContent.type === "quiz" && <Book className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                    <CardTitle className="text-base break-words sm:text-xl">{activeContent.title}</CardTitle>
                  </div>
                  {activeContent.description && (
                    <CardDescription className="mt-2 text-sm sm:text-base">{activeContent.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    {renderContent(activeContent)}
                  </div>
                  <div className="flex flex-col gap-3 mt-4 sm:flex-row sm:items-center sm:justify-between">
                    {(() => {
                      // Get current sub-pembahasan contents only
                      const currentSubPembahasanContents = activeContent
                        ? course.contents
                          .filter((content) => content.sub_pembahasan_id === activeContent.sub_pembahasan_id)
                          .sort((a, b) => a.order - b.order)
                        : []

                      const currentIndex = currentSubPembahasanContents.findIndex(
                        (content) => content.id === activeContent?.id,
                      )
                      const isFirstInSection = currentIndex === 0
                      const isLastInSection = currentIndex === currentSubPembahasanContents.length - 1

                      // Check if current content is completed (for video, PDF, and quiz content)
                      let isCurrentContentCompleted = true;
                      if (activeContent?.type === "video" && activeContent.url) {
                        const videoId = extractYouTubeVideoId(activeContent.url);
                        if (videoId) {
                          // Check both state and localStorage to ensure consistency
                          const currentCompletedVideos = new Set(completedVideos);
                          if (currentCompletedVideos.has(videoId)) {
                            isCurrentContentCompleted = true;
                          } else {
                            // Check localStorage as fallback
                            const localStorageCompletedVideos = localStorage.getItem(`completed-videos-${id}`);
                            if (localStorageCompletedVideos) {
                              try {
                                const parsed = JSON.parse(localStorageCompletedVideos);
                                if (Array.isArray(parsed)) {
                                  isCurrentContentCompleted = parsed.includes(videoId);
                                }
                              } catch (e) {
                                isCurrentContentCompleted = currentCompletedVideos.has(videoId);
                              }
                            } else {
                              isCurrentContentCompleted = currentCompletedVideos.has(videoId);
                            }
                          }

                        }
                      } else if (activeContent?.type === "pdf" && activeContent.url) {
                        const pdfFilename = activeContent.url.split("/").pop() || '';
                        if (pdfFilename) {
                          // Check both state and localStorage to ensure consistency
                          const currentDownloadedPDFs = new Set(downloadedPDFs);
                          if (currentDownloadedPDFs.has(pdfFilename)) {
                            isCurrentContentCompleted = true;
                          } else {
                            // Check localStorage as fallback
                            const localStorageDownloadedPDFs = localStorage.getItem(`downloaded-pdfs-${id}`);
                            if (localStorageDownloadedPDFs) {
                              try {
                                const parsed = JSON.parse(localStorageDownloadedPDFs);
                                if (Array.isArray(parsed)) {
                                  isCurrentContentCompleted = parsed.includes(pdfFilename);
                                }
                              } catch (e) {
                                isCurrentContentCompleted = currentDownloadedPDFs.has(pdfFilename);
                              }
                            } else {
                              isCurrentContentCompleted = currentDownloadedPDFs.has(pdfFilename);
                            }
                          }

                        }
                      } else if (activeContent?.type === "quiz") {
                        // For quizzes, check if there's a submission in the quizSubmissions array
                        const quizSubmission = getQuizSubmission(activeContent.id);
                        isCurrentContentCompleted = !!quizSubmission;

                      }

                      return (
                        <>
                          <Button
                            variant="outline"
                            className="w-full gap-2 transition-colors bg-transparent sm:w-auto hover:bg-blue-50 dark:hover:bg-blue-800/50"
                            disabled={isFirstInSection}
                            onClick={() => {

                              // Check if current content is completed before moving to previous
                              if ((activeContent?.type === "video" || activeContent?.type === "pdf" || activeContent?.type === "quiz") && !isCurrentContentCompleted) {
                                if (activeContent?.type === "video") {
                                  toast.error("Please complete the current video before navigating.");
                                } else if (activeContent?.type === "pdf") {
                                  toast.error("Please download the PDF before navigating.");
                                } else {
                                  toast.error("Please complete the current quiz before navigating.");
                                }
                                return;
                              }

                              if (currentIndex > 0) {

                                setActiveContent(currentSubPembahasanContents[currentIndex - 1])
                              }
                            }}
                          >
                            <ArrowLeft className="w-4 h-4" />
                            Previous
                          </Button>
                          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>
                              {currentIndex + 1} of {currentSubPembahasanContents.length}
                            </span>
                            {activeContent && (
                              <span className="px-2 py-1 text-xs bg-gray-100 rounded dark:bg-gray-800">
                                {
                                  groupedContents.find((group) =>
                                    group.contents.some((content) => content.id === activeContent.id),
                                  )?.subPembahasan.title
                                }
                              </span>
                            )}
                          </div>
                          <Button
                            className="w-full gap-2 transition-colors bg-blue-600 sm:w-auto hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                            disabled={isLastInSection}
                            onClick={() => {




                              // Check if current content is completed before moving to next
                              if ((activeContent?.type === "video" || activeContent?.type === "pdf" || activeContent?.type === "quiz") && !isCurrentContentCompleted) {
                                if (activeContent?.type === "video") {
                                  toast.error("Please complete the current video before navigating.");
                                } else if (activeContent?.type === "pdf") {
                                  toast.error("Please download the PDF before navigating.");
                                } else {
                                  toast.error("Please complete the current quiz before navigating.");
                                }
                                return;
                              }

                              if (currentIndex < currentSubPembahasanContents.length - 1) {

                                setActiveContent(currentSubPembahasanContents[currentIndex + 1])
                              } else {

                              }
                            }}
                          >
                            Next
                            <ArrowLeft className="w-4 h-4 rotate-180" />
                          </Button>
                        </>
                      )
                    })()}
                  </div>

                </CardContent>
              </Card>
            ) : (
              <Card className="border-blue-100 shadow-sm dark:border-blue-800">
                <CardContent className="flex flex-col items-center justify-center h-[400px] text-center">
                  <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-blue-50 dark:bg-blue-800/50">
                    <Book className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">Select a Content to Begin</h3>
                  <p className="max-w-sm text-gray-500 dark:text-gray-400">
                    Choose a lesson from the sidebar to start your learning journey
                  </p>

                  {/* Certificate Claiming Section when no content is selected but course is completed */}
                  {courseCompleted && (
                    <div className="w-full max-w-md p-4 mt-6 rounded-lg bg-green-50 dark:bg-green-900/30">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <p className="text-lg font-medium text-green-800 dark:text-green-200">
                          Course Completed!
                        </p>
                      </div>
                      <p className="mb-4 text-sm text-center text-green-600 dark:text-green-400">
                        Congratulations! You've completed all required content. Claim your certificate now.
                      </p>
                      <Button
                        onClick={handleClaimCertificate}
                        className="w-full text-white bg-green-600 hover:bg-green-700"
                      >
                        <Award className="w-4 h-4 mr-2" />
                        Claim Certificate
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default CourseLearnPage
