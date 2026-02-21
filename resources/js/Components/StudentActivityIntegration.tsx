"use client"

import { useEffect, useRef } from 'react'

interface StudentActivityIntegrationProps {
  children: React.ReactNode
}

// Extend Window interface to include Inertia and studentActivityTracker
declare global {
  interface Window {
    Inertia?: {
      props?: {
        auth?: {
          user?: any
        }
      }
      on: (event: string, callback: () => void) => void
      off: (event: string, callback: () => void) => void
    }
    studentActivityTracker?: {
      updateUserData: (user: any) => void
      isTracking: boolean
      processUserAndStart: (user: any) => void
      trackActivity: (activityType: string, data?: any) => void
      trackPDFDownload: (pdfId: string, pdfUrl: string) => void
      trackVideoPlay: (videoId: string, videoUrl: string) => void
      trackQuizCompletionEvent: (quizId: string, courseId: string, score: number) => void
      trackQuizStart: (quizId: string) => void
    }
  }
}

export default function StudentActivityIntegration({ children }: StudentActivityIntegrationProps) {
  const initializedRef = useRef(false)

  useEffect(() => {
    // Only initialize once per component mount
    if (initializedRef.current) return

    // Get user data from Inertia props (same as the tracker)
    const getUserData = () => {
      const inertia = window.Inertia;
      const props = inertia?.props;
      const auth = props?.auth;
      const user = auth?.user;
      return user;
    }

    const user = getUserData()

    // Check if user is a student
    if (user && user.tipe_user === 'siswa') {
      

      // Wait a bit for the tracker to be available
      const initTracker = () => {
        if (window.studentActivityTracker) {
          
          window.studentActivityTracker.updateUserData(user)

          // Force start tracking if not already tracking
          if (!window.studentActivityTracker.isTracking) {
            
            window.studentActivityTracker.processUserAndStart(user)
          }

          initializedRef.current = true
        } else {
          
          setTimeout(initTracker, 100)
        }
      }

      // Try to initialize immediately
      initTracker()

      // Also try after a delay as fallback
      setTimeout(initTracker, 1000)
    } else {
      
    }
  }, [])

  // Track page changes using a different approach
  useEffect(() => {
    const trackPageView = () => {
      const user = getUserData()
      if (user && user.tipe_user === 'siswa' && window.studentActivityTracker) {
        // Track page view when component mounts
        window.studentActivityTracker.trackActivity('page_view', {
          page_url: window.location.href,
          user_id: user.id
        })
      }
    }

    // Get user data from Inertia props
    const getUserData = () => {
      const inertia = window.Inertia;
      const props = inertia?.props;
      const auth = props?.auth;
      const user = auth?.user;
      return user;
    }

    // Track initial page view
    trackPageView()

    // Track page views on navigation
    const handleNavigation = () => {
      setTimeout(trackPageView, 100) // Small delay to ensure new page is loaded
    }

    // Listen for Inertia navigation events
    if (window.Inertia) {
      window.Inertia.on('navigate', handleNavigation)
    }

    return () => {
      if (window.Inertia) {
        window.Inertia.off('navigate', handleNavigation)
      }
    }
  }, [])

  return <>{children}</>
}
