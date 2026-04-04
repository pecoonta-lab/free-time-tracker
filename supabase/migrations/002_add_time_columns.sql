-- time_records に開始・終了時刻カラムを追加
alter table time_records add column if not exists start_time time;
alter table time_records add column if not exists end_time time;
