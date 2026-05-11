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
const noteSchema = z.object({
  title: z.string(),
  description: z.string(),
});

const timeSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)")
  .or(z.literal(""));

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
  .or(z.literal(""));

const officeHourSchema = z.object({
  location: z.string(),
  startTime: timeSchema,
  endTime: timeSchema,
  meetingDays: z.array(z.enum(["MO", "TU", "WE", "TH", "FR", "SA", "SU"])),
  additionalNotes: z.array(noteSchema),
});

const instructorSchema = z.object({
  name: z.string(),
  email: z.array(z.string().email().or(z.literal(""))),
  role: z.string(),
  officeHours: z.array(officeHourSchema),
});

const gradingItemSchema = z.object({
  type: z.string(),
  weight: z.coerce.number(),
});

const scheduleItemSchema = z.object({
  location: z.string(),
  startTime: timeSchema,
  endTime: timeSchema,
  meetingDays: z.array(z.enum(["MO", "TU", "WE", "TH", "FR", "SA", "SU"])),
  additionalNotes: z.array(noteSchema),
});

const deadlineSchema = z.object({
  title: z.string(),
  dueDate: dateSchema,
  dueTime: timeSchema.optional(), // can be empty string
});

const otherItemSchema = z.object({
  title: z.string(),
  description: z.string(),
});

// Main schema
export const syllabusSchema = z.object({
  class: z.object({
    title: z.string(),
    overview: z.string(),
    materials: z.array(z.string()),
    grading: z.array(gradingItemSchema),
    startDate: dateSchema,
    endDate: dateSchema,
    other: z.array(otherItemSchema),
  }),
  instructors: z.array(instructorSchema),
  schedule: z.array(scheduleItemSchema),
  deadlines: z.array(deadlineSchema),
  ok: z.boolean(),
});
