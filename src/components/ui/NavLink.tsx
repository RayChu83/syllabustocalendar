import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

export default function NavLink({
  pathname,
  href,
  className,
  children,
  onClick,
}: {
  pathname: string;
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "text-sm transition-all duration-300 tracking-wider text-nowrap outline-none font-light",
        className,
        pathname === href
          ? "text-neutral-700"
          : "animated-underline text-zinc-500 hover:text-zinc-400",
      )}
      onClick={onClick ? onClick : undefined}
    >
      {children}
    </Link>
  );
}
