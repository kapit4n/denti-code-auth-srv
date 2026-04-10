-- AlterTable
ALTER TABLE "User" ADD COLUMN "preferredLocale" TEXT;

-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "defaultLocale" TEXT NOT NULL DEFAULT 'en',
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "AppSettings" ("id", "defaultLocale", "updatedAt")
SELECT 'singleton', 'en', datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM "AppSettings" WHERE "id" = 'singleton');
