import { supabaseServer } from "@/lib/supabase-server";
import type { NextRequest } from "next/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabaseServer
      .from("active_timers")
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
