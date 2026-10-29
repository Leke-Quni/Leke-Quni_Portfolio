import { prisma } from "../src/lib/prisma";

const projects = [
  {
    slug: "placeholder-solo",
    title: "Placeholder Solo Project",
    tagline: "A short one-line description of what this project does.",
    kind: "SOLO" as const,
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
    kind: "TEAM" as const,
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
    kind: "SOLO" as const,
    stack: [],
    order: 3,
    published: false,
    summary: "Draft.",
    reasoning: "Draft.",
    technicalDepth: "Draft.",
  },
];

async function main() {
  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: project,
      create: project,
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
