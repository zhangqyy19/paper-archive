import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LibraryProvider } from '@/lib/LibraryContext'
import { LibraryPage } from '@/pages/LibraryPage'
import { BookDetailPage } from '@/pages/BookDetailPage'

export function App() {
  return (
    <LibraryProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<LibraryPage />} />
          <Route path="/book/:id" element={<BookDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </LibraryProvider>
  )
}