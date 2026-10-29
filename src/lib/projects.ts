export type ProjectKind = "solo" | "team";

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  kind: ProjectKind;
  myRole?: string;
  stack: string[];
  repoUrl?: string;
  liveUrl?: string;
  coverImage?: string;
  order: number;
  published: boolean;
  summary: string;
  reasoning: string;
  technicalDepth: string;
};

const projects: Project[] = [
  {
    slug: "placeholder-solo",
    title: "Placeholder Solo Project",
    tagline: "A short one-line description of what this project does.",
    kind: "solo",
    stack: ["TypeScript", "React", "PostgreSQL"],
    repoUrl: "https://github.com/",
    liveUrl: "https://example.com",
    order: 1,
    published: true,
    summary:
      "**Outcome:** Replace with the result, e.g. shipped to N users.\n\n**Stack:** TypeScript, React, PostgreSQL.",
    reasoning:
      "Why the key decisions were made, and which alternatives were rejected.\n\n- Decision one and why\n- Decision two and why",
    technicalDepth:
      "Implementation detail for engineers: architecture, data model, tricky parts.\n\n```ts\nconst example = 'code snippet';\n```",
  },
  {
    slug: "placeholder-team",
    title: "Placeholder Team Project",
    tagline: "A project built together with a team.",
    kind: "team",
    myRole: "Replace with what you personally built, e.g. the API and auth.",
    stack: ["Next.js", "Prisma", "Docker"],
    repoUrl: "https://github.com/",
    liveUrl: "https://example.com",
    order: 2,
    published: true,
    summary:
      "**Outcome:** Replace with the result.\n\n**Stack:** Next.js, Prisma, Docker.",
    reasoning: "Why the team chose this approach, and your part in the decisions.",
    technicalDepth: "Implementation detail for the parts you owned.",
  },
  {
    slug: "placeholder-draft",
    title: "Unpublished Draft",
    tagline: "Should never appear on the public site.",
    kind: "solo",
    stack: [],
    order: 3,
    published: false,
    summary: "Draft.",
    reasoning: "Draft.",
    technicalDepth: "Draft.",
  },
];

export function getPublishedProjects(): Project[] {
  return projects.filter((p) => p.published).sort((a, b) => a.order - b.order);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return getPublishedProjects().find((p) => p.slug === slug);
}

export function getAdjacentProjects(slug: string): {
  previous?: Project;
  next?: Project;
} {
  const list = getPublishedProjects();
  const i = list.findIndex((p) => p.slug === slug);
  if (i === -1) return {};
  return { previous: list[i - 1], next: list[i + 1] };
}
