import type { Book, Entry } from '@/models/types'

/**
 * The storage contract the whole app depends on. Today it is backed by
 * IndexedDB, but any implementation (REST, Supabase, Firebase...) that
 * satisfies this interface can be dropped in without touching the UI.
 */
export interface StorageProvider {
  ready(): Promise<void>

  // Books
  getBooks(): Promise<Book[]>
  getBook(id: string): Promise<Book | undefined>
  putBook(book: Book): Promise<void>
  deleteBook(id: string): Promise<void>

  // Entries
  getEntries(bookId: string): Promise<Entry[]>
  getEntry(id: string): Promise<Entry | undefined>
  putEntry(entry: Entry): Promise<void>
  deleteEntry(id: string): Promise<void>

  // Bulk (used by import / restore)
  replaceAll(data: { books: Book[]; entries: Entry[] }): Promise<void>
  exportAll(): Promise<{ books: Book[]; entries: Entry[] }>
}

/** The shape of an exported backup file. Versioned for forward-compat. */
export interface LibraryBackup {
  app: 'library'
  version: 1
  exportedAt: string
  data: {
    books: Book[]
    entries: Entry[]
  }
}