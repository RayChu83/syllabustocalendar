import { serverClient } from "@/lib/supabase/server";
import React from "react";
import ClassesCollapsible from "./ClassesCollapsible";
import { ClassPreview } from "@/constants";

const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

export default async function ClassesList() {
  const supabase = await serverClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) throw Error("Unauthorized");

  const { data: classesData, error: classesDataError } = await supabase
    .from("classes")
    .select(
      `
    id,
    title,
    semester_id,
    semesters!inner(profile),
    deadlines(
      due_date,
      due_time
    )
  `,
    )
    .eq("semesters.profile", user.id)
    .gt("deadlines.due_date", today);

  const typedClassesData = classesData as ClassPreview[];

  if (classesDataError) throw Error(classesDataError.message);
  return <ClassesCollapsible classes={typedClassesData} />;
}
