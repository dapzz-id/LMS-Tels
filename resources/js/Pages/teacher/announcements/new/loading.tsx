import { Skeleton } from "@/Components/ui/skeleton"

export default function NewAnnouncementLoading() {
  return (
    <div className="container py-6 space-y-6">
      <div>
        <Skeleton className="w-2/3 h-10 mb-2" />
        <Skeleton className="w-1/2 h-4" />
      </div>

      <Skeleton className="h-[600px] w-full rounded-xl" />
    </div>
  )
}

