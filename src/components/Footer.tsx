import { EmailContact } from "@/components/EmailContact";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-foreground/10">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-2 gap-y-3 sm:gap-x-5 px-6 py-6 text-sm">
        <EmailContact />
        <a
          href="https://github.com/Leke-Quni"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-foreground/30 px-4 py-2 font-medium text-foreground hover:bg-foreground/10"
        >
          GitHub
        </a>
        <a
          href="https://www.linkedin.com/in/leke-quni-a3a916261/"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-foreground/30 px-4 py-2 font-medium text-foreground hover:bg-foreground/10"
        >
          LinkedIn
        </a>
      </div>
    </footer>
  );
}
