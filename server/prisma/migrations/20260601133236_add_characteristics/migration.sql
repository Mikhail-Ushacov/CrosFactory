/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `Image` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "ProductCharacteristic" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    CONSTRAINT "ProductCharacteristic_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BannerProduct" (
    "bannerId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,

    PRIMARY KEY ("bannerId", "productId"),
    CONSTRAINT "BannerProduct_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "Banner" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BannerProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "News" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tag" TEXT NOT NULL DEFAULT 'Новини',
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "NewsBlock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT,
    "text" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "newsId" INTEGER NOT NULL,
    CONSTRAINT "NewsBlock_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "News" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NewsBlockImage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "blockId" INTEGER NOT NULL,
    "imageId" INTEGER NOT NULL,
    CONSTRAINT "NewsBlockImage_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "NewsBlock" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "NewsBlockImage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NewsBlockProduct" (
    "blockId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,

    PRIMARY KEY ("blockId", "productId"),
    CONSTRAINT "NewsBlockProduct_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "NewsBlock" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "NewsBlockProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NewsImage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "newsId" INTEGER NOT NULL,
    "imageId" INTEGER NOT NULL,
    CONSTRAINT "NewsImage_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "News" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "NewsImage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Banner" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Banner" ("description", "id", "text", "title") SELECT "description", "id", "text", "title" FROM "Banner";
DROP TABLE "Banner";
ALTER TABLE "new_Banner" RENAME TO "Banner";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "NewsImage_newsId_imageId_key" ON "NewsImage"("newsId", "imageId");

-- CreateIndex
CREATE UNIQUE INDEX "Image_url_key" ON "Image"("url");
