import { serverClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import { FaGraduationCap } from "react-icons/fa6";
import { BiSolidCalendar } from "react-icons/bi";
import SemestersList from "./_components/SemestersList";
import { Suspense } from "react";
import ClassesList from "./_components/ClassesList";
import SemestersLoading from "./_components/SemestersLoading";
import ClassesLoading from "./_components/ClassesLoading";

export default async function Dashboard() {
  const supabase = await serverClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    throw Error("Failed to retrieve user data");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profileError) {
    throw Error("Failed to retrieve user profile");
  }

  return (
    <main className="mt-24 max-w-320 m-auto p-6">
      <Image
        src={user.user_metadata?.avatar_url}
        alt="Profile Picture"
        width={100}
        height={100}
        className="rounded-full sm:size-20 size-15 object-cover mb-4"
      />
      <header className="flex sm:flex-row flex-col items-start justify-between gap-x-6 gap-y-2 mb-6">
        <div className="flex items-center justify-center gap-4 w-fit">
          <h1 className="leading-8 flex flex-col">
            <span className="text-lg text-neutral-400 mb-1">Greetings 👋</span>{" "}
            <span className="sm:text-5xl text-4xl text-neutral-700 font-medium tracking-wide">
              {user.user_metadata?.name || user.email}
            </span>
          </h1>
        </div>
        <ul className="sm:w-fit w-full overflow-auto flex sm:flex-col flex-row text-nowrap whitespace-nowrap items-end sm:justify-center gap-2 mb-2">
          <li className="text-neutral-500 tracking-wide flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 text-sm">
            <FaGraduationCap size={16} />
            <span>{profile.school}</span>
          </li>
          <li className="text-neutral-500 tracking-wide flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 text-sm">
            <BiSolidCalendar size={16} />
            Joined on {formatDate(profile.created_at)}
          </li>
        </ul>
      </header>
      <h2 className="text-neutral-500 mb-4 text-xl tracking-tight">
        Lets get started,
      </h2>
      <div className="w-full flex overflow-auto gap-4 mb-8 snap-x self-start">
        <button className="text-neutral-400 flex flex-col gap-2 items-center group snap-start">
          <div className="bg-neutral-100 rounded-2xl sm:size-56 size-48 group-hover:brightness-[0.975] transition-all duration-300 bg-cover bg-center relative flex items-center justify-center overflow-hidden p-4">
            <Image
              src="/graphics/semesters.png"
              alt="Semesters"
              width={448}
              height={448}
              className="object-cover w-full h-full"
              unoptimized
            />
          </div>
          <span className="tracking-tight">Start first semester</span>
        </button>
        <button className="text-neutral-400 flex flex-col gap-2 items-center group snap-start">
          <div className="bg-neutral-100 rounded-2xl sm:size-56 size-48 group-hover:brightness-[0.975] transition-all duration-300 bg-cover bg-center relative flex items-center justify-center overflow-hidden p-4">
            <Image
              src="/graphics/classes.png"
              alt="Classes"
              width={448}
              height={448}
              className="object-cover w-full h-full"
              unoptimized
            />
          </div>
          <span className="tracking-tight">Add your first class</span>
        </button>
        <button className="text-neutral-400 flex flex-col gap-2 items-center group snap-start">
          <div className="bg-neutral-100 rounded-2xl sm:size-56 size-48 group-hover:brightness-[0.975] transition-all duration-300 bg-cover bg-center relative flex items-center justify-center overflow-hidden p-4">
            <Image
              src="/graphics/assignments.png"
              alt="Assignments"
              width={448}
              height={448}
              className="object-cover w-full h-full"
              unoptimized
            />
          </div>
          <span className="tracking-tight">Create assignment</span>
        </button>
        <button className="text-neutral-400 flex flex-col gap-2 items-center group snap-start">
          <div className="bg-neutral-100 rounded-2xl sm:size-56 size-48 group-hover:brightness-[0.975] transition-all duration-300 bg-cover bg-center relative flex items-center justify-center overflow-hidden p-4">
            <Image
              src="/graphics/calendar.png"
              alt="Calendar"
              width={448}
              height={448}
              className="object-cover w-full h-full"
              unoptimized
            />
          </div>
          <span className="tracking-tight">Sync calendar</span>
        </button>
      </div>
      <Suspense fallback={<SemestersLoading />}>
        <SemestersList />
      </Suspense>
      <Suspense fallback={<ClassesLoading />}>
        <ClassesList />
      </Suspense>
    </main>
  );
}
