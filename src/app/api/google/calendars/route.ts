import { retrieveGoogleAccessToken } from "@/lib/google-oauth-tokens";
import { serverClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type GoogleCalendarListResponse = {
  items?: Array<{
    id?: string;
    summary?: string;
    primary?: boolean;
    timeZone?: string;
    accessRole?: string;
  }>;
  error?: {
    message?: string;
  };
};

export async function GET() {
  const supabase = await serverClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    return NextResponse.json(
      { error: "Failed to retrieve user profile" },
      { status: 401 },
    );
  }

  try {
    const accessToken = await retrieveGoogleAccessToken(supabase, user.id);
    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/users/me/calendarList",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );
    const data = (await response.json().catch(() => null)) as
      | GoogleCalendarListResponse
      | null;

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data?.error?.message || "Failed to retrieve Google calendars",
        },
        { status: response.status },
      );
    }

    const calendars =
      data?.items
        ?.filter((calendar) => calendar.id && calendar.summary)
        .map((calendar) => ({
          id: calendar.id,
          summary: calendar.summary,
          primary: Boolean(calendar.primary),
          timeZone: calendar.timeZone || null,
          accessRole: calendar.accessRole || null,
        })) || [];

    return NextResponse.json({ calendars });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to retrieve Google calendars",
      },
      { status: 500 },
    );
  }
}
