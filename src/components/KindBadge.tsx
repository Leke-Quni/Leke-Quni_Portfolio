import type { Project } from "@/lib/projects";

export function KindBadge({ kind }: { kind: Project["kind"] }) {
  return (
    <span className="shrink-0 whitespace-nowrap rounded-full border border-foreground/20 px-2 py-0.5 text-xs uppercase tracking-wide">
      {kind === "SOLO" ? "Solo" : "Team"}
    </span>
  );
}
