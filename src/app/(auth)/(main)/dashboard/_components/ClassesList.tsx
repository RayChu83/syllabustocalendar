import { serverClient } from "@/lib/supabase/server";
import React from "react";
import ClassesCollapsible from "./ClassesCollapsible";
import { ClassPreview } from "@/constants";
import Link from "next/link";
import Image from "next/image";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";

const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

export default async function ClassesList() {
  const supabase = await serverClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) throw Error("Unauthorized");

  const { data: classesData, error: classesDataError } = await supabase
    .from("classes")
    .select(
      `
    id,
    title,
    semester_id,
    semesters!inner(profile),
    deadlines(
      due_date,
      due_time
    )
  `,
    )
    .eq("semesters.profile", user.id)
    .gt("deadlines.due_date", today);

  if (classesDataError) throw Error(classesDataError.message);
  return (
    <>
      <Link
        href="/classes"
        className="sm:text-xl text-lg w-fit text-neutral-500 hover:text-neutral-700 transition-all rounded-full flex items-center gap-1 mb-4 group cursor-pointer tracking-tight"
      >
        <h6>Classes </h6>
        <MdOutlineKeyboardArrowRight />
      </Link>
      <div className="flex items-stretch flex-row flex-nowrap overflow-auto gap-4 snap-x self-center">
        {classesData.length ? (
          classesData.map((cls, index) => {
            return (
              <Link
                href={`/semesters/${cls.semester_id}/classes/${cls.id}`}
                className="flex flex-col items-start min-w-64 max-w-64 sm:min-w-74 sm:max-w-74 transition-all duration-300 snap-start relative group"
                key={index}
              >
                <Image
                  src="/graphics/semesters.png"
                  alt={cls.title}
                  width={600}
                  height={400}
                  className="aspect-[2/1.5] w-full object-cover rounded-2xl group-hover:brightness-[0.975] transition-all duration-300"
                />
                <header className="p-2 w-full">
                  <h3 className="text-neutral-700 line-clamp-2 mb-1">
                    {cls.title}
                  </h3>
                  <p className="text-sm mb-2 text-neutral-500">
                    {cls.deadlines.length} assignment
                    {cls.deadlines.length !== 1 ? "s" : ""} upcoming
                  </p>
                </header>
              </Link>
            );
          })
        ) : (
          <Link
            href="/classes/add"
            className="text-sm outline-2 outline-dashed outline-neutral-200 -outline-offset-2 min-w-74 py-16 flex items-center justify-center rounded-2xl text-neutral-400 hover:outline-neutral-300 transition-all"
          >
            Add your first class
          </Link>
        )}
      </div>
    </>
  );
}
