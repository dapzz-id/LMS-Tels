"use client"

import { useState, useEffect, useRef } from "react"
import { Head, router } from "@inertiajs/react"
import axios from "axios"
import { toast } from "sonner"
import { getFirstMessage } from "@/lib/api-messages"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Progress } from "@/Components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group"
import { Label } from "@/Components/ui/label"
import { ArrowLeft, Timer, CheckCircle2, AlertCircle } from "lucide-react"
import { cn, renderMath } from "@/lib/utils"
import { usePage } from "@inertiajs/react"

interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correct_answer: number
  explanation: string
  points: number
  timeLimit: number
  imageUrl?: string // Keep this line for image support
  optionImages?: (string | null)[] // Add this line for option images support
}

interface Quiz {
  id: number
  title: string
  description: string
  time_limit: number
  passing_score: number
  questions: QuizQuestion[]
  show_grades: boolean
}

interface QuizPageProps {
  quiz: Quiz | null
  error?: string
  id: string
  courseId: string
}

const QuizPage = (props: QuizPageProps) => {
  const { quiz: initialQuiz, error } = props;
  const page = usePage();

  // Add specific logging for optionImages (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && initialQuiz) {

      initialQuiz.questions.forEach((question, index) => {

      });
    }
  }, [initialQuiz]);

  // State to handle quiz data that might come from different sources
  const [quiz, setQuiz] = useState<Quiz | null>(initialQuiz);

  // Refs for timer state management
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isTimeRestoredRef = useRef(false);
  const quizStartTimeRef = useRef<number | null>(null);

  // State for tracking activities
  const [quizTracked, setQuizTracked] = useState(false);

  const renderLayout = (content: JSX.Element) => (
    <div className="flex min-h-screen bg-gray-50 dark:bg-blue-950/90">
      <div className="flex-1">
        {content}
      </div>
    </div>
  );

  // Get courseId from multiple sources
  function getCourseId() {
    // Priority 1: Direct props
    if (props.courseId) return props.courseId;

    // Priority 2: Page props
    if (page.props.courseId) return page.props.courseId as string;

    // Priority 3: Session storage (set by learn page)
    const sessionCourseId = sessionStorage.getItem('currentCourseId');
    if (sessionCourseId) return sessionCourseId;

    // Priority 4: URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlCourseId = urlParams.get('courseId');
    if (urlCourseId) return urlCourseId;

    return null;
  }

  // Get quizId from multiple sources
  function getQuizId() {
    // Priority 1: Direct props
    if (props.id) return props.id;

    // Priority 2: Page props
    if (page.props.id) return page.props.id as string;

    // Priority 3: Quiz object
    if (quiz && quiz.id) return quiz.id.toString();

    return null;
  }

  const courseId = getCourseId();
  const quizId = getQuizId();

  // Only log in development mode
  if (process.env.NODE_ENV === 'development') {


  }

  // Initialize activity tracker and track quiz start when component mounts
  useEffect(() => {
    // Initialize activity tracker with user data from page props
    const user = page.props.auth?.user;
    if (user && (window as any).initializeActivityTracker) {
      (window as any).initializeActivityTracker(user);
    }

    // Track quiz start only once
    if (quiz && quizId && courseId && window.studentActivityTracker && !quizTracked) {

      window.studentActivityTracker.trackActivity('quiz_start', {
        course_id: courseId,
        quiz_id: quizId
      });
      setQuizTracked(true);
    }
  }, [quiz, quizId, courseId, page.props.auth?.user, quizTracked]);

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(null) // Track currently selected option
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)
  const isDataRestoredRef = useRef(false); // Track if we've restored data

  // Effect to render math equations when question changes
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).MathJax) {
      // Render math equations after a short delay to ensure DOM is updated
      const timer = setTimeout(() => {
        const questionElement = document.querySelector('.quiz-question-content');
        if (questionElement) {
          renderMath(questionElement as HTMLElement);
        }

        // Render math in options as well
        const optionElements = document.querySelectorAll('.quiz-option-content');
        optionElements.forEach(element => {
          renderMath(element as HTMLElement);
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [currentQuestion, quiz]);

  // Add a function to re-render math when needed
  const reRenderMath = () => {
    if (typeof window !== 'undefined' && (window as any).MathJax) {
      setTimeout(() => {
        const questionElement = document.querySelector('.quiz-question-content');
        if (questionElement) {
          renderMath(questionElement as HTMLElement);
        }

        const optionElements = document.querySelectorAll('.quiz-option-content');
        optionElements.forEach(element => {
          renderMath(element as HTMLElement);
        });
      }, 50);
    }
  };

  // Call re-render when quiz data changes
  useEffect(() => {
    reRenderMath();
  }, [quiz]);

  // Helper to get per-question time limit (in seconds)
  function getInitialTime() {
    if (!quiz) return 0;
    const question = quiz.questions[currentQuestion];
    // Use per-question timeLimit if available and not null, otherwise fallback to quiz.time_limit
    // Both timeLimit values are already in minutes, so we convert to seconds
    const questionTimeLimit = question?.timeLimit != null ? question.timeLimit : null;
    const quizTimeLimit = quiz.time_limit ?? 0;

    // Debug logging (only in development)
    if (process.env.NODE_ENV === 'development') {

    }

    // Test the logic
    const result = (questionTimeLimit != null ? questionTimeLimit : quizTimeLimit) * 60;
    if (process.env.NODE_ENV === 'development') {

    }

    return result;
  }

  const [timeLeft, setTimeLeft] = useState(0);

  // Initialize timeLeft and answers with proper values - run when quiz loads
  useEffect(() => {
    if (quiz && !isDataRestoredRef.current) {
      // Try to restore time and answers from localStorage
      const savedQuizData = localStorage.getItem(`quiz-${props.id}-data`);
      if (savedQuizData) {
        try {
          const parsedData = JSON.parse(savedQuizData);
          // Only restore if it's for the same quiz and not expired (1 hour)
          // Use a consistent timestamp to avoid hydration mismatches
          const now = typeof window !== 'undefined' ? Date.now() : 0;
          if (parsedData.quizId === props.id && parsedData.timestamp > now - 3600000) {
            // Restore time
            setTimeLeft(parsedData.timeLeft || getInitialTime());

            // Restore start time
            if (parsedData.startTime) {
              quizStartTimeRef.current = parsedData.startTime;
            } else {
              // Use a consistent timestamp to avoid hydration mismatches
              quizStartTimeRef.current = typeof window !== 'undefined' ? Date.now() : 0;
            }

            isTimeRestoredRef.current = true;
            isDataRestoredRef.current = true;

            // Restore answers if they exist
            if (parsedData.answers && Array.isArray(parsedData.answers)) {
              setAnswers(parsedData.answers);
            }

            // Restore current question if it exists
            if (parsedData.currentQuestion !== undefined) {
              setCurrentQuestion(parsedData.currentQuestion);
            }


            return;
          }
        } catch (e) {

        }
      }

      // If no saved data or invalid data, initialize fresh
      if (!isDataRestoredRef.current) {
        // Set the quiz start time
        // Use a consistent timestamp to avoid hydration mismatches
        quizStartTimeRef.current = typeof window !== 'undefined' ? Date.now() : 0;

        // Set initial time
        const initialTime = getInitialTime();
        setTimeLeft(initialTime);
        isDataRestoredRef.current = true;

      }
    }
  }, [quiz, props.id]);

  // Timer effect - improved to persist across questions
  useEffect(() => {
    if (!quiz || timeLeft <= 0 || isSubmitted) return;

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Start new timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;

        // Save current quiz data to localStorage
        const quizData = {
          quizId: props.id,
          timeLeft: newTime,
          startTime: quizStartTimeRef.current,
          // Use a consistent timestamp to avoid hydration mismatches
          timestamp: typeof window !== 'undefined' ? Date.now() : 0,
          currentQuestion: currentQuestion,
          answers: answers
        };
        localStorage.setItem(`quiz-${props.id}-data`, JSON.stringify(quizData));

        // If time runs out, move to next question or submit
        if (newTime <= 0) {
          handleNextOrSubmit();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [quiz, timeLeft, props.id, currentQuestion, isSubmitted, answers]); // Dependencies that should trigger timer restart

  function handleNextOrSubmit() {
    if (currentQuestion < (quiz?.questions.length ?? 0) - 1) {
      // Move to next question without resetting timer
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleSubmit();
    }
  }

  useEffect(() => {
    if (error) {
      toast.error(error)

      if (courseId) {
        router.visit(`/dashboard/courses/${courseId}/learn`)
      } else {
        router.visit('/dashboard/courses')
      }
    }
  }, [error, courseId])

  // Update selected option when current question changes
  useEffect(() => {
    // Reset selected option when question changes
    setSelectedOption(answers[currentQuestion] !== undefined ? answers[currentQuestion] : null);
  }, [currentQuestion, answers]);

  const handleAnswer = (answerIndex: number) => {
    setSelectedOption(answerIndex);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  }

  const handleNextQuestion = () => {
    if (currentQuestion < (quiz?.questions.length ?? 0) - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    if (!quizId || !courseId) {
      toast.error('Quiz or course ID is missing. Please refresh the page and try again.');
      return;
    }
    try {
      // Calculate total time taken for the entire quiz
      let timeTaken = 0;
      if (quizStartTimeRef.current) {
        // Use a consistent timestamp to avoid hydration mismatches
        timeTaken = typeof window !== 'undefined'
          ? Math.floor((Date.now() - quizStartTimeRef.current) / 1000)
          : 0;
      }

      const response = await axios.post(`/api/quizzes/${quizId}/submit`, {
        answers,
        time_taken: timeTaken,
        course_id: courseId
      })
      setScore(response.data.score)
      setIsSubmitted(true)

      // Clear saved time from localStorage
      localStorage.removeItem(`quiz-${props.id}-data`);

      // Track quiz submission
      if (window.studentActivityTracker) {

        window.studentActivityTracker.trackActivity('quiz_submit', {
          course_id: courseId,
          quiz_id: quizId,
          score: response.data.score,
          answers: answers
        });

        // Track quiz completion with the new method
        window.studentActivityTracker.trackQuizCompletionEvent(
          quizId.toString(),
          courseId,
          response.data.score
        );
      }

      // Save quiz completion to database
      try {
        await axios.post('/api/progress/quiz-completion', {
          course_id: courseId,
          content_id: parseInt(quizId), // This should be the content ID from the course content
          quiz_id: parseInt(quizId),    // This should be the quiz content ID
          score: response.data.score
        });

      } catch (error) {

      }

      // Dispatch custom event for quiz completion
      const quizCompleteEvent = new CustomEvent('quizComplete', {
        detail: {
          quizId: quizId,
          courseId: courseId,
          score: response.data.score
        }
      });
      window.dispatchEvent(quizCompleteEvent);

      toast.success(getFirstMessage(response.data, "Quiz submitted successfully!"))
    } catch (error) {

      if (axios.isAxiosError(error)) {
        toast.error(getFirstMessage(error.response?.data, "Failed to submit quiz"))
      } else {
        toast.error("Failed to submit quiz")
      }
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getQuestionStatus = (index: number) => {
    if (answers[index] !== undefined) return 'answered'
    return 'unanswered'
  }

  // Set CSRF token for Axios (for Laravel web routes)
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (csrfToken) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
  }

  // Cleanup effect to clear saved data when component unmounts
  useEffect(() => {
    return () => {
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Only clear if quiz wasn't submitted successfully
      if (!isSubmitted) {
        localStorage.removeItem(`quiz-${props.id}-data`);
      }
    };
  }, [isSubmitted, props.id]);

  // Enhanced check for quiz data
  useEffect(() => {
    // If we don't have quiz data from props, try to get it from sessionStorage
    if (!initialQuiz && !quiz) {
      const storedQuiz = sessionStorage.getItem('currentQuiz');
      if (storedQuiz) {
        try {
          const parsedQuiz = JSON.parse(storedQuiz);

          setQuiz(parsedQuiz);
        } catch (e) {

        }
      }
    }

    // Log quiz data for debugging
    if (quiz) {

      (quiz as Quiz).questions.forEach((question: QuizQuestion, index: number) => {

      });
    }
  }, [initialQuiz, quiz]);

  // Defensive check for missing or empty questions
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    // Log the quiz object for debugging


    // Check if this is a one submission only error
    if (error && error.includes('already taken this quiz')) {
      return renderLayout(
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-red-500" />
            <h1 className="mb-4 text-2xl font-bold">Quiz Already Taken</h1>
            <p className="mb-6 text-gray-600">
              {error || "You have already taken this quiz and cannot retake it."}
            </p>
            <Button onClick={() => {
              if (courseId) {
                router.visit(`/dashboard/courses/${courseId}/learn`)
              } else {
                router.visit('/dashboard/courses')
              }
            }}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Course
            </Button>
          </div>
        </div>
      );
    }

    //   questionCount: quiz?.questions?.length || 0,
    //   initialQuiz,
    //   sessionStorageQuiz: sessionStorage.getItem('currentQuiz')
    // });
    return renderLayout(
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500" />
          <p className="mb-4 text-xl font-semibold">No questions found for this quiz.</p>
          <p className="mb-6 text-gray-600">The quiz data may be invalid or missing.</p>
          <Button onClick={() => {
            if (courseId) {
              router.visit(`/dashboard/courses/${courseId}/learn`)
            } else {
              router.visit('/dashboard/courses')
            }
          }}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return renderLayout(
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading quiz...</p>
      </div>
    )
  }

  if (isSubmitted) {
    return renderLayout(
      <div className="min-h-screen bg-gray-50 dark:bg-blue-950/90">
        <Head title="Quiz Results" />
        <div className="container px-4 py-8 mx-auto">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Quiz Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 text-center">
                {quiz.show_grades ? (
                  <>
                    <div className="relative w-32 h-32 mx-auto">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle
                          className="text-gray-200 dark:text-gray-700"
                          strokeWidth="10"
                          stroke="currentColor"
                          fill="transparent"
                          r="40"
                          cx="50"
                          cy="50"
                        />
                        <circle
                          className="text-blue-600 dark:text-blue-400"
                          strokeWidth="10"
                          strokeDasharray={251.2}
                          strokeDashoffset={251.2 - (251.2 * (score || 0)) / 100}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="40"
                          cx="50"
                          cy="50"
                        />
                      </svg>
                      <div className="absolute text-2xl font-bold transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                        {score}%
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-xl font-semibold">Quiz Summary</h2>
                      <p className="text-gray-600 dark:text-gray-300">
                        You got {Math.round((score || 0) * quiz.questions.length / 100)} out of {quiz.questions.length} questions correct
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <CheckCircle2 className="w-16 h-16 mx-auto text-green-500" />
                    <h2 className="text-xl font-semibold">Quiz Submitted</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Your quiz has been submitted successfully. Your instructor will review your results.
                    </p>
                  </div>
                )}
                <Button
                  onClick={() => courseId ? router.visit(`/dashboard/courses/${courseId}/learn`) : router.visit('/dashboard/courses')}
                  className="mt-4"
                >
                  Return to Course
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return renderLayout(
    <div className="min-h-screen bg-gray-50 dark:bg-blue-950/90">
      <Head title={`${quiz.title} - Quiz`} />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-blue-100 dark:border-blue-800 dark:bg-blue-900">
        <div className="container px-4 py-4 mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => courseId ? router.visit(`/dashboard/courses/${courseId}/learn`) : router.visit('/dashboard/courses')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Course
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-800/50">
                <Timer className="w-4 h-4" />
                <span className="font-medium">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-8 mx-auto">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Quiz Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>{quiz.title}</CardTitle>
                <p className="text-gray-600 dark:text-gray-300">{quiz.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {answers.filter(a => a !== undefined).length} answered
                      </span>
                    </div>
                    <Progress value={(currentQuestion + 1) / quiz.questions.length * 100} />
                  </div>

                  {/* Question */}
                  <div className="space-y-4">
                    {quiz.questions[currentQuestion].imageUrl && (
                      <div className="flex justify-start">
                        <img
                          src={quiz.questions[currentQuestion].imageUrl}
                          alt="Question"
                          className="object-contain max-h-64 rounded-lg shadow-md"
                        />
                      </div>
                    )}
                    <h3 className="text-lg font-semibold quiz-question-content math-tex">
                      {quiz.questions[currentQuestion].question}
                    </h3>
                    <RadioGroup
                      key={`question-${currentQuestion}`}
                      value={selectedOption !== null ? selectedOption.toString() : undefined}
                      onValueChange={(value) => handleAnswer(parseInt(value))}
                      className="space-y-3"
                    >
                      {quiz.questions[currentQuestion].options.map((option, index) => (
                        <div
                          key={index}
                          className={cn(
                            "flex items-start space-x-2 p-4 rounded-lg border transition-colors",
                            selectedOption === index
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/50"
                              : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                          )}
                        >
                          <RadioGroupItem value={index.toString()} id={`option-${index}`} className="mt-1" />
                          <Label
                            htmlFor={`option-${index}`}
                            className="flex-1 cursor-pointer quiz-option-content math-tex"
                          >
                            {/* Option Image */}
                            {(() => {
                              try {
                                // Check if optionImages exists and has a value for this index
                                const optionImages = quiz.questions[currentQuestion].optionImages;
                                const hasOptionImage = optionImages &&
                                  Array.isArray(optionImages) &&
                                  index < optionImages.length &&
                                  optionImages[index];

                                // Only log in development
                                if (process.env.NODE_ENV === 'development') {

                                }

                                return hasOptionImage && (
                                  <div className="mb-2">
                                    <img
                                      src={optionImages[index] || ''}
                                      alt={`Option ${index + 1}`}
                                      className="object-contain max-h-48 rounded-lg"
                                    />
                                  </div>
                                );
                              } catch (error) {
                                // Handle any errors gracefully

                                return null;
                              }
                            })()}
                            <span>{option}</span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between mt-6">
                    <Button
                      variant="outline"
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestion === 0}
                    >
                      Previous
                    </Button>
                    {currentQuestion < quiz.questions.length - 1 ? (
                      <Button
                        onClick={handleNextQuestion}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setShowConfirmSubmit(true)}
                        disabled={answers.filter(a => a !== undefined).length !== quiz.questions.length}
                      >
                        Submit Quiz
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Navigation Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Question Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {quiz.questions.map((_, index) => (
                    <Button
                      key={index}
                      variant={getQuestionStatus(index) === 'answered' ? 'default' : 'outline'}
                      className={cn(
                        "h-10 w-10 p-0",
                        currentQuestion === index && "ring-2 ring-blue-500"
                      )}
                      onClick={() => setCurrentQuestion(index)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span>Current Question</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-gray-200 rounded-full dark:bg-gray-700" />
                    <span>Unanswered</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-blue-100 rounded-full dark:bg-blue-900" />
                    <span>Answered</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Submit Confirmation Dialog */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Confirm Submission</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Are you sure you want to submit your quiz?</p>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmSubmit(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      setShowConfirmSubmit(false)
                      handleSubmit()
                    }}
                  >
                    Submit Quiz
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default QuizPage
