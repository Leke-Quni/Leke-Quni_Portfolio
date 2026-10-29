import { z } from "zod";

function isHttpUrl(value: string) {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

const optionalUrl = z
  .string()
  .trim()
  .refine((v) => v === "" || isHttpUrl(v), "Enter a full http(s) URL.")
  .transform((v) => (v === "" ? null : v));

const MAX_SECTION_IMAGES = 12;

const imageList = z
  .array(z.string().trim().refine(isHttpUrl, "Enter a full http(s) URL."))
  .max(MAX_SECTION_IMAGES, `Up to ${MAX_SECTION_IMAGES} images per section.`);

const projectSchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens."),
  title: z.string().trim().min(1, "Required."),
  tagline: z.string().trim().min(1, "Required."),
  kind: z.enum(["SOLO", "TEAM"]),
  myRole: z.string().trim(),
  stack: z.string(),
  repoUrl: optionalUrl,
  liveUrl: optionalUrl,
  coverImage: optionalUrl,
  summary: z.string().trim().min(1, "Required."),
  reasoning: z.string().trim().min(1, "Required."),
  technicalDepth: z.string().trim().min(1, "Required."),
  summaryImages: imageList,
  reasoningImages: imageList,
  technicalDepthImages: imageList,
  published: z.boolean(),
});

export type ProjectFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export function parseProjectForm(formData: FormData) {
  const get = (key: string) => formData.get(key) ?? "";
  const result = projectSchema.safeParse({
    slug: get("slug"),
    title: get("title"),
    tagline: get("tagline"),
    kind: get("kind"),
    myRole: get("myRole"),
    stack: get("stack"),
    repoUrl: get("repoUrl"),
    liveUrl: get("liveUrl"),
    coverImage: get("coverImage"),
    summary: get("summary"),
    reasoning: get("reasoning"),
    technicalDepth: get("technicalDepth"),
    summaryImages: formData.getAll("summaryImages").map(String),
    reasoningImages: formData.getAll("reasoningImages").map(String),
    technicalDepthImages: formData.getAll("technicalDepthImages").map(String),
    published: formData.get("published") === "on",
  });

  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = String(issue.path[0]);
      fieldErrors[key] ??= issue.message;
    }
    return { fieldErrors } as const;
  }

  const { myRole, stack, ...rest } = result.data;
  return {
    data: {
      ...rest,
      myRole: rest.kind === "TEAM" && myRole !== "" ? myRole : null,
      stack: stack
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    },
  } as const;
}
