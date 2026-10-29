import type { ProjectKind } from "@/lib/projects";

export function KindBadge({ kind }: { kind: ProjectKind }) {
  return (
    <span className="rounded-full border border-foreground/20 px-2 py-0.5 text-xs uppercase tracking-wide">
      {kind === "solo" ? "Solo" : "Team"}
    </span>
  );
}
