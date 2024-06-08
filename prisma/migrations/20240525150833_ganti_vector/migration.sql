/*
  Warnings:

  - You are about to drop the column `isVectorised` on the `Document` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "isVectorised";

-- AlterTable
ALTER TABLE "UserDocument" ADD COLUMN     "isVectorised" BOOLEAN NOT NULL DEFAULT false;
