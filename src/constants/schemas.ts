import z from "zod";

// SYLLABUS FILE UPLOAD SCHEMA

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_FILE_TYPES = ["application/pdf"] as const;

type AllowedFileType = (typeof ALLOWED_FILE_TYPES)[number];

export const isAllowedFileType = (type: string): type is AllowedFileType =>
  ALLOWED_FILE_TYPES.includes(type as AllowedFileType);

export const syllabusFileSchema = z
  .instanceof(File)
  .refine(
    (file) => file.size <= MAX_FILE_SIZE,
    "Each file must be less than 5MB",
  )
  .refine(
    (file) => isAllowedFileType(file.type),
    "Your file type is not supported",
  );

// SYLLABUS TEXT UPLOAD / PARSED SCHEMA

export const syllabusTextSchema = z
  .string({
    error: "Syllabus text must be a valid string",
  })
  .refine(
    (text) => /instructor|professor|office hours|grading|schedule/i.test(text),
    { message: "Text does not appear to be a valid syllabus" },
  )
  .refine(
    (text) => {
      const unique = new Set(text.split(" "));
      return unique.size / text.split(" ").length > 0.33;
    },
    { message: "Text appears overly repetitive" },
  )
  .trim()
  .min(100, "Syllabus must be at least 100 characters")
  .max(25000, "Syllabus must be no more than 25,000 characters");

// AI SYLLABUS PARSED JSON SCHEMA

const otherItemSchema = z.object({
  title: z
    .string()
    .describe("The title of the additional note or piece of information"),
  description: z
    .string()
    .describe("A description of the additional note or piece of information"),
});

// Structured Outputs (via zodTextFormat) can only represent plain JSON Schema shapes:
// no z.transform()/z.pipe() and no enforcement of z.regex()/z.email() during generation.
// So we ask the model to fill a *loose* wire schema (plain strings), normalize its raw
// output ourselves with the functions below, then validate the normalized result
// against the strict, canonical schema everything else in the app relies on.

export function normalizeTime(raw: string): string {
  const value = raw.trim();
  if (value === "") return "";

  if (/^\d{2}:\d{2}$/.test(value)) return value;

  const match = value.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm|AM|PM)?$/);
  if (!match) return ""; // unparseable -> treat as "no time", never throw

  let hour = Number(match[1]);
  const minute = match[2];
  const meridiem = match[3]?.toLowerCase();

  if (meridiem === "pm" && hour !== 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;
  if (hour > 23) return "";

  return `${String(hour).padStart(2, "0")}:${minute}`;
}

const MONTHS: Record<string, string> = {
  january: "01",
  february: "02",
  march: "03",
  april: "04",
  may: "05",
  june: "06",
  july: "07",
  august: "08",
  september: "09",
  october: "10",
  november: "11",
  december: "12",
};

export function normalizeDate(raw: string): string {
  const value = raw.trim();
  if (value === "") return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const slash = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) {
    const [, m, d, y] = slash;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  const named = value.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (named) {
    const month = MONTHS[named[1].toLowerCase()];
    if (month) return `${named[3]}-${month}-${named[2].padStart(2, "0")}`;
  }

  return ""; // unparseable -> "" (existing "no date" sentinel)
}

export function normalizeEmail(raw: string): string {
  const value = raw.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : "";
}

const strictTimeSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)")
  .or(z.literal(""));
const looseTimeSchema = z
  .string()
  .describe("Time in 24-hour format (HH:MM) or empty string for no time");

const strictDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
  .or(z.literal(""));
const looseDateSchema = z
  .string()
  .describe("Date in YYYY-MM-DD format or empty string for no date");

const strictEmailSchema = z.string().email().or(z.literal(""));
const looseEmailSchema = z
  .string()
  .describe("A contact email, or empty string if unknown");

const gradingItemSchema = z.object({
  type: z
    .string()
    .describe("The type of grading component, e.g., Assignment, Exam, Project"),
  weight: z.coerce
    .number()
    .describe("The weight of the grading component as a number percentage"),
});

