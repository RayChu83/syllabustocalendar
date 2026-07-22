import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function BackButton({
  href,
  onClick,
  as,
  cn,
  text,
}: {
  href?: string;
  onClick?: () => void;
  as: "link" | "button";
  cn?: string;
  text?: string;
}) {
  switch (as) {
    case "link":
      return (
        <Link
          href={href || "/dashboard"}
          aria-label="Go back"
          className={`flex items-center gap-2 group ${cn || ""}`}
        >
          <BackButtonChild text={text} />
        </Link>
      );
    case "button":
      return (
        <button
          type="button"
          onClick={onClick}
          className={`flex items-center gap-2 group ${cn || ""}`}
        >
          <BackButtonChild />
        </button>
      );
  }
}

function BackButtonChild({ text }: { text?: string }) {
  return (
    <>
      <div className="flex items-center justify-center size-10 rounded-full bg-neutral-100 text-neutral-500 group-hover:bg-[#f0f0f0] cursor-pointer shrink-0 transition-all">
        <ArrowLeft size={20} />
      </div>
      <span className="text-neutral-500 group-hover:text-neutral-600 transition-all">
        {text || "Go back"}
      </span>
    </>
  );
}
