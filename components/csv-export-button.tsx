'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { generateCSV, downloadCSV } from '@/lib/csv-export'
import type { Interview } from '@/lib/types'

interface CSVExportButtonProps {
  interviews: Interview[]
  disabled?: boolean
}

export function CSVExportButton({
  interviews,
  disabled = false,
}: CSVExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      console.log('[v0] Exporting', interviews.length, 'interviews to CSV')

      // CSV を生成
      const csv = generateCSV(interviews)

      // ファイル名を日付付きで生成
      const now = new Date()
      const dateStr = now.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
      const filename = `取材記録_${dateStr}.csv`

      // ダウンロード
      downloadCSV(csv, filename)
      console.log('[v0] CSV exported successfully:', filename)
    } catch (error) {
      console.error('[v0] Error exporting CSV:', error)
      alert('CSV エクスポートに失敗しました')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      onClick={handleExport}
      disabled={disabled || isExporting || interviews.length === 0}
      className="whitespace-nowrap px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 hover:from-green-500 hover:via-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-2xl font-bold text-xs sm:text-base transition-all transform hover:scale-105 active:scale-95 border-2 border-green-300"
    >
      <span className="hidden sm:inline">{isExporting ? '📊 エクスポート中...' : '📥 CSV ダウンロード'}</span>
      <span className="sm:hidden">{isExporting ? 'エクスポート中...' : 'CSV'}</span>
    </Button>
  )
}
