"use client";
import { SemesterWithClasses } from "@/constants";
import { MdEventBusy } from "react-icons/md";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import SemesterCard from "./SemesterCard";

const semesterStatuses = ["All", "Active", "Inactive"] as const;
export default function SemesterList({
  semesters,
}: {
  semesters: SemesterWithClasses[];
}) {
  const [semesterStatus, setSemesterStatus] = useState("All");
  return (
    <>
      {semesters.length ? (
        <>
          <div className="flex items-stretch flex-row flex-nowrap overflow-auto gap-2 snap-x mb-6">
            {semesterStatuses.map((status, index) => (
              <button
                className={cn(
                  "px-4 py-1.5 rounded-full transition-all duration-300 outline -outline-offset-1 text-sm",
                  semesterStatus === status
                    ? "bg-neutral-100 text-neutral-700 outline-transparent"
                    : " outline-neutral-200 text-neutral-500",
                )}
                key={index}
                onClick={() => setSemesterStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="grid 2xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
            {semesters.map((semester, i) => (
              <SemesterCard key={i} semester={semester} withDetails />
            ))}
          </div>
        </>
      ) : (
        <div className="py-12 max-w-sm m-auto flex flex-col items-center text-center">
          <div className="p-4 rounded-2xl bg-[#f0f0f0] text-neutral-700 w-fit mb-4">
            <MdEventBusy size={24} />
          </div>
          <header className="mb-4">
            <h5 className="text-xl text-neutral-700 tracking-tight mb-1">
              No semesters were found
            </h5>
            <p className="text-sm text-neutral-500">
              Add a semester to start adding classes
            </p>
          </header>
          <Link
            href="/semesters/add"
            className="text-sm text-emerald-500 underline font-medium tracking-tight hover:text-emerald-600 transition-all"
          >
            Add your first semester
          </Link>
        </div>
      )}
    </>
  );
}
