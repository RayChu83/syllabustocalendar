"use client";
import { ClassPreview } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";

export default function ClassesCollapsible({
  classes,
}: {
  classes: ClassPreview[];
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
        <h6>Classes </h6>
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="flex items-stretch flex-row flex-nowrap overflow-auto gap-4 snap-x self-center">
            {classes.map((cls, index) => {
              return (
                <Link
                  href={`/semesters/${cls.semester_id}/classes/${cls.id}`}
                  className="flex flex-col items-start w-74 transition-all duration-300 snap-start relative group"
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
            })}
          </div>
        </div>
      </div>
    </>
  );
}
