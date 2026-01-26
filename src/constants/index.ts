import z from "zod";

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, index);

  return `${size.toFixed(size < 10 && index > 0 ? 1 : 0)} ${units[index]}`;
}

// ZOD SCHEMAS
export const ClassTitleSchema = z
  .string({
    error: "Class title must be a valid string",
  })
  .trim()
  .min(3, { message: "Class title must be at least 3 characters long" })
  .max(50, { message: "Class title should not exceed 50 characters long" });

export const ClassSyllabusTextSchema = z
  .string({
    error: "Syllabus text must be a valid string",
  })
  .trim()
  .min(100, "Syllabus must be at least 100 characters")
  .max(10_000, "Syllabus must be no more than 10,000 characters");

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/rtf",
  "text/markdown",
] as const;

type AllowedFileType = (typeof ALLOWED_FILE_TYPES)[number];

export const isAllowedFileType = (type: string): type is AllowedFileType =>
  ALLOWED_FILE_TYPES.includes(type as AllowedFileType);

export const ClassSyllabusFilesSchema = z
  .array(
    z
      .instanceof(File)
      .refine(
        (file) => file.size <= MAX_FILE_SIZE,
        "Each file must be less than 5MB",
      )
      .refine(
        (file) => isAllowedFileType(file.type),
        "Your file type is not supported",
      ),
  )
  .min(1, "At least one file is required")
  .max(5, "You can only upload up to 5 files");

// TYPEs
export type FILE_TYPE = {
  upload: File;
  status: "idle" | "loading" | "uploaded" | "fail";
  loadPercent: number;
  key: string;
};

export const EmailSchema = z
  .email("Email must be a valid email address")
  .max(254, { message: "Email is too long" });

export const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(128, "Password is too long")
  .refine((v) => !/\s/.test(v), {
    message: "Password must not contain spaces",
  })
  .refine((v) => /[a-z]/.test(v), {
    message: "Password must contain a lowercase letter",
  })
  .refine((v) => /[A-Z]/.test(v), {
    message: "Password must contain an uppercase letter",
  })
  .refine((v) => /\d/.test(v), {
    message: "Password must contain a number",
  });

export const defaultSemesters = [
  {
    id: "986a886f-229b-4048-a4b0-de6aaf1fa2df",
    title: "Semester 1",
    grade: "Lower Freshman",
    classes: [
      "Intro to Computer Science",
      "Intro to Anthropology",
      "First Year Seminar",
      "Classical Mythology",
      "Calculus I",
    ],
  },
  {
    id: "c21e9c8a-47d6-4e9b-8f41-6b0b0f0f0b11",
    title: "Semester 2",
    grade: "Upper Freshman",
    classes: [
      "Data Structures",
      "College Writing II",
      "General Psychology",
      "Discrete Mathematics",
      "Introduction to Philosophy",
    ],
  },
  {
    id: "f9a2c7b4-9d41-4c32-8b75-2c71c3a8e921",
    title: "Semester 3",
    grade: "Lower Sophomore",
    classes: [
      "Computer Organization",
      "Linear Algebra",
      "Statistics for the Social Sciences",
      "World History to 1500",
      "Public Speaking",
    ],
  },
  {
    id: "a3b7e12d-5f64-4d91-9c28-91e6d43e8c77",
    title: "Semester 4",
    grade: "Upper Sophomore",
    classes: [
      "Algorithms",
      "Operating Systems",
      "Database Systems",
      "Ethics in Technology",
      "Technical Writing",
    ],
  },
];

export type Semester = {
  id: string;
  profile: string;
  title: string;
  active: boolean;
  created_at: Date;
  from: Date;
  to: Date;
  grade: string;
};
