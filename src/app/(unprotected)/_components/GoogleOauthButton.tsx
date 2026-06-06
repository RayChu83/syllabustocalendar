"use client";

import { Button } from "@/components/ui/button";
import { supabaseBrowserClient as supabase } from "@/lib/supabase/browser";
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
    <Button onClick={handleGoogleLogin} disabled={isLoading}>
      {isLoading ? "Redirecting..." : "Login with Google"}
    </Button>
  );
}
