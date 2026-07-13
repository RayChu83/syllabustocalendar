import {
  normalizeSyllabus,
  syllabusSchema,
  syllabusTextSchema,
  syllabusWireSchema,
} from "@/constants/schemas";
import { serverClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const { syllabusText } = await req.json();
  const supabase = await serverClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    syllabusTextSchema.parse(syllabusText);
  } catch {
    return NextResponse.json(
      { error: "Invalid syllabus text" },
      { status: 400 },
    );
  }

  try {
    const response = await openai.responses.parse({
      model: "gpt-5-mini",
      input: [
        {
          role: "system",
          content: `
You are an expert at extracting structured information from a course syllabus.

Never invent information. If something is missing, do not invent information, fallback on the default values in the schema.

It is okay to summarize long text fields concisely while preserving key meaning

Do not use ellipses (...) to shorten text

Please assume all years to be in the current year: ${new Date().getFullYear()}
`,
        },

        {
          role: "user",
          content: `
Extract all course details, assignments, professor information, and due dates.

Syllabus:

${syllabusText}
`,
        },
      ],
      text: { format: zodTextFormat(syllabusWireSchema, "calendar_event") },
      max_output_tokens: 5000,
    });

    try {
      if (!response.output_parsed) {
        return NextResponse.json(
          { error: "An unexpected output was received" },
          { status: 500 },
        );
      }

      const parsedSyllabus = normalizeSyllabus(response.output_parsed);
      const isValid = syllabusSchema.safeParse(parsedSyllabus);
      if (!isValid.success) {
        console.error("Parsed syllabus validation error:", isValid.error);
        return NextResponse.json(
          { error: "Parsed syllabus does not match the expected schema" },
          { status: 500 },
        );
      }
      console.log("Parsed syllabus JSON:", parsedSyllabus);

      return NextResponse.json(parsedSyllabus, { status: 200 });
    } catch {
      return NextResponse.json(
        { error: "An unexpected output was received" },
        { status: 500 },
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to parse syllabus" },
      { status: 500 },
    );
  }
}
