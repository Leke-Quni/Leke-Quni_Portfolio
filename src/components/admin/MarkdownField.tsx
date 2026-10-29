"use client";

import { useState } from "react";
import { Markdown } from "@/components/Markdown";

export function MarkdownField({
  name,
  label,
  placeholder,
  defaultValue = "",
  error,
}: {
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  error?: string;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <p className="mb-2 text-xs text-foreground/50">
        {"**bold** · *italic* · `code` · - list item · [link](https://…) · ```ts … ``` code block"}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <textarea
          id={name}
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          rows={10}
          className="w-full rounded-md border border-foreground/20 bg-transparent p-3 font-mono text-sm"
        />
        <div className="rounded-md border border-foreground/10 p-3">
          <Markdown>{value || "*Preview*"}</Markdown>
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
