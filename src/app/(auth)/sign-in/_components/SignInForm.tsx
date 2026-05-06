"use client";
import Label from "@/components/ui/Label";
import { supabaseBrowserClient as supabase } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

const initSignInDetails = {
  email: { value: "", error: "" },
  password: { value: "", error: "" },
};

export default function SignInForm() {
  const [signInDetails, setSignInDetails] = useState(initSignInDetails);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: signInDetails.email.value.toLowerCase(),
      password: signInDetails.password.value,
    });
    if (error) {
      toast.error("Failed to sign in", { description: error.message });
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <header>
        <h1 className="text-2xl font-bold tracking-wide text-neutral-700">
          Sign in
        </h1>
        <p className="text-neutral-400 text-lg">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-blue-400 underline">
            Sign Up
          </Link>
        </p>
      </header>
      <div className="flex flex-col gap-2">
        <Label required id="sign-in-email" title="Email:" />
        <div className="w-full space-y-1.5">
          <input
            type="email"
            className={cn(
              "text-sm bg-neutral-100 text-neutral-500 px-4 py-2 w-full rounded-sm outline-offset-2 transition-all border outline-2",
              signInDetails.email.error
                ? "outline-red-400/60"
                : "outline-transparent focus:outline-neutral-400/60",
            )}
            id="sign-in-email"
            value={signInDetails.email.value}
            onChange={(e) =>
              setSignInDetails((prev) => ({
                ...prev,
                email: { value: e.target.value, error: "" },
              }))
            }
            placeholder="Enter email"
          />
          {signInDetails.email.error && (
            <p className="text-red-400 text-sm">{signInDetails.email.error}</p>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label required id="sign-in-password" title="Password:" />
        <div className="w-full space-y-1.5">
          <input
            type="password"
            className={cn(
              "text-sm bg-neutral-100 text-neutral-500 px-4 py-2 w-full rounded-sm outline-offset-2 transition-all border outline-2",
              signInDetails.password.error
                ? "outline-red-400/60"
                : "outline-transparent focus:outline-neutral-400/60",
            )}
            id="sign-in-password"
            value={signInDetails.password.value}
            onChange={(e) =>
              setSignInDetails((prev) => ({
                ...prev,
                password: { value: e.target.value, error: "" },
              }))
            }
            placeholder="Enter password"
          />
          {signInDetails.password.error && (
            <p className="text-red-400 text-sm">
              {signInDetails.password.error}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <aside className="gap-2 flex">
          <button
            className="text-sm py-2.5 px-5 rounded-md bg-neutral-100 cursor-pointer hover:brightness-110 transition-all"
            type="button"
            onClick={() => setSignInDetails(initSignInDetails)}
          >
            Reset
          </button>
          <button className="text-sm disabled:animate-none disabled:pointer-events-none py-2.5 px-5 hover:brightness-90 font-normal flex items-center gap-3">
            Sign in
          </button>
        </aside>
      </div>
    </form>
  );
}
