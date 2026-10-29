"use client";

import { useState } from "react";
import { deleteProject } from "@/app/admin/actions";

export function DeleteProjectButton({ id, title }: { id: string; title: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-md border border-red-400/50 px-4 py-2 text-sm text-red-400 hover:bg-red-400/10"
      >
        Delete project
      </button>
    );
  }

  return (
    <form action={deleteProject.bind(null, id)} className="space-y-3">
      <p className="text-sm">
        Delete <strong>{title}</strong>? This can&apos;t be undone.
      </p>
      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-md bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
        >
          Yes, delete
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-md border border-foreground/20 px-4 py-2 text-sm hover:bg-foreground/5"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
