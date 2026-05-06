"use client";

import { useSession } from "@/app/_context/AuthContext";

export default function Dashboard() {
  const session = useSession();

  // undefined = still loading, null = no session, object = logged in
  if (session === undefined) {
    return (
      <main className="mt-17 flex flex-col gap-10 max-w-400 mx-auto p-6">
        <div>Loading session...</div>
      </main>
    );
  }

  if (session === null) {
    return (
      <main className="mt-17 flex flex-col gap-10 max-w-400 mx-auto p-6">
        <div>Not logged in</div>
      </main>
    );
  }

  return (
    <main className="mt-17 flex flex-col gap-10 max-w-400 mx-auto p-6">
      <h1>Dashboard</h1>
      <div>Welcome, {session.user.email}</div>
      <pre>{JSON.stringify(session.user, null, 2)}</pre>
    </main>
  );
}
