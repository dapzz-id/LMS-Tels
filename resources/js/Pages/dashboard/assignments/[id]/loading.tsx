export default function AssignmentLoading() {
  return (
    <div className="container mx-auto p-4 lg:p-6">
      <div className="h-10 w-24 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700 mb-6"></div>

      <div className="mb-6">
        <div className="h-8 w-3/4 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
        <div className="mt-2 flex gap-2">
          <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-6 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="border-b border-gray-200 p-4 dark:border-gray-800">
          <div className="h-6 w-1/3 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
          <div className="mt-2 h-4 w-2/3 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-1/4 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-4 w-1/3 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-4 w-1/4 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
            </div>

            <div className="space-y-2">
              <div className="h-4 w-1/5 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-2 w-full animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-3 w-1/6 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="border-b border-gray-200 p-4 dark:border-gray-800">
          <div className="h-6 w-1/3 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
          <div className="mt-2 h-4 w-2/3 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
        </div>
        <div className="p-4">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="h-5 w-2/3 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
                <div className="mt-4 space-y-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div
                      key={j}
                      className="flex items-center space-x-2 rounded-md border border-gray-200 p-3 dark:border-gray-700"
                    >
                      <div className="h-4 w-4 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-4 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
          <div className="h-10 w-32 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-10 w-32 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    </div>
  )
}

