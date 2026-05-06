import Link from "next/link";
import React from "react";

export default function Home() {
  return (
    <main className="max-w-400 m-auto px-8 py-8">
      <h1 className="text-2xl font-medium tracking-tight text-neutral-700">
        Home
      </h1>
      <Link href="/sign-in" className="block leading-12 text-neutral-500">
        Sign In
      </Link>
      <Link href="/sign-up" className="block leading-12 text-neutral-500">
        Sign Up
      </Link>
    </main>
  );
}
