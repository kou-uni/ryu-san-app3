export interface Interview {
  id: string
  interviewee_name: string
  interview_date: string
  content: string
  summary: string
  created_at: string
  updated_at: string
}

export interface InterviewInput {
  interviewee_name: string
  interview_date: string
  content: string
  summary?: string
}

export type InterviewWithoutId = Omit<Interview, 'id' | 'created_at' | 'updated_at'>
