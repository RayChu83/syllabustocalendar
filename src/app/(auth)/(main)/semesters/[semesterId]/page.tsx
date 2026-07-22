import BackButton from "@/components/ui/BackButton";
import { SemesterWithClasses } from "@/constants";
import { serverClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import { BiSolidCalendar } from "react-icons/bi";
import { FaChalkboardTeacher } from "react-icons/fa";

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

  const { data: semesterData, error: semesterDataError } = await supabase
    .from("semesters")
    .select("*, classes(id, title)")
    .eq("id", semesterId)
    .maybeSingle();

  if (semesterDataError) throw Error(semesterDataError.message);
  if (!semesterData) notFound();

  const semester: SemesterWithClasses = {
    ...semesterData,
    created_at: new Date(semesterData.created_at),
  };

  return (
    <main className="mx-auto mt-13 flex max-w-7xl flex-col gap-8 p-6">
      <header className="flex flex-col gap-3">
        <BackButton
          href="/semesters"
          as="link"
          text="Back to Semesters"
          cn="mb-4"
        />
        <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-semibold tracking-tight text-neutral-600 sm:text-5xl">
              {semester.title}
            </h1>
            <p className="text-neutral-500 tracking-wide">
              {semester.grade} • {semester.semester}
            </p>
          </div>
          <ul className="sm:w-fit w-full overflow-auto flex sm:flex-col flex-row text-nowrap whitespace-nowrap items-end sm:justify-center gap-2 mb-2">
            <li className="text-neutral-500 tracking-wide flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 text-sm">
              <FaChalkboardTeacher size={16} />
              <span>
                {semester.classes.length} class
                {semester.classes.length !== 1 ? "es" : ""} enrolled
              </span>
            </li>
            <li className="text-neutral-500 tracking-wide flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 text-sm">
              <BiSolidCalendar size={16} />
              Created at {formatDate(semester.created_at)}
            </li>
          </ul>
        </div>
      </header>
    </main>
  );
}
