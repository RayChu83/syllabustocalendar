"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatFileSize, SyllabusUpload } from "@/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { BsFileEarmarkText } from "react-icons/bs";
import { CgClose } from "react-icons/cg";
import { PiUploadSimpleBold } from "react-icons/pi";
import { RxArrowTopRight } from "react-icons/rx";

export default function SyllabusUploadForm({
  file,
  setFile,
  setError,
}: {
  file: SyllabusUpload | null;
  setFile: (file: SyllabusUpload | null) => void;
  setError: (error: string) => void;
}) {
  return (
    <div className="w-full">
      {file ? (
        <>
          <ul className="w-full space-y-4">
            <li className="flex flex-col gap-2 p-3 rounded-sm bg-neutral-100 outline relative">
              <section className="flex sm:items-center sm:flex-row flex-col gap-x-6 gap-y-4">
                {file.value.type.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={file.objectUrl}
                    alt={file.value.name}
                    className="sm:size-12 size-16 object-cover rounded bg-neutral-400"
                  />
                ) : (
                  <BsFileEarmarkText className="sm:text-5xl text-[64px]" />
                )}
                <div className="sm:grid grid-cols-8 gap-3 w-full">
                  <p className="col-span-4 overflow-hidden text-nowrap whitespace-nowrap truncate text-sm text-neutral-400">
                    {file.value.name}
                  </p>
                  <p className="col-span-2 text-sm text-neutral-400">
                    {file.value.type}
                  </p>
                  <p
                    className={cn(
                      "col-span-2 sm:text-end text-sm",
                      file.status === "uploaded"
                        ? "text-emerald-500"
                        : file.status === "fail"
                          ? "text-red-500"
                          : "text-neutral-400",
                    )}
                  >
                    {file.status === "uploaded"
                      ? "Uploaded"
                      : file.status === "fail"
                        ? "Failed"
                        : formatFileSize(file.value.size)}
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:static absolute top-3 right-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="p-2 bg-neutral-100 hover:bg-white hover:text-red-500 cursor-pointer rounded-md transition-all duration-300"
                        type="button"
                        onClick={() => {
                          URL.revokeObjectURL(file.objectUrl);
                          setFile(null);
                        }}
                      >
                        <CgClose className="text-xl" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Remove</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        className="p-2 bg-neutral-100 hover:bg-white hover:text-blue-500 cursor-pointer rounded-md transition-all duration-300"
                        href={file.objectUrl}
                        target="_blank"
                      >
                        <RxArrowTopRight className="text-xl" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>Open in new tab</TooltipContent>
                  </Tooltip>
                </div>
              </section>
              {file.status === "loading" ? (
                <section className="flex items-center justify-between gap-4">
                  <div
                    className="h-[2] bg-emerald-500 rounded-full"
                    style={{ width: `${file.loadPercent}%` }}
                  />
                  <p className="text-emerald-500 font-black text-sm">
                    {file.loadPercent}%
                  </p>
                </section>
              ) : null}
            </li>
          </ul>
        </>
      ) : (
        <>
          <label
            htmlFor="class-syllabus"
            className="flex flex-col gap-4 items-center justify-center w-full text-center py-8 px-6 bg-blue-500/10 outline-dashed outline-2 outline-blue-500/75 cursor-pointer transition-all rounded-sm backdrop-blur-2xl relative overflow-hidden group"
          >
            <PiUploadSimpleBold className="text-6xl" />
            <div className="space-y-1">
              <p className="font-black">Upload your Course Syllabus</p>
              <small className="tracking-widest text-neutral-500 font-light">
                Accepts PDF Files Only
              </small>
            </div>
            <div className="py-2 px-4 rounded-full bg-blue-500 text-white text-sm outline -outline-offset-1 outline-transparent hover:outline-blue-400 transition-all duration-300">
              Browse files
            </div>
          </label>
          <input
            id="class-syllabus"
            type="file"
            className="hidden"
            onChange={(e) => {
              // Zod Type Validation in the future (HTML INPUT ACCEPT Not Good Enough)
              if (e.target.files) {
                const file = e.target.files[0];
                const objectUrl = URL.createObjectURL(file);
                const updatedSyllabus: SyllabusUpload = {
                  value: file,
                  status: "idle",
                  loadPercent: 0,
                  key: "",
                  error: "",
                  objectUrl,
                };
                setFile(updatedSyllabus);
                setError("");
              }
            }}
            accept=".pdf"
          />
        </>
      )}
    </div>
  );
}
