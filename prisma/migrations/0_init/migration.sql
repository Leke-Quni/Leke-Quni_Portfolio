-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ProjectKind" AS ENUM ('SOLO', 'TEAM');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "kind" "ProjectKind" NOT NULL,
    "myRole" TEXT,
    "stack" TEXT[],
    "repoUrl" TEXT,
    "liveUrl" TEXT,
    "coverImage" TEXT,
    "order" INTEGER NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "summary" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "technicalDepth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_published_order_idx" ON "Project"("published", "order");

