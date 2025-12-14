"use client"

import { useState, useEffect } from "react"
import { Button } from "@/Components/ui/button"
import { X } from "lucide-react"

export function QuickActionTooltip() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if the user has already seen the tooltip
    const hasSeenTooltip = localStorage.getItem("hasSeenQuickActionTooltip")

    if (!hasSeenTooltip && !isDismissed) {
      // Show tooltip after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [isDismissed])

  const dismissTooltip = () => {
    setIsVisible(false)
    setIsDismissed(true)
    localStorage.setItem("hasSeenQuickActionTooltip", "true")
  }

  if (!isVisible) return null

  return (
    <div className="fixed z-50 max-w-xs p-4 bg-white border border-blue-200 rounded-lg shadow-lg bottom-24 right-6 dark:bg-slate-900 dark:border-blue-800 animate-fade-in">
      <Button
        variant="ghost"
        size="icon"
        className="absolute w-6 h-6 top-1 right-1 text-slate-500"
        onClick={dismissTooltip}
      >
        <X className="w-4 h-4" />
      </Button>
      <div className="flex items-start space-x-3">
        <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full dark:bg-blue-900">
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">💡</span>
        </div>
        <div>
          <h3 className="text-sm font-medium">Quick Actions Available!</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Use this floating button for quick access to common actions from anywhere in the dashboard.
          </p>
          <div className="flex justify-end mt-2">
            <Button size="sm" variant="outline" className="text-xs rounded-full h-7" onClick={dismissTooltip}>
              Got it
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

