import { Button } from "@/Components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select"

type ClientPaginationProps = {
  totalItems: number
  currentPage: number
  perPage: number
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  perPageOptions?: number[]
  itemLabel?: string
}

export default function ClientPagination({
  totalItems,
  currentPage,
  perPage,
  onPageChange,
  onPerPageChange,
  perPageOptions = [6, 10, 20, 50],
  itemLabel = "items",
}: ClientPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / Math.max(perPage, 1)))
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages)

  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * perPage + 1
  const endItem = Math.min(safeCurrentPage * perPage, totalItems)

  const visiblePages: number[] = []
  for (
    let page = Math.max(1, safeCurrentPage - 1);
    page <= Math.min(totalPages, safeCurrentPage + 1);
    page++
  ) {
    visiblePages.push(page)
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
      <div className="text-sm text-slate-600 dark:text-slate-300">
        Showing {startItem}-{endItem} of {totalItems} {itemLabel}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-500 dark:text-slate-400">Per page</span>
        <Select
          value={String(perPage)}
          onValueChange={(value) => onPerPageChange(Number(value))}
        >
          <SelectTrigger className="h-8 w-[84px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {perPageOptions.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage <= 1}
        >
          Prev
        </Button>

        {visiblePages.map((page) => (
          <Button
            key={page}
            size="sm"
            className="h-8 min-w-8 px-2"
            variant={page === safeCurrentPage ? "default" : "outline"}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
