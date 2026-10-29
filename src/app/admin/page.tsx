import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { signOut } from "@/auth";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { CvUpload } from "@/components/admin/CvUpload";
import { SortableProjectList } from "@/components/admin/SortableProjectList";

export const metadata: Metadata = {
  title: "Admin · Leke",
  robots: { index: false },
};

async function AdminDashboard() {
  await connection();
  const session = await requireAdmin();
  const projects = await prisma.project.findMany({ orderBy: { order: "asc" } });
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });

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

      <SortableProjectList
        projects={projects.map(({ id, title, slug, kind, published }) => ({
          id,
          title,
          slug,
          kind,
          published,
        }))}
      />

      <h2 className="mt-12 text-sm font-medium uppercase tracking-wide text-foreground/60">
        CV
      </h2>
      <CvUpload hasCv={!!settings?.cvUrl} />
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
