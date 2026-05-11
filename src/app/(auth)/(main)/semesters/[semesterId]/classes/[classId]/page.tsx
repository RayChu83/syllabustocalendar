import { serverClient } from "@/lib/supabase/server";
import Link from "next/link";
import React from "react";
import { GoArrowLeft } from "react-icons/go";

export default async function Class({
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

  const { data: classData, error: classError } = await supabase
    .from("classes")
    .select("*")
    .eq("id", classId)
    .eq("semester_id", semesterId)
    .single();

  if (!classData || classError) {
    throw Error("Failed to retrieve class details");
  }

  return (
    <main className="mt-17 flex flex-col gap-2 max-w-400 mx-auto p-6">
      <header className="mb-8 flex flex-col gap-1.5 w-fit">
        <Link
          href={`/semesters/${semesterId}`}
          className="text-neutral-400 hover:text-neutral-500 flex items-center gap-2 transition-all font-semibold tracking-tight w-fit"
        >
          <GoArrowLeft /> <span>Return to Semester</span>
        </Link>
        <h1 className="sm:text-5xl text-4xl tracking-tight font-black text-neutral-500 mb-4">
          {classData.title}
        </h1>
        {/* <div className="flex flex-wrap items-center gap-4">
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
        </div> */}
      </header>
      {/* <div className="grid 2xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
        <SemestersCard semesters={semesters} />
      </div> */}
    </main>
  );
}
