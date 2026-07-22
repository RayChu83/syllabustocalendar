import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export default function SemestersLoading() {
  return (
    <>
      <Skeleton className="h-7 w-30 rounded-full bg-[#f0f0f0] mb-4" />
      <div className="flex items-stretch flex-row flex-nowrap overflow-auto gap-4 snap-x self-center mb-8 no-scrollbar">
        <Skeleton className="min-h-33 min-w-74 rounded-xl bg-[#f0f0f0]" />
        <Skeleton className="min-h-33 min-w-74 rounded-xl bg-[#f0f0f0]" />
        <Skeleton className="min-h-33 min-w-74 rounded-xl bg-[#f0f0f0]" />
        <Skeleton className="min-h-33 min-w-74 rounded-xl bg-[#f0f0f0]" />
      </div>
    </>
  );
}
