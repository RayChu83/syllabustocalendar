import { syllabusTextSchema } from "@/constants/schemas";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const { syllabusText } = await req.json();

  try {
    syllabusTextSchema.parse(syllabusText);
  } catch {
    return NextResponse.json(
      { error: "Invalid syllabus text" },
      { status: 400 },
    );
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: `
            You are a data extraction engine.
            You convert syllabus text into strictly valid JSON.

            General Rules:
              - Return only valid JSON and do not include additional non JSON text
              - It is okay to summarize long text fields concisely while preserving key meaning
              - Do not use ellipses (...) to shorten text
              - If any of the fields are empty, still include them in the output with empty string "" or empty array [] as value
              - Assume titles to be less than 1 sentence and descriptions to be 2-3 sentences max
              - Please do not use/assume any information outside the syllabus text provided
                `,
        },
        {
          role: "user",
          content: `
                Extract structured data from the syllabus below.

                Schema:

                {
                  class: {
                      title: string, (e.g. "Calculus 1", "English 101")
                      overview: string, (A brief summary of the course content and objectives.)
                      materials: string[], (A string list of required textbooks, software, or other materials needed for the course)
                      grading: { type: string, weight: number }[], (A breakdown of grading components, e.g. [{ type: "Homework", weight: 30 }, { type: "Midterm Exam", weight: 30 }, { type: "Final Exam", weight: 40 }])
                      startDate : string, (Extract semester start date into "YYYY-MM-DD" format. If not explicitly listed, infer it is the very first date mentioned e.g. 2023-08-23)
                      endDate : string, (Extract semester end date into "YYYY-MM-DD" format. If not explicitly listed, infer it is the very last date mentioned e.g. 2023-12-15)
                      other: { title: string, description: string }[], (A fallback array for any important class information that doesn't fit into the above fields. Each item should have a concise title and a brief summarized description.)
                  },
                  instructors: {
                      name: string, (e.g. "Professor. Smith")
                      email: string[], (A list of contact emails for the instructor, if available)
                      role : string, (e.g. "Professor", "Assistant Professor", "Teaching Assistant")
                      officeHours: {
                        location: string, (e.g. "Room 101", "Virtual")
                        startTime: string, (Extract office hour start-time into 24-hour format "HH:mm", e.g. "4:00 PM" → "16:00")
                        endTime: string, (Extract office hour end-time into 24-hour format "HH:mm", e.g. "4:00 PM" → "16:00")
                        meetingDays : string[], (e.g. ["MO", "WE", "FR"])
                        additionalNotes: { title: string, description: string }[] (Any additional notes regarding instructor information that doesn't fit into the above fields.)
                      }[]
                  }[],
                  schedule: {
                      location: string, (e.g. "Room 101", "Virtual")
                      startTime: string, (Extract class start-time into 24-hour format "HH:mm", e.g. "4:00 PM" → "16:00")
                      endTime: string, (Extract class end-time into 24-hour format "HH:mm", e.g. "4:00 PM" → "16:00")
                      meetingDays : string[], (e.g. ["MO", "WE", "FR"])
                      additionalNotes: { title: string, description: string }[] (Any additional notes regarding class meeting times information that doesn't fit into the above fields.)
                  }[], (In the case of different lecture and discussion times, have multiple schedule objects in the array.)
                  deadlines: {
                      title: string, (e.g. Essay 1, Midterm Exam 1, Project 1)
                      dueDate: string, (Extract deadline date into "YYYY-MM-DD" format. If the year is not specified, infer it from the syllabus term if possible. e.g. 2023-10-15)
                      dueTime : string, (Extract deadline time into 24-hour format "HH:mm", e.g. "4:00 PM" → "16:00")
                  }[], (An array of every deadline including homeworks, projects, exams. Each deadline must be a separate object in the array.)
                  ok : boolean, (e.g. if the syllabus provided does not contain any sufficient information or is not a syllabus at all, set ok: false)
                }

                Syllabus:
                ${syllabusText}
            `,
        },
      ],
      max_completion_tokens: 5000,
      temperature: 1,
    });

    const raw = response.choices[0].message?.content || "";

    console.log(raw);

    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "An unexpected output was received" },
        { status: 500 },
      );
    }

    return NextResponse.json(parsed, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to parse syllabus" },
      { status: 500 },
    );
  }
}
