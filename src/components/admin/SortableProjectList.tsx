"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { useState, useTransition } from "react";
import { reorderProjects, setPublished } from "@/app/admin/actions";
import { KindBadge } from "@/components/KindBadge";
import type { Project } from "@/lib/projects";

export type AdminProject = Pick<
  Project,
  "id" | "title" | "slug" | "kind" | "published"
>;

function Row({ project }: { project: AdminProject }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: project.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center justify-between gap-4 bg-background py-4 ${
        isDragging ? "relative z-10 opacity-80 shadow-lg" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Drag to reorder ${project.title}`}
          className="cursor-grab touch-none px-1 text-foreground/50 hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
        <div>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-medium">{project.title}</span>
            <KindBadge kind={project.kind} />
            <span className="text-xs text-foreground/50">
              {project.published ? "Published" : "Draft"}
            </span>
          </div>
          <p className="text-sm text-foreground/50">/projects/{project.slug}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <form action={setPublished.bind(null, project.id, !project.published)}>
          <button type="submit" className="hover:underline">
            {project.published ? "Unpublish" : "Publish"}
          </button>
        </form>
        <Link href={`/admin/projects/${project.id}`} className="hover:underline">
          Edit
        </Link>
      </div>
    </li>
  );
}

export function SortableProjectList({ projects }: { projects: AdminProject[] }) {
  const [orderIds, setOrderIds] = useState(() => projects.map((p) => p.id));
  const [error, setError] = useState<string>();
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const byId = new Map(projects.map((p) => [p.id, p]));
  const items = orderIds.flatMap((id) => byId.get(id) ?? []);

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;

    const previous = orderIds;
    const next = arrayMove(
      orderIds,
      orderIds.indexOf(String(active.id)),
      orderIds.indexOf(String(over.id)),
    );
    setOrderIds(next);
    setError(undefined);

    startTransition(async () => {
      const result = await reorderProjects(next);
      if (result.error) {
        setOrderIds(previous);
        setError(result.error);
      }
    });
  }

  return (
    <div>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      <DndContext
        id="admin-project-list"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={orderIds} strategy={verticalListSortingStrategy}>
          <ul className="mt-4 divide-y divide-foreground/10 border-y border-foreground/10">
            {items.map((project) => (
              <Row key={project.id} project={project} />
            ))}
            {items.length === 0 && (
              <li className="py-4 text-foreground/50">No projects yet.</li>
            )}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}
