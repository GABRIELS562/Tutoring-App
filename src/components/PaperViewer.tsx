'use client'

import { useState, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import {
  X,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  AlertCircle,
} from 'lucide-react'

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

type PaperViewerProps = {
  url: string
  title: string
  onClose: () => void
}

export default function PaperViewer({ url, title, onClose }: PaperViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setLoading(false)
    setError(null)
  }, [])

  const onDocumentLoadError = useCallback((err: Error) => {
    console.error('PDF load error:', err)
    setLoading(false)
    setError('Failed to load PDF. The file may be unavailable.')
  }, [])

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1))
  }

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages))
  }

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2.0))
  }

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.6))
  }

  const handleDownload = () => {
    // Open PDF in new tab for download
    window.open(url, '_blank')
  }

  // Close on escape key and navigate pages
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowLeft') {
      goToPrevPage()
    } else if (e.key === 'ArrowRight') {
      goToNextPage()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(0, 0, 0, 0.9)' }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border-custom)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: 'var(--text)' }}
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
          <h2
            className="font-semibold text-sm md:text-base truncate max-w-[200px] md:max-w-none"
            style={{ color: 'var(--text)' }}
          >
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="hidden md:flex items-center gap-1 mr-2">
            <button
              onClick={zoomOut}
              disabled={scale <= 0.6}
              className="p-2 rounded-lg transition-colors hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: 'var(--text)' }}
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span
              className="text-xs font-medium px-2 min-w-[50px] text-center"
              style={{ color: 'var(--muted-custom)' }}
            >
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              disabled={scale >= 2.0}
              className="p-2 rounded-lg transition-colors hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: 'var(--text)' }}
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Download button */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
            style={{ background: 'var(--accent-red)', color: 'white' }}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-4">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2
              className="w-8 h-8 animate-spin mb-3"
              style={{ color: 'var(--accent-red)' }}
            />
            <p style={{ color: 'var(--muted-custom)' }}>Loading PDF...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <AlertCircle
              className="w-12 h-12 mb-3"
              style={{ color: 'var(--accent-red)' }}
            />
            <p className="font-medium mb-1" style={{ color: 'var(--text)' }}>
              Could not load PDF
            </p>
            <p className="text-sm mb-4" style={{ color: 'var(--muted-custom)' }}>
              {error}
            </p>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
              style={{ background: 'var(--accent-red)', color: 'white' }}
            >
              <Download className="w-4 h-4" />
              Try downloading instead
            </button>
          </div>
        )}

        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
          error={null}
          className={loading || error ? 'hidden' : ''}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-2xl"
          />
        </Document>
      </div>

      {/* Footer with page navigation */}
      {!loading && !error && numPages > 0 && (
        <div
          className="flex items-center justify-center gap-4 px-4 py-3 shrink-0"
          style={{ background: 'var(--surface)', borderTop: '1px solid var(--border-custom)' }}
        >
          {/* Mobile zoom controls */}
          <div className="md:hidden flex items-center gap-1 mr-4">
            <button
              onClick={zoomOut}
              disabled={scale <= 0.6}
              className="p-2 rounded-lg transition-colors disabled:opacity-50"
              style={{ color: 'var(--text)', background: 'var(--surface2)' }}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={zoomIn}
              disabled={scale >= 2.0}
              className="p-2 rounded-lg transition-colors disabled:opacity-50"
              style={{ color: 'var(--text)', background: 'var(--surface2)' }}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Page navigation */}
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ color: 'var(--text)', background: 'var(--surface2)' }}
            title="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span
            className="text-sm font-medium min-w-[100px] text-center"
            style={{ color: 'var(--text)' }}
          >
            Page {pageNumber} of {numPages}
          </span>

          <button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ color: 'var(--text)', background: 'var(--surface2)' }}
            title="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}
