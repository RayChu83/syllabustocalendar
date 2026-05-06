"use client";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GoArrowRight, GoPersonAdd } from "react-icons/go";
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
import { toast } from "sonner";
import { SemesterWithClasses } from "@/constants";
import { useRouter } from "next/navigation";

export default function SemestersCard({
  semesters,
}: {
  semesters: SemesterWithClasses[];
}) {
  const router = useRouter();
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

  return semesters.map((semester, i) => (
    <section
      className="w-full bg-neutral-100 rounded-md p-6 transition-all duration-300 hover:scale-[1.02] ease-in-out"
      key={i}
    >
      <header className="flex items-center justify-between mb-4">
        <Link href={`/semesters/${semester.id}`}>
          <h3 className="text-xl font-medium text-neutral-500 block">
            {semester.title}
          </h3>
          <p className="text-neutral-400 text-sm font-medium">
            {semester.semester}
          </p>
        </Link>
        <aside className="flex items-center gap-6">
          <Dialog>
            <DialogTrigger asChild>
              <button className="text-2xl cursor-pointer transition-all border-none text-neutral-500 outline-0">
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
                  Share this link for others to see your school semester.
                </DialogDescription>
              </DialogHeader>
              <input
                type="text"
                className="bg-neutral-100 text-neutral-500 px-4 py-2 w-full rounded-sm transition-all"
                defaultValue={`http://localhost:3000/semesters/${semester.id}`}
                disabled
                readOnly
              />
              <DialogFooter className="flex flex-row items-center gap-4">
                <button
                  className="w-fit py-2 px-4 rounded-sm bg-neutral-100 text-neutral-500 cursor-pointer"
                  onClick={() => {
                    copyToClipboard(
                      `http://localhost:3000/semesters/${semester.id}`,
                    );
                  }}
                >
                  Copy
                </button>
                <DialogClose asChild>
                  <button className="w-fit py-2 px-4 rounded-sm bg-black text-white cursor-pointer">
                    Close
                  </button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex text-2xl cursor-pointer transition-all border-none text-neutral-500 outline-0">
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
            <DropdownMenuContent>
              <DropdownMenuLabel className="font-semibold tracking-tight text-neutral-400">
                Settings
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <button className="w-full text-neutral-400 transition-all cursor-pointer flex items-center justify-between group">
                  <span>Edit</span>
                  <MdEdit />
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <button className="w-full text-neutral-400 transition-all cursor-pointer flex items-center justify-between group">
                  <span>Delete</span>
                  <MdDelete />
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
                "bg-red-50 text-red-500 hover:bg-red-100",
                "bg-orange-50 text-orange-500 hover:bg-orange-bg-red-100",
                "bg-yellow-50 text-yellow-500 hover:bg-yellow-bg-red-100",
                "bg-green-50 text-green-500 hover:bg-green-bg-red-100",
                "bg-blue-50 text-blue-500 hover:bg-blue-bg-red-100",
              ][j % 5],
            )}
            href={`/semesters/${semester.id}/classes/${cls.id}`}
          >
            <span className="text-start line-clamp-1">{cls.title}</span>
            <GoArrowRight className="text-lg" />
          </Link>
        ))}
        <Link
          className={cn(
            "flex items-center justify-between gap-2 text-sm py-1.5 px-3 rounded-sm font-light tracking-wide cursor-pointer transition-all bg-white",
          )}
          href={`/semesters/${semester.id}/classes/create`}
        >
          <span className="text-start">Add new class</span>
          <GoArrowRight className="text-lg" />
        </Link>
      </div>
    </section>
  ));
}
