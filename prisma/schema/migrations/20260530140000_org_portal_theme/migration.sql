-- AlterTable
ALTER TABLE "Organization" ADD COLUMN "portalTheme" TEXT NOT NULL DEFAULT '{}';
ALTER TABLE "Organization" ADD COLUMN "portalBranding" TEXT NOT NULL DEFAULT '{}';
