import SemestersCollapsible from "./SemestersCollapsible";
import { serverClient } from "@/lib/supabase/server";
import { SemesterWithClasses } from "@/constants";

export default async function SemestersList() {
  const supabase = await serverClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) throw Error("Unauthorized");

  // RLS should already scope this to the current user; the explicit filter
  // is a defense-in-depth backstop in case a policy is ever missing/wrong.
  const { data: semestersData, error: semestersDataError } = await supabase
    .from("semesters")
    .select("*, classes(id, title)")
    .eq("profile", user.id);

  const semesters: SemesterWithClasses[] = semestersData
    ? semestersData.map((s) => ({
        ...s,
        created_at: new Date(s.created_at),
      }))
    : [];

  if (semestersDataError) throw Error(semestersDataError.message);

  return <SemestersCollapsible semesters={semesters} />;
}
