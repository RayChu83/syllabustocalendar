"use client";

import { Button } from "@/components/ui/button";
import { supabaseBrowserClient as supabase } from "@/lib/supabase/browser";
import { CalendarPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function GoogleCalendarConnectButton({
  label = "Connect Google Calendar",
  nextPath = "/calendar",
}: {
  label?: string;
  nextPath?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnectGoogleCalendar = async () => {
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        scopes: "https://www.googleapis.com/auth/calendar",
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      setIsLoading(false);
      toast.error("Unable to connect Google Calendar", {
        description: error.message,
      });
    }
  };

  return (
    <Button onClick={handleConnectGoogleCalendar} disabled={isLoading}>
      <CalendarPlus data-icon="inline-start" />
      {isLoading ? "Redirecting..." : label}
    </Button>
  );
}
