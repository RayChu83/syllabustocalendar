"use client";
import Label from "@/components/ui/Label";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { cn } from "@/lib/utils";
import { FormEvent, useState } from "react";
import { supabaseBrowserClient as supabase } from "@/lib/supabase/browser";
import { useSession } from "@/app/_context/AuthContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const initProfileDetails = {
  firstName: { value: "", error: "" },
  lastName: { value: "", error: "" },
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
          firstName: profileDetails.firstName.value,
          lastName: profileDetails.lastName.value,
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
        <h1 className="text-2xl font-bold tracking-wide text-neutral-200">
          Set up your Profile
        </h1>
      </header>
      <div className="flex flex-col gap-2">
        <Label required id="profile-setup-first-name" title="First name:" />
        <div className="w-full space-y-1.5">
          <input
            type="text"
            className={cn(
              "bg-zinc-850 text-neutral-300 px-4 py-2 w-full rounded-sm outline-offset-2 transition-all border border-zinc-600 outline-2",
              profileDetails.firstName.error
                ? "outline-red-400/60"
                : "outline-transparent focus:outline-zinc-400/60",
            )}
            id="profile-setup-first-name"
            value={profileDetails.firstName.value}
            onChange={(e) =>
              setProfileDetails((prev) => ({
                ...prev,
                firstName: { value: e.target.value, error: "" },
              }))
            }
            placeholder="John"
          />
          {profileDetails.firstName.error && (
            <p className="text-red-400 text-sm">
              {profileDetails.firstName.error}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label required id="profile-setup-last-name" title="Last name:" />
        <div className="w-full space-y-1.5">
          <input
            type="text"
            className={cn(
              "bg-zinc-850 text-neutral-300 px-4 py-2 w-full rounded-sm outline-offset-2 transition-all border border-zinc-600 outline-2",
              profileDetails.lastName.error
                ? "outline-red-400/60"
                : "outline-transparent focus:outline-zinc-400/60",
            )}
            id="profile-setup-last-name"
            value={profileDetails.lastName.value}
            onChange={(e) =>
              setProfileDetails((prev) => ({
                ...prev,
                lastName: { value: e.target.value, error: "" },
              }))
            }
            placeholder="Doe"
          />
          {profileDetails.lastName.error && (
            <p className="text-red-400 text-sm">
              {profileDetails.lastName.error}
            </p>
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
              "bg-zinc-850 text-neutral-300 px-4 py-2 w-full rounded-sm outline-offset-2 transition-all border border-zinc-600 outline-2",
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
            className="py-2 px-3 rounded-md bg-zinc-850 outline outline-zinc-700 cursor-pointer hover:brightness-110 transition-all"
            type="button"
            onClick={handleReset}
          >
            Reset
          </button>
          <RainbowButton
            variant="default"
            className="disabled:animate-none disabled:pointer-events-none text-base py-4.5 px-3 hover:brightness-90 font-normal flex items-center gap-3"
          >
            <span>Continue</span>
            {/* <div role="status">
          <svg
            aria-hidden="true"
            className="size-4 text-neutral-tertiary animate-spin fill-brand"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="#000"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="#FFF"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div> */}
          </RainbowButton>
        </aside>
      </div>
    </form>
  );
}
