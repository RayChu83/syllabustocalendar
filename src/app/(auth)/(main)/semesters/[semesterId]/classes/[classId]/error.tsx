"use client";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error); // Log to monitoring service
  }, [error]);

  return (
    <main className="mt-17 flex flex-col gap-2 max-w-400 mx-auto p-6">
      <h2>Something went wrong!</h2>
      <p>{error.message || "Unexpected error occurred."}</p>
      <button onClick={() => reset()}>Try again</button>
    </main>
  );
}
