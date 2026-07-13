"use client";
import { HiDotsVertical } from "react-icons/hi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { MdArrowOutward } from "react-icons/md";
import { SemesterWithClasses } from "@/constants";

export default function SemestersDropdownMenu({
  semester,
}: {
  semester: SemesterWithClasses;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="p-2 rounded-full hover:bg-neutral-200 transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <HiDotsVertical />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>{semester.title}</DropdownMenuLabel>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Classes</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {semester.classes.map((cls, index) => (
                  <DropdownMenuItem key={index}>
                    <Link
                      href={`/semester/${semester.id}/classes/${cls.id}`}
                      className="flex items-center gap-1.5"
                    >
                      <span className="truncate line-clamp-1 overflow-hidden max-w-60">
                        {cls.title}
                      </span>
                      <MdArrowOutward />
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem>Edit</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
