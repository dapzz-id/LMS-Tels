"use client"

import { useState } from "react"
import { router } from "@inertiajs/react"
import { Button } from "@/Components/ui/button"
import { Plus, X, FileText, GraduationCap, MessageSquare, Users, BookOpen } from "lucide-react"

export function QuickActionFAB() {
  const [isOpen, setIsOpen] = useState(false)

  const handleAction = (path: string) => {
    router.visit(path)
    setIsOpen(false)
  }

  return (
    <div className="fixed z-50 bottom-6 right-6">
      <div className={`absolute bottom-0 right-0 space-y-2 transition-all duration-300 ${isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"}`}>
        <Button
          variant="outline"
          size="icon"
          className="w-12 h-12 bg-white rounded-full shadow-lg hover:bg-gray-50"
          onClick={() => handleAction("/teacher/assignments/new")}
        >
          <FileText className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="w-12 h-12 bg-white rounded-full shadow-lg hover:bg-gray-50"
          onClick={() => handleAction("/teacher/courses/new")}
        >
          <GraduationCap className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="w-12 h-12 bg-white rounded-full shadow-lg hover:bg-gray-50"
          onClick={() => handleAction("/teacher/announcements/new")}
        >
          <MessageSquare className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="w-12 h-12 bg-white rounded-full shadow-lg hover:bg-gray-50"
          onClick={() => handleAction("/teacher/student-progress")}
        >
          <Users className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="w-12 h-12 bg-white rounded-full shadow-lg hover:bg-gray-50"
          onClick={() => handleAction("/teacher/materials/upload")}
        >
          <BookOpen className="w-5 h-5" />
        </Button>
      </div>
      <Button
        variant="outline"
        size="icon"
        className={`h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg transition-transform duration-300 hover:bg-blue-700 ${isOpen ? "rotate-45" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </Button>
    </div>
  )
}
