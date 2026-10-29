import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">About</h1>
      <p className="mt-4 text-foreground/70">
        Placeholder. Write a short bio covering your background, what you are
        interested in, and what you are looking for.
      </p>
      <p className="mt-4">
        <a
          href="/cv.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          View my CV
        </a>
      </p>
    </div>
  );
}
