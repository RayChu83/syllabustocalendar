import { Button } from "@/components/ui/button";
import GoogleCalendarConnectButton from "@/app/(auth)/(main)/calendar/_components/GoogleCalendarConnectButton";
import { getValidatedGoogleCalendarConnection } from "@/lib/google-oauth-tokens";
import { serverClient } from "@/lib/supabase/server";
import { ArrowLeft, CalendarOff } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import CalendarSyncForm from "./_components/CalendarSyncForm";

function SyncFallback() {
  return (
    <main className="mx-auto mt-17 flex min-h-[calc(100vh-4.25rem)] max-w-400 items-center justify-center p-6">
      <section
        className="flex flex-col items-center gap-4 rounded-[2rem] border border-neutral-200 bg-white p-8 text-center shadow-sm"
        aria-live="polite"
        aria-busy="true"
      >
        <div
          role="status"
          className="size-10 animate-spin rounded-full border-4 border-neutral-100 border-t-blue-500"
        >
          <span className="sr-only">Loading sync checks...</span>
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-black tracking-tight text-neutral-700">
            Checking sync readiness
          </h1>
          <p className="text-sm text-neutral-500">
            Verifying your class and Google Calendar connection.
          </p>
        </div>
      </section>
    </main>
  );
}

async function SyncReadiness({
  params,
}: {
  params: Promise<{ semesterId: string; classId: string }>;
}) {
  const { semesterId, classId } = await params;
  const supabase = await serverClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    throw Error("Failed to retrieve user profile");
  }

  const { data: semesterData, error: semesterError } = await supabase
    .from("semesters")
    .select("id")
    .eq("id", semesterId)
    .eq("profile", user.id)
    .single();

  if (!semesterData || semesterError) {
    throw Error("Failed to retrieve semester details");
  }

  const { data: classData, error: classError } = await supabase
    .from("classes")
    .select("id,title,overview,start_date,end_date")
    .eq("id", classId)
    .eq("semester_id", semesterId)
    .single();

  if (!classData || classError) {
    throw Error("No class was found in the selected semester.");
  }

  const googleCalendarConnection = await getValidatedGoogleCalendarConnection(
    supabase,
    user.id,
  );

  if (!googleCalendarConnection?.ok) {
    return (
      <main className="mx-auto mt-17 flex min-h-[calc(100vh-4.25rem)] max-w-400 items-center justify-center p-6">
        <section className="flex max-w-xl flex-col gap-5 rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <CalendarOff />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-black tracking-tight text-neutral-700">
              Google Calendar is not connected
            </h1>
            <p className="text-sm leading-6 text-neutral-500">
              Connect a Google Calendar account before syncing this class. Once
              connected, return here to continue.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="outline">
              <Link href={`/semesters/${semesterId}/classes/${classId}`}>
                <ArrowLeft data-icon="inline-start" />
                Return to Class
              </Link>
            </Button>
            <GoogleCalendarConnectButton
              label="Add Google Calendar Connection"
              nextPath={`/semesters/${semesterId}/classes/${classId}/sync`}
            />
          </div>
        </section>
      </main>
    );
  }

  const [
    { data: deadlinesData, error: deadlinesError },
    { data: scheduleData, error: scheduleError },
  ] = await Promise.all([
    supabase
      .from("deadlines")
      .select("id,title,due_date,due_time")
      .eq("class_id", classId)
      .order("due_date", { ascending: true }),
    supabase
      .from("schedule")
      .select("id,location,start_time,end_time,meeting_days")
      .eq("class_id", classId)
      .order("start_time", { ascending: true }),
  ]);

  if (deadlinesError) throw Error(deadlinesError.message);
  if (scheduleError) throw Error(scheduleError.message);

  return (
    <CalendarSyncForm
      classDetails={{
        id: classData.id,
        title: classData.title || "this class",
        overview: classData.overview,
        startDate: classData.start_date,
        endDate: classData.end_date,
      }}
      deadlines={deadlinesData || []}
      schedules={scheduleData || []}
    />
  );
}

export default function SyncPage({
  params,
}: {
  params: Promise<{ semesterId: string; classId: string }>;
}) {
  return (
    <Suspense fallback={<SyncFallback />}>
      <SyncReadiness params={params} />
    </Suspense>
  );
}
