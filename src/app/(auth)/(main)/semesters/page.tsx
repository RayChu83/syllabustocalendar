"use client";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Particles } from "@/components/ui/particles";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { GoArrowLeft, GoArrowRight, GoPersonAdd } from "react-icons/go";
import { IoSettingsOutline } from "react-icons/io5";
import { MdDelete, MdEdit } from "react-icons/md";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { defaultSemesters } from "@/constants";
import { toast } from "sonner";
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function Semesters() {
  const [semesters, setSemesters] = useState(defaultSemesters);

  async function copyToClipboard(text: string) {
    try {
      // Use the modern Clipboard API
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard:", { description: text });
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast.error("Failed to copy to clipboard:", { description: text });
    }
  }

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
          {semesters.map((semester, i) => (
            <section
              className="w-full bg-zinc-850 hover:bg-zinc-800 rounded-md p-4 group transition-all duration-300  hover:scale-[1.02] ease-in-out border-b-2 border-r-2 border-zinc-600"
              key={i}
            >
              <header className="flex items-center justify-between mb-4">
                <aside>
                  <Link
                    className="text-2xl font-bold text-neutral-200 block underline decoration-[0.5px] decoration-transparent group-hover:decoration-neutral-200 underline-offset-4 transition-all "
                    href={`/semesters/${semester.id}`}
                  >
                    {semester.title}
                  </Link>
                  <AnimatedShinyText
                    className="text-neutral-400"
                    shimmerWidth={200}
                  >
                    <span className="text-sm font-medium">
                      {semester.grade}
                    </span>
                  </AnimatedShinyText>
                </aside>
                <aside className="flex items-center gap-6">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-2xl cursor-pointer transition-all border-none text-neutral-200 outline-0">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex">
                              <GoPersonAdd />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>Invite people</TooltipContent>
                        </Tooltip>
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invite people</DialogTitle>
                        <DialogDescription>
                          Share this link for others to see your school
                          semester.
                        </DialogDescription>
                      </DialogHeader>
                      <input
                        type="text"
                        className="bg-zinc-850 text-neutral-300 px-4 py-2 w-full rounded-sm outline-offset-2 transition-all border border-zinc-600 outline-2 outline-transparent focus:outline-zinc-400/60"
                        defaultValue={`http://localhost:3000/semesters/${semester.id}`}
                        disabled
                        readOnly
                      />
                      <DialogFooter className="flex flex-row items-center gap-4">
                        <button
                          className="w-fit py-2 px-4 rounded-sm bg-neutral-300 text-black cursor-pointer"
                          onClick={() => {
                            copyToClipboard(
                              "http://localhost:3000/semesters/${semester.id}"
                            );
                          }}
                        >
                          Copy
                        </button>
                        <DialogClose asChild>
                          <button className="w-fit py-2 px-4 rounded-sm bg-zinc-850 text-neutral-300 cursor-pointer">
                            Close
                          </button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex text-2xl cursor-pointer transition-all border-none text-neutral-200 outline-0">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex">
                              <IoSettingsOutline />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>Settings</TooltipContent>
                        </Tooltip>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-zinc-850 outline-zinc-600">
                      <DropdownMenuLabel className="font-semibold tracking-tight text-neutral-300">
                        Settings
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <button className="w-full text-neutral-300 hover:bg-zinc-800! transition-all cursor-pointer flex items-center justify-between group">
                          <span className="group-hover:text-yellow-400 transition-all">
                            Edit
                          </span>
                          <MdEdit className="group-hover:text-yellow-400 transition-all" />
                        </button>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <button className="w-full text-neutral-300 hover:bg-zinc-800! transition-all cursor-pointer flex items-center justify-between group">
                          <span className="group-hover:text-red-400 transition-all">
                            Delete
                          </span>
                          <MdDelete className="group-hover:text-red-400 transition-all" />
                        </button>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </aside>
              </header>
              <div className="flex flex-col gap-2">
                {semester.classes.map((cls, j) => (
                  <Link
                    key={j}
                    className={cn(
                      "flex items-center justify-between gap-2 text-sm py-1.5 px-3 rounded-sm font-light tracking-wide cursor-pointer transition-all",
                      [
                        "bg-red-500/10 text-red-300 hover:bg-red-500/20",
                        "bg-orange-500/10 text-orange-300 hover:bg-orange-500/20",
                        "bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20",
                        "bg-green-500/10 text-green-300 hover:bg-green-500/20",
                        "bg-blue-500/10 text-blue-300 hover:bg-blue-500/20",
                      ][j % 5]
                    )}
                    href={`/semesters/${semester.id}/${cls}`}
                  >
                    <span>{cls}</span>
                    <GoArrowRight className="text-lg" />
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <AuroraBackground />
      <Particles className="fixed w-full h-full top-0 left-0 -z-50" />
    </>
  );
}
