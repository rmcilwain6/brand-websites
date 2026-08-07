-- AlterEnum
ALTER TYPE "GalleryStatus" ADD VALUE 'PRIVATE';

-- AlterTable
ALTER TABLE "Gallery" ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "passwordHash" TEXT;

-- CreateTable
CREATE TABLE "GalleryAccessLog" (
    "id" TEXT NOT NULL,
    "galleryId" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GalleryAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GalleryAccessLog_galleryId_idx" ON "GalleryAccessLog"("galleryId");

-- CreateIndex
CREATE INDEX "GalleryAccessLog_galleryId_createdAt_idx" ON "GalleryAccessLog"("galleryId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Gallery_accessToken_key" ON "Gallery"("accessToken");

-- AddForeignKey
ALTER TABLE "GalleryAccessLog" ADD CONSTRAINT "GalleryAccessLog_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "Gallery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

