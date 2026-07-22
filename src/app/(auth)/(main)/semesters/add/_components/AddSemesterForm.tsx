"use client";
import { useSession } from "@/app/_context/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { supabaseBrowserClient as supabase } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";
import { HiOutlineAcademicCap } from "react-icons/hi2";
import { LuSchool } from "react-icons/lu";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { PiPencilSimpleLineDuotone } from "react-icons/pi";
import BackButton from "@/components/ui/BackButton";

const academicLevels = [
  "High school",
  "Freshman",
  "Sophomore",
  "Junior",
  "Senior",
  "Master's student",
  "Doctoral student",
  "Other",
] as const;

// Derived from today's date so users never have to think about term/year themselves.
function getCurrentSemesterLabel(date = new Date()) {
  const month = date.getMonth();
  const year = date.getFullYear();
  if (month <= 4) return `Spring ${year}`;
  if (month <= 7) return `Summer ${year}`;
  return `Fall ${year}`;
}

const initSemesterDetails = {
  title: { value: "", error: "" },
  semester: { value: getCurrentSemesterLabel(), error: "" },
  grade: { value: "", error: "" },
};

export default function AddSemesterForm() {
  const session = useSession();
  const router = useRouter();
  const [step, setStep] = useState<0 | 1>(0);
  const [semesterDetails, setSemesterDetails] = useState(initSemesterDetails);

  const goBack = () => {
    if (step === 0) {
      router.back();
      return;
    }
    setStep(0);
  };

  const goNext = () => {
    if (!semesterDetails.title.value.trim()) {
      setSemesterDetails((prev) => ({
        ...prev,
        title: { ...prev.title, error: "Give your semester a name" },
      }));
      return;
    }
    setStep(1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (step === 0) {
      goNext();
      return;
    }

    if (!session) {
      toast.error("Session was missing", {
        description: "Please log back in and try again",
      });
      return;
    }

    if (!semesterDetails.grade.value) {
      setSemesterDetails((prev) => ({
        ...prev,
        grade: { ...prev.grade, error: "Select your academic level" },
      }));
      return;
    }

    const { error: addSemesterError } = await supabase
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
      return;
    }
    router.push("/semesters");
  };

  return (
    <form
      className="flex flex-col gap-6 h-[calc(100dvh-116px)]"
      onSubmit={handleSubmit}
    >
      <header className="flex items-center gap-4">
        <BackButton onClick={goBack} as="button" />
      </header>

      <div className="m-auto max-w-lg w-full pb-[116px]">
        <div className="flex flex-col justify-center w-full">
          {step === 0 ? (
            <div className="flex flex-col gap-4 mb-4">
              <div className="p-4 rounded-full bg-neutral-100 text-emerald-500 w-fit">
                <PiPencilSimpleLineDuotone size={28} />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-700">
                Give your semester a name
              </h1>
              <div className="w-full space-y-1.5">
                <input
                  autoFocus
                  type="text"
                  className={cn(
                    "bg-neutral-100 text-neutral-700 px-3 py-2 w-full rounded-xl transition-all border outline-2 drop-shadow-sm drop-shadow-transparent",
                    semesterDetails.title.error
                      ? "outline-red-400/60"
                      : "outline-transparent focus:outline-neutral-200 drop-shadow-neutral-100",
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
          ) : (
            <div className="flex flex-col gap-4 mb-4">
              <div className="p-4 rounded-full bg-neutral-100 text-emerald-500 w-fit">
                <HiOutlineAcademicCap size={28} />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-700">
                What&apos;s your grade level?
              </h1>
              <div className="w-full space-y-1.5">
                <Select
                  value={semesterDetails.grade.value}
                  onValueChange={(value) => {
                    if (value) {
                      setSemesterDetails((prev) => ({
                        ...prev,
                        grade: { value, error: "" },
                      }));
                    }
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      "w-full h-12 px-4 py-5 rounded-xl bg-neutral-100",
                      semesterDetails.grade.error
                        ? "outline-red-400/60"
                        : "outline-transparent focus-visible:ring-emerald-400/30",
                    )}
                  >
                    <SelectValue placeholder="Select your academic level" />
                  </SelectTrigger>
                  <SelectContent className="p-2">
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
          )}
          <div className="max-w-lg w-full mx-auto">
            <button
              type="submit"
              disabled={
                step === 0
                  ? !semesterDetails.title.value.trim()
                  : !semesterDetails.grade.value
              }
              className="w-full py-3 rounded-xl bg-emerald-500 text-white font-medium tracking-wide disabled:opacity-40 disabled:pointer-events-none hover:bg-emerald-600 transition-all cursor-pointer text-sm"
            >
              {step === 0 ? "Continue" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
