import { Skeleton } from "@/Components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/Components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Skeleton className="w-64 h-10 mb-2" />
          <Skeleton className="w-48 h-4" />
        </div>
        <Skeleton className="h-10 w-[180px]" />
      </div>

      <Card className="border-0 shadow-md rounded-xl">
        <CardHeader className="pb-2">
          <Skeleton className="w-32 h-6 mb-1" />
          <Skeleton className="w-64 h-4" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center">
            <Skeleton className="flex-1 h-10 rounded-lg" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-[150px] rounded-lg" />
              <Skeleton className="h-10 w-[150px] rounded-lg" />
              <Skeleton className="w-10 h-10 rounded-lg" />
              <Skeleton className="w-10 h-10 rounded-lg" />
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <Skeleton className="w-16 h-4" />
                  </TableHead>
                  <TableHead>
                    <Skeleton className="w-12 h-4" />
                  </TableHead>
                  <TableHead>
                    <Skeleton className="w-16 h-4" />
                  </TableHead>
                  <TableHead>
                    <Skeleton className="w-16 h-4" />
                  </TableHead>
                  <TableHead>
                    <Skeleton className="w-24 h-4" />
                  </TableHead>
                  <TableHead className="text-right">
                    <Skeleton className="w-16 h-4 ml-auto" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array(5)
                  .fill(null)
                  .map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-8 h-8 rounded-full" />
                          <div>
                            <Skeleton className="w-32 h-4 mb-1" />
                            <Skeleton className="w-40 h-3" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="w-16 h-6 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="w-20 h-6 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="w-4 h-4" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="w-24 h-4" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="w-8 h-8 ml-auto rounded-full" />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

