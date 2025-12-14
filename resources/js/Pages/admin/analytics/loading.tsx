import { Skeleton } from "@/Components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/Components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Skeleton className="w-64 h-10 mb-2" />
          <Skeleton className="w-48 h-4" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="w-10 h-10" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
      </div>

      <Card className="border-0 shadow-md rounded-xl">
        <CardHeader className="pb-2">
          <Skeleton className="w-48 h-6 mb-1" />
          <Skeleton className="w-64 h-4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Skeleton className="flex-1 h-10 rounded-lg" />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array(4)
                .fill(null)
                .map((_, i) => (
                  <Card key={i} className="overflow-hidden border-0 shadow-sm rounded-xl">
                    <Skeleton className="w-full h-1" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <Skeleton className="w-24 h-4" />
                      <Skeleton className="rounded-full h-9 w-9" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="w-20 h-8 mb-1" />
                      <Skeleton className="w-32 h-3 mb-4" />
                      <Skeleton className="w-full h-2" />
                    </CardContent>
                  </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {Array(2)
                .fill(null)
                .map((_, i) => (
                  <Card key={i} className="border-0 shadow-sm rounded-xl">
                    <CardHeader>
                      <Skeleton className="w-40 h-5 mb-1" />
                      <Skeleton className="w-32 h-3" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-[300px] w-full rounded-lg" />
                    </CardContent>
                  </Card>
                ))}
            </div>

            <Card className="border-0 shadow-sm rounded-xl">
              <CardHeader>
                <Skeleton className="w-40 h-5 mb-1" />
                <Skeleton className="w-32 h-3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full rounded-lg" />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

