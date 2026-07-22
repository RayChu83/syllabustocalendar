import { serverClient } from "@/lib/supabase/server";
import { SemesterWithClasses } from "@/constants";
import Link from "next/link";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import SemesterCard from "../../semesters/_components/SemesterCard";

export default async function SemestersList() {
  const supabase = await serverClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) throw Error("Unauthorized");

  // RLS should already scope this to the current user; the explicit filter
  // is a defense-in-depth backstop in case a policy is ever missing/wrong.
  const { data: semestersData, error: semestersDataError } = await supabase
    .from("semesters")
    .select("*, classes(id, title)")
    .eq("profile", user.id);

  const semesters: SemesterWithClasses[] = semestersData
    ? semestersData.map((s) => ({
        ...s,
        created_at: new Date(s.created_at),
      }))
    : [];

  if (semestersDataError) throw Error(semestersDataError.message);

  return (
    <>
      <Link
        href="/semesters"
        className="sm:text-xl w-fit text-lg text-neutral-500 hover:text-neutral-700 transition-all rounded-full flex items-center gap-1 mb-4 group cursor-pointer tracking-tight"
      >
        <h6>Semesters </h6>
        <MdOutlineKeyboardArrowRight />
      </Link>
      <div className="flex items-stretch flex-row flex-nowrap overflow-auto gap-4 snap-x self-center mb-8">
        {semesters.length ? (
          semesters.map((semester, index) => (
            <SemesterCard key={index} semester={semester} />
          ))
        ) : (
          <Link
            href="/semesters/add"
            className="text-sm outline-2 outline-dashed outline-neutral-200 -outline-offset-2 min-w-74 py-16 flex items-center justify-center rounded-2xl text-neutral-400 hover:outline-neutral-300 transition-all"
          >
            Create your first semester
          </Link>
        )}
      </div>
    </>
  );
}
