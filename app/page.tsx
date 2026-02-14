'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { InterviewForm } from '@/components/interview-form'
import { InterviewCard } from '@/components/interview-card'
import { InterviewDetailModal } from '@/components/interview-detail-modal'
import { CSVExportButton } from '@/components/csv-export-button'
import type { Interview } from '@/lib/types'

type View = 'list' | 'form'

export default function Page() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(
    null
  )
  const [view, setView] = useState<View>('list')
  const [isLoading, setIsLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Fetch interviews
  const fetchInterviews = async (keyword?: string) => {
    try {
      setError(null)
      setIsLoading(true)
      const url = new URL('/api/interviews', window.location.origin)
      if (keyword) {
        url.searchParams.set('keyword', keyword)
      }
      console.log('[v0] Fetching interviews from:', url.toString())
      const response = await fetch(url.toString())
      console.log('[v0] Fetch response status:', response.status)
      const data = await response.json()
      console.log('[v0] Fetch response data:', data)
      
      if (!response.ok) {
        setError(data.error || 'Failed to fetch interviews')
        setInterviews([])
        return
      }
      
      setInterviews(data)
    } catch (err) {
      console.error('[v0] Error fetching interviews:', err)
      setError('Error connecting to database')
      setInterviews([])
    } finally {
      setIsLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchInterviews()
  }, [])

  // Handle search
  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword)
    if (keyword.trim()) {
      fetchInterviews(keyword)
    } else {
      fetchInterviews()
    }
  }

  // Handle new interview
  const handleInterviewCreated = (newInterview: Interview) => {
    setInterviews((prev) => [newInterview, ...prev])
    setView('list')
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/interviews/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete')
      setInterviews((prev) => prev.filter((i) => i.id !== id))
      setSelectedInterview(null)
    } catch (error) {
      console.error('Error deleting interview:', error)
      throw error
    }
  }

  return (
    <main className="min-h-screen bg-transparent">
      {/* Header */}
      <header className="sticky top-0 bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 z-40 shadow-lg border-b border-blue-300">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md line-clamp-1">
                長崎県茂木町の魅力の記録
              </h1>
              <p className="text-xs sm:text-sm text-white/90 mt-0.5 sm:mt-1 drop-shadow line-clamp-1">
                地元の魅力的なコンテンツを取材・記録
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              {view === 'list' && (
                <CSVExportButton interviews={interviews} disabled={isLoading} />
              )}
              <Button
                onClick={() => setView(view === 'list' ? 'form' : 'list')}
                className={`whitespace-nowrap font-semibold px-3 sm:px-5 py-2 text-sm sm:text-base flex-1 sm:flex-none transition-all ${
                  view === 'list'
                    ? 'bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white shadow-lg'
                    : 'bg-white/20 hover:bg-white/30 text-white border border-white/40 backdrop-blur-sm'
                }`}
              >
                {view === 'list' ? '新規作成' : '一覧に戻る'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {view === 'form' ? (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <InterviewForm
            onSuccess={handleInterviewCreated}
            onCancel={() => setView('list')}
          />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
          {/* Error Message */}
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm sm:text-base">
              <p className="font-medium">エラーが発生しました</p>
              <p className="text-xs sm:text-sm mt-1">{error}</p>
              {error.includes('Database not configured') && (
                <p className="text-xs sm:text-sm mt-2 text-red-600">
                  Supabase環境変数が設定されていません。プロジェクト設定で設定してください。
                </p>
              )}
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-4 sm:mb-8">
            <input
              type="text"
              placeholder="キーワード検索..."
              value={searchKeyword}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 sm:px-6 py-2 sm:py-3 border border-white/40 rounded-full focus:outline-none focus:ring-2 focus:ring-primary bg-white/70 backdrop-blur-sm text-foreground placeholder-gray-500 shadow-md hover:bg-white/80 transition-all text-sm sm:text-base"
            />
          </div>

          {/* Results Info */}
          {searchKeyword && (
            <div className="mb-4 sm:mb-6 text-xs sm:text-sm text-muted-foreground">
              "{searchKeyword}" の検索結果: {interviews.length} 件
            </div>
          )}

          {/* Interview Cards Grid */}
          {isLoading ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-muted-foreground text-sm sm:text-base">読み込み中...</p>
            </div>
          ) : interviews.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-muted-foreground text-base sm:text-lg">
                {searchKeyword
                  ? `"${searchKeyword}" に該当する取材がありません`
                  : '取材がまだ登録されていません'}
              </p>
              {!searchKeyword && (
                <Button
                  onClick={() => setView('form')}
                  className="mt-4"
                >
                  最初の取材を記録
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {interviews.map((interview) => (
                <InterviewCard
                  key={interview.id}
                  interview={interview}
                  onClick={setSelectedInterview}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedInterview && (
        <InterviewDetailModal
          interview={selectedInterview}
          onClose={() => setSelectedInterview(null)}
          onDelete={handleDelete}
        />
      )}
    </main>
  )
}
