"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CalendarCheck,
  CheckCircle2,
  ListChecks,
  RefreshCw,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type CalendarOption = {
  id: string;
  summary: string;
  primary: boolean;
  timeZone: string | null;
  accessRole: string | null;
};

type DeadlineOption = {
  id: string;
  title: string | null;
  due_date: string | null;
  due_time: string | null;
};

type ScheduleOption = {
  id: string;
  location: string | null;
  start_time: string | null;
  end_time: string | null;
  meeting_days: unknown;
};

type ClassDetails = {
  id: string;
  title: string;
  overview: string | null;
  startDate: string | null;
  endDate: string | null;
};

type CalendarListResponse = {
  calendars?: CalendarOption[];
  error?: string;
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
  if (!value) return "Time TBA";

  const [hour, minute] = value.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return value;

  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2000, 0, 1, hour, minute));
}

function formatMeetingDays(value: unknown) {
  const days = Array.isArray(value)
    ? value
        .map((day) => (typeof day === "string" ? dayLabels[day] || day : ""))
        .filter(Boolean)
    : [];

  return days.length ? days.join(", ") : "Days TBA";
}

function toMeetingDayArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((day): day is string => typeof day === "string")
    : [];
}

function toIsoDateTime(date: string, time: string) {
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  return `${date}T${normalizedTime}`;
}

function toRRuleUntil(date: string) {
  return `${date.replaceAll("-", "")}T235959Z`;
}

