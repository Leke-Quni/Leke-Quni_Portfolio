# Content lives in Postgres and Blob, edited through an Admin

Projects, Case Studies and their Order are stored in Postgres (Prisma), and images and the CV in Vercel Blob, edited through an owner-only Admin, rather than as Markdown files in the repo. Markdown files would be simpler and need no auth or database, but they can't support dynamic reordering or in-browser CV uploads, and Leke wants hands-on practice with this CMS-style stack for work.
