"use client";
import { useSession } from "@/app/_context/AuthContext";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import Label from "@/components/ui/Label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import React, { FormEvent, useState } from "react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { supabaseBrowserClient as supabase } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

const initSemesterDetails = {
  title: { value: "", error: "" },
  grade: { value: "", error: "" },
};

export default function AddSemesterForm() {
  const session = useSession();
  const router = useRouter();
  const [semesterDetails, setSemesterDetails] = useState(initSemesterDetails);
  const [dateRange, setDateRange] = React.useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [open, setOpen] = React.useState({ from: false, to: false });
  const handleReset = async () => {
    setSemesterDetails(initSemesterDetails);
    setDateRange({ from: undefined, to: undefined });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast.error("Session was missing", {
        description: "Please log back in and try again",
      });
      return;
    }

    const dateRangeValidated = validateDateRange();
    if (
      !dateRangeValidated ||
      !semesterDetails.title.value ||
      !semesterDetails.grade.value
    )
      return;

    const { data, error: addSemesterError } = await supabase
      .from("semesters")
      .insert([
        {
          title: semesterDetails.title.value,
          grade: semesterDetails.grade.value,
          active: true,
          from: dateRange.from,
          to: dateRange.to,
        },
      ]);
    if (addSemesterError) {
      toast.error("Failed to add semester");
    }
    router.push("/semesters");
  };

  const validateDateRange = () => {
    const { from, to } = dateRange;
    if (!from || !to) {
      toast.error("Please select both start and end dates.");
      return false;
    }

    if (from >= to) {
      toast.error("End date must be after Start date.");
      return false;
    }
    if (to <= from) {
      toast.error("Start date must be before End date.");
      return false;
    }
    return true;
  };
  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <header>
        <h1 className="text-2xl font-bold tracking-wide text-neutral-200">
          Add Semester
        </h1>
      </header>
      <div className="flex flex-col gap-2">
        <Label required id="semester-title" title="Semester title:" />
        <div className="w-full space-y-1.5">
          <input
            type="text"
            className={cn(
              "bg-zinc-850 text-neutral-300 px-4 py-2 w-full rounded-sm outline-offset-2 transition-all border border-zinc-600 outline-2",
              semesterDetails.title.error
                ? "outline-red-400/60"
                : "outline-transparent focus:outline-zinc-400/60",
            )}
            id="semester-title"
            value={semesterDetails.title.value}
            onChange={(e) =>
              setSemesterDetails((prev) => ({
                ...prev,
                title: { value: e.target.value, error: "" },
              }))
            }
            placeholder="Semester 1"
          />
          {semesterDetails.title.error && (
            <p className="text-red-400 text-sm">
              {semesterDetails.title.error}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label required id="semester-grade" title="Semester Grade:" />
        <div className="w-full space-y-1.5">
          <input
            type="text"
            className={cn(
              "bg-zinc-850 text-neutral-300 px-4 py-2 w-full rounded-sm outline-offset-2 transition-all border border-zinc-600 outline-2",
              semesterDetails.grade.error
                ? "outline-red-400/60"
                : "outline-transparent focus:outline-zinc-400/60",
            )}
            id="semester-grade"
            value={semesterDetails.grade.value}
            onChange={(e) =>
              setSemesterDetails((prev) => ({
                ...prev,
                grade: { value: e.target.value, error: "" },
              }))
            }
            placeholder="Lower freshman"
          />
          {semesterDetails.grade.error && (
            <p className="text-red-400 text-sm">
              {semesterDetails.grade.error}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-start justify-center gap-3 w-full">
        <div className="flex flex-col gap-2 w-full">
          <Label required id="start-date" title="Start Date:" />
          <Popover
            open={open.from}
            onOpenChange={(open) =>
              setOpen((prev) => ({ ...prev, from: open }))
            }
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="start-date"
                className="w-full justify-between font-normal"
              >
                {dateRange.from
                  ? dateRange.from.toLocaleDateString()
                  : "Select date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={dateRange.from}
                onSelect={(date) => {
                  setDateRange((prev) => ({ ...prev, from: date }));
                  setOpen((prev) => ({ ...prev, from: false }));
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <Label required id="end-date" title="End Date:" />
          <Popover
            open={open.to}
            onOpenChange={(open) => setOpen((prev) => ({ ...prev, to: open }))}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="end-date"
                className="w-full justify-between font-normal"
              >
                {dateRange.to
                  ? dateRange.to.toLocaleDateString()
                  : "Select date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={dateRange.to}
                onSelect={(date) => {
                  setDateRange((prev) => ({ ...prev, to: date }));
                  setOpen((prev) => ({ ...prev, to: false }));
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <aside className="space-x-4 flex">
          <button
            className="py-2 px-3 rounded-md bg-zinc-850 outline outline-zinc-700 cursor-pointer hover:brightness-110 transition-all"
            type="button"
            onClick={handleReset}
          >
            Reset
          </button>
          <RainbowButton
            variant="default"
            className="disabled:animate-none disabled:pointer-events-none text-base py-4.5 px-3 hover:brightness-90 font-normal flex items-center gap-3"
          >
            <span>Continue</span>
            {/* <div role="status">
          <svg
            aria-hidden="true"
            className="size-4 text-neutral-tertiary animate-spin fill-brand"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="#000"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="#FFF"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div> */}
          </RainbowButton>
        </aside>
      </div>
    </form>
  );
}
