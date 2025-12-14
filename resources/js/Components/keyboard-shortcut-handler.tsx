"use client"

import { useEffect } from "react"
import { router } from "@inertiajs/react"

export function KeyboardShortcutHandler() {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Check for Ctrl/Cmd + K
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault()
        router.visit("/search")
      }
      // Check for Ctrl/Cmd + N
      if ((event.ctrlKey || event.metaKey) && event.key === "n") {
        event.preventDefault()
        router.visit("/teacher/assignments/new")
      }
      // Check for Ctrl/Cmd + Shift + N
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === "N") {
        event.preventDefault()
        router.visit("/teacher/courses/new")
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [])

  return null
}

