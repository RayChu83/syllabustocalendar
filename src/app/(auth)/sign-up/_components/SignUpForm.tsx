"use client";
import Label from "@/components/ui/Label";
import { EmailSchema, PasswordSchema } from "@/constants";
import { supabaseBrowserClient as supabase } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

const initSignUpDetails = {
  email: { value: "", error: "" },
  password: { value: "", error: "" },
};

export default function SignUpForm() {
  const [signUpDetails, setSignUpDetails] = useState(initSignUpDetails);
  const router = useRouter();

  const handleReset = () => {
    setSignUpDetails(initSignUpDetails);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // validate fields with zod schemas
    const emailRes = EmailSchema.safeParse(signUpDetails.email.value);
    const passwordRes = PasswordSchema.safeParse(signUpDetails.password.value);

    if (!emailRes.success || !passwordRes.success) {
      setSignUpDetails((prev) => ({
        ...prev,
        email: {
          ...prev.email,
          error: emailRes.success ? "" : emailRes.error.issues[0].message,
        },
        password: {
          ...prev.password,
          error: passwordRes.success ? "" : passwordRes.error.issues[0].message,
        },
      }));
      return;
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpDetails.email.value.toLowerCase(),
        password: signUpDetails.password.value,
      });
      if (!error) {
        handleReset();
        toast.success("User was created", { description: data.user?.email });
        router.push("/profile/set-up");
        // update status state
      } else {
        toast.error("Failed to sign up", {
          description: error.message,
        });
      }
    } catch {
      toast.error("Failed to sign up", {
        description: "An unexpected error had occurred. Please try again",
      });
    }
  };
  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <header>
        <h1 className="text-2xl font-bold tracking-wide text-neutral-700">
          Sign up
        </h1>
        <p className="text-neutral-400 text-lg">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-blue-400 underline">
            Sign In
          </Link>
        </p>
      </header>
      <div className="flex flex-col gap-2">
        <Label required id="sign-up-email" title="Email:" />
        <div className="w-full space-y-1.5">
          <input
            type="text"
            className={cn(
              "text-sm bg-neutral-100 text-neutral-500 px-4 py-2 w-full rounded-sm outline-offset-2 transition-all border outline-2",
              signUpDetails.email.error
                ? "outline-red-400/60"
                : "outline-transparent focus:outline-neutral-400/60",
            )}
            id="sign-up-email"
            value={signUpDetails.email.value}
            onChange={(e) =>
              setSignUpDetails((prev) => ({
                ...prev,
                email: { value: e.target.value, error: "" },
              }))
            }
            placeholder="Enter email"
          />
          {signUpDetails.email.error && (
            <p className="text-red-400 text-sm">{signUpDetails.email.error}</p>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label required id="sign-up-password" title="Password:" />
        <div className="w-full space-y-1.5">
          <input
            type="password"
            className={cn(
              "text-sm bg-neutral-100 text-neutral-500 px-4 py-2 w-full rounded-sm outline-offset-2 transition-all border outline-2",
              signUpDetails.password.error
                ? "outline-red-400/60"
                : "outline-transparent focus:outline-neutral-400/60",
            )}
            id="sign-up-password"
            value={signUpDetails.password.value}
            onChange={(e) =>
              setSignUpDetails((prev) => ({
                ...prev,
                password: { value: e.target.value, error: "" },
              }))
            }
            placeholder="Enter password"
          />
          {signUpDetails.password.error && (
            <p className="text-red-400 text-sm">
              {signUpDetails.password.error}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <aside className="gap-2 flex">
          <button
            className="text-sm py-2.5 px-5 rounded-md bg-neutral-100 cursor-pointer hover:brightness-110 transition-all"
            type="button"
            onClick={handleReset}
          >
            Reset
          </button>
          <button className="text-sm disabled:animate-none disabled:pointer-events-none py-2.5 px-5  hover:brightness-90 font-normal flex items-center gap-3">
            <span>Sign up</span>
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
          </button>
        </aside>
      </div>
    </form>
  );
}
