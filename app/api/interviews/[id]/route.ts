import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import type { Interview } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const sqlQuery = `
      SELECT
        id::text,
        interviewee_name,
        interview_date::text,
        content,
        summary,
        created_at::text,
        updated_at::text
      FROM interviews
      WHERE id = $1
    `

    const data = await query<Interview>(sqlQuery, [id])

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('[PostgreSQL] Error fetching interview:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch interview'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { interviewee_name, interview_date, content, summary } = body

    const sqlQuery = `
      UPDATE interviews
      SET
        interviewee_name = $1,
        interview_date = $2,
        content = $3,
        summary = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING
        id::text,
        interviewee_name,
        interview_date::text,
        content,
        summary,
        created_at::text,
        updated_at::text
    `

    const sqlParams = [
      interviewee_name,
      interview_date,
      content,
      summary || content.substring(0, 100),
      id,
    ]

    const data = await query<Interview>(sqlQuery, sqlParams)

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('[PostgreSQL] Error updating interview:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update interview'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const sqlQuery = 'DELETE FROM interviews WHERE id = $1 RETURNING id'
    const data = await query(sqlQuery, [id])

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PostgreSQL] Error deleting interview:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete interview'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
