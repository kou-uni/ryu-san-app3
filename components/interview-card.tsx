'use client'

import type { Interview } from '@/lib/types'

interface InterviewCardProps {
  interview: Interview
  onClick: (interview: Interview) => void
}

export function InterviewCard({ interview, onClick }: InterviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  return (
    <div
      onClick={() => onClick(interview)}
      className="p-4 sm:p-6 border border-white/40 rounded-2xl bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:shadow-xl hover:border-primary transition-all cursor-pointer group"
    >
      <div className="space-y-2">
        {/* Date */}
        <p className="text-xs text-muted-foreground">
          {formatDate(interview.interview_date)}
        </p>

        {/* Interviewee Name */}
        <h3 className="text-base sm:text-lg font-semibold text-foreground line-clamp-1">
          {interview.interviewee_name}
        </h3>

        {/* Summary */}
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
          {interview.summary}
        </p>
      </div>

      {/* Click to read more indicator */}
      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/20">
        <p className="text-xs text-primary font-semibold group-hover:translate-x-1 transition-transform">→ クリックして詳細を表示</p>
      </div>
    </div>
  )
}
