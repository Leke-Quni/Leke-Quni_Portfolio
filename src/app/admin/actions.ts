"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "../../../generated/prisma/client";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { parseProjectForm, type ProjectFormState } from "@/lib/project-input";

const SLUG_TAKEN: ProjectFormState = {
  fieldErrors: { slug: "Another Project already uses this slug." },
};

export async function createProject(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireAdmin();
  const parsed = parseProjectForm(formData);
  if ("fieldErrors" in parsed) return { fieldErrors: parsed.fieldErrors };

  try {
    const last = await prisma.project.aggregate({ _max: { order: true } });
    await prisma.project.create({
      data: { ...parsed.data, order: (last._max.order ?? 0) + 1 },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return SLUG_TAKEN;
    }
    throw e;
  }

  updateTag("projects");
  redirect("/admin");
}

export async function updateProject(
  id: string,
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireAdmin();
  const parsed = parseProjectForm(formData);
  if ("fieldErrors" in parsed) return { fieldErrors: parsed.fieldErrors };

  try {
    await prisma.project.update({ where: { id }, data: parsed.data });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") return SLUG_TAKEN;
      if (e.code === "P2025") return { error: "This Project no longer exists." };
    }
    throw e;
  }

  updateTag("projects");
  redirect("/admin");
}

export async function setPublished(id: string, published: boolean) {
  await requireAdmin();
  await prisma.project.update({ where: { id }, data: { published } });
  updateTag("projects");
  redirect("/admin");
}
