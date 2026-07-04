"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto mt-17 flex min-h-[calc(100vh-4.25rem)] max-w-400 items-center justify-center p-6">
      <section className="flex max-w-xl flex-col gap-5 rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
          <AlertTriangle />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-black tracking-tight text-neutral-700">
            Sync cannot start
          </h1>
          <p className="text-sm leading-6 text-neutral-500">
            {error.message || "Unexpected error occurred."}
          </p>
        </div>

        <Button type="button" onClick={() => reset()} className="w-fit">
          Try again
        </Button>
      </section>
    </main>
  );
}
