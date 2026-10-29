"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/app/admin/actions";
import { Markdown } from "@/components/Markdown";
import { FileUploadButton } from "./FileUploadButton";

const IMAGE_TYPES = "image/png,image/jpeg,image/gif,image/webp";
const INLINE_IMAGE = /!\[[^\]]*\]\(([^)\s]+)\)/g;

export function MarkdownField({
  name,
  label,
  placeholder,
  defaultValue = "",
  imagesName,
  defaultImages = [],
  error,
  imagesError,
}: {
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  imagesName: string;
  defaultImages?: string[];
  error?: string;
  imagesError?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [images, setImages] = useState(defaultImages);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function insertImage(url: string) {
    const markdown = `![describe the image](${url})`;
    const el = textareaRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    setValue(value.slice(0, start) + markdown + value.slice(end));
  }

  const inlineImages = [...value.matchAll(INLINE_IMAGE)].map((m) => ({
    markdown: m[0],
    url: m[1],
    index: m.index,
  }));

  function removeInlineImage(index: number, markdown: string) {
    setValue(value.slice(0, index) + value.slice(index + markdown.length));
  }

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
          ref={textareaRef}
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

      <div className="mt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground/60">
          {label} images
        </p>
        {images.length > 0 && (
          <ul className="mb-3 flex flex-wrap gap-3">
            {images.map((url) => (
              <li key={url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="h-24 w-24 rounded-md border border-foreground/20 object-cover"
                />
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => setImages((prev) => prev.filter((u) => u !== url))}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600"
                >
                  ✕
                </button>
                <input type="hidden" name={imagesName} value={url} />
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap items-start gap-3">
          <FileUploadButton
            action={uploadImage}
            accept={IMAGE_TYPES}
            label="Add images"
            multiple
            onUploaded={(url) => setImages((prev) => [...prev, url])}
          />
          <FileUploadButton
            action={uploadImage}
            accept={IMAGE_TYPES}
            label="Insert image into text"
            onUploaded={insertImage}
          />
        </div>
        {inlineImages.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground/60">
              Images in text
            </p>
            <ul className="flex flex-wrap gap-3">
              {inlineImages.map(({ markdown, url, index }) => (
                <li key={index} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="h-24 w-24 rounded-md border border-foreground/20 object-cover"
                  />
                  <button
                    type="button"
                    aria-label="Remove image from text"
                    onClick={() => removeInlineImage(index, markdown)}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {imagesError && <p className="mt-1 text-sm text-red-400">{imagesError}</p>}
      </div>
    </div>
  );
}
