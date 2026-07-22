import React from "react";
import GoogleOauthButton from "./_components/GoogleOauthButton";
import Image from "next/image";

export default function Home() {
  return (
    <main className="max-w-md h-screen m-auto px-8 py-8 flex flex-col items-center justify-center rounded-2xl">
      <Image
        src="/logos/logo1.png"
        alt="Logo"
        width={40}
        height={40}
        className="mb-6"
      />
      <h1 className="text-2xl tracking-tight text-neutral-700 mb-2 text-center">
        Lets get you started
      </h1>
      <p className="text-neutral-500 mb-6 text-center">
        Sync now, have forever.
      </p>
      <GoogleOauthButton />
    </main>
  );
}
