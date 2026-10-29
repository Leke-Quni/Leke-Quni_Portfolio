"use client";

import { useEffect, useRef, useState } from "react";

export function ImageGallery({
  images,
  label,
}: {
  images: string[];
  label: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (openIndex !== null && !dialog.open) dialog.showModal();
    if (openIndex === null && dialog.open) dialog.close();
  }, [openIndex]);

  if (images.length === 0) return null;

  const step = (delta: number) =>
    setOpenIndex((i) => (i === null ? i : (i + delta + images.length) % images.length));

  return (
    <>
      <ul className="mt-4 flex flex-wrap gap-3">
        {images.map((url, i) => (
          <li key={url}>
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              aria-label={`Open ${label} image ${i + 1}`}
              className="block overflow-hidden rounded-md border border-foreground/20 hover:border-foreground/50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`${label} image ${i + 1}`}
                loading="lazy"
                className="h-24 w-36 object-cover"
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => setOpenIndex(null)}
        onClick={(e) => {
          if (e.target === dialogRef.current) setOpenIndex(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") step(-1);
          if (e.key === "ArrowRight") step(1);
        }}
        className="m-auto max-h-[92vh] max-w-[92vw] bg-transparent p-0 text-foreground backdrop:bg-black/80"
      >
        {openIndex !== null && (
          <div className="flex flex-col items-center gap-3 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[openIndex]}
              alt={`${label} image ${openIndex + 1}`}
              className="max-h-[78vh] max-w-full rounded-md object-contain"
            />
            <div className="flex items-center gap-4 text-sm">
              {images.length > 1 && (
                <button type="button" onClick={() => step(-1)} className="hover:underline">
                  ← Previous
                </button>
              )}
              <span className="text-foreground/60">
                {openIndex + 1} / {images.length}
              </span>
              {images.length > 1 && (
                <button type="button" onClick={() => step(1)} className="hover:underline">
                  Next →
                </button>
              )}
              <button type="button" onClick={() => setOpenIndex(null)} className="hover:underline">
                Close
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
