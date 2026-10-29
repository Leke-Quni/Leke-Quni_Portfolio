import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth, signOut } from "@/auth";

export const metadata: Metadata = {
  title: "Admin · Leke",
  robots: { index: false },
};

async function AdminDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
      <p className="mt-3 text-foreground/70">Signed in as {session.user.name}.</p>
      <form
        className="mt-6"
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          className="rounded-md border border-foreground/20 px-4 py-2 text-sm hover:bg-foreground/5"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense>
      <AdminDashboard />
    </Suspense>
  );
}
