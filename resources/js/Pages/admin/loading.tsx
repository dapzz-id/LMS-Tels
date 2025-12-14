import { Skeleton } from "@/Components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/Components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Skeleton className="w-64 h-10 mb-2" />
          <Skeleton className="w-48 h-4" />
        </div>
        <Skeleton className="h-10 w-[180px]" />
      </div>

      {/* System Status Card */}
      <Card className="overflow-hidden border-0 shadow-md rounded-xl">
        <div className="p-1 bg-gradient-to-r from-blue-600 to-blue-500"></div>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Skeleton className="w-40 h-6" />
            <Skeleton className="w-24 h-6" />
          </div>
          <Skeleton className="w-56 h-4 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {Array(4)
              .fill(null)
              .map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="rounded-full h-9 w-9" />
                  <div className="space-y-2">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-32 h-3" />
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Cards */}
      <div className="mb-8">
        <Skeleton className="w-48 h-6 mb-4" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array(4)
            .fill(null)
            .map((_, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-800 h-[250px] p-5"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-500"></div>
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                  </div>
                  <Skeleton className="w-32 h-5 mb-1" />
                  <Skeleton className="w-full h-3 mb-3" />
                  <div className="mt-auto">
                    <Skeleton className="w-full rounded-md h-9" />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array(4)
          .fill(null)
          .map((_, i) => (
            <Card key={i} className="overflow-hidden transition-shadow border-0 shadow-md rounded-xl hover:shadow-lg">
              <div className="p-1 bg-gradient-to-r from-blue-600 to-blue-500"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="rounded-full h-9 w-9" />
              </CardHeader>
              <CardContent>
                <Skeleton className="w-16 h-8 mb-1" />
                <Skeleton className="w-32 h-3 mb-4" />
                <Skeleton className="w-full h-2 rounded-full" />
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Tabbed Content */}
      <Card className="border-0 shadow-md rounded-xl">
        <CardHeader>
          <Skeleton className="w-40 h-6 mb-1" />
          <Skeleton className="w-64 h-4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-2">
              {Array(3)
                .fill(null)
                .map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded-md" />
                ))}
            </div>
            <div className="space-y-4">
              {Array(3)
                .fill(null)
                .map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="w-48 h-4" />
                      <Skeleton className="w-64 h-3" />
                      <Skeleton className="w-24 h-3" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

