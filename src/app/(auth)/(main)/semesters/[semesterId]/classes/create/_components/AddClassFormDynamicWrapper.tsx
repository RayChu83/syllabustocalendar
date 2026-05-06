// AddClassFormWrapper.tsx
"use client";

import dynamic from "next/dynamic";

const AddClassFormDynamic = dynamic(() => import("./AddClassForm"), {
  ssr: false,
});

export default function AddClassFormWrapper({
  semesterId,
}: {
  semesterId: string;
}) {
  return <AddClassFormDynamic semesterId={semesterId} />;
}
