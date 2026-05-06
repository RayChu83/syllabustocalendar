import z from "zod";

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, index);

  return `${size.toFixed(size < 10 && index > 0 ? 1 : 0)} ${units[index]}`;
}

// ZOD SCHEMAS

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

export type SyllabusUpload = {
  value: File;
  error: string;
  status: "loading" | "uploaded" | "fail" | "idle";
  loadPercent: number;
  key: string;
  objectUrl: string;
};

export type Semester = {
  id: string;
  profile: string;
  title: string;
  semester: string;
  created_at: Date;
  grade: string;
};

export type SemesterWithClasses = Semester & {
  classes: { id: string; title: string }[];
};

export type Classes = {
  created_at: Date;
  title: string;
  syllabus: string;
  semester: string;
  id: string;
  overview: string;
  materials: string[];
  grading: { category: string; weight: number }[];
  other: string[];
};

export type Schedule = {
  id: string;
  created_at: Date;
  class: string;
  day: string;
  start: string;
  end: string;
  location: string;
};
