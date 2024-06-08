/*
  Warnings:

  - You are about to drop the `Feedback` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `categoryId` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Highlight` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_userId_fkey";

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "categoryId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Highlight" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserDocument" ADD COLUMN     "lastAccessed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "Feedback";

-- CreateTable
CREATE TABLE "Embedding" (
    "id" SERIAL NOT NULL,
    "vector" DOUBLE PRECISION[],
    "metadata" JSONB,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Embedding_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Embedding" ADD CONSTRAINT "Embedding_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Embedding" ADD CONSTRAINT "Embedding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Highlight" ADD CONSTRAINT "Highlight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
