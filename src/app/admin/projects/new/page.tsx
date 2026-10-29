import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { requireAdmin } from "@/lib/admin";
import { createProject } from "../../actions";

export const metadata: Metadata = {
  title: "New project · Admin",
  robots: { index: false },
};

async function NewProject() {
  await connection();
  await requireAdmin();
  return <ProjectForm action={createProject} />;
}

export default function NewProjectPage() {
  return (
    <div>
      <Link href="/admin" className="text-sm text-foreground/70 hover:underline">
        ← Admin
      </Link>
      <h1 className="mt-4 mb-6 text-3xl font-semibold tracking-tight">New project</h1>
      <Suspense>
        <NewProject />
      </Suspense>
    </div>
  );
}
