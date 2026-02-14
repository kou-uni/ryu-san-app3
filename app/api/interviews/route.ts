import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import type { Interview } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const keyword = searchParams.get('keyword')

    let sqlQuery = `
      SELECT
        id::text,
        interviewee_name,
        interview_date::text,
        content,
        summary,
        created_at::text,
        updated_at::text
      FROM interviews
    `
    const params: any[] = []

    // If keyword is provided, search in interviewee_name, content, and summary
    if (keyword) {
      sqlQuery += `
        WHERE
          interviewee_name ILIKE $1 OR
          content ILIKE $1 OR
          summary ILIKE $1
      `
      params.push(`%${keyword}%`)
    }

    sqlQuery += ' ORDER BY interview_date DESC'

    const data = await query<Interview>(sqlQuery, params)

    console.log('[PostgreSQL] Fetched interviews:', data.length)
    return NextResponse.json(data)
  } catch (error) {
    console.error('[PostgreSQL] Error fetching interviews:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch interviews'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { interviewee_name, interview_date, content, summary } = body

    if (!interviewee_name || !interview_date || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const sqlQuery = `
      INSERT INTO interviews (interviewee_name, interview_date, content, summary)
      VALUES ($1, $2, $3, $4)
      RETURNING
        id::text,
        interviewee_name,
        interview_date::text,
        content,
        summary,
        created_at::text,
        updated_at::text
    `

    const params = [
      interviewee_name,
      interview_date,
      content,
      summary || content.substring(0, 100),
    ]

    const data = await query<Interview>(sqlQuery, params)

    console.log('[PostgreSQL] Interview created:', data[0])
    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('[PostgreSQL] Error creating interview:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create interview'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
