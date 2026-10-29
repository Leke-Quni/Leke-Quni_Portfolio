export type GithubImport = {
  title: string;
  slug: string;
  tagline: string;
  stack: string;
  repoUrl: string;
  liveUrl: string;
  kind: "SOLO" | "TEAM";
  collaborators: string[];
  myRole: string;
  highlights: string[];
};

const MAX_STACK = 12;
const MAX_MANIFESTS = 8;
const MIN_ROLE_COMMITS = 3;
const MAX_ROLE_AREAS = 4;
const MAX_HIGHLIGHTS = 5;
const MAX_COMMIT_DETAILS = 50;
const RATE_LIMIT_RESERVE = 2;
const IGNORED_DIRS = /(^|\/)(node_modules|vendor|dist|build|\.next|bin|obj|test|tests|__tests__)\//i;

const ROLE_AREAS: [phrase: string, message: RegExp, path: RegExp][] = [
  [
    "the frontend",
    /\b(ui|ux|frontend|front-end|page|component|css|style|layout|design|responsive)s?\b/i,
    /(^|\/)(frontend|client|web|ui|components|pages|styles|public)\/|\.(css|scss|html|vue|svelte|tsx|jsx)$/i,
  ],
  [
    "the API",
    /\b(api|endpoint|controller|route|backend|back-end|server)s?\b/i,
    /(^|\/)(api|controllers?|routes?|endpoints?|backend|server)\//i,
  ],
  [
    "the business logic",
    /\b(domain|use ?case|logic|dto|mapping|service)s?\b/i,
    /(^|\/)(domain|application|services?|use-?cases?)\//i,
  ],
  [
    "the database",
    /\b(database|db|migration|schema|model|entity|query|sql)s?\b/i,
    /(^|\/)(migrations?|prisma|models?|entities|repositories)\/|\.sql$/i,
  ],
  [
    "authentication",
    /\b(auth|login|logout|signup|jwt|token|oauth|password)\b/i,
    /auth|login/i,
  ],
  [
    "deployment",
    /\b(docker|deploy|deployment|ci|cd|pipeline|workflow)\b/i,
    /(^|\/)dockerfile|docker-compose|\.github\/workflows\//i,
  ],
  ["documentation", /\b(docs?|readme|documentation)\b/i, /\.md$/i],
];
const ROLE_FIXES = /\b(fix|fixes|fixed|bug|bugs|resolve|resolved|patch)\b/i;
const ROLE_TESTS = /\b(test|tests|testing|spec)\b/i;
const TEST_PATH = /(^|\/)(tests?|__tests__)\/|\.(test|spec)\./i;
const VAGUE_COMMIT = /^(update|updates|fix|fixes|change|changes|wip|test|tests|commit|initial commit|merge\b.*|\.+|-+)$/i;

const NPM_PACKAGES: Record<string, string> = {
  next: "Next.js",
  react: "React",
  vue: "Vue",
  nuxt: "Nuxt",
  svelte: "Svelte",
  "@sveltejs/kit": "SvelteKit",
  "@angular/core": "Angular",
  astro: "Astro",
  "solid-js": "Solid",
  "react-native": "React Native",
  expo: "Expo",
  electron: "Electron",
  express: "Express",
  fastify: "Fastify",
  koa: "Koa",
  hono: "Hono",
  "@nestjs/core": "NestJS",
  tailwindcss: "Tailwind CSS",
  bootstrap: "Bootstrap",
  "@mui/material": "MUI",
  sass: "Sass",
  vite: "Vite",
  webpack: "Webpack",
  "@prisma/client": "Prisma",
  "drizzle-orm": "Drizzle",
  mongoose: "MongoDB",
  mongodb: "MongoDB",
  pg: "PostgreSQL",
  mysql2: "MySQL",
  redis: "Redis",
  ioredis: "Redis",
  "@supabase/supabase-js": "Supabase",
  firebase: "Firebase",
  "next-auth": "Auth.js",
  "socket.io": "Socket.IO",
  graphql: "GraphQL",
  "@trpc/server": "tRPC",
  "@reduxjs/toolkit": "Redux",
  "@tanstack/react-query": "TanStack Query",
  "framer-motion": "Framer Motion",
  three: "Three.js",
  zod: "Zod",
  jest: "Jest",
  vitest: "Vitest",
  "@playwright/test": "Playwright",
  cypress: "Cypress",
};

