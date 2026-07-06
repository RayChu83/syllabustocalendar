import React from "react";
import GoogleOauthButton from "./_components/GoogleOauthButton";

export default function Home() {
  return (
    <main className="max-w-320 m-auto px-8 py-8">
      <h1 className="text-2xl font-medium tracking-tight text-neutral-700">
        Home
      </h1>
      <GoogleOauthButton />
    </main>
  );
}
