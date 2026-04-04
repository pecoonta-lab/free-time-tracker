# 自由時間トラッカー

夫婦の自由時間を記録・管理するWebアプリです。累計の差分（どちらがどれだけ多く自由時間を持っているか）をリアルタイムに把握できます。

## セットアップ手順

### 1. Supabase プロジェクトの作成

1. [Supabase](https://supabase.com) でアカウントを作成し、新しいプロジェクトを作成します
2. プロジェクトの **Settings > API** から以下の値をメモします：
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **anon public key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### 2. テーブルの作成

Supabase ダッシュボードの **SQL Editor** で、以下のファイルの内容を実行します：

```
supabase/migrations/001_create_tables.sql
```

これにより以下が作成されます：
- `time_records` テーブル（自由時間の記録）
- `active_timers` テーブル（実行中のタイマー）
- `updated_at` 自動更新トリガー
- Realtime の有効化

### 3. RLS の無効化

認証なしで使用するため、Supabase ダッシュボードで両テーブルの **Row Level Security (RLS)** を無効化します：

1. **Authentication > Policies** を開く
2. `time_records` と `active_timers` それぞれで RLS を OFF にする

### 4. Realtime の確認

**Database > Replication** で、`time_records` と `active_timers` の両テーブルが Realtime に含まれていることを確認します（マイグレーションで自動設定済み）。

### 5. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、Supabase の値を設定します：

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 6. ローカルで起動

```bash
npm install
npm run dev
```

http://localhost:3000 を開いて確認します。

### 7. Vercel へのデプロイ

1. GitHub にリポジトリをプッシュ
2. [Vercel](https://vercel.com) でリポジトリをインポート
3. 環境変数 `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定
4. デプロイ

## 技術スタック

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (PostgreSQL + Realtime)
- Vercel (ホスティング)
