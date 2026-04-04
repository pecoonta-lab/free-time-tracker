export type Person = "夫" | "妻";
export type Source = "timer" | "manual";

export interface TimeRecord {
  id: string;
  person: Person;
  duration_minutes: number;
  date: string;
  start_time: string | null;
  end_time: string | null;
  source: Source;
  created_at: string;
  updated_at: string;
}

export interface ActiveTimer {
  id: string;
  person: Person;
  started_at: string;
}
