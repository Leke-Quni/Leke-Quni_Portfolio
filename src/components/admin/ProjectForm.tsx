"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/projects";
import type { ProjectFormState } from "@/lib/project-input";
import { importGithubRepo, uploadImage } from "@/app/admin/actions";
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
  const [myRole, setMyRole] = useState(project?.myRole ?? "");
  const [summaryDefault, setSummaryDefault] = useState(project?.summary);
  const [summaryKey, setSummaryKey] = useState(0);
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const errors = state.fieldErrors ?? {};
  const formRef = useRef<HTMLFormElement>(null);
  const imported = useRef<{ fields: Record<string, string>; summary?: string; myRole?: string } | null>(null);

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

  async function importRepo() {
    setImporting(true);
    setImportError("");
    const result = await importGithubRepo(importUrl);
    setImporting(false);
    if ("error" in result) {
      setImportError(result.error);
      return;
    }
    const form = formRef.current;
    if (!form) return;
    const { kind: importedKind, collaborators, myRole: importedRole, highlights, ...fields } = result.data;
    const filled: Record<string, string> = {};
    for (const [name, value] of Object.entries(fields)) {
      const input = form.elements.namedItem(name);
      if (input instanceof HTMLInputElement && value) {
        input.value = value;
        filled[name] = value;
      }
    }
    setKind(importedKind);
    imported.current = { fields: filled };
    if (importedRole && !myRole.trim()) {
      imported.current.myRole = importedRole;
      setMyRole(importedRole);
    }
    const summary = form.elements.namedItem("summary");
    if (collaborators.length > 1 && summary instanceof HTMLTextAreaElement && !summary.value.trim()) {
      const text =
        `**Team:** ${collaborators.join(", ")}` +
        (highlights.length > 0
          ? `\n\n**Highlights from my commits:**\n${highlights.map((h) => `- ${h}`).join("\n")}`
          : "");
      imported.current.summary = text;
      setSummaryDefault(text);
      setSummaryKey((k) => k + 1);
    }
  }

  function clearImport() {
    const form = formRef.current;
    const previous = imported.current;
    imported.current = null;
    setImportError("");
    if (!form || !previous) return;
    for (const name of Object.keys(previous.fields)) {
      const input = form.elements.namedItem(name);
      if (input instanceof HTMLInputElement) input.value = "";
    }
    setKind("SOLO");
    if (previous.myRole) setMyRole("");
    const summary = form.elements.namedItem("summary");
    if (previous.summary && summary instanceof HTMLTextAreaElement) {
      setSummaryDefault("");
      setSummaryKey((k) => k + 1);
    }
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      {!project && (
        <div>
          <label htmlFor="githubUrl" className="mb-1 block text-sm font-medium">
            Import from GitHub (optional)
          </label>
          <div className="flex gap-3">
            <input
              id="githubUrl"
              placeholder="https://github.com/Leke-Quni/my-project"
              value={importUrl}
              onChange={(e) => {
                setImportUrl(e.target.value);
                if (!e.target.value.trim()) clearImport();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (importUrl.trim() && !importing) importRepo();
                }
              }}
              className={inputClass}
            />
            <button
              type="button"
              onClick={importRepo}
              disabled={importing || !importUrl.trim()}
              className="rounded-md border border-foreground/20 px-3 py-1.5 text-sm hover:bg-foreground/10 disabled:opacity-50"
            >
              {importing ? "Importing…" : "Import"}
            </button>
          </div>
          {importError && <p className="mt-1 text-sm text-red-400">{importError}</p>}
        </div>
      )}

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
          <input id="myRole" name="myRole" placeholder="e.g. Built the API and authentication" value={myRole} onChange={(e) => setMyRole(e.target.value)} className={inputClass} />
        </Field>
      )}

      <Field name="stack" label="Stack (comma separated)" error={errors.stack}>
        <input id="stack" name="stack" placeholder="TypeScript, React, PostgreSQL" defaultValue={project?.stack.join(", ")} className={inputClass} />
      </Field>

      <Field name="liveUrl" label="Live project URL" error={errors.liveUrl}>
        <input id="liveUrl" name="liveUrl" placeholder="https://my-project.vercel.app" defaultValue={project?.liveUrl ?? ""} className={inputClass} />
      </Field>

      <Field name="repoUrl" label="Repository URL" error={errors.repoUrl}>
        <input id="repoUrl" name="repoUrl" placeholder="https://github.com/Leke-Quni/my-project" defaultValue={project?.repoUrl ?? ""} className={inputClass} />
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
        key={summaryKey}
        name="summary"
        label="Summary"
        placeholder={"**Outcome:** What it achieved, e.g. shipped to 200 users.\n\n**Stack:** TypeScript, React, PostgreSQL."}
        defaultValue={summaryDefault}
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
