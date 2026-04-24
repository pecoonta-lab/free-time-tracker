import { supabaseServer } from "@/lib/supabase-server";
import type { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { duration_minutes, date, start_time, end_time } = body;
    const { data, error } = await supabaseServer
      .from("time_records")
      .update({ duration_minutes, date, start_time, end_time })
      .eq("id", id)
      .select()
      .single();
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json(data);
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabaseServer
      .from("time_records")
      .delete()
      .eq("id", id);
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
