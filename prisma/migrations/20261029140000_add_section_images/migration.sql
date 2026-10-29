-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "reasoningImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "summaryImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "technicalDepthImages" TEXT[] DEFAULT ARRAY[]::TEXT[];
