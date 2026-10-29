"use client";

import { useRef, useState, useTransition } from "react";
import type { UploadResult } from "@/app/admin/actions";

export function FileUploadButton({
  action,
  accept,
  label,
  multiple = false,
  onUploaded,
}: {
  action: (prev: UploadResult, formData: FormData) => Promise<UploadResult>;
  accept: string;
  label: string;
  multiple?: boolean;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    setError(undefined);
    startTransition(async () => {
      for (const file of files) {
        const formData = new FormData();
        formData.set("file", file);
        try {
          const result = await action({}, formData);
          if (result.error) setError(`${file.name}: ${result.error}`);
          else if (result.url) onUploaded(result.url);
        } catch {
          setError(`${file.name}: upload failed. Try again.`);
        }
      }
    });
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
      <button
        type="button"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
        className="rounded-md border border-foreground/20 px-3 py-1.5 text-sm hover:bg-foreground/5 disabled:opacity-50"
      >
        {pending ? "Uploading…" : label}
      </button>
      {error && <span className="text-sm text-red-400">{error}</span>}
    </span>
  );
}
