"use client";

import { SyllabusJSON } from "@/constants/types";
import { cn } from "@/lib/utils";
import type React from "react";
import { useState } from "react";
import { IoMdClose } from "react-icons/io";

type DraftSetter = React.Dispatch<React.SetStateAction<SyllabusJSON | null>>;
type ClassData = SyllabusJSON["class"];
type Day = SyllabusJSON["schedule"][number]["meetingDays"][number];
type Note = ClassData["other"][number];

const DAYS: Day[] = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
const REVIEW_SECTIONS = [
  { id: "class-details", label: "Class details" },
  { id: "materials", label: "Materials" },
  { id: "grading", label: "Grading" },
  { id: "instructors", label: "Instructors" },
  { id: "class-schedule", label: "Class schedule" },
  { id: "deadlines", label: "Deadlines" },
  { id: "additional-notes", label: "Additional notes" },
] as const;

type ReviewSectionId = (typeof REVIEW_SECTIONS)[number]["id"];

const emptyNote = (): Note => ({ title: "", description: "" });

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block w-fit text-sm font-medium tracking-tight text-neutral-400"
    >
      {children}
    </label>
  );
}

function TextInput({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  id?: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "date" | "time" | "number" | "email";
}) {
  return (
    <input
      id={id}
      type={type}
      className="w-full rounded-2xl bg-white px-4 py-2 text-neutral-700 outline -outline-offset-1 outline-neutral-200 transition-all placeholder:text-neutral-300 placeholder:italic hover:outline-neutral-300 focus:outline-neutral-400 focus:drop-shadow-xs"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function TextArea({
  id,
  value,
  onChange,
  placeholder,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      id={id}
      className="min-h-24 w-full rounded-2xl bg-white px-4 py-2 text-neutral-700 outline -outline-offset-1 outline-neutral-200 transition-all placeholder:text-neutral-300 placeholder:italic hover:outline-neutral-300 focus:outline-neutral-400 focus:drop-shadow-xs"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function ReviewSection({
  id,
  activeSection,
  title,
  description,
  action,
  children,
}: {
  id: ReviewSectionId;
  activeSection: ReviewSectionId;
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "rounded-3xl border border-neutral-200 bg-neutral-50/70 p-4 sm:p-5",
        id !== activeSection && "lg:hidden",
      )}
    >
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-black tracking-tight text-neutral-700">
            {title}
          </h2>
          <p className="text-sm leading-6 text-neutral-400">{description}</p>
        </div>
        {action}
      </header>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

function AddButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-fit rounded-2xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-600"
    >
      {children}
    </button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-white text-neutral-400 transition-all hover:text-red-500"
      aria-label="Remove item"
    >
      <IoMdClose />
    </button>
  );
}

function DayPicker({
  value,
  onChange,
}: {
  value: Day[];
  onChange: (value: Day[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {DAYS.map((day) => {
        const selected = value.includes(day);

        return (
          <button
            key={day}
            type="button"
            onClick={() =>
              onChange(
                selected
                  ? value.filter((selectedDay) => selectedDay !== day)
                  : [...value, day],
              )
            }
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              selected
                ? "bg-blue-500 text-white"
                : "bg-white text-neutral-400 hover:text-neutral-600"
            }`}
          >
            {day}
          </button>
        );
      })}
    </div>
  );
}

function NotesEditor({
  value,
  onChange,
  emptyText,
}: {
  value: Note[];
  onChange: (value: Note[]) => void;
  emptyText: string;
}) {
  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium tracking-tight text-neutral-400">
          Additional notes
        </p>
        <AddButton onClick={() => onChange([...value, emptyNote()])}>
          Add note
        </AddButton>
      </div>
      {value.length ? (
        value.map((note, noteIndex) => (
          <div key={noteIndex} className="rounded-2xl bg-white p-3">
            <div className="mb-2 flex items-start gap-2">
              <TextInput
                value={note.title}
                onChange={(title) =>
                  onChange(
                    value.map((item, index) =>
                      index === noteIndex ? { ...item, title } : item,
                    ),
                  )
                }
                placeholder="Note title"
              />
              <RemoveButton
                onClick={() =>
                  onChange(value.filter((_, index) => index !== noteIndex))
                }
              />
            </div>
            <TextArea
              value={note.description}
              onChange={(description) =>
                onChange(
                  value.map((item, index) =>
                    index === noteIndex ? { ...item, description } : item,
                  ),
                )
              }
              placeholder="Note description"
            />
          </div>
        ))
      ) : (
        <p className="rounded-2xl bg-white p-3 text-sm text-neutral-400">
          {emptyText}
        </p>
      )}
    </div>
  );
}

export default function ParsedSyllabusReview({
  draft,
  setDraft,
}: {
  draft: SyllabusJSON;
  setDraft: DraftSetter;
}) {
  const [activeSection, setActiveSection] =
    useState<ReviewSectionId>("class-details");

  const updateDraft = (updater: (current: SyllabusJSON) => SyllabusJSON) => {
    setDraft((current) => (current ? updater(current) : current));
  };

  const updateClass = <K extends keyof ClassData>(
    key: K,
    value: ClassData[K],
  ) => {
    updateDraft((current) => ({
      ...current,
      class: { ...current.class, [key]: value },
    }));
  };

  return (
    <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(13rem,3fr)_minmax(0,7fr)] lg:items-start">
      <nav
        className="sticky top-20 hidden rounded-3xl border border-neutral-200 bg-white p-2 lg:flex lg:flex-col lg:gap-1"
        aria-label="Parsed syllabus sections"
      >
        {REVIEW_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActiveSection(section.id)}
            className={cn(
              "rounded-2xl px-4 py-3 text-left text-sm font-semibold tracking-tight transition-all",
              activeSection === section.id
                ? "bg-blue-500 text-white shadow-sm"
                : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700",
            )}
          >
            {section.label}
          </button>
        ))}
      </nav>

      <div className="flex min-w-0 flex-col gap-5">
      <ReviewSection
        id="class-details"
        activeSection={activeSection}
        title="Class details"
        description="Confirm the top-level course information before saving."
      >
        <div>
          <FieldLabel htmlFor="class-title">Class title</FieldLabel>
          <TextInput
            id="class-title"
            value={draft.class.title}
            onChange={(value) => updateClass("title", value)}
            placeholder="Course title"
          />
        </div>
        <div>
          <FieldLabel htmlFor="class-overview">Class overview</FieldLabel>
          <TextArea
            id="class-overview"
            value={draft.class.overview}
            onChange={(value) => updateClass("overview", value)}
            placeholder="A brief course description"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="class-start-date">Start date</FieldLabel>
            <TextInput
              id="class-start-date"
              type="date"
              value={draft.class.startDate}
              onChange={(value) => updateClass("startDate", value)}
            />
          </div>
          <div>
            <FieldLabel htmlFor="class-end-date">End date</FieldLabel>
            <TextInput
              id="class-end-date"
              type="date"
              value={draft.class.endDate}
              onChange={(value) => updateClass("endDate", value)}
            />
          </div>
        </div>
      </ReviewSection>

      <ReviewSection
        id="materials"
        activeSection={activeSection}
        title="Materials"
        description="Books, software, supplies, and other required resources."
        action={
          <AddButton
            onClick={() =>
              updateClass("materials", [...draft.class.materials, ""])
            }
          >
            Add material
          </AddButton>
        }
      >
        {draft.class.materials.length ? (
          draft.class.materials.map((material, index) => (
            <div key={index} className="flex items-start gap-2">
              <TextInput
                value={material}
                onChange={(value) =>
                  updateClass(
                    "materials",
                    draft.class.materials.map((item, itemIndex) =>
                      itemIndex === index ? value : item,
                    ),
                  )
                }
                placeholder="Required material"
              />
              <RemoveButton
                onClick={() =>
                  updateClass(
                    "materials",
                    draft.class.materials.filter(
                      (_, itemIndex) => itemIndex !== index,
                    ),
                  )
                }
              />
            </div>
          ))
        ) : (
          <p className="rounded-2xl bg-white p-4 text-sm text-neutral-400">
            No materials were returned.
          </p>
        )}
      </ReviewSection>

      <ReviewSection
        id="grading"
        activeSection={activeSection}
        title="Grading"
        description="Each grading component and its percentage weight."
        action={
          <AddButton
            onClick={() =>
              updateClass("grading", [
                ...draft.class.grading,
                { type: "", weight: 0 },
              ])
            }
          >
            Add grade item
          </AddButton>
        }
      >
        {draft.class.grading.length ? (
          draft.class.grading.map((item, index) => (
            <div
              key={index}
              className="grid gap-2 rounded-2xl bg-white p-3 sm:grid-cols-[1fr_120px_auto]"
            >
              <TextInput
                value={item.type}
                onChange={(value) =>
                  updateClass(
                    "grading",
                    draft.class.grading.map((grade, gradeIndex) =>
                      gradeIndex === index ? { ...grade, type: value } : grade,
                    ),
                  )
                }
                placeholder="Homework, exam, project"
              />
              <TextInput
                type="number"
                value={item.weight}
                onChange={(value) =>
                  updateClass(
                    "grading",
                    draft.class.grading.map((grade, gradeIndex) =>
                      gradeIndex === index
                        ? { ...grade, weight: Number(value) }
                        : grade,
                    ),
                  )
                }
                placeholder="Weight"
              />
              <RemoveButton
                onClick={() =>
                  updateClass(
                    "grading",
                    draft.class.grading.filter(
                      (_, gradeIndex) => gradeIndex !== index,
                    ),
                  )
                }
              />
            </div>
          ))
        ) : (
          <p className="rounded-2xl bg-white p-4 text-sm text-neutral-400">
            No grading items were returned.
          </p>
        )}
      </ReviewSection>

      <ReviewSection
        id="instructors"
        activeSection={activeSection}
        title="Instructors"
        description="Instructor names, roles, contact emails, and office hours."
        action={
          <AddButton
            onClick={() =>
              updateDraft((current) => ({
                ...current,
                instructors: [
                  ...current.instructors,
                  { name: "", email: [], role: "", officeHours: [] },
                ],
              }))
            }
          >
            Add instructor
          </AddButton>
        }
      >
        {draft.instructors.length ? (
          draft.instructors.map((instructor, instructorIndex) => (
            <article
              key={instructorIndex}
              className="rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <h3 className="font-bold tracking-tight text-neutral-600">
                  Instructor {instructorIndex + 1}
                </h3>
                <RemoveButton
                  onClick={() =>
                    updateDraft((current) => ({
                      ...current,
                      instructors: current.instructors.filter(
                        (_, index) => index !== instructorIndex,
                      ),
                    }))
                  }
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <FieldLabel>Name</FieldLabel>
                  <TextInput
                    value={instructor.name}
                    onChange={(value) =>
                      updateDraft((current) => ({
                        ...current,
                        instructors: current.instructors.map((item, index) =>
                          index === instructorIndex
                            ? { ...item, name: value }
                            : item,
                        ),
                      }))
                    }
                    placeholder="Professor name"
                  />
                </div>
                <div>
                  <FieldLabel>Role</FieldLabel>
                  <TextInput
                    value={instructor.role}
                    onChange={(value) =>
                      updateDraft((current) => ({
                        ...current,
                        instructors: current.instructors.map((item, index) =>
                          index === instructorIndex
                            ? { ...item, role: value }
                            : item,
                        ),
                      }))
                    }
                    placeholder="Professor, TA"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <FieldLabel>Email addresses</FieldLabel>
                  <AddButton
                    onClick={() =>
                      updateDraft((current) => ({
                        ...current,
                        instructors: current.instructors.map((item, index) =>
                          index === instructorIndex
                            ? { ...item, email: [...item.email, ""] }
                            : item,
                        ),
                      }))
                    }
                  >
                    Add email
                  </AddButton>
                </div>
                {instructor.email.length ? (
                  instructor.email.map((email, emailIndex) => (
                    <div key={emailIndex} className="flex gap-2">
                      <TextInput
                        type="email"
                        value={email}
                        onChange={(value) =>
                          updateDraft((current) => ({
                            ...current,
                            instructors: current.instructors.map(
                              (item, index) =>
                                index === instructorIndex
                                  ? {
                                      ...item,
                                      email: item.email.map(
                                        (emailItem, itemIndex) =>
                                          itemIndex === emailIndex
                                            ? value
                                            : emailItem,
                                      ),
                                    }
                                  : item,
                            ),
                          }))
                        }
                        placeholder="name@example.edu"
                      />
                      <RemoveButton
                        onClick={() =>
                          updateDraft((current) => ({
                            ...current,
                            instructors: current.instructors.map(
                              (item, index) =>
                                index === instructorIndex
                                  ? {
                                      ...item,
                                      email: item.email.filter(
                                        (_, itemIndex) =>
                                          itemIndex !== emailIndex,
                                      ),
                                    }
                                  : item,
                            ),
                          }))
                        }
                      />
                    </div>
                  ))
                ) : (
                  <p className="rounded-2xl bg-neutral-50 p-3 text-sm text-neutral-400">
                    No email addresses were returned.
                  </p>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <FieldLabel>Office hours</FieldLabel>
                  <AddButton
                    onClick={() =>
                      updateDraft((current) => ({
                        ...current,
                        instructors: current.instructors.map((item, index) =>
                          index === instructorIndex
                            ? {
                                ...item,
                                officeHours: [
                                  ...item.officeHours,
                                  {
                                    location: "",
                                    startTime: "",
                                    endTime: "",
                                    meetingDays: [],
                                    additionalNotes: [],
                                  },
                                ],
                              }
                            : item,
                        ),
                      }))
                    }
                  >
                    Add office hour
                  </AddButton>
                </div>
                {instructor.officeHours.map((officeHour, officeHourIndex) => (
                  <div
                    key={officeHourIndex}
                    className="rounded-2xl bg-neutral-50 p-3"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <p className="text-sm font-bold text-neutral-500">
                        Office hour {officeHourIndex + 1}
                      </p>
                      <RemoveButton
                        onClick={() =>
                          updateDraft((current) => ({
                            ...current,
                            instructors: current.instructors.map(
                              (item, index) =>
                                index === instructorIndex
                                  ? {
                                      ...item,
                                      officeHours: item.officeHours.filter(
                                        (_, itemIndex) =>
                                          itemIndex !== officeHourIndex,
                                      ),
                                    }
                                  : item,
                            ),
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <TextInput
                        value={officeHour.location}
                        onChange={(value) =>
                          updateDraft((current) => ({
                            ...current,
                            instructors: current.instructors.map(
                              (item, index) =>
                                index === instructorIndex
                                  ? {
                                      ...item,
                                      officeHours: item.officeHours.map(
                                        (hour, itemIndex) =>
                                          itemIndex === officeHourIndex
                                            ? { ...hour, location: value }
                                            : hour,
                                      ),
                                    }
                                  : item,
                            ),
                          }))
                        }
                        placeholder="Location"
                      />
                      <TextInput
                        type="time"
                        value={officeHour.startTime}
                        onChange={(value) =>
                          updateDraft((current) => ({
                            ...current,
                            instructors: current.instructors.map(
                              (item, index) =>
                                index === instructorIndex
                                  ? {
                                      ...item,
                                      officeHours: item.officeHours.map(
                                        (hour, itemIndex) =>
                                          itemIndex === officeHourIndex
                                            ? { ...hour, startTime: value }
                                            : hour,
                                      ),
                                    }
                                  : item,
                            ),
                          }))
                        }
                      />
                      <TextInput
                        type="time"
                        value={officeHour.endTime}
                        onChange={(value) =>
                          updateDraft((current) => ({
                            ...current,
                            instructors: current.instructors.map(
                              (item, index) =>
                                index === instructorIndex
                                  ? {
                                      ...item,
                                      officeHours: item.officeHours.map(
                                        (hour, itemIndex) =>
                                          itemIndex === officeHourIndex
                                            ? { ...hour, endTime: value }
                                            : hour,
                                      ),
                                    }
                                  : item,
                            ),
                          }))
                        }
                      />
                    </div>
                    <div className="mt-3">
                      <DayPicker
                        value={officeHour.meetingDays}
                        onChange={(value) =>
                          updateDraft((current) => ({
                            ...current,
                            instructors: current.instructors.map(
                              (item, index) =>
                                index === instructorIndex
                                  ? {
                                      ...item,
                                      officeHours: item.officeHours.map(
                                        (hour, itemIndex) =>
                                          itemIndex === officeHourIndex
                                            ? { ...hour, meetingDays: value }
                                            : hour,
                                      ),
                                    }
                                  : item,
                            ),
                          }))
                        }
                      />
                    </div>
                    <NotesEditor
                      value={officeHour.additionalNotes}
                      emptyText="No office-hour notes were returned."
                      onChange={(value) =>
                        updateDraft((current) => ({
                          ...current,
                          instructors: current.instructors.map((item, index) =>
                            index === instructorIndex
                              ? {
                                  ...item,
                                  officeHours: item.officeHours.map(
                                    (hour, itemIndex) =>
                                      itemIndex === officeHourIndex
                                        ? {
                                            ...hour,
                                            additionalNotes: value,
                                          }
                                        : hour,
                                  ),
                                }
                              : item,
                          ),
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-2xl bg-white p-4 text-sm text-neutral-400">
            No instructors were returned.
          </p>
        )}
      </ReviewSection>

      <ReviewSection
        id="class-schedule"
        activeSection={activeSection}
        title="Class schedule"
        description="Lecture, lab, discussion, or recurring class meeting times."
        action={
          <AddButton
            onClick={() =>
              updateDraft((current) => ({
                ...current,
                schedule: [
                  ...current.schedule,
                  {
                    location: "",
                    startTime: "",
                    endTime: "",
                    meetingDays: [],
                    additionalNotes: [],
                  },
                ],
              }))
            }
          >
            Add meeting
          </AddButton>
        }
      >
        {draft.schedule.length ? (
          draft.schedule.map((meeting, meetingIndex) => (
            <article key={meetingIndex} className="rounded-2xl bg-white p-4">
              <div className="mb-3 flex items-start justify-between">
                <h3 className="font-bold tracking-tight text-neutral-600">
                  Meeting {meetingIndex + 1}
                </h3>
                <RemoveButton
                  onClick={() =>
                    updateDraft((current) => ({
                      ...current,
                      schedule: current.schedule.filter(
                        (_, index) => index !== meetingIndex,
                      ),
                    }))
                  }
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <TextInput
                  value={meeting.location}
                  onChange={(value) =>
                    updateDraft((current) => ({
                      ...current,
                      schedule: current.schedule.map((item, index) =>
                        index === meetingIndex
                          ? { ...item, location: value }
                          : item,
                      ),
                    }))
                  }
                  placeholder="Location"
                />
                <TextInput
                  type="time"
                  value={meeting.startTime}
                  onChange={(value) =>
                    updateDraft((current) => ({
                      ...current,
                      schedule: current.schedule.map((item, index) =>
                        index === meetingIndex
                          ? { ...item, startTime: value }
                          : item,
                      ),
                    }))
                  }
                />
                <TextInput
                  type="time"
                  value={meeting.endTime}
                  onChange={(value) =>
                    updateDraft((current) => ({
                      ...current,
                      schedule: current.schedule.map((item, index) =>
                        index === meetingIndex
                          ? { ...item, endTime: value }
                          : item,
                      ),
                    }))
                  }
                />
              </div>
              <div className="mt-3">
                <DayPicker
                  value={meeting.meetingDays}
                  onChange={(value) =>
                    updateDraft((current) => ({
                      ...current,
                      schedule: current.schedule.map((item, index) =>
                        index === meetingIndex
                          ? { ...item, meetingDays: value }
                          : item,
                      ),
                    }))
                  }
                />
              </div>
              <NotesEditor
                value={meeting.additionalNotes}
                emptyText="No schedule notes were returned."
                onChange={(value) =>
                  updateDraft((current) => ({
                    ...current,
                    schedule: current.schedule.map((item, index) =>
                      index === meetingIndex
                        ? { ...item, additionalNotes: value }
                        : item,
                    ),
                  }))
                }
              />
            </article>
          ))
        ) : (
          <p className="rounded-2xl bg-white p-4 text-sm text-neutral-400">
            No class meetings were returned.
          </p>
        )}
      </ReviewSection>

      <ReviewSection
        id="deadlines"
        activeSection={activeSection}
        title="Deadlines"
        description="Assignments, exams, projects, readings, and other calendar-ready dates."
        action={
          <AddButton
            onClick={() =>
              updateDraft((current) => ({
                ...current,
                deadlines: [
                  ...current.deadlines,
                  { title: "", dueDate: "", dueTime: "" },
                ],
              }))
            }
          >
            Add deadline
          </AddButton>
        }
      >
        {draft.deadlines.length ? (
          draft.deadlines.map((deadline, deadlineIndex) => (
            <div
              key={deadlineIndex}
              className="grid gap-2 rounded-2xl bg-white p-3 sm:grid-cols-[1fr_160px_130px_auto]"
            >
              <TextInput
                value={deadline.title}
                onChange={(value) =>
                  updateDraft((current) => ({
                    ...current,
                    deadlines: current.deadlines.map((item, index) =>
                      index === deadlineIndex
                        ? { ...item, title: value }
                        : item,
                    ),
                  }))
                }
                placeholder="Deadline title"
              />
              <TextInput
                type="date"
                value={deadline.dueDate}
                onChange={(value) =>
                  updateDraft((current) => ({
                    ...current,
                    deadlines: current.deadlines.map((item, index) =>
                      index === deadlineIndex
                        ? { ...item, dueDate: value }
                        : item,
                    ),
                  }))
                }
              />
              <TextInput
                type="time"
                value={deadline.dueTime || ""}
                onChange={(value) =>
                  updateDraft((current) => ({
                    ...current,
                    deadlines: current.deadlines.map((item, index) =>
                      index === deadlineIndex
                        ? { ...item, dueTime: value }
                        : item,
                    ),
                  }))
                }
              />
              <RemoveButton
                onClick={() =>
                  updateDraft((current) => ({
                    ...current,
                    deadlines: current.deadlines.filter(
                      (_, index) => index !== deadlineIndex,
                    ),
                  }))
                }
              />
            </div>
          ))
        ) : (
          <p className="rounded-2xl bg-white p-4 text-sm text-neutral-400">
            No deadlines were returned.
          </p>
        )}
      </ReviewSection>

      <ReviewSection
        id="additional-notes"
        activeSection={activeSection}
        title="Additional class notes"
        description="Anything important that did not fit the structured fields."
        action={
          <AddButton
            onClick={() =>
              updateClass("other", [...draft.class.other, emptyNote()])
            }
          >
            Add note
          </AddButton>
        }
      >
        {draft.class.other.length ? (
          draft.class.other.map((item, noteIndex) => (
            <article key={noteIndex} className="rounded-2xl bg-white p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <TextInput
                  value={item.title}
                  onChange={(value) =>
                    updateClass(
                      "other",
                      draft.class.other.map((note, index) =>
                        index === noteIndex ? { ...note, title: value } : note,
                      ),
                    )
                  }
                  placeholder="Note title"
                />
                <RemoveButton
                  onClick={() =>
                    updateClass(
                      "other",
                      draft.class.other.filter(
                        (_, index) => index !== noteIndex,
                      ),
                    )
                  }
                />
              </div>
              <TextArea
                value={item.description}
                onChange={(value) =>
                  updateClass(
                    "other",
                    draft.class.other.map((note, index) =>
                      index === noteIndex
                        ? { ...note, description: value }
                        : note,
                    ),
                  )
                }
                placeholder="Note description"
              />
            </article>
          ))
        ) : (
          <p className="rounded-2xl bg-white p-4 text-sm text-neutral-400">
            No additional notes were returned.
          </p>
        )}
      </ReviewSection>
      </div>
    </div>
  );
}
