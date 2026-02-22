// Student Activity Tracker
// This utility automatically tracks student activities and sends them to the server

class StudentActivityTracker {
    constructor() {
        this.isTracking = false;
        this.lastActivity = null;
        this.activityQueue = [];
        this.maxQueueSize = 10;
        this.flushInterval = null;
        this.heartbeatInterval = null;
        this.userData = null;
        this.trackedPDFs = new Set(); // Track downloaded PDFs
        this.trackedVideos = new Set(); // Track played videos
        this.trackedQuizzes = new Set(); // Track completed quizzes
        this.init();
    }

    init() {
        // Wait for Inertia to be ready and get user data
        this.waitForUserAndStart();

        // Set up specific tracking for PDF downloads, video playback, and quiz completion
        this.setupContentTracking();
    }

    waitForUserAndStart() {
        // Check if we have user data from Inertia props
        const user = this.getUserFromProps();

        if (user) {
            this.userData = user;
            this.processUserAndStart(user);
        } else {
            setTimeout(() => this.waitForUserAndStart(), 100);
        }
    }

    getUserFromProps() {
        // Try to get user from Inertia props (same as debug panel)
        const inertia = window.Inertia;
        const props = inertia?.props;
        const auth = props?.auth;
        const user = auth?.user;

        return user;
    }

    processUserAndStart(user) {
        // Only track if user is a student
        if (this.isStudent(user)) {
            this.startTracking();
        }
    }

    isStudent(user) {
        // Check if user exists and is a student
        if (user && user.tipe_user === 'siswa') {
            return true;
        }

        // Fallback: check if we're on student pages
        const isStudentPage = window.location.pathname.includes('/dashboard') &&
            !window.location.pathname.includes('/admin');

        return isStudentPage;
    }

    startTracking() {
        if (this.isTracking) return;

        this.isTracking = true;
        this.trackActivity('login');

        // Track page views
        this.trackPageView();

        // Track user interactions
        this.trackUserInteractions();

        // Start heartbeat to keep user online
        this.startHeartbeat();

        // Start flushing queue
        this.startFlushInterval();

        // Track when user leaves
        this.trackPageUnload();
    }

    stopTracking() {
        if (!this.isTracking) return;

        this.isTracking = false;
        this.trackActivity('logout');

        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }

