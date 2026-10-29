"use client";

import { useActionState, useState } from "react";
import type { Project } from "@/lib/projects";
import type { ProjectFormState } from "@/lib/project-input";
import { MarkdownField } from "./MarkdownField";

const inputClass =
  "w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2 text-sm";

function Field({
  name,
  label,
  error,
  children,
}: {
  name: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}

export function ProjectForm({
  action,
  project,
}: {
  action: (
    prev: ProjectFormState,
    formData: FormData,
  ) => Promise<ProjectFormState>;
  project?: Project;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [kind, setKind] = useState<Project["kind"]>(project?.kind ?? "SOLO");
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6">
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <Field name="title" label="Title" error={errors.title}>
        <input id="title" name="title" defaultValue={project?.title} className={inputClass} />
      </Field>

      <Field name="slug" label="Slug (used in the URL)" error={errors.slug}>
        <input id="slug" name="slug" defaultValue={project?.slug} className={inputClass} />
      </Field>

      <Field name="tagline" label="One-line summary" error={errors.tagline}>
        <input id="tagline" name="tagline" defaultValue={project?.tagline} className={inputClass} />
      </Field>

      <Field name="kind" label="Solo or Team" error={errors.kind}>
        <select
          id="kind"
          name="kind"
          value={kind}
          onChange={(e) => setKind(e.target.value as Project["kind"])}
          className={inputClass}
        >
          <option value="SOLO">Solo</option>
          <option value="TEAM">Team</option>
        </select>
      </Field>

      {kind === "TEAM" && (
        <Field name="myRole" label="My role" error={errors.myRole}>
          <input id="myRole" name="myRole" defaultValue={project?.myRole ?? ""} className={inputClass} />
        </Field>
      )}

      <Field name="stack" label="Stack (comma separated)" error={errors.stack}>
        <input id="stack" name="stack" defaultValue={project?.stack.join(", ")} className={inputClass} />
      </Field>

      <Field name="liveUrl" label="Live project URL" error={errors.liveUrl}>
        <input id="liveUrl" name="liveUrl" defaultValue={project?.liveUrl ?? ""} className={inputClass} />
      </Field>

      <Field name="repoUrl" label="Repository URL" error={errors.repoUrl}>
        <input id="repoUrl" name="repoUrl" defaultValue={project?.repoUrl ?? ""} className={inputClass} />
      </Field>

      <Field name="coverImage" label="Cover image URL" error={errors.coverImage}>
        <input id="coverImage" name="coverImage" defaultValue={project?.coverImage ?? ""} className={inputClass} />
      </Field>

      <MarkdownField name="summary" label="Summary" defaultValue={project?.summary} error={errors.summary} />
      <MarkdownField name="reasoning" label="Reasoning" defaultValue={project?.reasoning} error={errors.reasoning} />
      <MarkdownField
        name="technicalDepth"
        label="Technical depth"
        defaultValue={project?.technicalDepth}
        error={errors.technicalDepth}
      />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" defaultChecked={project?.published} />
        Published
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
