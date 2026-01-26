import { Particles } from "@/components/ui/particles";
import { GoArrowLeft, GoArrowRight } from "react-icons/go";
import Link from "next/link";
import { AuroraBackground } from "@/components/ui/aurora-background";
import SemestersCard from "./_components/SemestersCard";
import { serverClient } from "@/lib/supabase/server";
import { defaultSemesters, Semester } from "@/constants";

export default async function Semesters() {
  const supabase = await serverClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    return;
  }

  const { data: semestersData, error } = await supabase
    .from("semesters")
    .select("*");
  const semesters: Semester[] = semestersData
    ? semestersData.map((s) => ({
        ...s,
        from: new Date(s.from),
        to: new Date(s.to),
        created_at: new Date(s.created_at),
      }))
    : [];
  return (
    <>
      <main className="mt-17 flex flex-col gap-2 max-w-480 mx-auto p-6">
        <header className="mb-8 flex flex-col gap-1.5 w-fit">
          <Link
            href="/dashboard"
            className="text-neutral-400 hover:text-neutral-300 flex items-center gap-2 transition-all font-semibold tracking-tight"
          >
            <GoArrowLeft /> <span>Return to Dashboard</span>
          </Link>
          <h1 className="sm:text-5xl text-4xl tracking-tight font-black text-neutral-200 mb-2">
            Your Semesters:
          </h1>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              className="text-sm text-emerald-300 outline outline-emerald-700 w-fit cursor-pointer px-4 py-1.5 rounded-full bg-emerald-900 drop-shadow-2xl drop-shadow-emerald-900 flex items-center justify-center gap-2 hover:brightness-110 transition-all duration-300"
              href="/semesters/add"
            >
              <span>📚</span>
              <span className="flex items-center gap-1.5">
                Add Semester <GoArrowRight />
              </span>
            </Link>
            <button className="text-sm text-purple-300 outline outline-purple-700 w-fit cursor-pointer px-4 py-1.5 rounded-full bg-purple-900 drop-shadow-2xl drop-shadow-purple-900 flex items-center justify-center gap-2 hover:brightness-110 transition-all duration-300">
              <span>✨</span>
              <span>Powered by Advyna AI</span>
            </button>
          </div>
        </header>
        <div className="grid 2xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
          <SemestersCard semesters={semesters} />
        </div>
      </main>
      <AuroraBackground />
      <Particles className="fixed w-full h-full top-0 left-0 -z-50" />
    </>
  );
}
