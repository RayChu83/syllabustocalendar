"use client";
import { SyllabusUpload } from "@/constants";
import axios from "axios";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import SyllabusUploadForm from "./SyllabusUpload";
import Input from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { supabaseBrowserClient as supabase } from "@/lib/supabase/browser";
import {
  syllabusFileSchema,
  syllabusSchema,
  syllabusTextSchema,
} from "@/constants/schemas";
import { SyllabusJSON } from "@/constants/types";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { IoMdClose } from "react-icons/io";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export default function AddClassForm({ semesterId }: { semesterId: string }) {
  const [syllabus, setSyllabus] = useState<{
    file: SyllabusUpload | null;
    text: string;
  }>({ file: null, text: "" });

  const [syllabusType, setSyllabusType] = useState<"file" | "text">("file");
  const [status, setStatus] = useState<
    "idle" | "parsing" | "draft" | "creating"
  >("idle");
  const [syllabusJSONDraft, setSyllabusJSONDraft] =
    useState<SyllabusJSON | null>(null);
  const [syllabusRecordId, setSyllabusRecordId] = useState<number | null>(null);

  // placeholder to prevent TS errors (no functional change)
  const [classDetailErrors, setClassDetailErrors] = useState<
    Record<string, string>
  >({});
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const router = useRouter();

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  async function hashFile(file: File) {
    const buffer = await file.arrayBuffer();

    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);

    const hashArray = Array.from(new Uint8Array(hashBuffer));

    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return hashHex;
  }

  async function hashText(text: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text); // string → Uint8Array

    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return hashHex;
  }

  async function checkSyllabusExists(hash: string) {
    const existing = await supabase
      .from("syllabus")
      .select("*")
      .eq("file_hash", hash)
      .single();
    return existing.data;
  }

  async function parseSyllabusText(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/parseSyllabusText", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return data.text;
  }

  async function createSyllabusRecord(
    syllabusText: string,
    hash: string,
    syllabusJSON: SyllabusJSON,
  ) {
    const filePath = syllabusType === "file" ? await uploadSyllabus() : null;

    console.log("SYLLABUS FILE PATH", filePath);

    if (syllabusType === "file" && !filePath) {
      toast.error("Failed to upload syllabus file");
      return null;
    }

    const { data, error } = await supabase
      .from("syllabus")
      .insert({
        raw_text: syllabusText,
        file_hash: hash,
        parsed_data: syllabusJSON,
        key: filePath,
      })
      .select("id")
      .single();

    if (error) {
      toast.error("Failed to save syllabus details", {
        description: error.message,
      });
      return null;
    }

    return data.id as number;
  }

  async function parseSyllabusJson(syllabusText: string, hash: string) {
    const syllabusJSONRes = await fetch("/api/ai/testSyllabi", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ syllabusText }),
    });

    if (!syllabusJSONRes.ok) {
      const data = await syllabusJSONRes.json().catch(() => null);
      toast.error(data?.error || "Failed to parse syllabus");
      return null;
    }

    const syllabusJSON: SyllabusJSON = await syllabusJSONRes.json();

    const parsedSyllabusJSON = syllabusSchema.safeParse(syllabusJSON);

    if (syllabusJSON.ok && parsedSyllabusJSON.success) {
      const recordId = await createSyllabusRecord(
        syllabusText,
        hash,
        parsedSyllabusJSON.data,
      );

      if (!recordId) {
        return null;
      }

      setSyllabusRecordId(recordId);
      setStatus("draft");
      setSyllabusJSONDraft(parsedSyllabusJSON.data);
      return parsedSyllabusJSON.data;
    }

    if (!parsedSyllabusJSON.success) {
      console.error("Syllabus schema validation failed", {
        issues: parsedSyllabusJSON.error.issues,
        syllabusJSON,
      });
    }

    toast.error("Syllabus failed to parse correctly");
    return null;
  }

  async function uploadSyllabus() {
    const file = syllabus.file;
    if (!file || !syllabusFileSchema.safeParse(file.value).success) {
      return null;
    }
    const preSignedUrlRes = await fetch("/api/supabase/syllabusFileUpload", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        fileName: file.value.name,
        contentType: file.value.type,
        size: file.value.size,
      }),
    });
    if (!preSignedUrlRes.ok) {
      toast.error("Failed to fetch pre-signed URL");
      return null;
    }
    const { url, filePath }: { url: string; filePath: string } =
      await preSignedUrlRes.json();
    await axios.put(url, file.value, {
      headers: {
        "Content-Type": file.value.type,
      },
      onUploadProgress: (progressEvent) => {
        if (!progressEvent.total) return;
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        setSyllabus((prev) => ({
          ...prev,
          file: prev.file
            ? {
                ...prev.file,
                status: "loading",
                loadPercent: percent,
              }
            : prev.file,
        }));
      },
    });
    // Mark as uploaded
    setSyllabus((prev) => ({
      ...prev,
      file: prev.file
        ? {
            ...prev.file,
            status: "uploaded",
            loadPercent: 0,
            key: filePath,
          }
        : prev.file,
    }));
    return filePath;
  }

  const parseSyllabus = async () => {
    try {
      if (syllabusType === "file") {
        // handle file syllabus upload
        const file = syllabus.file as SyllabusUpload;
        const hash = await hashFile(file.value);

        // check if syllabus with the same hash already exists in the database
        const existingSyllabus = await checkSyllabusExists(hash);
        if (existingSyllabus) {
          // Syllabus already exists
          toast.info("This syllabus has already been uploaded.");
          setSyllabusRecordId(existingSyllabus.id);
          setSyllabusJSONDraft(existingSyllabus.parsed_data as SyllabusJSON);
          setStatus("draft");
          return existingSyllabus.parsed_data as SyllabusJSON;
        } else {
          // Upload new syllabus
          const syllabusText = await parseSyllabusText(file.value);
          const parsedText = syllabusTextSchema.safeParse(syllabusText);
          if (!parsedText.success) {
            toast.error("Invalid syllabus text format");
            return null;
          }
          return await parseSyllabusJson(syllabusText, hash);
        }
      } else {
        // Handle text syllabus upload
        const hash = await hashText(syllabus.text);
        // check if syllabus text is okay
        const parsedText = syllabusTextSchema.safeParse(syllabus.text);
        if (!parsedText.success) {
          toast.error(parsedText.error.issues[0].message);
          return null;
        }
        // check if syllabus with the same hash already exists in the database
        const existingSyllabus = await checkSyllabusExists(hash);
        if (existingSyllabus) {
          // Syllabus already exists
          toast.info("This syllabus has already been uploaded.");
          setSyllabusRecordId(existingSyllabus.id);
          setSyllabusJSONDraft(existingSyllabus.parsed_data as SyllabusJSON);
          setStatus("draft");
          return existingSyllabus.parsed_data as SyllabusJSON;
        } else {
          return await parseSyllabusJson(syllabus.text, hash);
        }
      }
    } catch (err) {
      console.log(err);

      const file = syllabus.file;

      toast.error("Something went wrong when uploading your file", {
        description: file?.value.name,
      });

      setSyllabus((prev) => ({
        ...prev,
        file: prev.file
          ? {
              ...prev.file,
              status: "fail",
              loadPercent: 0,
            }
          : prev.file,
      }));

      return null;
    }
  };

  // Form Actions

  const handleSyllabusSubmission = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // simplified validation (keeps intent, removes invalid indexing)
    if (
      (syllabusType === "file" && !syllabus.file) ||
      (syllabusType === "text" && !syllabus.text)
    ) {
      setClassDetailErrors((prev) => ({
        ...prev,
        [syllabusType]: "Please provide a syllabus.",
      }));
      toast.error("Please provide a syllabus.");
      return;
    }

    try {
      setStatus("parsing");
      // Parse syllabus
      const parsedSyllabus = await parseSyllabus();
      if (!parsedSyllabus) {
        setStatus("idle");
      }
    } catch {
      toast.error("An unknown error occurred");
      setStatus("idle");
    }
  };

  const handleDraftSubmission = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!syllabusRecordId) {
      toast.error("No saved syllabus record was found.");
      return;
    }

    const response = await fetch("/api/supabase/createClass", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        body: syllabusJSONDraft,
        semesterId,
        syllabusId: syllabusRecordId,
      }),
    });
    if (response.ok) {
      toast.success("Class created successfully!");
      router.push(`/semesters/${semesterId}`);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        if (status === "idle") {
          handleSyllabusSubmission(e);
        } else if (status === "draft") {
          handleDraftSubmission(e);
        } else {
          toast.loading("Processing upload...");
        }
      }}
      className="flex flex-col gap-4"
    >
      {(() => {
        switch (status) {
          case "idle":
            return (
              <>
                <div>
                  {syllabusType === "file" ? (
                    <SyllabusUploadForm
                      file={syllabus.file}
                      setFile={(file: SyllabusUpload | null) => {
                        setSyllabus((prev) => ({ ...prev, file }));
                      }}
                      setError={(error) =>
                        setClassDetailErrors((prev) => ({
                          ...prev,
                          [syllabusType]: error,
                        }))
                      }
                    />
                  ) : (
                    <Input
                      id="class-syllabus"
                      placeholder="Enter class syllabus as text"
                      setValue={(value) =>
                        setSyllabus((prev) => ({
                          ...prev,
                          [syllabusType]: value,
                        }))
                      }
                      value={syllabus[syllabusType]}
                      error={classDetailErrors[syllabusType]}
                      setError={(error) =>
                        setClassDetailErrors((prev) => ({
                          ...prev,
                          [syllabusType]: error,
                        }))
                      }
                      type="textarea"
                      inputClass="h-48 p-3"
                      showErrorMsg={false}
                      max={25000}
                    />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="p-1 bg-neutral-100 w-fit rounded-full flex gap-1">
                    <button
                      className={cn(
                        "px-6 py-2 rounded-full transition-all duration-300",
                        syllabusType === "file"
                          ? "bg-white text-blue-500"
                          : "hover:bg-neutral-200/50 cursor-pointer",
                      )}
                      type="button"
                      onClick={() => setSyllabusType("file")}
                    >
                      File
                    </button>
                    <button
                      className={cn(
                        "px-6 py-2 rounded-full transition-all duration-300",
                        syllabusType === "text"
                          ? "bg-white text-blue-500"
                          : "hover:bg-neutral-200/50 cursor-pointer",
                      )}
                      type="button"
                      onClick={() => setSyllabusType("text")}
                    >
                      Text
                    </button>
                  </div>
                  <button className="px-5 py-2.5 rounded-full bg-blue-500 text-white cursor-pointer">
                    Continue
                  </button>
                </div>
              </>
            );

          case "parsing":
            return (
              <section
                className="flex min-h-72 flex-col items-center justify-center gap-5 rounded-3xl border border-blue-100 bg-blue-50/60 px-8 py-12 text-center"
                aria-live="polite"
                aria-busy="true"
              >
                <div
                  role="status"
                  className="size-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-500"
                >
                  <span className="sr-only">Loading...</span>
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold tracking-tight text-neutral-700">
                    Reading your syllabus
                  </h2>
                  <p className="max-w-md text-sm text-neutral-500">
                    The OpenAI parser is extracting class details, schedules,
                    instructors, and deadlines. This can take a minute for long
                    syllabi.
                  </p>
                </div>
              </section>
            );

          case "draft":
            return (
              <>
                <section className="flex lg:flex-row flex-col gap-8 relative">
                  <aside className="h-fit lg:sticky top-18.75">
                    <div className="outline outline-neutral-200 rounded-2xl overflow-hidden mb-4">
                      <Document
                        file={syllabus.file?.objectUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                      >
                        <Page pageNumber={pageNumber} />
                      </Document>
                    </div>
                    <div className="flex items-center gap-2 bg-neutral-50 p-1 rounded-2xl w-fit text-sm">
                      {numPages && (
                        <>
                          <button
                            onClick={() => {
                              setPageNumber(Math.max(1, pageNumber - 1));
                            }}
                            type="button"
                            className="px-4 py-2 cursor-pointer rounded-full hover:bg-white hover:text-blue-500 transition-all duration-300 text-neutral-500"
                          >
                            Prev
                          </button>
                          <span className="tracking-wider text-neutral-400">
                            {pageNumber} of {numPages}
                          </span>
                          <button
                            onClick={() => {
                              setPageNumber(Math.min(numPages, pageNumber + 1));
                            }}
                            type="button"
                            className="px-4 py-2 cursor-pointer rounded-full hover:bg-white hover:text-blue-500 transition-all duration-300 text-neutral-500"
                          >
                            Next
                          </button>
                        </>
                      )}
                    </div>
                  </aside>
                  <aside className="flex flex-col gap-4 w-full">
                    {syllabusJSONDraft && (
                      <>
                        <div>
                          <label
                            htmlFor="class-title"
                            className="text-neutral-400 text-sm font-medium tracking-tight block w-fit mb-2"
                          >
                            Class title:{" "}
                          </label>
                          <input
                            type="text"
                            id="class-title"
                            className="outline -outline-offset-1 outline-neutral-200 hover:outline-neutral-300 focus:outline-neutral-400 focus:drop-shadow-xs rounded-2xl px-4 py-2 w-full placeholder:text-neutral-300  placeholder:italic text-neutral-700 bg-white"
                            value={syllabusJSONDraft.class.title}
                            onChange={(e) => {
                              setSyllabusJSONDraft((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      class: {
                                        ...prev.class,
                                        title: e.target.value,
                                      },
                                    }
                                  : prev,
                              );
                            }}
                            placeholder="Course title"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="class-overview"
                            className="text-neutral-400 text-sm font-medium tracking-tight block w-fit mb-2"
                          >
                            Class overview:{" "}
                          </label>
                          <textarea
                            id="class-overview"
                            className="outline -outline-offset-1 outline-neutral-200 hover:outline-neutral-300 focus:outline-neutral-400 focus:drop-shadow-xs rounded-2xl px-4 py-2 w-full placeholder:text-neutral-300  placeholder:italic text-neutral-700 bg-white min-h-20"
                            value={syllabusJSONDraft.class.overview}
                            onChange={(e) => {
                              setSyllabusJSONDraft((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      class: {
                                        ...prev.class,
                                        overview: e.target.value,
                                      },
                                    }
                                  : prev,
                              );
                            }}
                            placeholder="A brief description of the class"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label
                              htmlFor="class-start-date"
                              className="text-neutral-400 text-sm font-medium tracking-tight block w-fit mb-2"
                            >
                              Start date:{" "}
                            </label>
                            <input
                              type="text"
                              id="class-start-date"
                              className="outline -outline-offset-1 outline-neutral-200 hover:outline-neutral-300 focus:outline-neutral-400 focus:drop-shadow-xs rounded-2xl px-4 py-2 w-full placeholder:text-neutral-300  placeholder:italic text-neutral-700 bg-white"
                              value={syllabusJSONDraft.class.startDate}
                              onChange={(e) => {
                                setSyllabusJSONDraft((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        class: {
                                          ...prev.class,
                                          startDate: e.target.value,
                                        },
                                      }
                                    : prev,
                                );
                              }}
                              placeholder="YYYY-MM-DD"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="class-end-date"
                              className="text-neutral-400 text-sm font-medium tracking-tight block w-fit mb-2"
                            >
                              End date:{" "}
                            </label>
                            <input
                              type="text"
                              id="class-end-date"
                              className="outline -outline-offset-1 outline-neutral-200 hover:outline-neutral-300 focus:outline-neutral-400 focus:drop-shadow-xs rounded-2xl px-4 py-2 w-full placeholder:text-neutral-300  placeholder:italic text-neutral-700 bg-white"
                              value={syllabusJSONDraft.class.endDate}
                              onChange={(e) => {
                                setSyllabusJSONDraft((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        class: {
                                          ...prev.class,
                                          endDate: e.target.value,
                                        },
                                      }
                                    : prev,
                                );
                              }}
                              placeholder="YYYY-MM-DD"
                            />
                          </div>
                        </div>
                        <div>
                          <div>
                            <label
                              htmlFor="class-materials"
                              className="text-neutral-400 text-sm font-medium tracking-tight block w-fit mb-2"
                            >
                              Class materials:{" "}
                            </label>
                            <div className="flex items-stretch gap-2 mb-2">
                              <input
                                type="text"
                                id="class-materials"
                                className="outline -outline-offset-1 outline-neutral-200 hover:outline-neutral-300 focus:outline-neutral-400 focus:drop-shadow-xs rounded-2xl px-4 py-2 w-full placeholder:text-neutral-300 placeholder:italic text-neutral-700 bg-white"
                                placeholder="Calculus: Early Transcendentals, James Stewart"
                                autoComplete="off"
                              />
                              <button
                                onClick={() => {
                                  const input = document.getElementById(
                                    "class-materials",
                                  ) as HTMLInputElement;
                                  const value = input.value.trim();
                                  if (value && syllabusJSONDraft) {
                                    setSyllabusJSONDraft((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            class: {
                                              ...prev.class,
                                              materials: [
                                                ...prev.class.materials,
                                                value,
                                              ],
                                            },
                                          }
                                        : prev,
                                    );
                                    input.value = "";
                                  }
                                }}
                                className="bg-neutral-100 text-blue-500 px-5 py-2.5 rounded-2xl cursor-pointer text-sm"
                                type="button"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                          <ul className="flex flex-col gap-2">
                            {syllabusJSONDraft.class.materials.map(
                              (material, index) => (
                                <li
                                  key={index}
                                  className="bg-blue-50 px-3 py-1 rounded-full text-sm w-fit flex items-center gap-2"
                                >
                                  <span className="text-blue-400 line-clamp-1">
                                    {material}
                                  </span>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSyllabusJSONDraft((prev) =>
                                            prev
                                              ? {
                                                  ...prev,
                                                  class: {
                                                    ...prev.class,
                                                    materials:
                                                      prev.class.materials.filter(
                                                        (_, i) => i !== index,
                                                      ),
                                                  },
                                                }
                                              : prev,
                                          );
                                        }}
                                        className="text-neutral-400 cursor-pointer"
                                      >
                                        <IoMdClose />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Remove</TooltipContent>
                                  </Tooltip>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                        <div>
                          <div className="flex items-end gap-2 mb-2">
                            <div className="grid grid-cols-2 gap-2 w-full">
                              <div>
                                <label
                                  htmlFor="class-grading"
                                  className="text-neutral-400 text-sm font-medium tracking-tight block w-fit mb-2"
                                >
                                  Grading Policy:{" "}
                                </label>
                                <input
                                  type="text"
                                  id="class-grading"
                                  className="outline -outline-offset-1 outline-neutral-200 hover:outline-neutral-300 focus:outline-neutral-400 focus:drop-shadow-xs rounded-2xl px-4 py-2 w-full placeholder:text-neutral-300  placeholder:italic text-neutral-700 bg-white"
                                  placeholder="Extra credit project"
                                />
                              </div>
                              <div>
                                <label
                                  htmlFor="class-grading-weight"
                                  className="text-neutral-400 text-sm font-medium tracking-tight block w-fit mb-2"
                                >
                                  Grading Weight:{" "}
                                </label>
                                <input
                                  type="number"
                                  id="class-grading-weight"
                                  className="outline -outline-offset-1 outline-neutral-200 hover:outline-neutral-300 focus:outline-neutral-400 focus:drop-shadow-xs rounded-2xl px-4 py-2 w-full placeholder:text-neutral-300  placeholder:italic text-neutral-700 bg-white"
                                  placeholder="15%"
                                  min="0"
                                  max="100"
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const gradingInput = document.getElementById(
                                  "class-grading",
                                ) as HTMLInputElement;
                                const gradingValue = gradingInput.value.trim();

                                const weightInput = document.getElementById(
                                  "class-grading-weight",
                                ) as HTMLInputElement;
                                const weightValue = weightInput.value.trim();

                                if (
                                  gradingValue &&
                                  weightValue &&
                                  syllabusJSONDraft
                                ) {
                                  setSyllabusJSONDraft((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          class: {
                                            ...prev.class,
                                            grading: [
                                              ...prev.class.grading,
                                              {
                                                type: gradingValue,
                                                weight: Number(weightValue),
                                              },
                                            ],
                                          },
                                        }
                                      : prev,
                                  );
                                  gradingInput.value = "";
                                  weightInput.value = "";
                                }
                              }}
                              className="bg-neutral-100 text-blue-500 px-5 py-2.5 rounded-2xl cursor-pointer text-sm"
                              type="button"
                            >
                              Add
                            </button>
                          </div>
                          <ul className="text-neutral-600 grid xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-3 grid-cols-2 gap-2">
                            {syllabusJSONDraft.class.grading.map(
                              ({ type, weight }, index) => (
                                <li
                                  key={index}
                                  className="bg-neutral-50 rounded-2xl p-6"
                                >
                                  <header className="flex items-center justify-between gap-4 mb-2">
                                    <span className="text-2xl font-medium tracking-tighter text-blue-500 block">
                                      {weight}%
                                    </span>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSyllabusJSONDraft((prev) =>
                                              prev
                                                ? {
                                                    ...prev,
                                                    class: {
                                                      ...prev.class,
                                                      grading:
                                                        prev.class.grading.filter(
                                                          (_, i) => i !== index,
                                                        ),
                                                    },
                                                  }
                                                : prev,
                                            );
                                          }}
                                          className="text-neutral-500 cursor-pointer"
                                        >
                                          <IoMdClose />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent>Remove</TooltipContent>
                                    </Tooltip>
                                  </header>
                                  <span className="text-sm text-neutral-500">
                                    {type}
                                  </span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                        {syllabusJSONDraft.class.other.map(
                          ({ title }, index) => (
                            <div key={index}>
                              <label
                                htmlFor={`class-${index}`}
                                className="text-neutral-400 text-sm font-medium tracking-tight block w-fit mb-2"
                              >
                                {title}
                              </label>
                              <textarea
                                id={`class-${index}`}
                                className="outline -outline-offset-1 outline-neutral-200 hover:outline-neutral-300 focus:outline-neutral-400 focus:drop-shadow-xs rounded-2xl px-4 py-2 w-full placeholder:text-neutral-300  placeholder:italic text-neutral-700 bg-white min-h-20"
                                value={
                                  syllabusJSONDraft.class.other[index]
                                    .description
                                }
                                onChange={(e) => {
                                  setSyllabusJSONDraft((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          class: {
                                            ...prev.class,
                                            other: prev.class.other.map(
                                              (item, i) =>
                                                i === index
                                                  ? {
                                                      ...item,
                                                      description:
                                                        e.target.value,
                                                    }
                                                  : item,
                                            ),
                                          },
                                        }
                                      : prev,
                                  );
                                }}
                                placeholder="A brief description of the class"
                              />
                            </div>
                          ),
                        )}
                      </>
                    )}
                  </aside>
                </section>
                <section className="flex items-center justify-end gap-4">
                  <button
                    type="button"
                    className="px-5 py-2.5 rounded-2xl text-sm bg-neutral-50 text-blue-500 cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-2xl bg-blue-500 text-sm text-white cursor-pointer"
                  >
                    Save
                  </button>
                </section>
              </>
            );

          default:
            return <>LOADINGG</>;
        }
      })()}
    </form>
  );
}
