import Link from "next/link";
import { KindBadge } from "@/components/KindBadge";
import { getPublishedProjects } from "@/lib/projects";

export default async function Home() {
  const projects = await getPublishedProjects();

  return (
    <div>
      <section className="mb-12">
        <h1 className="text-3xl font-semibold tracking-tight">Hi, I&apos;m Leke.</h1>
        <p className="mt-3 text-foreground/70">
          Placeholder intro. A sentence or two on who you are and what you build.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-foreground/60">
          Projects
        </h2>
        <ul className="divide-y divide-foreground/10 border-y border-foreground/10">
          {projects.map((project) => (
            <li key={project.slug}>
              <Link
                href={`/projects/${project.slug}`}
                className="block py-5 hover:bg-foreground/5"
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-medium">{project.title}</h3>
                  <KindBadge kind={project.kind} />
                </div>
                <p className="mt-1 text-foreground/70">{project.tagline}</p>
                {project.stack.length > 0 && (
                  <p className="mt-2 text-sm text-foreground/50">
                    {project.stack.join(" · ")}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
