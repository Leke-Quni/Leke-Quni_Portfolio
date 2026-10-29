import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-foreground/10">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-semibold">
          Leke Quni
        </Link>
        <div className="flex gap-5 text-sm">
          <Link href="/" className="hover:underline">
            Projects
          </Link>
          <Link href="/about" className="hover:underline">
            About
          </Link>
          <a
            href="/cv.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            CV
          </a>
        </div>
      </nav>
    </header>
  );
}
