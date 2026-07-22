"use client";
import { SemesterWithClasses } from "@/constants";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaFolderOpen } from "react-icons/fa6";
import SemestersDropdownMenu from "../../dashboard/_components/SemestersDropdownMenu";
import { cn } from "@/lib/utils";
import { MdArrowOutward } from "react-icons/md";

export default function SemesterCard({
  semester,
  withDetails = false,
}: {
  semester: SemesterWithClasses;
  withDetails?: boolean;
}) {
  const router = useRouter();
  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/semesters/${semester.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(`/semesters/${semester.id}`);
      }}
      className="p-6 rounded-xl bg-neutral-100 flex flex-col items-start min-w-74 hover:bg-[#f0f0f0] transition-all duration-300 snap-start cursor-pointer"
    >
      <div className="mb-2 text-neutral-500 flex items-center justify-between w-full">
        <FaFolderOpen size={24} />
        <SemestersDropdownMenu semester={semester} />
      </div>
      <span className="text-neutral-700">{semester.title}</span>
      <span className="text-sm text-neutral-500">
        {semester.semester} • {semester.classes.length} class
        {semester.classes.length !== 1 ? "es" : ""}
      </span>
      {withDetails && (
        <>
          <Link
            className={cn(
              "flex items-center justify-between gap-2 text-sm py-2 px-4 rounded-xl font-light tracking-wide cursor-pointer transition-all bg-white w-full mt-4",
            )}
            href={`/semesters/${semester.id}/classes/create`}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-start">Add new class</span>
            <MdArrowOutward className="text-lg" />
          </Link>
        </>
      )}
    </div>
  );
}
