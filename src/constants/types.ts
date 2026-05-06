import z from "zod";
import { syllabusSchema } from "./schemas";

export type SyllabusJSON = z.infer<typeof syllabusSchema>;
