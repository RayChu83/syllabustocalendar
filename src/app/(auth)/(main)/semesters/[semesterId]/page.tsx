import { serverClient } from "@/lib/supabase/server";
import Link from "next/link";
import { GoArrowLeft } from "react-icons/go";

export default async function SemesterDetailed({
  params,
}: {
  params: Promise<{ semesterId: string }>;
}) {
  const { semesterId } = await params;

  const supabase = await serverClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    throw Error("Failed to retrieve user profile");
  }

  const { data: semesterTitle, error: semesterTitleError } = await supabase
    .from("semesters")
    .select("title")
    .eq("id", semesterId)
    .single();

  if (semesterTitleError) throw Error(semesterTitleError.message);

  const { data: classesData, error: classesDataError } = await supabase
    .from("classes")
    .select("*")
    .eq("semester_id", semesterId)
    .order("created_at", { ascending: true });

  if (classesDataError) throw Error(classesDataError.message);

  const classIds = classesData.map((course) => course.id);

  const { data: deadlinesData, error: deadlinesDataError } = classIds.length
    ? await supabase
        .from("deadlines")
        .select("id,title,due_date,due_time,class_id,created_at")
        .in("class_id", classIds)
        .order("due_date", { ascending: true })
    : { data: [], error: null };

  if (deadlinesDataError) throw Error(deadlinesDataError.message);

  const { data: scheduleData, error: scheduleDataError } = classIds.length
    ? await supabase
        .from("schedule")
        .select(
          "id,location,start_time,end_time,meeting_days,class_id,created_at",
        )
        .in("class_id", classIds)
        .order("start_time", { ascending: true })
    : { data: [], error: null };

  if (scheduleDataError) throw Error(scheduleDataError.message);

  return (
    <main className="mx-auto mt-17 flex max-w-400 flex-col gap-8 p-6">
      <header className="flex flex-col gap-3">
        <Link
          href="/semesters"
          className="flex w-fit items-center gap-2 font-semibold tracking-tight text-neutral-400 transition-all hover:text-neutral-500"
        >
          <GoArrowLeft /> <span>Return to Semesters</span>
        </Link>

        <div className="flex flex-col gap-4 rounded-3xl bg-neutral-50 p-6 sm:p-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-neutral-400">
                Semester Dashboard
              </p>
              <h1 className="text-4xl font-black tracking-tight text-neutral-600 sm:text-5xl">
                {semesterTitle.title}
              </h1>
            </div>

            <Link
              href={`/semesters/${semesterId}/classes/create`}
              className="w-fit rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-neutral-700"
            >
              Add class
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <p className="rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-700">
              {classesData.length} class{classesData.length !== 1 ? "es" : ""}{" "}
              enrolled
            </p>
            <p className="rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
              Built from your class syllabus data
            </p>
          </div>
        </div>
      </header>
    </main>
  );
}
