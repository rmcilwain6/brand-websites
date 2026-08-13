-- CreateEnum
CREATE TYPE "GalleryImageLayout" AS ENUM ('MASONRY', 'GRID');

-- AlterTable
ALTER TABLE "Gallery" ADD COLUMN     "imageLayout" "GalleryImageLayout" NOT NULL DEFAULT 'MASONRY';

