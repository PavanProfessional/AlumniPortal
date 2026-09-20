import { useMemo, useState } from 'react'

export interface Pagination<T> {
  page: number
  setPage: (p: number) => void
  pageSize: number
  setPageSize: (n: number) => void
  totalItems: number
  totalPages: number
  pageItems: T[]
  startIndex: number
  endIndex: number
}

/**
 * Slices `items` into pages, always deriving totalPages/page from the CURRENT
 * items length rather than trusting stale state — so if a filter shrinks the
 * list while the user is on page 5, the visible page silently clamps to the
 * new last page instead of rendering empty or crashing.
 */
export function usePagination<T>(items: T[], defaultPageSize = 10): Pagination<T> {
  const [rawPage, setPage] = useState(1)
  const [pageSize, setPageSizeRaw] = useState(defaultPageSize)

  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const page = Math.min(Math.max(1, rawPage), totalPages)

  const { pageItems, startIndex, endIndex } = useMemo(() => {
    const start = (page - 1) * pageSize
    const end = Math.min(start + pageSize, totalItems)
    return { pageItems: items.slice(start, end), startIndex: start, endIndex: end }
  }, [items, page, pageSize, totalItems])

  function setPageSize(n: number) {
    setPageSizeRaw(n)
    setPage(1)
  }

  return { page, setPage, pageSize, setPageSize, totalItems, totalPages, pageItems, startIndex, endIndex }
}
