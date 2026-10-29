import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "@/auth";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { KindBadge } from "@/components/KindBadge";
import { setPublished } from "./actions";

export const metadata: Metadata = {
  title: "Admin · Leke",
  robots: { index: false },
};

async function AdminDashboard() {
  const session = await requireAdmin();
  const projects = await prisma.project.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button type="submit" className="text-sm text-foreground/70 hover:underline">
            Sign out ({session.user?.name})
          </button>
        </form>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wide text-foreground/60">
          Projects
        </h2>
        <Link
          href="/admin/projects/new"
          className="rounded-md bg-foreground px-3 py-1.5 text-sm text-background"
        >
          New project
        </Link>
      </div>

      <ul className="mt-4 divide-y divide-foreground/10 border-y border-foreground/10">
        {projects.map((project) => (
          <li key={project.id} className="flex items-center justify-between gap-4 py-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-medium">{project.title}</span>
                <KindBadge kind={project.kind} />
                <span className="text-xs text-foreground/50">
                  {project.published ? "Published" : "Draft"}
                </span>
              </div>
              <p className="text-sm text-foreground/50">/projects/{project.slug}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <form action={setPublished.bind(null, project.id, !project.published)}>
                <button type="submit" className="hover:underline">
                  {project.published ? "Unpublish" : "Publish"}
                </button>
              </form>
              <Link href={`/admin/projects/${project.id}`} className="hover:underline">
                Edit
              </Link>
            </div>
          </li>
        ))}
        {projects.length === 0 && (
          <li className="py-4 text-foreground/50">No projects yet.</li>
        )}
      </ul>
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
