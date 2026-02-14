# インタビュー記録管理アプリ (CSV エクスポート対応版)

v0で作成したインタビュー記録管理システムです。ローカル開発はDocker + PostgreSQL、本番環境はVercel + Neonで動作します。

## 📋 機能

- インタビュー記録の登録・編集・削除
- インタビュー記録の検索（対象者名、内容、要約）
- 日付順でのソート表示
- **CSVエクスポート機能** （日本語対応、UTF-8 BOM付き）
- レスポンシブデザイン（モバイル対応）

## 🛠 技術スタック

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **UI**: Tailwind CSS, shadcn/ui components
- **Database (Local)**: PostgreSQL (Docker) ポート5433
- **Database (Production)**: Neon (Serverless Postgres)
- **Deployment**: Vercel

## 🚀 ローカル開発環境のセットアップ

### 前提条件

- Node.js 18以上
- Docker Desktop
- pnpm (推奨) または npm

### 1. 依存関係のインストール

\`\`\`bash
cd C:/Users/spark/.gemini/antigravity/scratch/ryu-san-app3
pnpm install
\`\`\`

### 2. 環境変数の確認

\`.env.local\`が既に作成されています:
\`\`\`
DATABASE_URL=postgresql://ryusan:ryusan_dev_pass@localhost:5433/ryu_san_db
\`\`\`

### 3. Dockerでデータベースを起動

\`\`\`bash
docker-compose up -d
\`\`\`

データベースの準備が完了したか確認:
\`\`\`bash
docker exec ryu-san-postgres-app3 pg_isready -U ryusan
\`\`\`

### 4. 開発サーバーの起動

\`\`\`bash
pnpm dev
\`\`\`

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

### 5. 開発が終わったらDockerを停止

\`\`\`bash
docker-compose down
\`\`\`

## 🌐 本番環境へのデプロイ (Vercel + Neon)

### 1. Neonでデータベースを作成

1. [Neon](https://neon.tech/)にアクセスしてアカウント作成
2. 新しいプロジェクトを作成
3. 接続文字列（\`DATABASE_URL\`）をコピー
4. Neonのダッシュボードで以下のSQLを実行してテーブルを作成:

\`\`\`sql
-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interviewee_name VARCHAR(255) NOT NULL,
  interview_date DATE NOT NULL,
  content TEXT NOT NULL,
  summary VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_interviews_name ON interviews (interviewee_name);
CREATE INDEX IF NOT EXISTS idx_interviews_date ON interviews (interview_date DESC);

-- Create auto-update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_interviews_updated_at
    BEFORE UPDATE ON interviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
\`\`\`

### 2. GitHubにプッシュ

\`\`\`bash
git init
git add .
git commit -m "Initial commit: Interview management app with CSV export"
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
\`\`\`

### 3. Vercelにデプロイ

1. [Vercel](https://vercel.com/)にGitHubアカウントでログイン
2. 「New Project」をクリック
3. GitHubリポジトリを選択してインポート
4. 環境変数を設定:
   - \`DATABASE_URL\`: NeonからコピーしたPostgreSQL接続文字列
5. 「Deploy」をクリック

## 📁 プロジェクト構造

\`\`\`
ryu-san-app3/
├── app/
│   ├── api/
│   │   └── interviews/        # Interview API routes
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── csv-export-button.tsx # CSV export component
│   ├── interview-card.tsx
│   ├── interview-detail-modal.tsx
│   └── interview-form.tsx
├── lib/
│   ├── db.ts                  # PostgreSQL connection pool
│   ├── csv-export.ts          # CSV export utilities
│   ├── types.ts
│   └── utils.ts
├── scripts/
│   ├── create-interviews-table.sql  # Original Supabase schema
│   └── init-db.sql            # Docker initialization script
├── docker-compose.yml         # Local PostgreSQL setup (port 5433)
├── .env.local                 # Local environment variables (gitignored)
└── .env.example               # Environment template
\`\`\`

## 🔧 主な変更点 (Supabase → PostgreSQL)

- \`@supabase/supabase-js\` → \`pg\` (node-postgres)
- \`lib/supabase.ts\` → \`lib/db.ts\` (Connection pooling)
- SupabaseクライアントのメソッドをSQL クエリに書き換え
- Row Level Security (RLS) を削除（本番環境では適宜追加）
- ポート番号を5433に変更（app2との競合回避）

## 💾 CSVエクスポート機能

- UTF-8 BOM付きでExcelでも正しく開けます
- 日本語フィールド名対応
- 改行やカンマを含むデータも正しくエスケープ
- ファイル名: \`取材記録.csv\`

## 📝 TODO

- [ ] 認証機能の追加
- [ ] ページネーション
- [ ] 画像アップロード機能
- [ ] PDFエクスポート機能

## 📄 ライセンス

MIT
