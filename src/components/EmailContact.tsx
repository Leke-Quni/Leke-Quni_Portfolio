"use client";

import { useEffect, useRef, useState } from "react";
import { CONTACT_EMAIL } from "@/lib/contact";

type Notice = { text: string; tone: "info" | "warning" };

export function EmailContact() {
  const [notice, setNotice] = useState<Notice>();
  const [copied, setCopied] = useState(false);
  const addressRef = useRef<HTMLSpanElement>(null);
  const openTimer = useRef<number>(undefined);
  const noticeTimer = useRef<number>(undefined);
  const copiedTimer = useRef<number>(undefined);

  useEffect(
    () => () => {
      window.clearTimeout(openTimer.current);
      window.clearTimeout(noticeTimer.current);
      window.clearTimeout(copiedTimer.current);
    },
    [],
  );

  function showNotice(next: Notice, ms: number) {
    window.clearTimeout(noticeTimer.current);
    setNotice(next);
    noticeTimer.current = window.setTimeout(() => setNotice(undefined), ms);
  }

  async function tryCopy() {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      window.clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => setCopied(false), 2000);
      return true;
    } catch {
      if (addressRef.current) window.getSelection()?.selectAllChildren(addressRef.current);
      return false;
    }
  }

  function handleMailtoClick() {
    window.clearTimeout(openTimer.current);
    const cancel = () => window.clearTimeout(openTimer.current);
    window.addEventListener("blur", cancel, { once: true });
    document.addEventListener("visibilitychange", cancel, { once: true });

    openTimer.current = window.setTimeout(async () => {
      window.removeEventListener("blur", cancel);
      document.removeEventListener("visibilitychange", cancel);
      const didCopy = await tryCopy();
      showNotice(
        {
          tone: "warning",
          text: didCopy
            ? `Couldn't open a mail app. ${CONTACT_EMAIL} was copied to your clipboard.`
            : `Couldn't open a mail app. You can reach me at ${CONTACT_EMAIL}.`,
        },
        8000,
      );
    }, 1500);
  }

  async function handleCopy() {
    const didCopy = await tryCopy();
    showNotice(
      {
        tone: "info",
        text: didCopy
          ? "Email address copied."
          : `Couldn't copy automatically. ${CONTACT_EMAIL} is selected: press Ctrl+C (⌘C on Mac).`,
      },
      didCopy ? 3000 : 8000,
    );
  }

  return (
    <div className="w-full sm:w-auto">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <a href={`mailto:${CONTACT_EMAIL}`} onClick={handleMailtoClick} className="hover:underline">
          Email
        </a>
        <span ref={addressRef} className="select-all text-foreground/60">
          {CONTACT_EMAIL}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy email address"
          title="Copy email address"
          className="rounded-md border border-foreground/20 p-1.5 hover:bg-foreground/5"
        >
          {copied ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>

      {notice && (
        <div
          role={notice.tone === "warning" ? "alert" : "status"}
          className={`fixed inset-x-4 bottom-6 z-50 mx-auto flex max-w-md items-start gap-3 rounded-md border px-4 py-3 text-sm shadow-lg ${
            notice.tone === "warning"
              ? "border-amber-400/60 bg-amber-950 text-amber-100"
              : "border-foreground/30 bg-background text-foreground"
          }`}
        >
          <p className="flex-1">{notice.text}</p>
          <button
            type="button"
            onClick={() => setNotice(undefined)}
            aria-label="Dismiss"
            className="text-foreground/70 hover:text-foreground"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
