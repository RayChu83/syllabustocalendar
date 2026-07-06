import { getValidatedGoogleCalendarConnection } from "@/lib/google-oauth-tokens";
import { serverClient } from "@/lib/supabase/server";
import CalendarConnectErrorToast from "./_components/CalendarConnectErrorToast";
import GoogleCalendarConnectButton from "./_components/GoogleCalendarConnectButton";
import {
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  Mail,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import { Suspense } from "react";

export default async function Calendar() {
  const supabase = await serverClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    throw Error("Failed to retrieve user profile");
  }

  const googleToken = await getValidatedGoogleCalendarConnection(
    supabase,
    user.id,
  );

  return (
    <main className="mt-17 flex flex-col gap-10 max-w-320 mx-auto p-6">
      <Suspense fallback={null}>
        <CalendarConnectErrorToast />
      </Suspense>
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
                {googleToken.avatar_url ? (
                  <Image
                    src={googleToken.avatar_url}
                    alt={`${googleToken.name ?? "Google account"} profile avatar`}
                    width={56}
                    height={56}
                    className="size-14 shrink-0 rounded-full border bg-muted object-cover"
                  />
                ) : (
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-full border bg-muted">
                    <UserRound className="size-6 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-base font-semibold">
                      {googleToken.name ?? "Google Account"}
                    </h2>
                    {googleToken.ok ? (
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="size-4 shrink-0 text-amber-600" />
                    )}
                  </div>
                  <div className="mt-1 flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="size-4 shrink-0" />
                    <span className="truncate">{googleToken.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 rounded-md border bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground">
                {googleToken.ok ? (
                  <>
                    <CalendarCheck className="size-4 text-emerald-600" />
                    Connected
                  </>
                ) : (
                  <>
                    <AlertTriangle className="size-4 text-amber-600" />
                    Reconnect needed
                  </>
                )}
              </div>
            </div>

            {!googleToken.ok ? (
              <div className="border-t border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
                Google rejected this calendar connection. Reconnect your account
                to restore calendar access.
              </div>
            ) : null}

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

        {googleToken && !googleToken.ok ? (
          <GoogleCalendarConnectButton />
        ) : null}
      </section>
    </main>
  );
}
