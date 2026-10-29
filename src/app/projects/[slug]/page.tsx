import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImageGallery } from "@/components/ImageGallery";
import { KindBadge } from "@/components/KindBadge";
import { Markdown } from "@/components/Markdown";
import {
  getAdjacentProjects,
  getProjectBySlug,
  getPublishedProjects,
} from "@/lib/projects";

export async function generateStaticParams() {
  const projects = await getPublishedProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: `${project.title} · Leke`,
    description: project.tagline,
    openGraph: {
      title: project.title,
      description: project.tagline,
      images: project.coverImage ? [project.coverImage] : undefined,
    },
  };
}

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const { previous, next } = await getAdjacentProjects(slug);

  return (
    <article>
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">{project.title}</h1>
          <KindBadge kind={project.kind} />
        </div>
        <p className="mt-2 text-foreground/70">{project.tagline}</p>
        {project.stack.length > 0 && (
          <p className="mt-2 text-sm text-foreground/50">{project.stack.join(" · ")}</p>
        )}
        <div className="mt-4 flex gap-3 text-sm">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-foreground px-3 py-1.5 text-background"
            >
              Visit live project
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-foreground/20 px-3 py-1.5 hover:bg-foreground/5"
            >
              View code
            </a>
          )}
        </div>
      </header>

      <section className="mb-10">
        <h2 className="mb-2 text-xl font-semibold">Summary</h2>
        <Markdown>{project.summary}</Markdown>
        <ImageGallery images={project.summaryImages} label="Summary" />
      </section>

      {project.kind === "TEAM" && project.myRole && (
        <section className="mb-10">
          <h2 className="mb-2 text-xl font-semibold">My role</h2>
          <p>{project.myRole}</p>
        </section>
      )}

      <section className="mb-10">
        <h2 className="mb-2 text-xl font-semibold">Reasoning</h2>
        <Markdown>{project.reasoning}</Markdown>
        <ImageGallery images={project.reasoningImages} label="Reasoning" />
      </section>

      <section className="mb-10">
        <h2 className="mb-2 text-xl font-semibold">Technical depth</h2>
        <Markdown>{project.technicalDepth}</Markdown>
        <ImageGallery images={project.technicalDepthImages} label="Technical depth" />
      </section>

      <nav className="flex justify-between border-t border-foreground/10 pt-6 text-sm">
        {previous ? (
          <Link href={`/projects/${previous.slug}`} className="hover:underline">
            ← {previous.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/projects/${next.slug}`} className="hover:underline">
            {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
