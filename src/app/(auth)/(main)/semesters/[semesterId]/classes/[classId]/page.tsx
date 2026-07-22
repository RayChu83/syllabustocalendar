import BackButton from "@/components/ui/BackButton";
import { serverClient } from "@/lib/supabase/server";
import {
  ArrowLeft,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  NotebookText,
  Percent,
  UserRound,
} from "lucide-react";
import Link from "next/link";

type JsonRecord = Record<string, unknown>;

type Deadline = {
  id: string;
  title: string | null;
  due_date: string | null;
  due_time: string | null;
  created_at: string | null;
};

type ScheduleItem = {
  id: string;
  location: string | null;
  start_time: string | null;
  end_time: string | null;
  meeting_days: unknown;
  additional_notes: unknown;
};

type Instructor = {
  id: string;
  name: string | null;
  email: unknown;
  role: string | null;
  office_hours: unknown;
};

const dayLabels: Record<string, string> = {
  MO: "Mon",
  TU: "Tue",
  WE: "Wed",
  TH: "Thu",
  FR: "Fri",
  SA: "Sat",
  SU: "Sun",
};

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

function formatDate(value: string | null) {
  if (!value) return "Date TBA";

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function formatTime(value: string | null) {
  if (!value) return "";

  const [hour, minute] = value.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return value;

  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2000, 0, 1, hour, minute));
}

function formatDateRange(startDate: string | null, endDate: string | null) {
  if (!startDate && !endDate) return "Term dates TBA";
  if (!startDate) return `Ends ${formatDate(endDate)}`;
  if (!endDate) return `Starts ${formatDate(startDate)}`;
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

function formatMeetingDays(value: unknown) {
  const days = asArray(value)
    .map((day) => (typeof day === "string" ? dayLabels[day] || day : ""))
    .filter(Boolean);

  return days.length ? days.join(", ") : "Days TBA";
}

function formatNotes(value: unknown) {
  return asArray(value)
    .map((note) => {
      if (typeof note === "string") return note;

      const record = asRecord(note);
      const title = typeof record.title === "string" ? record.title : "";
      const description =
        typeof record.description === "string" ? record.description : "";

      return [title, description].filter(Boolean).join(": ");
    })
    .filter(Boolean);
}

function getEmailList(value: unknown) {
  return asArray(value).filter(
    (email): email is string => typeof email === "string" && email.length > 0,
  );
}

function getOfficeHours(value: unknown) {
  return asArray(value).map((item) => asRecord(item));
}

function getUrgency(dueDate: string | null) {
  if (!dueDate)
    return { label: "Unscheduled", tone: "bg-neutral-100 text-neutral-500" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [year, month, day] = dueDate.split("-").map(Number);
  const due = new Date(year, month - 1, day);
  const diffDays = Math.ceil(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0)
    return { label: "Past due", tone: "bg-rose-50 text-rose-700" };
  if (diffDays === 0)
    return { label: "Due today", tone: "bg-amber-50 text-amber-700" };
  if (diffDays <= 7)
    return { label: `${diffDays} days`, tone: "bg-amber-50 text-amber-700" };
  return { label: `${diffDays} days`, tone: "bg-emerald-50 text-emerald-700" };
}

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
        {eyebrow}
      </p>
      <h2 className="text-xl font-black tracking-tight text-neutral-700">
        {title}
      </h2>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof CheckCircle2;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-36 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-neutral-200 bg-white/70 p-8 text-center">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
        <Icon />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-semibold tracking-tight text-neutral-600">{title}</p>
        <p className="max-w-md text-sm leading-6 text-neutral-400">
          {description}
        </p>
      </div>
    </div>
  );
}