function findFirstMeetingDate(startDate: string, meetingDays: string[]) {
  const weekdayIndexes: Record<string, number> = {
    SU: 0,
    MO: 1,
    TU: 2,
    WE: 3,
    TH: 4,
    FR: 5,
    SA: 6,
  };
  const start = new Date(`${startDate}T00:00:00`);
  const targetIndexes = meetingDays
    .map((day) => weekdayIndexes[day])
    .filter((dayIndex): dayIndex is number => dayIndex !== undefined);

  if (!targetIndexes.length) return startDate;

  const daysToAdd = targetIndexes
    .map((targetIndex) => (targetIndex - start.getDay() + 7) % 7)
    .sort((a, b) => a - b)[0];

  start.setDate(start.getDate() + daysToAdd);

  const year = start.getFullYear();
  const month = String(start.getMonth() + 1).padStart(2, "0");
  const day = String(start.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function ToggleRow({
  id,
  title,
  description,
  checked,
  onChange,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-4 transition-all hover:border-neutral-300"
    >
      <span className="flex flex-col gap-1">
        <span className="font-bold tracking-tight text-neutral-700">
          {title}
        </span>
        <span className="text-sm leading-5 text-neutral-400">
          {description}
        </span>
      </span>
      <input
        id={id}
        type="checkbox"
        className="size-5 shrink-0 accent-blue-500"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

function OptionCheckbox({
  id,
  title,
  detail,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  title: string;
  detail: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-2xl bg-white p-3 transition-all",
        disabled ? "opacity-60" : "hover:bg-neutral-100",
      )}
    >
      <input
        id={id}
        type="checkbox"
        className="mt-1 size-4 shrink-0 accent-blue-500"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-neutral-700">
          {title}
        </span>
        <span className="block text-sm leading-5 text-neutral-400">
          {detail}
        </span>
      </span>
    </label>
  );
}

export default function CalendarSyncForm({
  classDetails,
  deadlines,
  schedules,
}: {
  classDetails: ClassDetails;
  deadlines: DeadlineOption[];
  schedules: ScheduleOption[];
}) {
  const [calendars, setCalendars] = useState<CalendarOption[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState("");
  const [calendarError, setCalendarError] = useState("");
  const [isLoadingCalendars, setIsLoadingCalendars] = useState(true);
  const [syncAllDeadlines, setSyncAllDeadlines] = useState(true);
  const [syncAllSchedules, setSyncAllSchedules] = useState(true);
  const [selectedDeadlineIds, setSelectedDeadlineIds] = useState<string[]>(() =>
    deadlines.map((deadline) => deadline.id),
  );
  const [selectedScheduleIds, setSelectedScheduleIds] = useState<string[]>(() =>
    schedules.map((schedule) => schedule.id),
  );
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchCalendars() {
      setIsLoadingCalendars(true);
      setCalendarError("");

      try {
        const response = await fetch("/api/google/calendars");
        const data = (await response.json()) as CalendarListResponse;

        if (!response.ok) {
          throw new Error(data.error || "Failed to load calendars");
        }

        const calendarOptions = data.calendars || [];

        if (!isMounted) return;

        setCalendars(calendarOptions);
        setSelectedCalendarId(
          calendarOptions.find((calendar) => calendar.primary)?.id ||
            calendarOptions[0]?.id ||
            "",
        );
      } catch (error) {
        if (!isMounted) return;

        const message =
          error instanceof Error ? error.message : "Failed to load calendars";
        setCalendarError(message);
        toast.error("Unable to load Google calendars", {
          description: message,
        });
      } finally {
        if (isMounted) {
          setIsLoadingCalendars(false);
        }
      }
    }

    fetchCalendars();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedCalendar = calendars.find(
    (calendar) => calendar.id === selectedCalendarId,
  );
  const selectedItemCount = useMemo(
    () => selectedDeadlineIds.length + selectedScheduleIds.length,
    [selectedDeadlineIds.length, selectedScheduleIds.length],
  );

  function updateDeadlineSelection(id: string, checked: boolean) {
    setSyncAllDeadlines(false);
    setSelectedDeadlineIds((current) =>
      checked ? [...current, id] : current.filter((itemId) => itemId !== id),
    );
  }

  function updateScheduleSelection(id: string, checked: boolean) {
    setSyncAllSchedules(false);
    setSelectedScheduleIds((current) =>
      checked ? [...current, id] : current.filter((itemId) => itemId !== id),
    );
  }

  function toggleAllDeadlines(checked: boolean) {
    setSyncAllDeadlines(checked);
    setSelectedDeadlineIds(
      checked ? deadlines.map((deadline) => deadline.id) : [],
    );
  }

  function toggleAllSchedules(checked: boolean) {
    setSyncAllSchedules(checked);
    setSelectedScheduleIds(
      checked ? schedules.map((schedule) => schedule.id) : [],
    );
  }

  async function handlePrepareSync() {
    if (!selectedCalendar) {
      toast.error("Choose a Google Calendar before syncing.");
      return;
    }

    if (selectedItemCount === 0) {
      toast.error("Choose at least one deadline or meeting to sync.");
      return;
    }

    const selectedDeadlines = deadlines.filter((deadline) =>
      selectedDeadlineIds.includes(deadline.id),
    );
    const selectedSchedules = schedules.filter((schedule) =>
      selectedScheduleIds.includes(schedule.id),
    );
    const timezone = selectedCalendar.timeZone;
    const deadlineEvents = selectedDeadlines
      .filter((deadline) => deadline.due_date)
      .map((deadline) => {
        const dueDate = deadline.due_date as string;
        const title = `${classDetails.title}: ${deadline.title || "Deadline"}`;
        const description = [
          `Class: ${classDetails.title}`,
          classDetails.overview ? `Overview: ${classDetails.overview}` : "",
          `Deadline source ID: ${deadline.id}`,
        ]
          .filter(Boolean)
          .join("\n");

        if (!deadline.due_time) {
          return {
            source_id: deadline.id,
            tool: "create_all_day_event",
            params: {
              calendarId: selectedCalendar.id,
              title,
              description,
              date: dueDate,
              timezone,
            },
          };
        }

        const startDateTime = toIsoDateTime(dueDate, deadline.due_time);

        return {
          source_id: deadline.id,
          tool: "create_event",
          params: {
            calendarId: selectedCalendar.id,
            title,
            description,
            start_datetime: startDateTime,
            end_datetime: startDateTime,
            timezone,
          },
        };
      });

    const scheduleEvents = selectedSchedules
      .filter(
        (schedule) =>
          classDetails.startDate &&
          schedule.start_time &&
          schedule.end_time &&
          toMeetingDayArray(schedule.meeting_days).length > 0,
      )
      .map((schedule) => {
        const meetingDays = toMeetingDayArray(schedule.meeting_days);
        const firstMeetingDate = findFirstMeetingDate(
          classDetails.startDate as string,
          meetingDays,
        );

        return {
          source_id: schedule.id,
          tool: "create_recurring_event",
          params: {
            calendarId: selectedCalendar.id,
            title: classDetails.title,
            description: [
              `Class: ${classDetails.title}`,
              classDetails.overview ? `Overview: ${classDetails.overview}` : "",
              schedule.location ? `Location: ${schedule.location}` : "",
              `Schedule source ID: ${schedule.id}`,
            ]
              .filter(Boolean)
              .join("\n"),
            start_datetime: toIsoDateTime(
              firstMeetingDate,
              schedule.start_time as string,
            ),
            end_datetime: toIsoDateTime(
              firstMeetingDate,
              schedule.end_time as string,
            ),
            timezone,
            frequency: "WEEKLY",
            by_days: meetingDays,
            ...(classDetails.endDate
              ? { until: toRRuleUntil(classDetails.endDate) }
              : {}),
          },
        };
      });

    const skippedItems = [
      selectedDeadlines.length - deadlineEvents.length,
      selectedSchedules.length - scheduleEvents.length,
    ].reduce((total, count) => total + count, 0);

    if (!deadlineEvents.length && !scheduleEvents.length) {
      toast.error("Selected items are missing required date or time details.");
      return;
    }

    const agentPrompt = `
You are syncing a class to Google Calendar. The payload below contains preferred tool-ready params, but you may use any available calendar tools needed to safely complete the sync.

Class context:
${JSON.stringify(
  {
    id: classDetails.id,
    title: classDetails.title,
    overview: classDetails.overview,
    startDate: classDetails.startDate,
    endDate: classDetails.endDate,
  },
  null,
  2,
)}

Selected calendar:
${JSON.stringify(
  {
    id: selectedCalendar.id,
    summary: selectedCalendar.summary,
    timeZone: timezone,
  },
  null,
  2,
)}

Skipped selected items:
${skippedItems}

Tasks:
1. Before creating any event, first check the selected calendar to determine whether that event already exists. Use search_events or list_events with the selected calendar ID and the event title/date range.
2. Treat an event as already existing if it has the same source ID in its description. If no source ID match exists, treat the same calendar + same title + same start date/time/date as already existing.
3. If an event already exists, do not create it.
4. For every non-existing item in deadline_events, call the tool named by that item's tool field with its params object. Use create_all_day_event for all-day deadlines and create_event for timed deadlines.
5. For every non-existing item in schedule_events, call create_recurring_event with its params object.
6. The schedule_events params already use RFC 5545 UTC UNTIL values in YYYYMMDDT235959Z format. Do not rewrite them.
7. Do not call create tools for skipped, invalid, or already-existing items.
8. Return a concise summary including how many events were created, how many were skipped because they already existed, and any tool failures.

deadline_events:
${JSON.stringify(deadlineEvents, null, 2)}

schedule_events:
${JSON.stringify(scheduleEvents, null, 2)}
`.trim();

    setIsSyncing(true);

    console.log("Agent Prompt:", agentPrompt);

    // try {
    //   const response = await fetch("/api/ai/agent/googleCalendar", {
    //     method: "POST",
    //     headers: { "content-type": "application/json" },
    //     body: JSON.stringify({ body: agentPrompt }),
    //   });
    //   const data = await response.json();

    //   if (!response.ok) {
    //     throw new Error(data.error || "Failed to prepare calendar sync");
    //   }

    //   toast.success("Calendar sync completed", {
    //     description: skippedItems
    //       ? `${skippedItems} selected item(s) were skipped because required date or time data was missing.`
    //       : undefined,
    //   });
    // } catch (error) {
    //   toast.error("Calendar sync failed", {
    //     description:
    //       error instanceof Error ? error.message : "Unexpected sync error",
    //   });
    // } finally {
    //   setIsSyncing(false);
    // }
  }

  return (
    <main className="mx-auto mt-17 flex max-w-320 flex-col gap-6 p-4 sm:p-6">
      {isSyncing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 p-6 backdrop-blur-sm">
          <section
            className="flex max-w-sm flex-col items-center gap-4 rounded-[2rem] border border-neutral-200 bg-white p-8 text-center shadow-lg"
            aria-live="polite"
            aria-busy="true"
          >
            <div
              role="status"
              className="size-10 animate-spin rounded-full border-4 border-neutral-100 border-t-blue-500"
            >
              <span className="sr-only">Syncing with Google Calendar...</span>
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-black tracking-tight text-neutral-700">
                Preparing your calendar
              </h2>
              <p className="text-sm leading-6 text-neutral-500">
                The AI agent is creating selected deadlines and meetings in
                Google Calendar.
              </p>
            </div>
          </section>
        </div>
      ) : null}
      <header className="rounded-[2rem] border border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-stone-100 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-3xl flex-col gap-3">
            <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400 shadow-sm">
              Calendar Sync
            </span>
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-black tracking-tight text-neutral-700 sm:text-4xl">
                Sync {classDetails.title}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-neutral-500">
                Choose the Google Calendar destination and decide which
                deadlines and recurring class meetings should be prepared for
                sync.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-3xl bg-white/80 p-2 shadow-sm">
            <div className="rounded-2xl bg-neutral-50 p-3">
              <p className="text-xl font-black text-neutral-700">
                {calendars.length}
              </p>
              <p className="text-xs text-neutral-400">calendars</p>
            </div>
            <div className="rounded-2xl bg-neutral-50 p-3">
              <p className="text-xl font-black text-neutral-700">
                {selectedDeadlineIds.length}
              </p>
              <p className="text-xs text-neutral-400">deadlines</p>
            </div>
            <div className="rounded-2xl bg-neutral-50 p-3">
              <p className="text-xl font-black text-neutral-700">
                {selectedScheduleIds.length}
              </p>
              <p className="text-xs text-neutral-400">meetings</p>
            </div>
          </div>
        </div>
      </header>

      <form className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]">
        <section className="flex flex-col gap-6">
          <div className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <CalendarCheck />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-neutral-700">
                  Calendar destination
                </h2>
                <p className="text-sm leading-6 text-neutral-400">
                  Select one of the calendars available to your Google account.
                </p>
              </div>
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-neutral-500">
                Google Calendar
              </span>
              <select
                className="h-11 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-medium text-neutral-700 outline-none transition-all focus:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-60"
                value={selectedCalendarId}
                disabled={isLoadingCalendars || Boolean(calendarError)}
                onChange={(event) => setSelectedCalendarId(event.target.value)}
              >
                {isLoadingCalendars ? (
                  <option>Loading calendars...</option>
                ) : calendars.length ? (
                  calendars.map((calendar) => (
                    <option key={calendar.id} value={calendar.id}>
                      {calendar.summary}
                      {calendar.primary ? " (Primary)" : ""}
                    </option>
                  ))
                ) : (
                  <option>No calendars found</option>
                )}
              </select>
            </label>

            {calendarError ? (
              <p className="mt-3 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">
                {calendarError}
              </p>
            ) : null}
          </div>

          <div className="rounded-[2rem] border border-neutral-200 bg-neutral-50/70 p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-neutral-600">
                <ListChecks />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-neutral-700">
                  Items to sync
                </h2>
                <p className="text-sm leading-6 text-neutral-400">
                  Pick individual deadlines and meetings, or use the bulk
                  toggles.
                </p>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <section className="flex flex-col gap-3">
                <ToggleRow
                  id="sync-all-deadlines"
                  title="Sync all deadlines"
                  description="Automatically include every class deadline."
                  checked={syncAllDeadlines}
                  onChange={toggleAllDeadlines}
                />

                <div className="max-h-96 overflow-auto rounded-3xl bg-white/60 p-2">
                  {deadlines.length ? (
                    <div className="flex flex-col gap-2">
                      {deadlines.map((deadline) => (
                        <OptionCheckbox
                          key={deadline.id}
                          id={`deadline-${deadline.id}`}
                          title={deadline.title || "Untitled deadline"}
                          detail={`${formatDate(deadline.due_date)} / ${formatTime(deadline.due_time)}`}
                          checked={selectedDeadlineIds.includes(deadline.id)}
                          disabled={syncAllDeadlines}
                          onChange={(checked) =>
                            updateDeadlineSelection(deadline.id, checked)
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="p-4 text-sm text-neutral-400">
                      No class deadlines were found.
                    </p>
                  )}
                </div>
              </section>

              <section className="flex flex-col gap-3">
                <ToggleRow
                  id="sync-all-schedules"
                  title="Sync all class meetings"
                  description="Automatically include every recurring meeting."
                  checked={syncAllSchedules}
                  onChange={toggleAllSchedules}
                />

                <div className="max-h-96 overflow-auto rounded-3xl bg-white/60 p-2">
                  {schedules.length ? (
                    <div className="flex flex-col gap-2">
                      {schedules.map((schedule) => (
                        <OptionCheckbox
                          key={schedule.id}
                          id={`schedule-${schedule.id}`}
                          title={formatMeetingDays(schedule.meeting_days)}
                          detail={`${formatTime(schedule.start_time)} - ${formatTime(schedule.end_time)} / ${schedule.location || "Location TBA"}`}
                          checked={selectedScheduleIds.includes(schedule.id)}
                          disabled={syncAllSchedules}
                          onChange={(checked) =>
                            updateScheduleSelection(schedule.id, checked)
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="p-4 text-sm text-neutral-400">
                      No class meetings were found.
                    </p>
                  )}
                </div>
              </section>
            </div>
          </div>
        </section>

        <aside className="h-fit rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-22">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-neutral-700">
                Sync summary
              </h2>
              <p className="text-sm leading-6 text-neutral-400">
                Review your current selections before starting sync.
              </p>
            </div>
          </div>

          <dl className="flex flex-col gap-4 text-sm">
            <div className="rounded-2xl bg-neutral-50 p-4">
              <dt className="font-semibold text-neutral-400">Calendar</dt>
              <dd className="mt-1 font-bold text-neutral-700">
                {selectedCalendar?.summary || "No calendar selected"}
              </dd>
              {selectedCalendar?.timeZone ? (
                <dd className="mt-1 text-neutral-400">
                  {selectedCalendar.timeZone}
                </dd>
              ) : null}
            </div>
            <div className="rounded-2xl bg-neutral-50 p-4">
              <dt className="font-semibold text-neutral-400">Selected items</dt>
              <dd className="mt-1 font-bold text-neutral-700">
                {selectedItemCount} total
              </dd>
              <dd className="mt-1 text-neutral-400">
                {selectedDeadlineIds.length} deadlines /{" "}
                {selectedScheduleIds.length} meetings
              </dd>
            </div>
          </dl>

          <Button
            type="button"
            className="mt-5 w-full"
            disabled={
              !selectedCalendarId || selectedItemCount === 0 || isSyncing
            }
            onClick={handlePrepareSync}
          >
            <RefreshCw data-icon="inline-start" />
            Prepare Sync
          </Button>
        </aside>
      </form>
    </main>
  );
}
