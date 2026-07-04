import { retrieveGoogleAccessToken } from "@/lib/google-oauth-tokens";
import { makeGoogleCalendarAgent } from "@/lib/agents/googleCalendarAgent";
import { serverClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { body } = await request.json();
  const supabase = await serverClient();

  console.log(body);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const accessToken = await retrieveGoogleAccessToken(supabase, user.id);
    const agent = makeGoogleCalendarAgent(accessToken);

    const result = await agent.invoke({
      messages: [
        {
          role: "user",
          content: body,
        },
      ],
    });

    return NextResponse.json(
      {
        ok: true,
        result: result,
      },
      { status: 200 },
    );
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to process Google Calendar request";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
