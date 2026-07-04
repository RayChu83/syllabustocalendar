import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import Link from "next/link";

export default function GoogleCalendarConnectButton({
  label = "Connect Google Calendar",
  nextPath = "/calendar",
}: {
  label?: string;
  nextPath?: string;
}) {
  return (
    <Button asChild>
      <Link
        href={`/api/google/calendar/connect?next=${encodeURIComponent(nextPath)}`}
      >
        <CalendarPlus data-icon="inline-start" />
        {label}
      </Link>
    </Button>
  );
}
