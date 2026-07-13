"use client";

import { useState } from "react";
import Link from "next/link";
import { FaFolderOpen } from "react-icons/fa6";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import SemestersDropdownMenu from "./SemestersDropdownMenu";
import { SemesterWithClasses } from "@/constants";
import { cn } from "@/lib/utils";

export default function SemestersCollapsible({
  semesters,
}: {
  semesters: SemesterWithClasses[];
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="text-xl text-neutral-500 rounded-full flex items-center gap-1.5 mb-4 group cursor-pointer tracking-tight"
      >
        <MdOutlineKeyboardArrowRight
          className="transition-transform duration-300"
          style={{ rotate: isOpen ? "90deg" : "-90deg" }}
        />
        <h6>Semesters </h6>
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="flex items-stretch flex-row flex-nowrap overflow-auto gap-4 snap-x self-center mb-8">
            <Link
              href="/semesters/add"
              className="min-w-74 rounded-xl bg-transparent outline-2 outline-dashed -outline-offset-2 outline-neutral-200 hover:outline-neutral-300 p-6 flex items-center justify-center text-neutral-400 text-sm tracking-tight font-light transition-all duration-300 snap-start"
            >
              <span>Create semester</span>
            </Link>
            {semesters.map((semester, index) => (
              <Link
                href={`/semesters/${semester.id}`}
                key={index}
                className="p-6 rounded-xl bg-neutral-100 flex flex-col items-start min-w-74 hover:bg-[#f0f0f0] transition-all duration-300 snap-start"
              >
                <div className="mb-2 text-neutral-500 flex items-center justify-between w-full">
                  <FaFolderOpen size={24} />
                  <SemestersDropdownMenu semester={semester} />
                </div>
                <span className="text-neutral-700">{semester.title}</span>
                <span className="text-sm text-neutral-500">
                  {semester.classes.length} class
                  {semester.classes.length !== 1 ? "es" : ""}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
