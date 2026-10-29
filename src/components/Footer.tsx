export function Footer() {
  return (
    <footer className="mt-auto border-t border-foreground/10">
      <div className="mx-auto flex max-w-3xl flex-wrap gap-5 px-6 py-6 text-sm text-foreground/70">
        <a href="mailto:you@example.com" className="hover:underline">
          Email
        </a>
        <a href="https://github.com/" className="hover:underline">
          GitHub
        </a>
        <a href="https://www.linkedin.com/" className="hover:underline">
          LinkedIn
        </a>
      </div>
    </footer>
  );
}