const PYTHON_PACKAGES: Record<string, string> = {
  django: "Django",
  flask: "Flask",
  fastapi: "FastAPI",
  sqlalchemy: "SQLAlchemy",
  numpy: "NumPy",
  pandas: "pandas",
  tensorflow: "TensorFlow",
  torch: "PyTorch",
  "scikit-learn": "scikit-learn",
  celery: "Celery",
  pytest: "pytest",
};

const NUGET_PACKAGES: [prefix: string, label: string][] = [
  ["microsoft.net.sdk.web", "ASP.NET Core"],
  ["microsoft.aspnetcore", "ASP.NET Core"],
  ["microsoft.entityframeworkcore", "Entity Framework Core"],
  ["npgsql", "PostgreSQL"],
  ["mongodb.driver", "MongoDB"],
  ["stackexchange.redis", "Redis"],
  ["swashbuckle", "Swagger"],
  ["grpc", "gRPC"],
  ["microsoft.aspnetcore.signalr", "SignalR"],
  ["serilog", "Serilog"],
  ["mediatr", "MediatR"],
  ["automapper", "AutoMapper"],
  ["xunit", "xUnit"],
  ["nunit", "NUnit"],
];

function parseRepo(input: string) {
  const match = input
    .trim()
    .match(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/i);
  return match ? { owner: match[1], name: match[2] } : null;
}

let rateRemaining = Infinity;

async function github(path: string) {
  const res = await fetch(`https://api.github.com/repos/${path}`, {
    headers: { Accept: "application/vnd.github+json" },
    cache: "no-store",
  });
  const remaining = res.headers.get("x-ratelimit-remaining");
  if (remaining !== null) rateRemaining = Number(remaining);
  if (res.status === 404) throw new Error("Repository not found. Only public repositories work.");
  if (res.status === 403 || res.status === 429) {
    throw new Error("GitHub rate limit reached. Try again in a few minutes.");
  }
  if (!res.ok) throw new Error(`GitHub returned ${res.status}.`);
  return res.json();
}

function joinList(items: string[]) {
  return items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items.at(-1)}` : items[0];
}

async function describeRole(base: string): Promise<{ myRole: string; highlights: string[] }> {
  const none = { myRole: "", highlights: [] };
  const adminId = process.env.ADMIN_GITHUB_ID;
  if (!adminId) return none;
  const user = await fetch(`https://api.github.com/user/${encodeURIComponent(adminId)}`, {
    cache: "no-store",
  })
    .then((res) => (res.ok ? res.json() : null))
    .catch(() => null);
  if (!user?.login) return none;

  const list = await github(`${base}/commits?author=${encodeURIComponent(user.login)}&per_page=100`).catch(
    () => [],
  );
  const commits: { sha: string; message: string }[] = (Array.isArray(list) ? list : [])
    .filter((c: { parents?: unknown[] }) => (c.parents?.length ?? 0) < 2)
    .map((c: { sha: string; commit: { message: string } }) => ({
      sha: c.sha,
      message: c.commit.message.split("\n")[0].trim(),
    }));
  if (commits.length < MIN_ROLE_COMMITS) return none;

  const budget = Math.max(0, Math.min(MAX_COMMIT_DETAILS, rateRemaining - RATE_LIMIT_RESERVE));
  const files: string[][] = await Promise.all(
    commits.map((c, i) =>
      i < budget
        ? github(`${base}/commits/${c.sha}`)
            .then((d) => (d.files ?? []).map((f: { filename: string }) => f.filename))
            .catch(() => [])
        : [],
    ),
  );

  const areas = ROLE_AREAS.map(([phrase, message, path]) => ({
    phrase,
    count: commits.filter((c, i) => message.test(c.message) || files[i].some((f) => path.test(f))).length,
  }))
    .filter((a) => a.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_ROLE_AREAS)
    .map((a) => a.phrase);

  const meaningful = [...new Set(commits.map((c) => c.message))].filter(
    (m) => m.length >= 8 && !VAGUE_COMMIT.test(m),
  );
  const highlights = [...meaningful].sort((a, b) => b.length - a.length).slice(0, MAX_HIGHLIGHTS);
  if (areas.length === 0) return { myRole: "", highlights };

  const extras = [
    commits.filter((c) => ROLE_FIXES.test(c.message)).length >= 2 && "fixed bugs",
    commits.filter((c, i) => ROLE_TESTS.test(c.message) || files[i].some((f) => TEST_PATH.test(f)))
      .length >= 2 && "wrote tests",
  ].filter((e): e is string => Boolean(e));

  return {
    myRole: `Worked on ${joinList(areas)} across ${commits.length} commits${extras.length > 0 ? `, and ${joinList(extras)}` : ""}.`,
    highlights,
  };
}

