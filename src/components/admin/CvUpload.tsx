"use client";

import { useState } from "react";
import { uploadCv } from "@/app/admin/actions";
import { FileUploadButton } from "./FileUploadButton";

export function CvUpload({ hasCv }: { hasCv: boolean }) {
  const [uploaded, setUploaded] = useState(false);

  return (
    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
      {hasCv || uploaded ? (
        <a href="/cv.pdf" target="_blank" rel="noopener noreferrer" className="underline">
          View current CV
        </a>
      ) : (
        <span className="text-foreground/50">No CV uploaded yet.</span>
      )}
      <FileUploadButton
        action={uploadCv}
        accept="application/pdf"
        label={hasCv || uploaded ? "Replace CV (PDF)" : "Upload CV (PDF)"}
        onUploaded={() => setUploaded(true)}
      />
      {uploaded && <span className="text-foreground/70">CV uploaded.</span>}
    </div>
  );
}
