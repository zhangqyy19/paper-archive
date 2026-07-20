import type { Book, Entry } from '@/models/types'
import type { StorageProvider } from './StorageProvider'

const DB_NAME = 'library-db'
const DB_VERSION = 1
const STORE_BOOKS = 'books'
const STORE_ENTRIES = 'entries'

/**
 * IndexedDB-backed storage. Handles missing/corrupted databases gracefully
 * by surfacing a clear error; the data layer can then fall back to memory.
 */
export class IndexedDbProvider implements StorageProvider {
  private dbPromise: Promise<IDBDatabase> | null = null

  private open(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise
    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB is not available in this environment'))
        return
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION)
      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains(STORE_BOOKS)) {
          db.createObjectStore(STORE_BOOKS, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORE_ENTRIES)) {
          const store = db.createObjectStore(STORE_ENTRIES, { keyPath: 'id' })
          store.createIndex('by_book', 'bookId', { unique: false })
        }
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error ?? new Error('Failed to open IndexedDB'))
    })
    return this.dbPromise
  }

  async ready(): Promise<void> {
    await this.open()
  }

  private async tx<T>(
    store: string,
    mode: IDBTransactionMode,
    run: (s: IDBObjectStore) => IDBRequest<T>,
  ): Promise<T> {
    const db = await this.open()
    return new Promise<T>((resolve, reject) => {
      const transaction = db.transaction(store, mode)
      const request = run(transaction.objectStore(store))
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  private async getAll<T>(store: string): Promise<T[]> {
    return this.tx<T[]>(store, 'readonly', (s) => s.getAll() as IDBRequest<T[]>)
  }

  async getBooks(): Promise<Book[]> {
    return this.getAll<Book>(STORE_BOOKS)
  }

  async getBook(id: string): Promise<Book | undefined> {
    return this.tx<Book | undefined>(STORE_BOOKS, 'readonly', (s) => s.get(id))
  }

  async putBook(book: Book): Promise<void> {
    await this.tx(STORE_BOOKS, 'readwrite', (s) => s.put(book))
  }

  async deleteBook(id: string): Promise<void> {
    const db = await this.open()
    // Remove the book and cascade-delete its entries in one transaction.
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORE_BOOKS, STORE_ENTRIES], 'readwrite')
      transaction.objectStore(STORE_BOOKS).delete(id)
      const idx = transaction.objectStore(STORE_ENTRIES).index('by_book')
      const cursorReq = idx.openCursor(IDBKeyRange.only(id))
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        }
      }
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  async getEntries(bookId: string): Promise<Entry[]> {
    const db = await this.open()
    const entries = await new Promise<Entry[]>((resolve, reject) => {
      const transaction = db.transaction(STORE_ENTRIES, 'readonly')
      const idx = transaction.objectStore(STORE_ENTRIES).index('by_book')
      const req = idx.getAll(IDBKeyRange.only(bookId))
      req.onsuccess = () => resolve(req.result as Entry[])
      req.onerror = () => reject(req.error)
    })
    return entries.sort((a, b) => a.order - b.order)
  }

  async getEntry(id: string): Promise<Entry | undefined> {
    return this.tx<Entry | undefined>(STORE_ENTRIES, 'readonly', (s) => s.get(id))
  }

  async putEntry(entry: Entry): Promise<void> {
    await this.tx(STORE_ENTRIES, 'readwrite', (s) => s.put(entry))
  }

  async deleteEntry(id: string): Promise<void> {
    await this.tx(STORE_ENTRIES, 'readwrite', (s) => s.delete(id))
  }

  async replaceAll(data: { books: Book[]; entries: Entry[] }): Promise<void> {
    const db = await this.open()
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORE_BOOKS, STORE_ENTRIES], 'readwrite')
      const books = transaction.objectStore(STORE_BOOKS)
      const entries = transaction.objectStore(STORE_ENTRIES)
      books.clear()
      entries.clear()
      for (const b of data.books) books.put(b)
      for (const e of data.entries) entries.put(e)
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  async exportAll(): Promise<{ books: Book[]; entries: Entry[] }> {
    const [books, entries] = await Promise.all([
      this.getAll<Book>(STORE_BOOKS),
      this.getAll<Entry>(STORE_ENTRIES),
    ])
    return { books, entries }
  }
}