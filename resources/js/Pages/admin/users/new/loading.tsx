import { Skeleton } from "@/Components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/Components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <Skeleton className="w-64 h-10" />
      </div>

      <Card className="border-0 shadow-md rounded-xl">
        <CardHeader>
          <Skeleton className="w-48 h-6 mb-2" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-full h-10" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-full h-10" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-full h-10" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-full h-10" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="w-24 h-4" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Skeleton className="w-full h-10" />
                  <Skeleton className="w-full h-10" />
                  <Skeleton className="w-full h-10" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-full h-10" />
              </div>

              <div className="space-y-2">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="h-[100px] w-full" />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Skeleton className="w-24 h-10" />
              <Skeleton className="w-32 h-10" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

