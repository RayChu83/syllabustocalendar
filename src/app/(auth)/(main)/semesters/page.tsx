import { serverClient } from "@/lib/supabase/server";
import { SemesterWithClasses } from "@/constants";
import SemesterList from "./_components/SemesterList";
import BackButton from "@/components/ui/BackButton";

export default async function Semesters() {
  const supabase = await serverClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    throw Error("Failed to retrieve user profile");
  }

  const { data: semestersData, error: semestersDataError } = await supabase
    .from("semesters")
    .select("*, classes(id, title)");

  const semesters: SemesterWithClasses[] = semestersData
    ? semestersData.map((s) => ({
        ...s,
        created_at: new Date(s.created_at),
      }))
    : [];

  if (semestersDataError) throw Error(semestersDataError.message);

  return (
    <>
      <main className="mt-13 flex flex-col gap-2 max-w-7xl mx-auto p-6">
        <header className="mb-2 flex flex-col gap-1.5 w-fit">
          <BackButton
            href="/dashboard"
            as="link"
            cn="mb-4"
            text="Back to Dashboard"
          />
          <h1 className="sm:text-5xl text-4xl tracking-tight font-black text-neutral-700 mb-1">
            My semesters:
          </h1>
          <p className="text-neutral-500">
            Organize your classes into semesters.
          </p>
        </header>
        <SemesterList semesters={semesters} />
      </main>
    </>
  );
}
