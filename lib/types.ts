export type Person = "夫" | "妻";
export type Source = "timer" | "manual";

export interface TimeRecord {
  id: string;
  person: Person;
  duration_minutes: number;
  date: string;
  source: Source;
  created_at: string;
  updated_at: string;
}

export interface ActiveTimer {
  id: string;
  person: Person;
  started_at: string;
}
