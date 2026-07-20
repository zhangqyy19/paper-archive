import type { Book, Entry } from '@/models/types'
import type { LibraryBackup } from './StorageProvider'

/** Build a versioned backup object from raw data. */
export function makeBackup(data: { books: Book[]; entries: Entry[] }): LibraryBackup {
  return {
    app: 'library',
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  }
}

/** Serialize a backup to a pretty JSON string. */
export function serializeBackup(backup: LibraryBackup): string {
  return JSON.stringify(backup, null, 2)
}

/**
 * Parse and validate an imported backup file. Throws a friendly error if
 * the file is corrupt or from an unknown/future version.
 */
export function parseBackup(raw: string): { books: Book[]; entries: Entry[] } {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('That file is not valid JSON.')
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('That file does not look like a Library backup.')
  }

  const backup = parsed as Partial<LibraryBackup>
  if (backup.app !== 'library') {
    throw new Error('That file does not look like a Library backup.')
  }
  if (backup.version !== 1) {
    throw new Error(`Unsupported backup version: ${String(backup.version)}.`)
  }
  const data = backup.data
  if (!data || !Array.isArray(data.books) || !Array.isArray(data.entries)) {
    throw new Error('This backup is missing its books or entries.')
  }

  return { books: data.books, entries: data.entries }
}

/** Trigger a browser download of the backup JSON. */
export function downloadBackup(backup: LibraryBackup): void {
  const blob = new Blob([serializeBackup(backup)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const stamp = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `library-backup-${stamp}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Read a File selected by an <input type="file"> as text. */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error ?? new Error('Could not read file'))
    reader.readAsText(file)
  })
}