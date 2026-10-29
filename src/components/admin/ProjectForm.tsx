"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/projects";
import type { ProjectFormState } from "@/lib/project-input";
import { uploadImage } from "@/app/admin/actions";
import { RemoteImage } from "@/components/RemoteImage";
import { FileUploadButton } from "./FileUploadButton";
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
  const [coverImage, setCoverImage] = useState(project?.coverImage ?? "");
  const errors = state.fieldErrors ?? {};
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const snapshot = () =>
      JSON.stringify(
        Array.from(new FormData(formRef.current!).entries()).map(([key, value]) => [
          key,
          typeof value === "string" ? value : value.name,
        ]),
      );
    const initial = snapshot();
    const isDirty = () => formRef.current !== null && snapshot() !== initial;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty()) e.preventDefault();
    };
    const onClick = (e: MouseEvent) => {
      if (!isDirty() || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank") return;
      if (new URL(link.href).origin !== window.location.origin) return;
      if (!window.confirm("You have unsaved changes. Leave without saving?")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <Field name="title" label="Title" error={errors.title}>
        <input id="title" name="title" placeholder="My Project" defaultValue={project?.title} className={inputClass} />
      </Field>

      <Field name="slug" label="Slug (used in the URL)" error={errors.slug}>
        <input id="slug" name="slug" placeholder="my-project" defaultValue={project?.slug} className={inputClass} />
      </Field>

      <Field name="tagline" label="One-line summary" error={errors.tagline}>
        <input id="tagline" name="tagline" placeholder="A short one-line description of what it does." defaultValue={project?.tagline} className={inputClass} />
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
          <input id="myRole" name="myRole" placeholder="e.g. Built the API and authentication" defaultValue={project?.myRole ?? ""} className={inputClass} />
        </Field>
      )}

      <Field name="stack" label="Stack (comma separated)" error={errors.stack}>
        <input id="stack" name="stack" placeholder="TypeScript, React, PostgreSQL" defaultValue={project?.stack.join(", ")} className={inputClass} />
      </Field>

      <Field name="liveUrl" label="Live project URL" error={errors.liveUrl}>
        <input id="liveUrl" name="liveUrl" placeholder="https://my-project.vercel.app" defaultValue={project?.liveUrl ?? ""} className={inputClass} />
      </Field>

      <Field name="repoUrl" label="Repository URL" error={errors.repoUrl}>
        <input id="repoUrl" name="repoUrl" placeholder="https://github.com/Leka610/my-project" defaultValue={project?.repoUrl ?? ""} className={inputClass} />
      </Field>

      <Field name="coverImage" label="Cover image URL" error={errors.coverImage}>
        {coverImage && (
          <div className="mb-3 flex items-start gap-3">
            <RemoteImage
              src={coverImage}
              alt="Cover preview"
              width={144}
              height={96}
              className="h-24 w-36 rounded-md border border-foreground/20 object-cover"
            />
            <button
              type="button"
              onClick={() => setCoverImage("")}
              className="rounded-md border border-red-400/50 px-3 py-1.5 text-sm text-red-400 hover:bg-red-400/10"
            >
              Remove
            </button>
          </div>
        )}
        <div className="flex gap-3">
          <input
            id="coverImage"
            name="coverImage"
            placeholder="https://example.com/cover.png"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className={inputClass}
          />
          <FileUploadButton
            action={uploadImage}
            accept="image/png,image/jpeg,image/gif,image/webp"
            label={coverImage ? "Replace" : "Upload"}
            onUploaded={setCoverImage}
          />
        </div>
      </Field>

      <MarkdownField
        name="summary"
        label="Summary"
        placeholder={"**Outcome:** What it achieved, e.g. shipped to 200 users.\n\n**Stack:** TypeScript, React, PostgreSQL."}
        defaultValue={project?.summary}
        imagesName="summaryImages"
        defaultImages={project?.summaryImages}
        error={errors.summary}
        imagesError={errors.summaryImages}
      />
      <MarkdownField
        name="reasoning"
        label="Reasoning"
        placeholder={"Why you made the key decisions, and what you rejected.\n\n- Decision one, and why\n- Decision two, and why"}
        defaultValue={project?.reasoning}
        imagesName="reasoningImages"
        defaultImages={project?.reasoningImages}
        error={errors.reasoning}
        imagesError={errors.reasoningImages}
      />
      <MarkdownField
        name="technicalDepth"
        label="Technical depth"
        placeholder={"Architecture, data model, tricky parts.\n\n```ts\nconst example = 'code snippet';\n```"}
        defaultValue={project?.technicalDepth}
        imagesName="technicalDepthImages"
        defaultImages={project?.technicalDepthImages}
        error={errors.technicalDepth}
        imagesError={errors.technicalDepthImages}
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