async function rawFile(owner: string, name: string, branch: string, path: string) {
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  const res = await fetch(`https://raw.githubusercontent.com/${owner}/${name}/${branch}/${encoded}`, {
    cache: "no-store",
  });
  return res.ok ? res.text() : "";
}

async function detectTools(owner: string, name: string, branch: string, base: string) {
  const tree = await github(`${base}/git/trees/${encodeURIComponent(branch)}?recursive=1`).catch(() => null);
  const paths: string[] = (tree?.tree ?? [])
    .filter((t: { type: string }) => t.type === "blob")
    .map((t: { path: string }) => t.path)
    .filter((p: string) => !IGNORED_DIRS.test(p));

  const tools = new Set<string>();
  if (paths.some((p) => /(^|\/)(Dockerfile|docker-compose\.ya?ml)$/i.test(p))) tools.add("Docker");

  const manifests = paths
    .filter((p) => /(^|\/)(package\.json|requirements\.txt|pyproject\.toml)$|\.csproj$/.test(p))
    .sort((a, b) => a.split("/").length - b.split("/").length)
    .slice(0, MAX_MANIFESTS);

  const files = await Promise.all(
    manifests.map(async (path) => ({ path, text: await rawFile(owner, name, branch, path) })),
  );

  for (const { path, text } of files) {
    if (path.endsWith("package.json")) {
      try {
        const pkg = JSON.parse(text);
        for (const dep of Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })) {
          if (NPM_PACKAGES[dep]) tools.add(NPM_PACKAGES[dep]);
        }
      } catch {}
    } else if (path.endsWith(".csproj")) {
      const tokens = text.toLowerCase().match(/[a-z0-9_.-]+/g) ?? [];
      for (const [prefix, label] of NUGET_PACKAGES) {
        if (tokens.some((t) => t.startsWith(prefix))) tools.add(label);
      }
    } else {
      const tokens = new Set(text.toLowerCase().match(/[a-z0-9_.-]+/g));
      for (const [pkg, label] of Object.entries(PYTHON_PACKAGES)) {
        if (tokens.has(pkg)) tools.add(label);
      }
    }
  }
  return [...tools];
}

export async function importFromGithub(input: string): Promise<GithubImport> {
  const repo = parseRepo(input);
  if (!repo) throw new Error("Enter a link like https://github.com/owner/repo.");

  const base = `${repo.owner}/${repo.name}`;
  const [info, languages, contributors] = await Promise.all([
    github(base),
    github(`${base}/languages`),
    github(`${base}/contributors`).catch(() => []),
  ]);

  const collaborators: string[] = (Array.isArray(contributors) ? contributors : [])
    .filter((c: { type: string }) => c.type === "User")
    .map((c: { login: string }) => c.login);

  const [tools, { myRole, highlights }] = await Promise.all([
    detectTools(repo.owner, repo.name, info.default_branch, base),
    collaborators.length > 1 ? describeRole(base) : { myRole: "", highlights: [] },
  ]);

  const stack = [...Object.keys(languages), ...tools, ...(info.topics ?? [])]
    .filter((s, i, all) => all.findIndex((o) => o.toLowerCase() === s.toLowerCase()) === i)
    .slice(0, MAX_STACK)
    .join(", ");

  const homepage = typeof info.homepage === "string" ? info.homepage.trim() : "";
  const liveUrl = /^https?:\/\//.test(homepage) ? homepage : "";

  return {
    title: info.name
      .split(/[-_]+/)
      .filter(Boolean)
      .map((w: string) => w[0].toUpperCase() + w.slice(1))
      .join(" "),
    slug: info.name
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""),
    tagline: info.description ?? "",
    stack,
    repoUrl: info.html_url,
    liveUrl,
    kind: collaborators.length > 1 ? "TEAM" : "SOLO",
    collaborators,
    myRole,
    highlights,
  };
}
