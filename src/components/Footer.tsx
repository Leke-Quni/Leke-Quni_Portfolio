export function Footer() {
  return (
    <footer className="mt-auto border-t border-foreground/10">
      <div className="mx-auto flex max-w-3xl flex-wrap gap-5 px-6 py-6 text-sm text-foreground/70">
        <a href="mailto:qunileke@gmail.com" className="hover:underline">
          Email
        </a>
        <a
          href="https://github.com/Leka610"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          GitHub
        </a>
        <a
          href="https://www.linkedin.com/in/leke-quni-a3a916261/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          LinkedIn
        </a>
      </div>
    </footer>
  );
}
