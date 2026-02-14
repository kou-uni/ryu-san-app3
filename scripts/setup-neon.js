#!/usr/bin/env node
/**
 * Neon Database Setup Script
 *
 * このスクリプトはNeonデータベースにテーブルを作成します
 *
 * 使い方:
 * 1. Vercelから DATABASE_URL をコピー
 * 2. 環境変数として設定: export DATABASE_URL="your-connection-string"
 * 3. 実行: node scripts/setup-neon.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set');
    console.error('');
    console.error('Please set it using:');
    console.error('  export DATABASE_URL="your-neon-connection-string"');
    console.error('');
    console.error('You can find the connection string in:');
    console.error('  Vercel → Project Settings → Environment Variables → DATABASE_URL');
    console.error('  or');
    console.error('  Neon Console → Connection Details');
    process.exit(1);
  }

  console.log('🔌 Connecting to Neon database...');
  console.log(`   Host: ${connectionString.split('@')[1]?.split('/')[0] || 'hidden'}`);

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected successfully!\n');

    // Create interviews table
    console.log('📋 Creating interviews table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS interviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        interviewee_name VARCHAR(255) NOT NULL,
        interview_date DATE NOT NULL,
        content TEXT NOT NULL,
        summary VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table created');

    // Create indexes
    console.log('📊 Creating indexes...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_interviews_name ON interviews (interviewee_name)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_interviews_date ON interviews (interview_date DESC)
    `);
    console.log('✅ Indexes created');

    // Create trigger function
    console.log('⚡ Creating auto-update trigger...');
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_interviews_updated_at ON interviews
    `);

    await pool.query(`
      CREATE TRIGGER update_interviews_updated_at
          BEFORE UPDATE ON interviews
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column()
    `);
    console.log('✅ Trigger created');

    // Insert sample data
    console.log('📝 Inserting sample data...');
    const sampleData = [
      ['山田太郎', '2025-01-15', '新しい観光地開発について、地域住民の視点から貴重な意見をいただきました。特に環境保護と経済発展のバランスについて深い洞察がありました。', '観光地開発と環境保護のバランスについて'],
      ['佐藤花子', '2025-01-20', '伝統工芸の継承に関するインタビュー。若い世代への技術伝承の難しさと、新しいアプローチの必要性について語っていただきました。', '伝統工芸の継承と若者への技術伝承'],
      ['鈴木一郎', '2025-02-01', '地域活性化プロジェクトのリーダーとして、これまでの取り組みと今後の展望について詳しくお話しいただきました。', '地域活性化プロジェクトの現状と展望']
    ];

    for (const [name, date, content, summary] of sampleData) {
      await pool.query(`
        INSERT INTO interviews (interviewee_name, interview_date, content, summary)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO NOTHING
      `, [name, date, content, summary]);
    }
    console.log('✅ Sample data inserted');

    // Verify
    console.log('\n🔍 Verifying setup...');
    const result = await pool.query('SELECT COUNT(*) as count FROM interviews');
    console.log(`✅ Total interviews: ${result.rows[0].count}`);

    const samples = await pool.query('SELECT interviewee_name, interview_date FROM interviews ORDER BY interview_date DESC LIMIT 3');
    console.log('\n📌 Sample records:');
    samples.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.interviewee_name} (${row.interview_date})`);
    });

    console.log('\n🎉 Database setup completed successfully!');
    console.log('🌐 Your app should now work on Vercel!');

  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
