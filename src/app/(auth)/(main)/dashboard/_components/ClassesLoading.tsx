import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export default function ClassesLoading() {
  return (
    <>
      <Skeleton className="bg-[#f0f0f0] h-7 w-23.5 mb-4" />

      <div className="flex items-stretch flex-row flex-nowrap overflow-auto gap-4 snap-x self-center mb-8 no-scrollbar">
        <div>
          <Skeleton className="bg-[#f0f0f0] min-w-74 min-h-55.5 mb-2" />
          <div className="p-2">
            <Skeleton className="bg-[#f0f0f0] min-w-52 min-h-6 mb-2" />
            <Skeleton className="bg-[#f0f0f0] w-24 h-4" />
          </div>
        </div>
        <div>
          <Skeleton className="bg-[#f0f0f0] min-w-74 min-h-55.5 mb-2" />
          <div className="p-2">
            <Skeleton className="bg-[#f0f0f0] min-w-52 min-h-6 mb-2" />
            <Skeleton className="bg-[#f0f0f0] w-24 h-4" />
          </div>
        </div>
        <div>
          <Skeleton className="bg-[#f0f0f0] min-w-74 min-h-55.5 mb-2" />
          <div className="p-2">
            <Skeleton className="bg-[#f0f0f0] min-w-52 min-h-6 mb-2" />
            <Skeleton className="bg-[#f0f0f0] w-24 h-4" />
          </div>
        </div>
        <div>
          <Skeleton className="bg-[#f0f0f0] min-w-74 min-h-55.5 mb-2" />
          <div className="p-2">
            <Skeleton className="bg-[#f0f0f0] min-w-52 min-h-6 mb-2" />
            <Skeleton className="bg-[#f0f0f0] w-24 h-4" />
          </div>
        </div>
      </div>
    </>
  );
}
