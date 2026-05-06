import { GoArrowLeft, GoArrowRight } from "react-icons/go";
import Link from "next/link";
import SemestersCard from "./_components/SemestersCard";
import { serverClient } from "@/lib/supabase/server";
import { SemesterWithClasses } from "@/constants";

export default async function Semesters() {
  const supabase = await serverClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    throw Error("Failed to retrieve user profile");
  }

  const { data: semestersData, error: semestersDataError } = await supabase
    .from("semesters")
    .select("*, classes(id, title)");
  const semesters: SemesterWithClasses[] = semestersData
    ? semestersData.map((s) => ({
        ...s,
        created_at: new Date(s.created_at),
      }))
    : [];

  if (semestersDataError) throw Error(semestersDataError.message);

  console.log(JSON.stringify(semesters));

  return (
    <>
      <main className="mt-17 flex flex-col gap-2 max-w-400 mx-auto p-6">
        <header className="mb-8 flex flex-col gap-1.5 w-fit">
          <Link
            href="/dashboard"
            className="text-neutral-400 hover:text-neutral-500 flex items-center gap-2 transition-all font-semibold tracking-tight w-fit"
          >
            <GoArrowLeft /> <span>Return to Dashboard</span>
          </Link>
          <h1 className="sm:text-5xl text-4xl tracking-tight font-black text-neutral-500 mb-4">
            Your Semesters:
          </h1>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              className="text-sm text-emerald-700 outline outline-emerald-200 w-fit cursor-pointer px-4 py-1.5 rounded-full bg-emerald-100 drop-shadow-2xl drop-shadow-emerald-100 flex items-center justify-center gap-2 hover:brightness-95 transition-all duration-300"
              href="/semesters/add"
            >
              <span>📚</span>
              <span className="flex items-center gap-1.5">
                Add Semester <GoArrowRight />
              </span>
            </Link>
            <button className="text-sm text-purple-700 outline outline-purple-200 w-fit cursor-pointer px-4 py-1.5 rounded-full bg-purple-100 drop-shadow-2xl drop-shadow-purple-100 flex items-center justify-center gap-2 hover:brightness-95 transition-all duration-300">
              <span>✨</span>
              <span>Powered by Advyna AI</span>
            </button>
          </div>
        </header>
        <div className="grid 2xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
          <SemestersCard semesters={semesters} />
        </div>
      </main>
    </>
  );
}
