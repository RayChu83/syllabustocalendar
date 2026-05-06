import { serverClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await serverClient();

  const { body, semesterId } = await req.json();

  const { data, error } = await supabase.rpc("create_full_class", {
    payload: body, // ✅ pass the object directly, no JSON.stringify
    semester_id: semesterId,
  });

  if (error) {
    console.error("RPC error:", error);
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ classId: data });
}
