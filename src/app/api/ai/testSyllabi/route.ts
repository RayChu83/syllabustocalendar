import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json(
      {
        details: {
          class: {
            title:
              "American Government — A Historical Introduction (POLSC 110)",
            overview:
              "An introduction to American government and politics from a historical perspective, covering foundational political ideas, the Constitution, public opinion, political participation, institutions (Congress, presidency, courts), and political development from the founding era to the present. The course emphasizes critical thinking, use of evidence, and written argumentation through lectures, readings, discussion sections, exams, and a short historical paper.",
            materials: [
              "American Government, 3rd Edition by Glen Krutz and Sylvie Waskiewiscz (OpenStax PDF, ISBN-10 1-947172-65-4) - free at https://openstax.org/details/books/american-government-3e",
              "Assigned PDF readings on Brightspace (course Brightspace site)",
              "Top Hat (course code 182299; access via Brightspace Top Hat link; Hunter site license — no cost)",
              "Daily access to New York Times and/or Wall Street Journal (Hunter College online access)",
              "Brightspace (brightspace.cuny.edu) for syllabus, announcements, recorded lectures, discussion boards, and submissions",
              "Turnitin (for final paper submission via Blackboard/Blackboard/TurnItIn integration)",
            ],
            grading: [
              {
                type: "Discussion Section Participation (Weekly)",
                weight: 10,
              },
              {
                type: "Lecture Participation (Top Hat) (Weekly)",
                weight: 10,
              },
              {
                type: "Midterm 1",
                weight: 15,
              },
              {
                type: "Midterm 2",
                weight: 20,
              },
              {
                type: "Short Historical Paper",
                weight: 20,
              },
              {
                type: "Final Exam",
                weight: 25,
              },
            ],
            startDate: "2026-01-26",
            endDate: "2026-05-20",
            other: [
              {
                title: "Top Hat Enrollment and Usage",
                description:
                  "Top Hat is required for lecture participation credit; enroll only via the Top Hat link on the lecture Brightspace page (course code 182299). Hunter has a site license (no cost). Support contacts provided for issues.",
              },
              {
                title: "Short Historical Paper",
                description:
                  "A required 4–5 page paper based on an approved visit to a historical site; site must be approved by your TA. Submit final paper to TurnItIn via Blackboard. Late papers are not accepted.",
              },
              {
                title: "Exam Format and Rescheduling",
                description:
                  "Midterms and final are in-person during course meeting times and include multiple-choice and true/false questions. Contact the instructor ASAP for rescheduling or accommodations.",
              },
              {
                title: "Academic Integrity and Plagiarism",
                description:
                  "Plagiarized work will be submitted to the Office of Academic Integrity and receive an automatic 0; no re-submissions accepted. Hunter/CUNY academic integrity policies apply.",
              },
              {
                title: "Accessibility and Sexual Misconduct Policies",
                description:
                  "Students with disabilities should register with Office of AccessABILITY for accommodations. Hunter College and CUNY Title IX and sexual misconduct reporting resources and contacts are provided.",
              },
              {
                title: "Syllabus Change Policy",
                description:
                  "Syllabus is a guide and may change with advance notice; changes that affect grading will be communicated in advance via email.",
              },
            ],
          },
          instructors: [
            {
              name: "Erin Mayo-Adam, JD/PhD",
              email: [
                "erin.mayo-adam@hunter.cuny.edu",
                "Erin.Mayo-Adam@hunter.cuny.edu",
              ],
              role: "Instructor",
              officeHours: [
                {
                  location: "Virtual (Zoom) and In-Person (HW 1723)",
                  startTime: "13:00",
                  endTime: "14:00",
                  meetingDays: ["WE"],
                  additionalNotes: [
                    {
                      title: "Appointment Procedure",
                      description:
                        "Email by 17:00 on Tuesdays to schedule an office hours appointment (Erin.Mayo-Adam@hunter.cuny.edu).",
                    },
                    {
                      title: "Zoom Weekly Meeting",
                      description:
                        "Weekly virtual office hours via Zoom (every Wed until May 13, 2026). Meeting ID 865 5464 5882, Passcode 043798. Link provided in syllabus.",
                    },
                    {
                      title: "Email Availability",
                      description:
                        "Instructor available by email 09:00–17:00 Monday–Friday and generally does not respond on weekends.",
                    },
                  ],
                },
              ],
            },
            {
              name: "Rosa Arevalo Leon",
              email: ["rarevaloleon@gradcenter.cuny.edu"],
              role: "Teaching Assistant",
              officeHours: [
                {
                  location: "Discussion Section",
                  startTime: "10:00",
                  endTime: "10:50",
                  meetingDays: ["FR"],
                  additionalNotes: [],
                },
                {
                  location: "Discussion Section",
                  startTime: "11:00",
                  endTime: "11:50",
                  meetingDays: ["FR"],
                  additionalNotes: [],
                },
              ],
            },
            {
              name: "Seren Dowdy",
              email: ["sdowdy@gradcenter.cuny.edu"],
              role: "Teaching Assistant",
              officeHours: [
                {
                  location: "Discussion Section",
                  startTime: "13:00",
                  endTime: "13:50",
                  meetingDays: ["WE"],
                  additionalNotes: [],
                },
                {
                  location: "Discussion Section",
                  startTime: "14:00",
                  endTime: "14:50",
                  meetingDays: ["WE"],
                  additionalNotes: [],
                },
              ],
            },
            {
              name: "Michael Macher",
              email: ["mmacher@gradcenter.cuny.edu"],
              role: "Teaching Assistant",
              officeHours: [
                {
                  location: "Discussion Section",
                  startTime: "10:00",
                  endTime: "10:50",
                  meetingDays: ["FR"],
                  additionalNotes: [],
                },
                {
                  location: "Discussion Section",
                  startTime: "11:00",
                  endTime: "11:50",
                  meetingDays: ["FR"],
                  additionalNotes: [],
                },
              ],
            },
            {
              name: "Carmen Melillo",
              email: ["cmelillo@gradcenter.cuny.edu"],
              role: "Teaching Assistant",
              officeHours: [
                {
                  location: "Discussion Section",
                  startTime: "13:00",
                  endTime: "13:50",
                  meetingDays: ["MO"],
                  additionalNotes: [],
                },
                {
                  location: "Discussion Section",
                  startTime: "14:00",
                  endTime: "14:50",
                  meetingDays: ["MO"],
                  additionalNotes: [],
                },
                {
                  location: "Discussion Section",
                  startTime: "15:00",
                  endTime: "15:50",
                  meetingDays: ["MO"],
                  additionalNotes: [],
                },
              ],
            },
          ],
          schedule: [
            {
              location: "Hunter West 714",
              startTime: "12:00",
              endTime: "12:50",
              meetingDays: ["MO", "WE"],
              additionalNotes: [
                {
                  title: "Top Hat Participation",
                  description:
                    "Lecture participation recorded via Top Hat; used beginning first class for practice and second class for credit. Access Top Hat via Brightspace link.",
                },
                {
                  title: "Occasional Recorded Lectures",
                  description:
                    "Some lectures will be recorded and posted on Brightspace (e.g., Feb 18 lecture recorded with no in-person class that day).",
                },
                {
                  title: "Discussion Sections",
                  description:
                    "Separate weekly discussion sections meet (see TA section times) and are required for participation credit.",
                },
              ],
            },
          ],
          deadlines: [
            {
              title: "Midterm 1",
              dueDate: "2026-02-25",
              dueTime: "",
            },
            {
              title: "Midterm 2",
              dueDate: "2026-03-30",
              dueTime: "",
            },
            {
              title: "Short Historical Paper",
              dueDate: "2026-04-27",
              dueTime: "",
            },
            {
              title: "Final Exam",
              dueDate: "2026-05-20",
              dueTime: "11:30",
            },
          ],
          ok: true,
        },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch syllabus details" },
      { status: 500 },
    );
  }
}
