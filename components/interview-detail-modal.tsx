'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Interview } from '@/lib/types'

interface InterviewDetailModalProps {
  interview: Interview
  onClose: () => void
  onDelete?: (id: string) => Promise<void>
}

export function InterviewDetailModal({
  interview,
  onClose,
  onDelete,
}: InterviewDetailModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    // Close on Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(onClose, 200)
  }

  const handleDelete = async () => {
    if (!onDelete) return
    if (!confirm('この取材を削除しますか？')) return

    setIsDeleting(true)
    try {
      await onDelete(interview.id)
      handleClose()
    } catch (error) {
      console.error('Error deleting interview:', error)
      alert('削除に失敗しました')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        <div
          className="bg-background border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-background border-b border-border p-4 sm:p-6 flex justify-between items-start gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                {formatDate(interview.interview_date)}
              </p>
              <h2 className="text-lg sm:text-2xl font-bold text-foreground line-clamp-2">
                {interview.interviewee_name}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              aria-label="Close modal"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            <div className="prose prose-sm max-w-none text-foreground text-sm">
              <p className="whitespace-pre-wrap leading-relaxed">
                {interview.content}
              </p>
            </div>

            {/* Metadata */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border text-xs text-muted-foreground space-y-1">
              <p>作成日: {formatDate(interview.created_at)}</p>
              <p>更新日: {formatDate(interview.updated_at)}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-background border-t border-border p-4 sm:p-6 flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1"
            >
              閉じる
            </Button>
            {onDelete && (
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                variant="destructive"
                className="flex-1"
              >
                {isDeleting ? '削除中...' : '削除'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
