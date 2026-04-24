import { supabaseServer } from "@/lib/supabase-server";
import type { NextRequest } from "next/server";

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("active_timers")
      .select("*");
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
    const { person, started_at } = body;
    const { data, error } = await supabaseServer
      .from("active_timers")
      .insert({ person, started_at })
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
