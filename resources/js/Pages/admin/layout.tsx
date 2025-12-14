import type React from "react"

import AdminLayout from "@/Layouts/AdminLayout"

export default function AdminPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayout>{children}</AdminLayout>
}

