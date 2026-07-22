"use client";

import { Button } from "@/components/ui/button";
import { supabaseBrowserClient as supabase } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

export default function GoogleOauthButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      setIsLoading(false);
      toast.error("Unable to start Google sign in", {
        description: error.message,
      });
    }
  };

  return (
    <button
      className={cn(
        "text-neutral-700 px-6 py-2 rounded-full bg-neutral-100 hover:bg-[#f0f0f0] hover:outline-neutral-200 hover:scale-[1.025] outline -outline-offset-1 outline-[#f0f0f0] flex items-center justify-center gap-2 tracking-tight transition-all",
        isLoading && "cursor-progress opacity-50 saturate-0",
      )}
      onClick={handleGoogleLogin}
      disabled={isLoading}
    >
      <Image src="/logos/google.webp" alt="Google" width={16} height={16} />
      {isLoading ? "Redirecting..." : "Continue with Google"}
    </button>
  );
}
