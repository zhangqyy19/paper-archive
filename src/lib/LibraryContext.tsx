import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Book, Entry } from '@/models/types'
import { Repository, type NewBookInput } from './repository'
import { IndexedDbProvider } from '@/storage/indexedDbProvider'

interface LibraryContextValue {
  repo: Repository
  books: Book[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  createBook: (input: NewBookInput) => Promise<Book>
  updateBook: (id: string, patch: Partial<Book>) => Promise<void>
  deleteBook: (id: string) => Promise<void>
}

const LibraryContext = createContext<LibraryContextValue | null>(null)

// A single repository instance for the whole app. Swapping IndexedDbProvider
// for a cloud-backed provider here is all it takes to move off local storage.
const repo = new Repository(new IndexedDbProvider())

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const list = await repo.listBooks()
      setBooks(list)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load your library.')
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await repo.ready()
        const list = await repo.listBooks()
        if (!cancelled) setBooks(list)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not open local storage.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const createBook = useCallback(
    async (input: NewBookInput) => {
      const book = await repo.createBook(input)
      await refresh()
      return book
    },
    [refresh],
  )

  const updateBook = useCallback(
    async (id: string, patch: Partial<Book>) => {
      await repo.updateBook(id, patch)
      await refresh()
    },
    [refresh],
  )

  const deleteBook = useCallback(
    async (id: string) => {
      await repo.deleteBook(id)
      await refresh()
    },
    [refresh],
  )

  const value = useMemo<LibraryContextValue>(
    () => ({ repo, books, loading, error, refresh, createBook, updateBook, deleteBook }),
    [books, loading, error, refresh, createBook, updateBook, deleteBook],
  )

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('useLibrary must be used within a LibraryProvider')
  return ctx
}

/** Load and manage the entries of a single book, with reordering. */
export function useEntries(bookId: string | undefined) {
  const { repo } = useLibrary()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const bookIdRef = useRef(bookId)
  bookIdRef.current = bookId

  const refresh = useCallback(async () => {
    if (!bookId) return
    const list = await repo.listEntries(bookId)
    if (bookIdRef.current === bookId) setEntries(list)
  }, [repo, bookId])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    ;(async () => {
      if (!bookId) {
        setEntries([])
        setLoading(false)
        return
      }
      const list = await repo.listEntries(bookId)
      if (!cancelled) {
        setEntries(list)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [repo, bookId])

  const reorder = useCallback(
    async (orderedIds: string[]) => {
      // Optimistic local reorder for a snappy feel.
      setEntries((prev) => {
        const map = new Map(prev.map((e) => [e.id, e]))
        return orderedIds
          .map((id, i) => {
            const e = map.get(id)
            return e ? { ...e, order: i } : undefined
          })
          .filter((e): e is Entry => Boolean(e))
      })
      await repo.reorderEntries(orderedIds)
    },
    [repo],
  )

  return { entries, loading, refresh, reorder, setEntries }
}