"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: "Google Calendar connection was cancelled.",
  invalid_state: "That connection link expired or is invalid. Please try again.",
  missing_code: "Google did not return an authorization code. Please try again.",
  token_exchange_failed: "Failed to complete the Google Calendar connection.",
  google_oauth_error: "Google returned an error while connecting your calendar.",
};

export default function CalendarConnectErrorToast() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("calendar_connect_error");

  useEffect(() => {
    if (!errorCode) return;

    toast.error(
      ERROR_MESSAGES[errorCode] || "Failed to connect Google Calendar.",
    );
  }, [errorCode]);

  return null;
}