export default async function Class({
  params,
}: {
  params: Promise<{ semesterId: string; classId: string }>;
}) {
  const { semesterId, classId } = await params;

  const supabase = await serverClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    throw Error("Failed to retrieve user profile");
  }

  const { data: semesterData, error: semesterError } = await supabase
    .from("semesters")
    .select("id,title,grade,semester,profile")
    .eq("id", semesterId)
    .eq("profile", user.id)
    .single();

  if (!semesterData || semesterError) {
    throw Error("Failed to retrieve semester details");
  }

  const { data: classData, error: classError } = await supabase
    .from("classes")
    .select(
      "id,title,overview,materials,grading,other,start_date,end_date,created_at,semester_id,syllabus_id",
    )
    .eq("id", classId)
    .eq("semester_id", semesterId)
    .single();

  if (!classData || classError) {
    throw Error("Failed to retrieve class details");
  }

  const [
    { data: deadlinesData, error: deadlinesError },
    { data: scheduleData, error: scheduleError },
    { data: instructorsData, error: instructorsError },
    { data: syllabusData, error: syllabusError },
  ] = await Promise.all([
    supabase
      .from("deadlines")
      .select("id,title,due_date,due_time,created_at")
      .eq("class_id", classId)
      .order("due_date", { ascending: true }),
    supabase
      .from("schedule")
      .select("id,location,start_time,end_time,meeting_days,additional_notes")
      .eq("class_id", classId)
      .order("start_time", { ascending: true }),
    supabase
      .from("instructors")
      .select("id,name,email,role,office_hours")
      .eq("class_id", classId)
      .order("created_at", { ascending: true }),
    classData.syllabus_id
      ? supabase
          .from("syllabus")
          .select("id,created_at,file_hash,key")
          .eq("id", classData.syllabus_id)
          .single()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (deadlinesError) throw Error(deadlinesError.message);
  if (scheduleError) throw Error(scheduleError.message);
  if (instructorsError) throw Error(instructorsError.message);
  if (syllabusError) throw Error(syllabusError.message);

  const deadlines = (deadlinesData || []) as Deadline[];
  const schedule = (scheduleData || []) as ScheduleItem[];
  const instructors = (instructorsData || []) as Instructor[];
  const materials = asArray(classData.materials).filter(
    (material): material is string => typeof material === "string",
  );
  const grading = asArray(classData.grading).map((item) => asRecord(item));
  const other = asArray(classData.other).map((item) => asRecord(item));
  const nextDeadline = deadlines.find((deadline) => {
    if (!deadline.due_date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [year, month, day] = deadline.due_date.split("-").map(Number);
    return new Date(year, month - 1, day) >= today;
  });

  return (
    <main className="mx-auto mt-13 flex max-w-320 flex-col gap-8 p-4 sm:p-6">
      <header className="flex flex-col gap-4">
        <BackButton
          href={`/semesters`}
          as="link"
          text="Back to semesters"
          cn="mb-4"
        />
        <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-stone-100 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex max-w-4xl flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400 shadow-sm">
                  Class Dashboard
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {formatDateRange(classData.start_date, classData.end_date)}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <h1 className="text-4xl font-black tracking-tight text-neutral-700 sm:text-5xl">
                  {classData.title}
                </h1>
                {classData.overview ? (
                  <p className="max-w-3xl text-base leading-7 text-neutral-500">
                    {classData.overview}
                  </p>
                ) : (
                  <p className="text-base text-neutral-400">
                    No course overview was found in the syllabus data.
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-110">
              <div className="rounded-3xl bg-white/80 p-4 shadow-sm">
                <p className="text-2xl font-black tracking-tight text-neutral-700">
                  {deadlines.length}
                </p>
                <p className="text-xs font-medium text-neutral-400">
                  deadlines
                </p>
              </div>
              <div className="rounded-3xl bg-white/80 p-4 shadow-sm">
                <p className="text-2xl font-black tracking-tight text-neutral-700">
                  {schedule.length}
                </p>
                <p className="text-xs font-medium text-neutral-400">meetings</p>
              </div>
              <div className="rounded-3xl bg-white/80 p-4 shadow-sm">
                <p className="text-2xl font-black tracking-tight text-neutral-700">
                  {instructors.length}
                </p>
                <p className="text-xs font-medium text-neutral-400">
                  instructors
                </p>
              </div>
              <div className="rounded-3xl bg-white/80 p-4 shadow-sm">
                <p className="truncate text-2xl font-black tracking-tight text-neutral-700">
                  {nextDeadline ? formatDate(nextDeadline.due_date) : "Clear"}
                </p>
                <p className="text-xs font-medium text-neutral-400">next due</p>
              </div>
            </div>
          </div>
        </section>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]">
        <section className="flex flex-col gap-6">
          <div className="rounded-[2rem] border border-neutral-200 bg-neutral-50/70 p-5 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <SectionHeading
                eyebrow="Priority"
                title="Upcoming assignments and tasks"
              />
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-500 shadow-sm">
                {deadlines.length} total
              </span>
            </div>

            {deadlines.length ? (
              <div className="grid gap-3">
                {deadlines.map((deadline) => {
                  const urgency = getUrgency(deadline.due_date);

                  return (
                    <article
                      key={deadline.id}
                      className="grid gap-4 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:grid-cols-[1fr_auto]"
                    >
                      <div className="flex gap-4">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                          <CalendarClock />
                        </div>
                        <div className="flex min-w-0 flex-col gap-1">
                          <h3 className="truncate text-base font-bold tracking-tight text-neutral-700">
                            {deadline.title || "Untitled deadline"}
                          </h3>
                          <p className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
                            <span>{formatDate(deadline.due_date)}</span>
                            {deadline.due_time ? (
                              <>
                                <span className="text-neutral-300">/</span>
                                <span>{formatTime(deadline.due_time)}</span>
                              </>
                            ) : null}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start sm:justify-end">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${urgency.tone}`}
                        >
                          {urgency.label}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={CheckCircle2}
                title="No deadlines yet"
                description="Assignments and due dates parsed from the syllabus will appear here when they exist."
              />
            )}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
              <SectionHeading eyebrow="Status" title="Course summary" />
              <div className="mt-5 grid gap-3">
                <div className="flex items-center gap-3 rounded-3xl bg-neutral-50 p-4">
                  <BookOpen className="text-neutral-500" />
                  <div>
                    <p className="text-sm font-semibold text-neutral-700">
                      {semesterData.title}
                    </p>
                    <p className="text-sm text-neutral-400">
                      {semesterData.grade || "Grade not set"} /{" "}
                      {semesterData.semester || "Term label not set"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-3xl bg-neutral-50 p-4">
                  <Clock3 className="text-neutral-500" />
                  <div>
                    <p className="text-sm font-semibold text-neutral-700">
                      {formatDateRange(
                        classData.start_date,
                        classData.end_date,
                      )}
                    </p>
                    <p className="text-sm text-neutral-400">Course timeline</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-3xl bg-neutral-50 p-4">
                  <NotebookText className="text-neutral-500" />
                  <div>
                    <p className="text-sm font-semibold text-neutral-700">
                      {syllabusData ? "Syllabus connected" : "No syllabus link"}
                    </p>
                    <p className="text-sm text-neutral-400">
                      {syllabusData?.key || "Source file path unavailable"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
              <SectionHeading eyebrow="Meetings" title="Class schedule" />
              <div className="mt-5 flex flex-col gap-3">
                {schedule.length ? (
                  schedule.map((meeting) => {
                    const notes = formatNotes(meeting.additional_notes);

                    return (
                      <article
                        key={meeting.id}
                        className="rounded-3xl bg-neutral-50 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white text-neutral-500">
                            <CalendarClock />
                          </div>
                          <div className="flex min-w-0 flex-col gap-2">
                            <p className="font-semibold tracking-tight text-neutral-700">
                              {formatMeetingDays(meeting.meeting_days)}
                            </p>
                            <p className="text-sm text-neutral-500">
                              {formatTime(meeting.start_time)}
                              {meeting.end_time
                                ? ` - ${formatTime(meeting.end_time)}`
                                : ""}
                            </p>
                            <p className="flex items-center gap-2 text-sm text-neutral-400">
                              <MapPin />{" "}
                              <span>{meeting.location || "Location TBA"}</span>
                            </p>
                            {notes.length ? (
                              <ul className="flex flex-col gap-1 text-sm text-neutral-500">
                                {notes.map((note) => (
                                  <li key={note}>{note}</li>
                                ))}
                              </ul>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <EmptyState
                    icon={CalendarClock}
                    title="No meetings found"
                    description="Class meeting times from the syllabus will appear here."
                  />
                )}
              </div>
            </section>
          </div>

          <section className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
            <SectionHeading eyebrow="Evaluation" title="Grading breakdown" />
            {grading.length ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {grading.map((item, index) => (
                  <article
                    key={index}
                    className="rounded-3xl bg-neutral-50 p-5"
                  >
                    <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-white text-neutral-500">
                      <Percent />
                    </div>
                    <p className="text-3xl font-black tracking-tight text-neutral-700">
                      {typeof item.weight === "number"
                        ? `${item.weight}%`
                        : "Weight TBA"}
                    </p>
                    <p className="mt-1 text-sm font-medium text-neutral-500">
                      {typeof item.type === "string" ? item.type : "Grade item"}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-5">
                <EmptyState
                  icon={Percent}
                  title="No grading policy found"
                  description="Weights and grading categories will appear here after they are extracted."
                />
              </div>
            )}
          </section>
        </section>

        <aside className="flex flex-col gap-6">
          <section className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
            <SectionHeading eyebrow="People" title="Instructor details" />
            <div className="mt-5 flex flex-col gap-3">
              {instructors.length ? (
                instructors.map((instructor) => {
                  const emails = getEmailList(instructor.email);
                  const officeHours = getOfficeHours(instructor.office_hours);

                  return (
                    <article
                      key={instructor.id}
                      className="rounded-3xl bg-neutral-50 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-neutral-500">
                          <UserRound />
                        </div>
                        <div className="flex min-w-0 flex-col gap-3">
                          <div>
                            <h3 className="font-bold tracking-tight text-neutral-700">
                              {instructor.name || "Instructor TBA"}
                            </h3>
                            <p className="text-sm text-neutral-400">
                              {instructor.role || "Role not listed"}
                            </p>
                          </div>

                          {emails.length ? (
                            <div className="flex flex-col gap-1">
                              {emails.map((email) => (
                                <a
                                  key={email}
                                  href={`mailto:${email}`}
                                  className="flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-700"
                                >
                                  <Mail />{" "}
                                  <span className="truncate">{email}</span>
                                </a>
                              ))}
                            </div>
                          ) : null}

                          {officeHours.length ? (
                            <div className="flex flex-col gap-2">
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                                Office hours
                              </p>
                              {officeHours.map((officeHour, index) => (
                                <div
                                  key={index}
                                  className="rounded-2xl bg-white p-3 text-sm text-neutral-500"
                                >
                                  <p className="font-semibold text-neutral-600">
                                    {formatMeetingDays(officeHour.meetingDays)}
                                  </p>
                                  <p>
                                    {formatTime(
                                      typeof officeHour.startTime === "string"
                                        ? officeHour.startTime
                                        : null,
                                    )}
                                    {typeof officeHour.endTime === "string"
                                      ? ` - ${formatTime(officeHour.endTime)}`
                                      : ""}
                                  </p>
                                  <p>
                                    {typeof officeHour.location === "string"
                                      ? officeHour.location
                                      : "Location TBA"}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <EmptyState
                  icon={UserRound}
                  title="No instructor listed"
                  description="Instructor records connected to this class will appear here."
                />
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
            <SectionHeading eyebrow="Resources" title="Materials" />
            {materials.length ? (
              <ul className="mt-5 flex flex-col gap-2">
                {materials.map((material) => (
                  <li
                    key={material}
                    className="flex gap-3 rounded-2xl bg-neutral-50 p-3 text-sm text-neutral-600"
                  >
                    <BookOpen className="shrink-0 text-neutral-400" />
                    <span>{material}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-5">
                <EmptyState
                  icon={BookOpen}
                  title="No materials found"
                  description="Books, tools, and required resources will appear here."
                />
              </div>
            )}
          </section>

          <section className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
            <SectionHeading
              eyebrow="Notes"
              title="Additional syllabus details"
            />
            {other.length ? (
              <div className="mt-5 flex flex-col gap-3">
                {other.map((item, index) => (
                  <article
                    key={index}
                    className="rounded-3xl bg-neutral-50 p-4"
                  >
                    <div className="mb-3 flex size-10 items-center justify-center rounded-2xl bg-white text-neutral-500">
                      <FileText />
                    </div>
                    <h3 className="font-bold tracking-tight text-neutral-700">
                      {typeof item.title === "string"
                        ? item.title
                        : "Syllabus note"}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-neutral-500">
                      {typeof item.description === "string"
                        ? item.description
                        : "No description provided."}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-5">
                <EmptyState
                  icon={GraduationCap}
                  title="No extra details"
                  description="Policies and additional syllabus notes will appear here."
                />
              </div>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}
