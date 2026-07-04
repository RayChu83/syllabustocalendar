import { tool } from "langchain";
import { z } from "zod";

export const CALENDAR_BASE_URL = "https://www.googleapis.com/calendar/v3";

const weekdaySchema = z.enum(["MO", "TU", "WE", "TH", "FR", "SA", "SU"]);

function addOneDay(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const nextDate = new Date(Date.UTC(year, month - 1, day + 1));

  return nextDate.toISOString().slice(0, 10);
}

async function calendarJsonRequest<T>(
  path: string,
  init: RequestInit,
  accessToken: string,
): Promise<{ ok: boolean; data: T }> {
  const res = await fetch(`${CALENDAR_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  const data = (await res.json().catch(() => null)) as T;

  return {
    ok: res.ok,
    data,
  };
}

export function makeCalendarTools({ accessToken }: { accessToken: string }) {
  const getEventById = tool(
    async ({ event_id, calendarId }) => {
      const { ok, data: event } = await calendarJsonRequest(
        `/calendars/${calendarId || "primary"}/events/${event_id}`,
        { method: "GET" },
        accessToken,
      );

      return JSON.stringify({
        success: ok,
        event,
      });
    },
    {
      name: "get_event_by_id",
      description: "Retrieves details for a calendar event given its ID.",
      schema: z.object({
        event_id: z.string(),
        calendarId: z
          .string()
          .optional()
          .default("primary")
          .describe("The calendar ID, or 'primary' for the main calendar."),
      }),
    },
  );

  const listEvents = tool(
    async ({ calendarId, start_datetime, end_datetime }) => {
      const params = new URLSearchParams({
        timeMin: start_datetime,
        timeMax: end_datetime,
        singleEvents: "true",
        orderBy: "startTime",
      });

      const { ok, data } = await calendarJsonRequest<{
        items?: Array<{
          id: string;
          summary?: string;
          description?: string;
          status?: string;
          start?: Record<string, unknown>;
          end?: Record<string, unknown>;
        }>;
      }>(
        `/calendars/${calendarId || "primary"}/events?${params.toString()}`,
        { method: "GET" },
        accessToken,
      );

      return JSON.stringify({
        success: ok,
        events: data?.items || [],
      });
    },
    {
      name: "list_events",
      description:
        "Lists calendar events within a specific date/time range. Use this to find candidate events before updating or moving one.",
      schema: z.object({
        calendarId: z
          .string()
          .optional()
          .default("primary")
          .describe("The calendar ID, or 'primary' for the main calendar."),
        start_datetime: z
          .string()
          .describe("Inclusive ISO 8601 start datetime for the search range."),
        end_datetime: z
          .string()
          .describe("Exclusive ISO 8601 end datetime for the search range."),
      }),
    },
  );

  const searchEvents = tool(
    async ({ calendarId, query, start_datetime, end_datetime }) => {
      const params = new URLSearchParams({
        q: query,
        singleEvents: "true",
      });

      if (start_datetime) params.set("timeMin", start_datetime);
      if (end_datetime) params.set("timeMax", end_datetime);
      params.set("orderBy", "startTime");

      const { ok, data } = await calendarJsonRequest<{
        items?: Array<{
          id: string;
          summary?: string;
          description?: string;
          status?: string;
          start?: Record<string, unknown>;
          end?: Record<string, unknown>;
        }>;
      }>(
        `/calendars/${calendarId || "primary"}/events?${params.toString()}`,
        { method: "GET" },
        accessToken,
      );

      return JSON.stringify({
        success: ok,
        events: data?.items || [],
      });
    },
    {
      name: "search_events",
      description:
        "Searches calendar events by query string, optionally constrained to a date/time range. Use this when the user names an event but not its ID.",
      schema: z.object({
        calendarId: z
          .string()
          .optional()
          .default("primary")
          .describe("The calendar ID, or 'primary' for the main calendar."),
        query: z
          .string()
          .describe(
            "Search phrase, usually a title or fragment of the event title.",
          ),
        start_datetime: z
          .string()
          .optional()
          .describe(
            "Optional inclusive ISO 8601 start datetime to narrow the search.",
          ),
        end_datetime: z
          .string()
          .optional()
          .describe(
            "Optional exclusive ISO 8601 end datetime to narrow the search.",
          ),
      }),
    },
  );

  const listCalendars = tool(
    async () => {
      const { ok, data } = await calendarJsonRequest<{
        items?: Array<{
          id: string;
          summary?: string;
          primary?: boolean;
          timeZone?: string;
          accessRole?: string;
        }>;
      }>("/users/me/calendarList", { method: "GET" }, accessToken);

      return JSON.stringify({
        success: ok,
        calendars: data?.items || [],
      });
    },
    {
      name: "list_calendars",
      description:
        "Lists calendars available to the authenticated user. Use this before writing to a non-primary calendar to confirm the calendar exists and is accessible.",
      schema: z.object({}),
    },
  );

  const getCalendarDefaultTimezone = tool(
    async ({ calendar_name }) => {
      const normalizedCalendarName = calendar_name.trim().toLowerCase();

      const { ok, data } = await calendarJsonRequest<{
        items?: Array<{
          id: string;
          summary?: string;
          primary?: boolean;
          timeZone?: string;
          accessRole?: string;
        }>;
      }>("/users/me/calendarList", { method: "GET" }, accessToken);

      const calendars = data?.items || [];
      const exactMatches = calendars.filter(
        (calendar) =>
          calendar.summary?.trim().toLowerCase() === normalizedCalendarName,
      );
      const partialMatches =
        exactMatches.length > 0
          ? []
          : calendars.filter((calendar) =>
              calendar.summary
                ?.trim()
                .toLowerCase()
                .includes(normalizedCalendarName),
            );
      const matchedCalendar =
        exactMatches.length === 1 ? exactMatches[0] : undefined;

      return JSON.stringify({
        success: ok && exactMatches.length === 1,
        found: exactMatches.length === 1,
        ambiguous: exactMatches.length > 1,
        timezone: matchedCalendar?.timeZone || null,
        calendar: matchedCalendar || null,
        matches: exactMatches.length > 0 ? exactMatches : partialMatches,
      });
    },
    {
      name: "get_calendar_default_timezone",
      description:
        "Fetches the default IANA timezone for a calendar by its display name. Use this before creating events when the user names a calendar but does not provide a timezone.",
      schema: z.object({
        calendar_name: z
          .string()
          .min(1)
          .describe(
            "The calendar display name to look up, for example Work or Biology 101.",
          ),
      }),
    },
  );

  const createEvent = tool(
    async ({
      calendarId,
      title,
      description,
      start_datetime,
      end_datetime,
      timezone,
    }) => {
      const start = {
        dateTime: start_datetime,
        ...(timezone ? { timeZone: timezone } : {}),
      };

      const end = {
        dateTime: end_datetime,
        ...(timezone ? { timeZone: timezone } : {}),
      };

      const { ok, data: event } = await calendarJsonRequest(
        `/calendars/${calendarId || "primary"}/events`,
        {
          method: "POST",
          body: JSON.stringify({
            summary: title,
            description,
            start,
            end,
          }),
        },
        accessToken,
      );

      return JSON.stringify({
        success: ok,
        event,
      });
    },
    {
      name: "create_event",
      description:
        "Creates a one-time calendar event given a specific title and time.",
      schema: z.object({
        calendarId: z
          .string()
          .optional()
          .default("primary")
          .describe("The calendar ID, or 'primary' for the main calendar."),
        title: z.string(),
        description: z.string().optional(),
        start_datetime: z.string(),
        end_datetime: z.string(),
        timezone: z
          .string()
          .optional()
          .describe("IANA timezone, for example America/New_York."),
      }),
    },
  );

  const createAllDayEvent = tool(
    async ({ calendarId, title, description, date }) => {
      const { ok, data: event } = await calendarJsonRequest(
        `/calendars/${calendarId || "primary"}/events`,
        {
          method: "POST",
          body: JSON.stringify({
            summary: title,
            description,
            start: { date },
            end: { date: addOneDay(date) },
          }),
        },
        accessToken,
      );

      return JSON.stringify({
        success: ok,
        event,
      });
    },
    {
      name: "create_all_day_event",
      description:
        "Creates a one-time all-day calendar event for a specific date.",
      schema: z.object({
        calendarId: z
          .string()
          .optional()
          .default("primary")
          .describe("The calendar ID, or 'primary' for the main calendar."),
        title: z.string(),
        description: z.string().optional(),
        date: z
          .string()
          .describe("Event date in YYYY-MM-DD format for the all-day event."),
        timezone: z
          .string()
          .optional()
          .describe(
            "IANA timezone from the target calendar. Accepted for prompt consistency; all-day events are created with date fields.",
          ),
      }),
    },
  );

  const createRecurringEvent = tool(
    async ({
      calendarId,
      title,
      description,
      start_datetime,
      end_datetime,
      timezone,
      frequency,
      interval,
      count,
      until,
      by_days,
    }) => {
      const recurrenceParts = [`FREQ=${frequency}`];

      if (interval) recurrenceParts.push(`INTERVAL=${interval}`);
      if (count) recurrenceParts.push(`COUNT=${count}`);
      if (until) recurrenceParts.push(`UNTIL=${until}`);
      if (by_days?.length) recurrenceParts.push(`BYDAY=${by_days.join(",")}`);

      const { ok, data: event } = await calendarJsonRequest(
        `/calendars/${calendarId || "primary"}/events`,
        {
          method: "POST",
          body: JSON.stringify({
            summary: title,
            description,
            start: { dateTime: start_datetime, timeZone: timezone },
            end: { dateTime: end_datetime, timeZone: timezone },
            recurrence: [`RRULE:${recurrenceParts.join(";")}`],
          }),
        },
        accessToken,
      );

      return JSON.stringify({
        success: ok,
        event,
      });
    },
    {
      name: "create_recurring_event",
      description:
        "Creates a recurring calendar event, especially for repeating class meetings.",
      schema: z.object({
        calendarId: z
          .string()
          .optional()
          .default("primary")
          .describe("The calendar ID, or 'primary' for the main calendar."),
        title: z.string().describe("Short event title."),
        description: z
          .string()
          .describe("Helpful event details from the syllabus."),
        start_datetime: z.string().describe("ISO 8601 event start datetime."),
        end_datetime: z.string().describe("ISO 8601 event end datetime."),
        timezone: z
          .string()
          .describe("IANA timezone, for example America/New_York."),
        frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
        interval: z.number().int().positive().optional(),
        count: z.number().int().positive().optional(),
        until: z
          .string()
          .optional()
          .describe("RFC 5545 UNTIL value or ISO 8601 datetime."),
        by_days: z
          .array(weekdaySchema)
          .optional()
          .describe("Days of week used for weekly recurrence."),
      }),
    },
  );

  const updateEvent = tool(
    async ({
      event_id,
      calendarId,
      title,
      description,
      start_datetime,
      end_datetime,
      timezone,
    }) => {
      const body: Record<string, unknown> = {};

      if (title !== undefined) body.summary = title;
      if (description !== undefined) body.description = description;
      if (start_datetime !== undefined || timezone !== undefined) {
        body.start = {
          ...(start_datetime !== undefined ? { dateTime: start_datetime } : {}),
          ...(timezone !== undefined ? { timeZone: timezone } : {}),
        };
      }
      if (end_datetime !== undefined || timezone !== undefined) {
        body.end = {
          ...(end_datetime !== undefined ? { dateTime: end_datetime } : {}),
          ...(timezone !== undefined ? { timeZone: timezone } : {}),
        };
      }

      const { ok, data: event } = await calendarJsonRequest(
        `/calendars/${calendarId || "primary"}/events/${event_id}`,
        {
          method: "PATCH",
          body: JSON.stringify(body),
        },
        accessToken,
      );

      return JSON.stringify({
        success: ok,
        event,
      });
    },
    {
      name: "update_event",
      description:
        "Updates an existing calendar event by event ID. Use this when dates, times, titles, or descriptions change.",
      schema: z.object({
        event_id: z.string().describe("The calendar event ID."),
        calendarId: z
          .string()
          .optional()
          .default("primary")
          .describe("The calendar ID, or 'primary' for the main calendar."),
        title: z.string().optional().describe("Updated event title."),
        description: z
          .string()
          .optional()
          .describe("Updated event description."),
        start_datetime: z
          .string()
          .optional()
          .describe("Updated ISO 8601 event start datetime."),
        end_datetime: z
          .string()
          .optional()
          .describe("Updated ISO 8601 event end datetime."),
        timezone: z
          .string()
          .optional()
          .describe("Updated IANA timezone, for example America/New_York."),
      }),
    },
  );

  return [
    getEventById,
    listEvents,
    searchEvents,
    listCalendars,
    getCalendarDefaultTimezone,
    createEvent,
    createAllDayEvent,
    createRecurringEvent,
    updateEvent,
  ];
}
