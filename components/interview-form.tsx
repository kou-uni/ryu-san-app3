'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Interview } from '@/lib/types'

interface InterviewFormProps {
  onSuccess?: (interview: Interview) => void
  onCancel?: () => void
}

export function InterviewForm({ onSuccess, onCancel }: InterviewFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    interviewee_name: '',
    interview_date: new Date().toISOString().split('T')[0],
    content: '',
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (!formData.interviewee_name.trim()) {
        throw new Error('取材相手の名前を入力してください')
      }
      if (!formData.content.trim()) {
        throw new Error('取材内容を入力してください')
      }

      // Generate summary (first 20 characters + ...)
      const summary =
        formData.content.length > 20
          ? formData.content.substring(0, 20) + '...'
          : formData.content

      const response = await fetch('/api/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          summary,
        }),
      })

      console.log('[v0] Interview POST response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.log('[v0] Interview POST error:', errorData)
        throw new Error(errorData.error || 'Failed to create interview')
      }

      const newInterview = await response.json()
      console.log('[v0] Interview created successfully:', newInterview)
      setFormData({
        interviewee_name: '',
        interview_date: new Date().toISOString().split('T')[0],
        content: '',
      })
      onSuccess?.(newInterview)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-foreground">
        新しい取材を記録
      </h2>

      {error && (
        <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4 sm:space-y-5">
        {/* Interviewee Name */}
        <div>
          <label htmlFor="interviewee_name" className="block text-xs sm:text-sm font-medium text-foreground mb-2">
            取材相手の名前 *
          </label>
          <input
            id="interviewee_name"
            type="text"
            name="interviewee_name"
            value={formData.interviewee_name}
            onChange={handleInputChange}
            placeholder="例：田中花子"
            className="w-full px-3 sm:px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm"
            required
          />
        </div>

        {/* Interview Date */}
        <div>
          <label htmlFor="interview_date" className="block text-xs sm:text-sm font-medium text-foreground mb-2">
            取材日 *
          </label>
          <input
            id="interview_date"
            type="date"
            name="interview_date"
            value={formData.interview_date}
            onChange={handleInputChange}
            className="w-full px-3 sm:px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm"
            required
          />
        </div>

        {/* Interview Content */}
        <div>
          <label htmlFor="content" className="block text-xs sm:text-sm font-medium text-foreground mb-2">
            取材内容 *
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="取材内容を詳しく入力してください..."
            rows={6}
            className="w-full px-3 sm:px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background resize-none text-sm"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            このテキストが要約として表示されます
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? '保存中...' : '保存'}
          </Button>
          {onCancel && (
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="flex-1"
            >
              キャンセル
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}
