import { serverClient } from "@/lib/supabase/server";
import GoogleCalendarConnectButton from "./_components/GoogleCalendarConnectButton";
import { CalendarCheck, CheckCircle2, Mail, UserRound } from "lucide-react";
import Image from "next/image";

export default async function Calendar() {
  const supabase = await serverClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    throw Error("Failed to retrieve user profile");
  }

  const { data: googleToken } = await supabase
    .from("google_oauth_tokens")
    .select("avatar_url, email, name, ok, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <main className="mt-17 flex flex-col gap-10 max-w-400 mx-auto p-6">
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            Connect Google Calendar when you are ready to sync class schedules
            and deadlines.
          </p>
        </div>

        {googleToken ? (
          <div className="max-w-2xl overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <Image
                  src={googleToken.avatar_url}
                  alt={`${googleToken.name}'s Google profile avatar`}
                  width={56}
                  height={56}
                  className="size-14 shrink-0 rounded-full border bg-muted object-cover"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-base font-semibold">
                      {googleToken.name}
                    </h2>
                    {googleToken.ok ? (
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                    ) : null}
                  </div>
                  <div className="mt-1 flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="size-4 shrink-0" />
                    <span className="truncate">{googleToken.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 rounded-md border bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground">
                <CalendarCheck className="size-4 text-emerald-600" />
                Connected
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap bg-muted/30 border-t">
              <div className="flex items-center gap-2 px-5 py-3 text-sm">
                <UserRound className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">Account</span>
              </div>
              <div className="px-5 py-3 text-sm sm:col-span-2">
                <span className="font-medium">{googleToken.created_at}</span>
              </div>
            </div>
          </div>
        ) : (
          <GoogleCalendarConnectButton />
        )}
      </section>
    </main>
  );
}
