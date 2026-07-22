"use client";
import { HiDotsVertical } from "react-icons/hi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { MdArrowOutward } from "react-icons/md";
import { SemesterWithClasses } from "@/constants";
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
import { toast } from "sonner";

export default function SemestersDropdownMenu({
  semester,
}: {
  semester: SemesterWithClasses;
}) {
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
          {semester.classes.length ? (
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
          ) : (
            <>
              <DropdownMenuItem>
                <Link
                  href={`/semesters/${semester.id}/classes/create`}
                  className="h-full w-full"
                >
                  Create your first class
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <Dialog>
            <DialogTrigger asChild>
              <DropdownMenuItem>Share</DropdownMenuItem>
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
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
