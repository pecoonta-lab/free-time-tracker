import { supabaseServer } from "@/lib/supabase-server";
import type { NextRequest } from "next/server";

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("time_records")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json(data);
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { person, duration_minutes, date, start_time, end_time, source } = body;
    const { data, error } = await supabaseServer
      .from("time_records")
      .insert({ person, duration_minutes, date, start_time, end_time, source })
      .select()
      .single();
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json(data, { status: 201 });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
