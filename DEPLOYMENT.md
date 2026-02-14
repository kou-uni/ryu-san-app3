# Vercel + Neon デプロイメントガイド

## 📋 現在の状態

- ✅ GitHubリポジトリ: https://github.com/kou-uni/ryu-san-app3
- ✅ Vercelプロジェクト: https://vercel.com/unis-projects-9a80993d/ryu-san-app3
- ⏳ Neonデータベース: 初期化待ち

## 🗄️ Neonデータベースの初期化

### 方法1: Neon SQL Editorを使用（推奨）

1. **Neonダッシュボードにアクセス**
   - https://console.neon.tech/ にログイン
   - 対象のプロジェクトを選択

2. **SQL Editorを開く**
   - 左メニューから「SQL Editor」を選択
   - または直接 `https://console.neon.tech/app/projects/YOUR_PROJECT_ID/editor` にアクセス

3. **SQLスクリプトを実行**
   - 以下のSQLをコピー＆ペースト
   - 「Run」をクリック

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

-- Sample data
INSERT INTO interviews (interviewee_name, interview_date, content, summary) VALUES
  ('山田太郎', '2025-01-15', '新しい観光地開発について、地域住民の視点から貴重な意見をいただきました。特に環境保護と経済発展のバランスについて深い洞察がありました。', '観光地開発と環境保護のバランスについて'),
  ('佐藤花子', '2025-01-20', '伝統工芸の継承に関するインタビュー。若い世代への技術伝承の難しさと、新しいアプローチの必要性について語っていただきました。', '伝統工芸の継承と若者への技術伝承'),
  ('鈴木一郎', '2025-02-01', '地域活性化プロジェクトのリーダーとして、これまでの取り組みと今後の展望について詳しくお話しいただきました。', '地域活性化プロジェクトの現状と展望')
ON CONFLICT (id) DO NOTHING;

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_interviews_updated_at ON interviews;
CREATE TRIGGER update_interviews_updated_at
    BEFORE UPDATE ON interviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
\`\`\`

4. **確認**
   - 以下を実行して3件のデータが入っているか確認
   \`\`\`sql
   SELECT * FROM interviews ORDER BY interview_date DESC;
   \`\`\`

### 方法2: psqlコマンドラインを使用

\`\`\`bash
# NeonのDATABASE_URLを環境変数に設定
export DATABASE_URL="your-neon-connection-string"

# psqlで接続してスクリプト実行
psql $DATABASE_URL -f scripts/neon-init.sql
\`\`\`

## 🔗 Vercel自動デプロイ設定

### 現在の設定確認

1. **Vercelダッシュボード**
   - https://vercel.com/unis-projects-9a80993d/ryu-san-app3/settings/git にアクセス

2. **Git連携を確認**
   - 「Connected Git Repository」が `kou-uni/ryu-san-app3` になっているか確認
   - 「Production Branch」が `main` になっているか確認

### 自動デプロイの仕組み

✅ **既に設定済みのはずです！**

GitHubにプッシュすると自動的に：
1. Vercelがコミットを検知
2. ビルドを自動実行
3. デプロイを自動実行

### 環境変数の確認

1. **Vercel環境変数ページ**
   - https://vercel.com/unis-projects-9a80993d/ryu-san-app3/settings/environment-variables

2. **必要な環境変数**
   - `DATABASE_URL` = Neonの接続文字列
   - 例: `postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

3. **環境の選択**
   - ✅ Production
   - ✅ Preview
   - ✅ Development

## 🧪 デプロイのテスト

### 1. コードを修正してプッシュ

\`\`\`bash
cd C:/Users/spark/.gemini/antigravity/scratch/ryu-san-app3

# READMEを少し修正
echo "## デプロイテスト" >> README.md

# コミット＆プッシュ
git add .
git commit -m "test: Verify Vercel auto-deployment"
git push origin main
\`\`\`

### 2. Vercelで確認

- https://vercel.com/unis-projects-9a80993d/ryu-san-app3 を開く
- 「Deployments」タブで新しいデプロイが開始されたか確認
- 数分待つとデプロイ完了

### 3. 本番URLにアクセス

デプロイが完了したら、Vercelが発行したURLにアクセス：
\`\`\`
https://ryu-san-app3.vercel.app
\`\`\`
（実際のURLはVercelダッシュボードで確認）

## 📊 デプロイフロー

\`\`\`
GitHub (main)
    ↓ push
Vercel検知
    ↓
自動ビルド
    ↓
自動デプロイ
    ↓
本番環境更新
\`\`\`

## ⚠️ トラブルシューティング

### ビルドエラーが出る場合

1. **環境変数の確認**
   - DATABASE_URLが正しく設定されているか
   - Neonの接続文字列が有効か

2. **ビルドログの確認**
   - Vercelの「Deployments」→失敗したデプロイ→「View Function Logs」

3. **データベース接続テスト**
   - NeonのSQL Editorで `SELECT 1;` を実行して接続確認

### 自動デプロイが動かない場合

1. **Git連携の確認**
   - Vercel Settings → Git で接続状態を確認
   - 必要に応じて再接続

2. **デプロイ設定の確認**
   - 「Production Branch」が `main` になっているか
   - 「Ignored Build Step」が設定されていないか

## 📝 次のステップ

1. ✅ Neonデータベースを初期化（上記SQL実行）
2. ✅ Vercel環境変数でDATABASE_URLを確認
3. ✅ GitHubにプッシュしてデプロイテスト
4. ✅ 本番URLでアプリ動作確認
5. ✅ CSVエクスポート機能のテスト

## 🎉 完了

すべて完了したら：
- 本番URL: https://ryu-san-app3.vercel.app （要確認）
- GitHub: https://github.com/kou-uni/ryu-san-app3
- Vercel: https://vercel.com/unis-projects-9a80993d/ryu-san-app3