function buildSyllabusSchema(
  timeSchema: typeof strictTimeSchema | typeof looseTimeSchema,
  dateSchema: typeof strictDateSchema | typeof looseDateSchema,
  emailSchema: typeof strictEmailSchema | typeof looseEmailSchema,
) {
  const officeHourSchema = z.object({
    location: z
      .string()
      .describe(
        "The location of the office hours, e.g., Room 101, Virtual meeting link (if applicable)",
      ),
    startTime: timeSchema,
    endTime: timeSchema,
    meetingDays: z
      .array(z.enum(["MO", "TU", "WE", "TH", "FR", "SA", "SU"]))
      .describe(
        "The days of the week when the office hours take place, represented as an array of two-letter abbreviations",
      ),
    additionalNotes: z
      .array(otherItemSchema)
      .describe("Additional office hour notes, if any"),
  });

  const instructorSchema = z.object({
    name: z.string().describe("The name of the instructor"),
    email: z
      .array(emailSchema)
      .describe("A list of contact emails for the instructor, if available"),
    role: z
      .string()
      .describe(
        "The role of the instructor, e.g., Professor, Teaching Assistant",
      ),
    officeHours: z
      .array(officeHourSchema)
      .describe("A list of office hours for the current instructor"),
  });

  const scheduleItemSchema = z.object({
    title: z
      .string()
      .describe(
        "The title of the scheduled recurring meeting, e.g., Lecture, Lab, Discussion, Recitation, etc.",
      ),
    location: z
      .string()
      .describe(
        "The location of the scheduled class, e.g., Room 101, Virtual meeting link (if applicable)",
      ),
    startTime: timeSchema.describe("The start time of the scheduled item"),
    endTime: timeSchema.describe("The end time of the scheduled item"),
    meetingDays: z
      .array(z.enum(["MO", "TU", "WE", "TH", "FR", "SA", "SU"]))
      .describe(
        "The days of the week when the class takes place, represented as an array of two-letter abbreviations",
      ),
    additionalNotes: z
      .array(otherItemSchema)
      .describe("Additional class notes, if any"),
  });

  const deadlineSchema = z.object({
    title: z
      .string()
      .describe(
        "The title of the deadline, e.g., Essay 1, Midterm Exam 1, Project 1",
      ),
    dueDate: dateSchema.describe(
      "The date when the deadline is due, otherwise leave blank",
    ),
    dueTime: timeSchema.describe(
      "The time when the deadline is due, otherwise leave blank",
    ),
  });

  return z.object({
    class: z.object({
      title: z.string().describe("The title of the class"),
      overview: z
        .string()
        .describe(
          "A short description of the class, including its objectives and content",
        ),
      materials: z
        .array(z.string())
        .describe("A list of required materials for the class"),
      grading: z
        .array(gradingItemSchema)
        .describe("A list of grading components and their weights"),
      startDate: dateSchema.describe(
        "The start date of the class, e.g. the first day of lectures",
      ),
      endDate: dateSchema.describe(
        "The end date of the class, e.g. the last day of lectures",
      ),
      other: z
        .array(otherItemSchema)
        .describe(
          "A list of other important class information not listed already",
        ),
    }),
    instructors: z
      .array(instructorSchema)
      .describe("A list of instructors for the class"),
    schedule: z
      .array(scheduleItemSchema)
      .describe(
        "A list of scheduled recurring lectures, labs, discussions, recitations, or recurring class meeting times.",
      ),
    deadlines: z
      .array(deadlineSchema)
      .describe("A list of important deadlines, events, and due dates"),
    ok: z.boolean().describe("A flag indicating if the syllabus is valid"),
  });
}

// Canonical schema: strict HH:MM / YYYY-MM-DD / valid-email-or-empty. Used app-wide
// (client-side re-validation, SyllabusJSON type) and for the final validation of the
// AI's output once it has been normalized.
export const syllabusSchema = buildSyllabusSchema(
  strictTimeSchema,
  strictDateSchema,
  strictEmailSchema,
);

// Wire schema: plain strings only, so it can be turned into JSON Schema for OpenAI
// Structured Outputs, and so the SDK's automatic response parsing never throws on a
// differently-formatted (but still valid-looking) time/date/email from the model.
export const syllabusWireSchema = buildSyllabusSchema(
  looseTimeSchema,
  looseDateSchema,
  looseEmailSchema,
);

type SyllabusWireData = z.infer<typeof syllabusWireSchema>;

export function normalizeSyllabus(raw: SyllabusWireData) {
  return {
    ...raw,
    class: {
      ...raw.class,
      startDate: normalizeDate(raw.class.startDate),
      endDate: normalizeDate(raw.class.endDate),
    },
    instructors: raw.instructors.map((instructor) => ({
      ...instructor,
      email: instructor.email.map(normalizeEmail),
      officeHours: instructor.officeHours.map((officeHour) => ({
        ...officeHour,
        startTime: normalizeTime(officeHour.startTime),
        endTime: normalizeTime(officeHour.endTime),
      })),
    })),
    schedule: raw.schedule.map((item) => ({
      ...item,
      startTime: normalizeTime(item.startTime),
      endTime: normalizeTime(item.endTime),
    })),
    deadlines: raw.deadlines.map((deadline) => ({
      ...deadline,
      dueDate: normalizeDate(deadline.dueDate),
      dueTime: normalizeTime(deadline.dueTime),
    })),
  };
}
