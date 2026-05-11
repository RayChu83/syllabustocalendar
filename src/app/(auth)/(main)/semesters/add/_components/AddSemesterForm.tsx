"use client";
import { useSession } from "@/app/_context/AuthContext";
import Label from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import React, { FormEvent, useState } from "react";
import { toast } from "sonner";
import { supabaseBrowserClient as supabase } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

const initSemesterDetails = {
  title: { value: "", error: "" },
  semester: { value: "", error: "" },
  grade: { value: "", error: "" },
};

const academicLevels = [
  "High school",
  "Freshman",
  "Sophomore",
  "Junior",
  "Senior",
  "Master's student",
  "Doctoral student",
] as const;

export default function AddSemesterForm() {
  const session = useSession();
  const router = useRouter();
  const [semesterDetails, setSemesterDetails] = useState(initSemesterDetails);
  const handleReset = async () => {
    setSemesterDetails(initSemesterDetails);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast.error("Session was missing", {
        description: "Please log back in and try again",
      });
      return;
    }

    if (
      !semesterDetails.title.value ||
      !semesterDetails.semester.value ||
      !semesterDetails.grade.value
    )
      return;

    const { data, error: addSemesterError } = await supabase
      .from("semesters")
      .insert([
        {
          title: semesterDetails.title.value,
          semester: semesterDetails.semester.value,
          grade: semesterDetails.grade.value,
        },
      ]);
    if (addSemesterError) {
      toast.error("Failed to add semester");
    }
    router.push("/semesters");
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <header>
        <h1 className="text-2xl font-bold tracking-wide text-neutral-500">
          Add Semester
        </h1>
      </header>
      <div className="flex flex-col gap-2">
        <Label required id="semester-title" title="Semester title:" />
        <div className="w-full space-y-1.5">
          <input
            type="text"
            className={cn(
              "bg-neutral-100 text-neutral-400 px-4 py-2 w-full rounded-sm outline-offset-2 transition-all border outline-2",
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
        <Label required id="semester" title="Semester:" />
        <div className="w-full space-y-1.5">
          <input
            type="text"
            className={cn(
              "bg-neutral-100 text-neutral-400 px-4 py-2 w-full rounded-sm outline-offset-2 transition-all border outline-2",
              semesterDetails.semester.error
                ? "outline-red-400/60"
                : "outline-transparent focus:outline-zinc-400/60",
            )}
            id="semester"
            value={semesterDetails.semester.value}
            onChange={(e) =>
              setSemesterDetails((prev) => ({
                ...prev,
                semester: { value: e.target.value, error: "" },
              }))
            }
            placeholder="Spring 2026"
          />
          {semesterDetails.semester.error && (
            <p className="text-red-400 text-sm">
              {semesterDetails.semester.error}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label required id="semester-grade" title="Academic level:" />
        <div className="w-full space-y-1.5">
          <Select
            value={semesterDetails.grade.value}
            onValueChange={(value) =>
              setSemesterDetails((prev) => ({
                ...prev,
                grade: { value, error: "" },
              }))
            }
          >
            <SelectTrigger
              className={cn(
                semesterDetails.grade.error
                  ? "outline-red-400/60"
                  : "outline-transparent focus-visible:ring-zinc-400/20",
              )}
            >
              <SelectValue placeholder="Select a grade level" />
            </SelectTrigger>
            <SelectContent>
              {academicLevels.map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {semesterDetails.grade.error && (
            <p className="text-red-400 text-sm">
              {semesterDetails.grade.error}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <aside className="space-x-4 flex">
          <button
            className="text-sm py-2.5 px-5 rounded-md bg-neutral-100 cursor-pointer hover:brightness-110 transition-all"
            type="button"
            onClick={handleReset}
          >
            Reset
          </button>
          <button className="text-sm disabled:animate-none disabled:pointer-events-none py-2.5 px-5 hover:brightness-90 font-normal flex items-center gap-3">
            Continue
          </button>
        </aside>
      </div>
    </form>
  );
}
