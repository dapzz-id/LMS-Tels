"use client"

import { useState, useEffect } from "react"
import { Head, router, usePage } from "@inertiajs/react"
import axios from "axios"
import { toast } from "sonner"
import { getFirstMessage } from "@/lib/api-messages"
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
  Menu
} from "lucide-react"
import { Dialog } from "@/Components/ui/dialog"
import { DialogContent } from "@radix-ui/react-dialog"
import StudentSidebar from "@/Components/StudentSidebar"

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
  const [isQuizCompleted, setIsQuizCompleted] = useState(false) // Add this line
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

  // Helper function to extract YouTube video ID
  const extractYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const fetchQuizSubmissions = async (courseId: string) => {
    try {
      const response = await axios.get(`/api/quiz-submissions/${courseId}`)
      if (response.data && response.data.submissions) {
        setQuizSubmissions(response.data.submissions)
      }
    } catch (error) {
      console.error("Error fetching quiz submissions:", error)
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
        console.log('Video completion saved to database:', response.data);

        // Also update progress in the main progress table
        await updateMainProgress(courseId, contentId, 1); // 1 for video completion
      }

      return response.data;
    } catch (error) {
      console.error('Error saving video completion:', error);
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
        console.log('PDF download saved to database:', response.data);

        // Also update progress in the main progress table
        await updateMainProgress(courseId, contentId, 2); // 2 for PDF download
      }

      return response.data;
    } catch (error) {
      console.error('Error saving PDF download:', error);
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
        console.log('Quiz completion saved to database:', response.data);

        // Also update progress in the main progress table
        await updateMainProgress(courseId, contentId, 3); // 3 for quiz completion
      }

      return response.data;
    } catch (error) {
      console.error('Error saving quiz completion:', error);
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

      console.log('Main progress updated:', response.data);
    } catch (error) {
      console.error('Error updating main progress:', error);
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
      console.error("Error loading progress from database:", error);
    }
  };

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        if (!id) {
          console.error("Course ID is undefined")
          toast.error("Invalid course ID")
          router.get(route("student.courses"))
          return
        }

        console.log("Fetching course details for ID:", id)
        const response = await axios.get(`/api/getDataCourseku/${id}`)
        console.log("Raw API Response:", response)
        console.log("Response data:", response.data)
        console.log("Response data.kursus:", response.data?.kursus)

        if (response.data && response.data.kursus && response.data.kursus.length > 0) {
          const courseData = response.data.kursus[0] // Get the first course from the array
          console.log("Course data before processing:", courseData)

          // Ensure contents is an array and has valid quiz data
          if (!Array.isArray(courseData.contents)) {
            console.log("Contents is not an array, setting to empty array")
            courseData.contents = []
          } else {
            // Validate quiz data in contents
            courseData.contents = courseData.contents.map((content: Course["contents"][0]) => {
              console.log("Processing content:", content)
              if (content.type === "quiz" && content.quiz_data) {
                console.log("Found quiz content with data:", content.quiz_data)
                try {
                  // Ensure quiz_data is properly parsed
                  if (typeof content.quiz_data === "string") {
                    console.log("Parsing quiz data string:", content.quiz_data)
                    const parsedData = JSON.parse(content.quiz_data)
                    console.log("Parsed quiz data:", parsedData)
                    content.quiz_data = parsedData
                  }
                } catch (e) {
                  console.error("Error parsing quiz data:", e)
                  content.quiz_data = null
                }
              }
              return content
            })
            console.log("Processed contents array:", courseData.contents)
          }

          console.log("Setting course data:", courseData)
          setCourse(courseData)

          // Set first content as active if available
          if (courseData.contents.length > 0) {
            console.log("Setting active content to first item:", courseData.contents[0])
            setActiveContent(courseData.contents[0])
          } else {
            console.log("No contents available to set as active")
          }

          // Auto-expand all sections initially
          if (courseData.sub_pembahasan && courseData.sub_pembahasan.length > 0) {
            const allSectionIds : Set<number>= new Set(courseData.sub_pembahasan.map((sp: SubPembahasan) => sp.id))
            setExpandedSections(allSectionIds)
          }

          // Fetch quiz submissions for this course
          await fetchQuizSubmissions(id)

          // Load progress from database
          await loadProgressFromDatabase(id)
        } else {
          console.error("Invalid response format or empty kursus array:", response.data)
          toast.error("Course not found")
          router.get(route("student.courses"))
        }
      } catch (error) {
        console.error("Error fetching course details:", error)
        if (axios.isAxiosError(error)) {
          console.error("Axios error details:", {
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers,
          })
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

  // Update the handleQuizStart function
  const handleQuizStart = async (content: Course["contents"][0]) => {
    setQuizLoading(true)
    setQuizError(null)
    try {
      console.log("Starting quiz with content:", content)

      // Parse quiz data - handle different possible formats
      let quizData: any[] = []
      try {
        if (typeof content.quiz_data === "string") {
          const parsed = JSON.parse(content.quiz_data)
          // Handle the new structure with timeLimit, passingScore, and questions
          if (parsed.questions) {
            quizData = parsed.questions
          } else {
            // Handle legacy format
            quizData = Array.isArray(parsed) ? parsed : [parsed]
          }
        } else if (typeof content.quiz_data === "object" && content.quiz_data !== null) {
          // Handle the new structure with timeLimit, passingScore, and questions
          if ((content.quiz_data as any).questions) {
            quizData = (content.quiz_data as any).questions
          } else {
            // Handle legacy format
            quizData = Array.isArray(content.quiz_data) ? content.quiz_data : [content.quiz_data]
          }
        } else {
          quizData = []
        }
        console.log("Parsed quiz data:", quizData)
      } catch (e) {
        console.error("Error parsing quiz data:", e)
        quizData = []
      }

      // Prepare quiz object with proper structure
      const quiz = {
        id: content.id,
        title: content.title,
        description: content.description || "",
        time_limit: content.duration || 30,
        passing_score: 70, // Default passing score
        questions: Array.isArray(quizData)
          ? quizData.map((q, index) => ({
              id: index + 1,
              question: q.question || "",
              options: q.options || ["", "", "", ""],
              correct_answer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
              explanation: q.explanation || "",
              points: q.points || 10,
              timeLimit: q.timeLimit || 60,
            }))
          : [],
      }

      console.log("Prepared quiz object:", quiz)

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

      console.log("Navigating to quiz page with params:", { courseId: id, id: content.id })
      // Use the correct route with proper parameter names
      router.get(route("student.quiz.course", { courseId: id, id: content.id }))
    } catch (error: any) {
      console.error("Error starting quiz:", error)
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
          console.error("Logout error:", errors)
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
      console.error('Error claiming certificate:', error);
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
    console.log("Back button clicked, stored course ID:", storedCourseId)

    if (storedCourseId) {
      console.log("Navigating back to course with ID:", storedCourseId)
      router.get(route("student.courses.learn", { id: storedCourseId }))
    } else {
      console.log("No stored course ID, navigating to courses list")
      router.get(route("student.courses"))
    }
  }

  // Update the handleQuizCompletion function
  const handleQuizCompletion = () => {
    const storedCourseId = sessionStorage.getItem("currentCourseId")
    console.log("Handling quiz completion, stored course ID:", storedCourseId)

    if (storedCourseId) {
      console.log("Navigating back to course with ID:", storedCourseId)
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
      console.log("No stored course ID found, navigating to courses list")
      router.get(route("student.courses"))
    }
  }

  const BASE_URL = import.meta.env.BASE_URL;

  // Update the useEffect for quiz completion
  useEffect(() => {
    const handleQuizComplete = (event: CustomEvent) => {
      const storedCourseId = sessionStorage.getItem("currentCourseId")
      console.log("Quiz completion event received:", event.detail)
      console.log("Stored course ID:", storedCourseId)

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
        console.log("Navigating back to course with ID:", storedCourseId)
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
        console.log("No stored course ID found, navigating to courses list")
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
          console.log("Page became visible, stored course ID:", storedCourseId)
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
          console.log('YouTube IFrame API loaded');
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
      console.log('YouTube IFrame API ready');
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

        // Only initialize if not already initialized
        if (!(window as any).ytPlayers[activeContent.id]) {
          try {
            (window as any).ytPlayers[activeContent.id] = new (window as any).YT.Player(`youtube-player-${activeContent.id}`, {
              events: {
                'onReady': (window as any).onPlayerReady,
                'onStateChange': (window as any).onPlayerStateChange
              }
            });
            console.log('YouTube player initialized for video:', videoId);
          } catch (error) {
            console.error('Error initializing YouTube player:', error);
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
    console.log('Player is ready');
  };

  // Set up state change handler
  (window as any).onPlayerStateChange = (event: any) => {
    const videoId = extractYouTubeVideoId(activeContent?.url || '');
    if (!videoId) return;

    console.log('Player state changed:', event.data, 'for video:', videoId);

    // Video has ended
    if (event.data === 0) {
      console.log('Video ended, marking as completed:', videoId);

      // Mark video as completed and update state immediately
      const newCompletedVideos = new Set(completedVideos);
      newCompletedVideos.add(videoId);
      setCompletedVideos(newCompletedVideos);

      // Also update localStorage immediately for UI consistency
      if (course) {
        localStorage.setItem(`completed-videos-${course.id}`, JSON.stringify(Array.from(newCompletedVideos)));
      }

      // Track video completion using existing trackVideoPlay method
      if (window.studentActivityTracker) {
        window.studentActivityTracker.trackVideoPlay(videoId, activeContent?.url || '');
      }

      // Save video completion to database and show feedback based on backend response
      if (activeContent && course) {
        saveVideoCompletion(course.id.toString(), activeContent.id, videoId, activeContent.duration || 0)
          .then((data) => {
            if (data?.status === 'success') {
              toast.success(getFirstMessage(data, 'Video completed! You can now navigate to the next content.'));
            } else {
              toast.error(getFirstMessage(data, 'Failed to save video completion. Please try again.'));
            }
          });
      } else {
        toast.error('Failed to save video completion. Please try again.');
      }

      console.log('Video completed:', videoId);
    }

    // Video is playing
    if (event.data === 1) {
      console.log('Video started playing');
    }
  };

  // Debug effect to log completed videos
  useEffect(() => {
    console.log('Current completed videos:', Array.from(completedVideos));
    if (activeContent?.type === "video" && activeContent.url) {
      const videoId = extractYouTubeVideoId(activeContent.url);
      if (videoId) {
        console.log('Current video ID:', videoId, 'Is completed:', completedVideos.has(videoId));
      }
    }
  }, [completedVideos, activeContent]);

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
        console.error('Error parsing saved completed videos:', e);
      }
    }
  }, [id]);

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
        console.error('Error parsing saved downloaded PDFs:', e);
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
      console.error('Error checking certificate eligibility:', error);
      setCertificateChecked(true);
    }
  };

  // Check certificate eligibility when course and submissions are loaded
  useEffect(() => {
    if (course && !certificateChecked) {
      checkCertificateEligibility();
    }
  }, [course, quizSubmissions, certificateChecked]);

  // Periodically check video completion status for better reliability
  useEffect(() => {
    // Only run for video content
    if (activeContent?.type !== "video" || !activeContent.url) return;

    const videoId = extractYouTubeVideoId(activeContent.url);
    if (!videoId) return;

    // Check if video is already marked as completed
    const isAlreadyCompleted = completedVideos.has(videoId);
    if (isAlreadyCompleted) return;

    let intervalId: NodeJS.Timeout | null = null;

    // Set up interval to periodically check video progress
    intervalId = setInterval(() => {
      // First check if we have the YouTube player API and player instance
      if ((window as any).ytPlayers && (window as any).ytPlayers[activeContent.id]) {
        try {
          const player = (window as any).ytPlayers[activeContent.id];
          if (player && player.getCurrentTime && player.getDuration) {
            const currentTime = player.getCurrentTime();
            const duration = player.getDuration();

            // If video is near the end (within 2 seconds), mark as completed
            if (duration > 0 && (duration - currentTime) <= 2) {
              // Mark video as completed and update state immediately
              const newCompletedVideos = new Set(completedVideos);
              newCompletedVideos.add(videoId);
              setCompletedVideos(newCompletedVideos);

              // Also update localStorage immediately for UI consistency
              if (course) {
                localStorage.setItem(`completed-videos-${course.id}`, JSON.stringify(Array.from(newCompletedVideos)));
              }

              // Track video completion
              if (window.studentActivityTracker) {
                window.studentActivityTracker.trackVideoPlay(videoId, activeContent.url || '');
              }

              // Save video completion to database and show feedback based on backend response
              if (activeContent && course) {
                saveVideoCompletion(course.id.toString(), activeContent.id, videoId, activeContent.duration || 0)
                  .then((data) => {
                    if (data?.status === 'success') {
                      toast.success(getFirstMessage(data, 'Video completed! You can now navigate to the next content.'));
                    } else {
                      toast.error(getFirstMessage(data, 'Failed to save video completion. Please try again.'));
                    }
                  });
              } else {
                toast.error('Failed to save video completion. Please try again.');
              }

              console.log('Video automatically marked as completed:', videoId);

              // Clear interval since we've completed the video
              if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
              }
            }
          }
        } catch (error) {
          console.error('Error checking video progress:', error);
        }
      }
      // If we don't have the player API yet, we still check localStorage in the render function
    }, 1000); // Check every second

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activeContent, completedVideos, course]);

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

  const renderContent = (content: Course["contents"][0]) => {
    switch (content.type) {
      case "video":
        // Modify YouTube URL to make it non-skippable
        let videoUrl = content.url || "";
        const youtubeId = extractYouTubeVideoId(videoUrl);

        if (youtubeId) {
          // Create YouTube embed URL with parameters to disable seeking and other controls
          // Completely hide controls to prevent any skipping
          videoUrl = `https://www.youtube.com/embed/${youtubeId}?controls=0&disablekb=1&fs=0&rel=0&modestbranding=1&playsinline=1&autoplay=0&loop=0&enablejsapi=1&iv_load_policy=3&cc_load_policy=0&cc_lang_pref=&disable_polymer=false&end=&start=0&widget_referrer=&origin=${window.location.origin}`;
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
          if ((window as any).ytPlayers && (window as any).ytPlayers[content.id]) {
            try {
              // Get current time and duration to check if video is near the end
              const player = (window as any).ytPlayers[content.id];
              const currentTime = player.getCurrentTime ? player.getCurrentTime() : 0;
              const duration = player.getDuration ? player.getDuration() : 0;

              // If video is within 5 seconds of the end, consider it completed
              if (duration > 0 && (duration - currentTime) <= 5) {
                isVideoCompleted = true;
              }
            } catch (e) {
              console.log('Could not get video time information:', e);
            }
          }
        }

        return (
          <div className="w-full aspect-video">
            <iframe
              id={`youtube-player-${content.id}`}
              src={videoUrl}
              className="w-full h-full rounded-lg"
              allowFullScreen={false}
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
            <div className="flex items-center justify-between mt-2">
              {isVideoCompleted ? (
                <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Video completed
                </div>
              ) : (
                <div className="text-sm text-yellow-600 dark:text-yellow-400">
                  Please watch the entire video to proceed
                </div>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Status: {isVideoCompleted ? 'Completed' : 'In Progress'}
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
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handlePDFDownload}
              >
                {isPDFDownloaded ? 'Open PDF' : 'Download PDF'}
              </button>
            </div>
          </div>
        );

      case "quiz":
        let questionCount = 0
        let quizData: any[] = []
        try {
          console.log("Rendering quiz content:", content)
          if (typeof content.quiz_data === "string") {
            quizData = JSON.parse(content.quiz_data)
          } else if (Array.isArray(content.quiz_data)) {
            quizData = content.quiz_data
          } else if (typeof content.quiz_data === "object" && content.quiz_data !== null) {
            quizData = [content.quiz_data]
          } else {
            quizData = []
          }
          if (Array.isArray(quizData)) questionCount = quizData.length
          console.log("Processed quiz data for rendering:", { quizData, questionCount })
        } catch (e) {
          console.error("Error processing quiz data for rendering:", e)
          quizData = []
        }
        // Use content.duration for quiz time limit, fallback to 30 if not set
        const quizTimeLimit = content.duration || 30;
        const submission = getQuizSubmission(content.id);

        // Check if this is a one submission only quiz and user has already taken it
        const isOneSubmissionOnly = content.one_submission_only || false;
        const hasTakenQuiz = !!submission;

        // Track quiz start when button is clicked
        const handleStartQuiz = () => {
          console.log("Start Quiz button clicked"); // untuk debugging

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
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{questionCount} Questions</span>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Time Limit: {quizTimeLimit} min</span>
            </div>

            {/* Quiz Score Display */}
            {submission && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-blue-900/50 rounded-lg border border-gray-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
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
            {quizData.length === 0 && <div className="mb-2 text-sm text-red-500">Quiz data is invalid or missing.</div>}

            {/* Show message if this is a one submission only quiz and user has already taken it */}
            {isOneSubmissionOnly && hasTakenQuiz ? (
              <div className="p-3 text-sm text-center text-blue-700 bg-blue-50 rounded-lg dark:bg-blue-900/50 dark:text-blue-300">
                You have already completed this quiz. Only one submission is allowed.
              </div>
            ) : (
              <Button
                onClick={handleStartQuiz}
                className="w-full"
                disabled={quizLoading || quizData.length === 0}
              >
                {quizLoading ? "Preparing Quiz..." : "Start Quiz"}
              </Button>
            )}

            {/* Quiz Dialog */}
            <Dialog open={quizDialogOpen} onOpenChange={setQuizDialogOpen}>
              <DialogContent className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg dark:bg-blue-900">
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
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setQuizDialogOpen(false)} disabled={quizLoading}>
                      Cancel
                    </Button>
                    <Button onClick={() => handleQuizStart(content)} disabled={quizLoading}>
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
        <div className="container px-4 py-4 mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
                <span className="sr-only">Toggle sidebar</span>
              </Button>
              <Button
                variant="ghost"
                onClick={handleBackToCourses}
                className="flex items-center gap-2 transition-colors hover:bg-blue-50 dark:hover:bg-blue-800/50"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Courses
              </Button>
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={BASE_URL + course.url_thumbnail || "/placeholder.svg"}
                    alt={course.judul_kursus}
                    className="object-cover w-10 h-10 rounded-lg ring-2 ring-blue-100 dark:ring-blue-800"
                  />
                  <div className="absolute w-4 h-4 bg-green-500 border-2 border-white rounded-full -bottom-1 -right-1 dark:border-gray-900" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                    {course.judul_kursus}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{course.mapel?.nama_mapel}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-blue-700 bg-blue-50 dark:bg-blue-800/50 dark:text-blue-200">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date().toLocaleDateString()}
              </Badge>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
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
                              className={`w-full justify-start gap-2 transition-all duration-200 group relative text-xs h-auto py-2 ${
                                activeContent?.id === content.id
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
                                  className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium transition-colors flex-shrink-0 ${
                                    activeContent?.id === content.id
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
                              {content.duration && (
                                <span className="flex items-center flex-shrink-0 gap-1 text-xs text-gray-500 dark:text-gray-400">
                                  <Clock className="w-3 h-3" />
                                  {content.duration}m
                                </span>
                              )}
                              {activeContent?.id === content.id && (
                                <div className="absolute top-0 bottom-0 left-0 w-1 bg-blue-600 rounded-r-full dark:bg-blue-400" />
                              )}
                            </Button>
                          ))}
                        </div>
                      )}

                      {/* Certificate Claiming Section */}
                      {courseCompleted && (
                        <div className="border border-gray-100 rounded-lg dark:border-gray-800 mt-4">
                          <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
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
                              className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white"
                              disabled={certificateChecked && !certificateEligible}
                            >
                              <Award className="w-4 h-4 mr-2" />
                              Claim Certificate
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Certificate Claiming Section */}
                  {courseCompleted && (
                    <div className="border border-gray-100 rounded-lg dark:border-gray-800 mt-4">
                      <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
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
                          className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white"
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
                    <CardTitle className="text-xl">{activeContent.title}</CardTitle>
                  </div>
                  {activeContent.description && (
                    <CardDescription className="mt-2 text-base">{activeContent.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    {renderContent(activeContent)}
                  </div>
                  <div className="flex items-center justify-between mt-4">
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
                          console.log('Checking video completion:', videoId, 'Completed:', isCurrentContentCompleted);
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
                          console.log('Checking PDF download:', pdfFilename, 'Downloaded:', isCurrentContentCompleted);
                        }
                      } else if (activeContent?.type === "quiz") {
                        // For quizzes, check if there's a submission in the quizSubmissions array
                        const quizSubmission = getQuizSubmission(activeContent.id);
                        isCurrentContentCompleted = !!quizSubmission;
                        console.log('Checking quiz completion:', activeContent.id, 'Completed:', isCurrentContentCompleted);
                      }

                      return (
                        <>
                          <Button
                            variant="outline"
                            className="gap-2 transition-colors bg-transparent hover:bg-blue-50 dark:hover:bg-blue-800/50"
                            disabled={isFirstInSection}
                            onClick={() => {
                              console.log('Previous button clicked');
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
                                console.log('Navigating to previous content');
                                setActiveContent(currentSubPembahasanContents[currentIndex - 1])
                              }
                            }}
                          >
                            <ArrowLeft className="w-4 h-4" />
                            Previous
                          </Button>
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
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
                            className="gap-2 transition-colors bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                            disabled={isLastInSection}
                            onClick={() => {
                              console.log('Next button clicked');
                              console.log('Current content type:', activeContent?.type);
                              console.log('Is current content completed:', isCurrentContentCompleted);

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
                                console.log('Navigating to next content');
                                setActiveContent(currentSubPembahasanContents[currentIndex + 1])
                              } else {
                                console.log('Already at last content in section');
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
                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg w-full max-w-md">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <p className="text-lg font-medium text-green-800 dark:text-green-200">
                          Course Completed!
                        </p>
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-400 mb-4 text-center">
                        Congratulations! You've completed all required content. Claim your certificate now.
                      </p>
                      <Button
                        onClick={handleClaimCertificate}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
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
