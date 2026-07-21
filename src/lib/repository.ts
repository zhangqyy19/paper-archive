import type { Book, BookCover, BookFormatId, Entry } from '@/models/types'
import { getFormat } from '@/models/formats'
import type { StorageProvider } from '@/storage/StorageProvider'
import { uid, now, todayYmd } from './utils'

/** Input for creating a new book. */
export interface NewBookInput {
  title: string
  description?: string
  format: BookFormatId
  cover: BookCover
  customTerms?: { singular: string; plural: string }
}

/**
 * A thin business layer over the storage provider. UI code talks to this,
 * never to storage directly — so swapping the backend is a one-line change.
 */
export class Repository {
  constructor(private storage: StorageProvider) {}

  ready() {
    return this.storage.ready()
  }

  // ---- Books ----
  listBooks() {
    return this.storage.getBooks()
  }

  getBook(id: string) {
    return this.storage.getBook(id)
  }

  async createBook(input: NewBookInput): Promise<Book> {
    const timestamp = now()
    const book: Book = {
      id: uid(),
      title: input.title.trim() || 'Untitled',
      description: input.description?.trim() || undefined,
      format: input.format,
      customTerms: input.format === 'custom' ? input.customTerms : undefined,
      cover: input.cover,
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    await this.storage.putBook(book)
    return book
  }

  async updateBook(id: string, patch: Partial<Book>): Promise<Book | undefined> {
    const existing = await this.storage.getBook(id)
    if (!existing) return undefined
    const updated: Book = { ...existing, ...patch, id, updatedAt: now() }
    await this.storage.putBook(updated)
    return updated
  }

  async touchBook(id: string): Promise<void> {
    const existing = await this.storage.getBook(id)
    if (existing) await this.storage.putBook({ ...existing, updatedAt: now() })
  }

  deleteBook(id: string) {
    return this.storage.deleteBook(id)
  }

  // ---- Entries ----
  listEntries(bookId: string) {
    return this.storage.getEntries(bookId)
  }

  getEntry(id: string) {
    return this.storage.getEntry(id)
  }

  async createEntry(book: Book): Promise<Entry> {
    const existing = await this.storage.getEntries(book.id)
    const format = getFormat(book.format)
    const term =
      book.format === 'custom' && book.customTerms ? book.customTerms.singular : format.singular
    const timestamp = now()
    const entry: Entry = {
      id: uid(),
      bookId: book.id,
      title: `${term} ${existing.length + 1}`,
      content: '',
      order: existing.length,
      createdAt: timestamp,
      updatedAt: timestamp,
      // Diary entries get a user-editable date, defaulting to today.
      entryDate: book.format === 'diary' ? todayYmd() : undefined,
      // Recipe entries start with empty structured ingredient/instruction areas.
      recipe:
        book.format === 'recipe'
          ? { ingredients: '', instructions: '', media: [] }
          : undefined,
      // Poem entries carry an (optional) chosen form.
      poetry: book.format === 'poetry' ? {} : undefined,
    }
    await this.storage.putEntry(entry)
    await this.touchBook(book.id)
    return entry
  }

  async updateEntry(id: string, patch: Partial<Entry>): Promise<Entry | undefined> {
    const existing = await this.storage.getEntry(id)
    if (!existing) return undefined
    const updated: Entry = { ...existing, ...patch, id, updatedAt: now() }
    await this.storage.putEntry(updated)
    await this.touchBook(updated.bookId)
    return updated
  }

  async deleteEntry(id: string): Promise<void> {
    const existing = await this.storage.getEntry(id)
    await this.storage.deleteEntry(id)
    if (existing) await this.touchBook(existing.bookId)
  }

  /** Persist a new ordering of entries within a book. */
  async reorderEntries(orderedIds: string[]): Promise<void> {
    for (let i = 0; i < orderedIds.length; i++) {
      const entry = await this.storage.getEntry(orderedIds[i])
      if (entry && entry.order !== i) {
        await this.storage.putEntry({ ...entry, order: i })
      }
    }
  }

  // ---- Backup ----
  exportAll() {
    return this.storage.exportAll()
  }

  importAll(data: { books: Book[]; entries: Entry[] }) {
    return this.storage.replaceAll(data)
  }
}