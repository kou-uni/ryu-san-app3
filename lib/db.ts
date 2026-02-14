import { Pool } from 'pg'

// Global connection pool
let pool: Pool | null = null

export function getDbPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set')
    }

    pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err)
    })
  }

  return pool
}

export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const pool = getDbPool()
  const result = await pool.query(text, params)
  return result.rows
}
