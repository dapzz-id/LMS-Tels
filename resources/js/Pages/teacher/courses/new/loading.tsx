import { Skeleton } from "@/Components/ui/skeleton"

export default function NewCourseLoading() {
  return (
    <div className="container py-6 space-y-6">
      <div>
        <Skeleton className="w-2/3 h-10 mb-2" />
        <Skeleton className="w-1/2 h-4" />
      </div>

      <div className="space-y-6">
        <Skeleton className="w-full h-10" />

        <div className="space-y-4">
          <Skeleton className="w-full h-64 rounded-lg" />
          <Skeleton className="w-full h-64 rounded-lg" />
        </div>

        <div className="flex justify-end gap-4">
          <Skeleton className="w-24 h-10" />
          <Skeleton className="w-32 h-10" />
        </div>
      </div>
    </div>
  )
}

