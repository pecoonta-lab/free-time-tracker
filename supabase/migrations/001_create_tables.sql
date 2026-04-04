-- 自由時間記録テーブル
create table if not exists time_records (
  id uuid primary key default gen_random_uuid(),
  person text not null check (person in ('夫', '妻')),
  duration_minutes integer not null check (duration_minutes > 0),
  date date not null default current_date,
  source text not null check (source in ('timer', 'manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- アクティブタイマーテーブル
create table if not exists active_timers (
  id uuid primary key default gen_random_uuid(),
  person text not null unique check (person in ('夫', '妻')),
  started_at timestamptz not null default now()
);

-- updated_at を自動更新するトリガー
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger time_records_updated_at
  before update on time_records
  for each row
  execute function update_updated_at();

-- Realtime を有効化
alter publication supabase_realtime add table time_records;
alter publication supabase_realtime add table active_timers;