        if (this.flushInterval) {
            clearInterval(this.flushInterval);
        }
    }

    trackActivity(activityType, data = {}) {
        if (!this.isTracking) return;

        const activity = {
            activity_type: activityType,
            page_url: window.location.href,
            course_id: this.getCourseId(),
            quiz_id: this.getQuizId(),
            metadata: {
                ...data,
                user_agent: navigator.userAgent,
                screen_resolution: `${screen.width}x${screen.height}`,
                timestamp: new Date().toISOString(),
                user_id: this.userData?.id
            }
        };

        this.activityQueue.push(activity);
        this.lastActivity = activity;

        // Flush immediately for important activities
        if (['login', 'logout', 'quiz_start', 'quiz_submit', 'pdf_download', 'video_play', 'quiz_completion'].includes(activityType)) {
            this.flushQueue();
        }

        // Limit queue size
        if (this.activityQueue.length > this.maxQueueSize) {
            this.activityQueue.shift();
        }
    }

    trackPageView() {
        this.trackActivity('page_view');

        // Track when user navigates to different pages
        window.addEventListener('popstate', () => {
            setTimeout(() => this.trackActivity('page_view'), 100);
        });
    }

    trackUserInteractions() {
        // Track clicks on course-related elements
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-course-id], [data-quiz-id], .course-content, .quiz-content');
            if (target) {
                const courseId = target.dataset.courseId;
                const quizId = target.dataset.quizId;

                if (quizId) {
                    this.trackActivity('quiz_interaction', { quiz_id: quizId, action: 'click' });
                } else if (courseId) {
                    this.trackActivity('course_interaction', { course_id: courseId, action: 'click' });
                }
            }
        });

        // Track form submissions (like quiz submissions)
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form instanceof HTMLFormElement && (form.classList.contains('quiz-form') || form.dataset.quizId)) {
                this.trackActivity('quiz_submit', {
                    quiz_id: form.dataset.quizId,
                    form_data: this.serializeForm(form)
                });
            }
        });

        // Track course content interactions
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a[href*="/courses/"], a[href*="/quiz/"]');
            if (target) {
                const href = target.getAttribute('href');
                if (href.includes('/courses/')) {
                    const courseId = href.match(/\/courses\/(\d+)/)?.[1];
                    if (courseId) {
                        this.trackActivity('course_navigation', { course_id: courseId });
                    }
                } else if (href.includes('/quiz/')) {
                    const quizId = href.match(/\/quiz\/(\d+)/)?.[1];
                    if (quizId) {
                        this.trackActivity('quiz_navigation', { quiz_id: quizId });
                    }
                }
            }
        });
    }

    // Setup specific tracking for PDF downloads, video playback, and quiz completion
    setupContentTracking() {
        // Track PDF downloads
        this.trackPDFDownloads();

        // Track YouTube video playback
        this.trackVideoPlayback();

        // Track quiz completion
        this.trackQuizCompletion();
    }

    trackPDFDownloads() {
        // Listen for clicks on PDF download links
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a[href*="/download/pdf/"]');
            if (target) {
                const href = target.getAttribute('href');
                const pdfId = href.match(/\/download\/pdf\/(.+)$/)?.[1];

                if (pdfId && !this.trackedPDFs.has(pdfId)) {
                    this.trackedPDFs.add(pdfId);
                    this.trackActivity('pdf_download', {
                        pdf_id: pdfId,
                        pdf_url: href,
                        course_id: this.getCourseId(),
                        timestamp: new Date().toISOString()
                    });
                }
            }
        });
    }

    trackVideoPlayback() {
        // Listen for iframe load events that might be YouTube videos
        document.addEventListener('load', (e) => {
            if (e.target.tagName === 'IFRAME') {
                const src = e.target.src;
                if (src && (src.includes('youtube.com') || src.includes('youtu.be'))) {
                    const videoId = this.extractYouTubeVideoId(src);
                    if (videoId && !this.trackedVideos.has(videoId)) {
                        this.trackedVideos.add(videoId);
                        this.trackActivity('video_play', {
                            video_id: videoId,
                            video_url: src,
                            course_id: this.getCourseId(),
                            timestamp: new Date().toISOString()
                        });
                    }
                }
            }
        }, true); // Use capture phase to catch iframe loads

        // Also check for existing iframes on page load
        setTimeout(() => {
            const iframes = document.querySelectorAll('iframe');
            iframes.forEach(iframe => {
                const src = iframe.src;
                if (src && (src.includes('youtube.com') || src.includes('youtu.be'))) {
                    const videoId = this.extractYouTubeVideoId(src);
                    if (videoId && !this.trackedVideos.has(videoId)) {
                        this.trackedVideos.add(videoId);
                        this.trackActivity('video_play', {
                            video_id: videoId,
                            video_url: src,
                            course_id: this.getCourseId(),
                            timestamp: new Date().toISOString()
                        });
                    }
                }
            });
        }, 2000); // Wait a bit for iframes to load
    }

    trackQuizCompletion() {
        // Listen for quiz completion events
        window.addEventListener('quizComplete', (e) => {
            const detail = e.detail;
            const quizId = detail?.quizId || this.getQuizId();

            if (quizId && !this.trackedQuizzes.has(quizId)) {
                this.trackedQuizzes.add(quizId);
                this.trackActivity('quiz_completion', {
                    quiz_id: quizId,
                    course_id: detail?.courseId || this.getCourseId(),
                    score: detail?.score,
                    timestamp: new Date().toISOString()
                });
            }
        });
    }

    extractYouTubeVideoId(url) {
        // Extract YouTube video ID from various URL formats
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            this.trackActivity('heartbeat');
        }, 30000); // Every 30 seconds
    }

    startFlushInterval() {
        this.flushInterval = setInterval(() => {
            this.flushQueue();
        }, 5000); // Every 5 seconds
    }

    async flushQueue() {
        if (this.activityQueue.length === 0) return;

        const activities = [...this.activityQueue];
        this.activityQueue = [];

        try {
            for (const activity of activities) {
                await this.sendActivity(activity);
            }
        } catch (error) {
            // Re-add activities to queue on error
            this.activityQueue.unshift(...activities);
        }
    }

    async sendActivity(activity) {
        try {
            // Get CSRF token from meta tag or Inertia props
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
                window.Inertia?.props?.csrf_token ||
                '';

            const response = await fetch('/api/student/activity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify(activity)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            throw error;
        }
    }

    getCourseId() {
        // Extract course ID from URL or page elements
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('course_id') ||
            urlParams.get('id') ||
            document.querySelector('[data-course-id]')?.dataset.courseId ||
            this.extractCourseIdFromUrl();

        return courseId;
    }

    getQuizId() {
        // Extract quiz ID from URL or page elements
        const urlParams = new URLSearchParams(window.location.search);
        const quizId = urlParams.get('quiz_id') ||
            document.querySelector('[data-quiz-id]')?.dataset.quizId ||
            this.extractQuizIdFromUrl();

        return quizId;
    }

    extractCourseIdFromUrl() {
        // Extract course ID from URL patterns like /courses/123 or /dashboard/courses/123
        const match = window.location.pathname.match(/\/courses?\/(\d+)/);
        return match ? match[1] : null;
    }

    extractQuizIdFromUrl() {
        // Extract quiz ID from URL patterns like /quiz/123
        const match = window.location.pathname.match(/\/quiz\/(\d+)/);
        return match ? match[1] : null;
    }

    serializeForm(form) {
        const formData = new FormData(form);
        const data = {};
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        return data;
    }

    trackPageUnload() {
        window.addEventListener('beforeunload', () => {
            this.trackActivity('logout');
            this.flushQueue();
        });

        // Also track when user navigates away
        window.addEventListener('pagehide', () => {
            this.trackActivity('logout');
            this.flushQueue();
        });
    }

    // Public methods for manual tracking
    trackCourseView(courseId) {
        this.trackActivity('course_view', { course_id: courseId });
    }

    trackQuizSubmit(quizId, answers) {
        this.trackActivity('quiz_submit', {
            quiz_id: quizId,
            answers: answers,
            submitted_at: new Date().toISOString()
        });
    }

    // Method to track PDF download manually and save to database
    trackPDFDownload(pdfId, pdfUrl) {
        if (pdfId && !this.trackedPDFs.has(pdfId)) {
            this.trackedPDFs.add(pdfId);
            this.trackActivity('pdf_download', {
                pdf_id: pdfId,
                pdf_url: pdfUrl,
                course_id: this.getCourseId(),
                timestamp: new Date().toISOString()
            });

            // Save to database
            this.savePDFDownloadToDatabase(pdfId);
        }
    }

    // Method to track video play manually and save to database
    trackVideoPlay(videoId, videoUrl) {
        if (videoId && !this.trackedVideos.has(videoId)) {
            this.trackedVideos.add(videoId);
            this.trackActivity('video_play', {
                video_id: videoId,
                video_url: videoUrl,
                course_id: this.getCourseId(),
                timestamp: new Date().toISOString()
            });

            // Save to database
            this.saveVideoCompletionToDatabase(videoId);
        }
    }

    // Method to track quiz completion manually and save to database
    trackQuizCompletionEvent(quizId, courseId, score) {
        if (quizId && !this.trackedQuizzes.has(quizId)) {
            this.trackedQuizzes.add(quizId);
            this.trackActivity('quiz_completion', {
                quiz_id: quizId,
                course_id: courseId || this.getCourseId(),
                score: score,
                timestamp: new Date().toISOString()
            });

            // Save to database
            this.saveQuizCompletionToDatabase(quizId, courseId, score);
        }
    }

    // Method to track quiz start manually
    trackQuizStart(quizId) {
        if (quizId) {
            this.trackActivity('quiz_start', {
                quiz_id: quizId,
                course_id: this.getCourseId(),
                timestamp: new Date().toISOString()
            });
        }
    }

    // Method to update user data (useful when user data changes)
    updateUserData(userData) {
        this.userData = userData;
    }

    // Save video completion to database
    async saveVideoCompletionToDatabase(videoId) {
        try {
            // Get current course and content IDs
            const courseId = this.getCourseId();
            const contentId = this.getCurrentContentId();

            if (!courseId || !contentId) {
                return;
            }

            // Get CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
                window.Inertia?.props?.csrf_token ||
                '';

            // Send request to save video completion
            const response = await fetch('/api/progress/video-completion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    course_id: courseId,
                    content_id: contentId,
                    video_id: videoId,
                    duration: 0 // We don't have duration info here, but it's required
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            // Error silently ignored for production
        }
    }

    // Save PDF download to database
    async savePDFDownloadToDatabase(pdfId) {
        try {
            // Get current course and content IDs
            const courseId = this.getCourseId();
            const contentId = this.getCurrentContentId();

            if (!courseId || !contentId) {
                return;
            }

            // Get CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
                window.Inertia?.props?.csrf_token ||
                '';

            // Send request to save PDF download
            const response = await fetch('/api/progress/pdf-download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    course_id: courseId,
                    content_id: contentId,
                    pdf_filename: pdfId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            // Error silently ignored for production
        }
    }

    // Save quiz completion to database
    async saveQuizCompletionToDatabase(quizId, courseId, score) {
        try {
            // Get current content ID
            const contentId = this.getCurrentContentId();

            if (!courseId || !contentId) {
                return;
            }

            // Get CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
                window.Inertia?.props?.csrf_token ||
                '';

            // Send request to save quiz completion
            const response = await fetch('/api/progress/quiz-completion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    course_id: courseId,
                    content_id: contentId,
                    quiz_id: quizId,
                    score: score
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            // Error silently ignored for production
        }
    }

    // Get current content ID from URL or page elements
    getCurrentContentId() {
        // Try to get from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        let contentId = urlParams.get('content_id');

        // Try to get from data attributes
        if (!contentId) {
            contentId = document.querySelector('[data-content-id]')?.dataset.contentId;
        }

        // Try to extract from URL path
        if (!contentId) {
            const match = window.location.pathname.match(/\/content\/(\d+)/);
            contentId = match ? match[1] : null;
        }

        return contentId;
    }
}

// Initialize the tracker when the page loads
let activityTracker = null;

// Function to initialize tracker
function initializeTracker() {
    if (activityTracker) {
        return;
    }

    activityTracker = new StudentActivityTracker();
    window.studentActivityTracker = activityTracker;
}

// Wait for Inertia to be fully loaded
function waitForInertia() {
    // Check if we have user data from Inertia props
    const inertia = window.Inertia;
    const props = inertia?.props;
    const auth = props?.auth;
    const user = auth?.user;

    if (user) {
        initializeTracker();
    } else {
        setTimeout(waitForInertia, 100);
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    waitForInertia();
});

// Initialize on Inertia page visits
if (window.Inertia) {
    window.Inertia.on('navigate', () => {
        // Reset tracker on navigation
        activityTracker = null;
        setTimeout(waitForInertia, 100);
    });
}

// Fallback: try to initialize after a longer delay
setTimeout(() => {
    if (!activityTracker) {
        waitForInertia();
    }
}, 3000);

// Global function to initialize activity tracker with user data
window.initializeActivityTracker = function (userData) {
    if (userData && userData.tipe_user === 'siswa') {
        if (!window.studentActivityTracker) {
            window.studentActivityTracker = new StudentActivityTracker();
        }
        // Force start tracking with the provided user data
        window.studentActivityTracker.updateUserData(userData);
        window.studentActivityTracker.processUserAndStart(userData);
    }
};

export default StudentActivityTracker;
