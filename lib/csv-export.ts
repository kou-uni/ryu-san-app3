import type { Interview } from './types'

export function generateCSV(interviews: Interview[]): string {
  // CSV ヘッダーを定義
  const headers = [
    '取材相手名',
    '取材日',
    '要約',
    '取材内容',
    '作成日',
    '更新日',
  ]

  // CSV エスケープ関数（ダブルクォートと改行を処理）
  const escapeCSVField = (field: string | undefined): string => {
    if (!field) return ''
    const escaped = String(field).replace(/"/g, '""')
    // 改行またはカンマを含む場合はダブルクォートで囲む
    if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
      return `"${escaped}"`
    }
    return escaped
  }

  // ヘッダー行を作成
  const headerRow = headers.map((h) => escapeCSVField(h)).join(',')

  // データ行を作成
  const dataRows = interviews.map((interview) => {
    return [
      interview.interviewee_name,
      interview.interview_date,
      interview.summary,
      interview.content,
      formatDateForCSV(interview.created_at),
      formatDateForCSV(interview.updated_at),
    ]
      .map((field) => escapeCSVField(field))
      .join(',')
  })

  // CSVをまとめる（BOM付きで日本語対応）
  const csv = [headerRow, ...dataRows].join('\n')
  return '\uFEFF' + csv // UTF-8 BOM を付ける
}

export function formatDateForCSV(
  dateString: string
): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}

export function downloadCSV(
  csv: string,
  filename: string = '取材記録.csv'
): void {
  // Blobを作成
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })

  // ダウンロードリンクを作成
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  // リンクをクリックしてダウンロードを開始
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // メモリをクリーンアップ
  URL.revokeObjectURL(url)
}
