"use client";
import Label from "@/components/ui/Label";
import { cn } from "@/lib/utils";
import { FormEvent, useState } from "react";
import { supabaseBrowserClient as supabase } from "@/lib/supabase/browser";
import { useSession } from "@/app/_context/AuthContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const initProfileDetails = {
  name: { value: "", error: "" },
  school: { value: "", error: "" },
};

export default function ProfileSetUpForm() {
  const session = useSession();
  const [profileDetails, setProfileDetails] = useState(initProfileDetails);
  const router = useRouter();

  const handleReset = () => {
    setProfileDetails(initProfileDetails);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("Session was missing", {
        description: "Please log back in and try again",
      });
      return;
    }
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser();

    if (!user || getUserError) {
      toast.error("Failed to load user", {
        description: getUserError?.message,
      });
      return;
    }

    // optional sanity check
    if (session && session.user.id !== user.id) {
      toast.error("Session and user are not the same", {
        description: "Please refresh and try again",
      });
    }

    const { data, error: completeProfileError } = await supabase
      .from("profiles")
      .insert([
        {
          name: profileDetails.name.value,
          school: profileDetails.school.value,
        },
      ]);

    if (completeProfileError) {
      toast.error("Failed to complete profile", {
        description: completeProfileError.message,
      });
      return;
    }

    toast.success("Profile was completed");
    router.push("/dashboard");
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <header>
        <h1 className="text-2xl font-bold tracking-wide text-neutral-500">
          Set up your Profile
        </h1>
      </header>
      <div className="flex flex-col gap-2">
        <Label required id="profile-setup-name" title="Name:" />
        <div className="w-full space-y-1.5">
          <input
            type="text"
            className={cn(
              "bg-neutral-100 text-neutral-400 px-4 py-2 w-full rounded-sm outline-offset-2 transition-all border outline-2",
              profileDetails.name.error
                ? "outline-red-400/60"
                : "outline-transparent focus:outline-zinc-400/60",
            )}
            id="profile-setup-name"
            value={profileDetails.name.value}
            onChange={(e) =>
              setProfileDetails((prev) => ({
                ...prev,
                name: { value: e.target.value, error: "" },
              }))
            }
            placeholder="John doe"
          />
          {profileDetails.name.error && (
            <p className="text-red-400 text-sm">{profileDetails.name.error}</p>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {/* https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json */}
        <Label
          required
          id="profile-setup-school"
          title="College / University:"
        />
        <div className="w-full space-y-1.5">
          <input
            type="text"
            className={cn(
              "bg-neutral-100 text-neutral-400 px-4 py-2 w-full rounded-sm outline-offset-2 transition-all border outline-2",
              profileDetails.school.error
                ? "outline-red-400/60"
                : "outline-transparent focus:outline-zinc-400/60",
            )}
            id="profile-setup-school"
            value={profileDetails.school.value}
            onChange={(e) =>
              setProfileDetails((prev) => ({
                ...prev,
                school: { value: e.target.value, error: "" },
              }))
            }
            placeholder="Harvard University"
          />
          {profileDetails.school.error && (
            <p className="text-red-400 text-sm">
              {profileDetails.school.error}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <aside className="space-x-4 flex">
          <button
            className="text-sm py-2.5 px-5 rounded-md bg-neutral-100 cursor-pointer hover:brightness-110 transition-all"
            type="button"
            onClick={handleReset}
          >
            Reset
          </button>
          <button className="text-sm disabled:animate-none disabled:pointer-events-none py-2.5 px-5 hover:brightness-90 font-normal flex items-center gap-3">
            Continue
          </button>
        </aside>
      </div>
    </form>
  );
}
