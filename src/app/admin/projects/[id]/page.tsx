import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { updateProject } from "../../actions";

export const metadata: Metadata = {
  title: "Edit project · Admin",
  robots: { index: false },
};

async function EditProject({ params }: Pick<PageProps<"/admin/projects/[id]">, "params">) {
  await requireAdmin();
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  return <ProjectForm action={updateProject.bind(null, id)} project={project} />;
}

export default function EditProjectPage({ params }: PageProps<"/admin/projects/[id]">) {
  return (
    <div>
      <Link href="/admin" className="text-sm text-foreground/70 hover:underline">
        ← Admin
      </Link>
      <h1 className="mt-4 mb-6 text-3xl font-semibold tracking-tight">Edit project</h1>
      <Suspense>
        <EditProject params={params} />
      </Suspense>
    </div>
  );
}
