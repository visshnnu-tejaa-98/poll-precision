/*
  Warnings:

  - Added the required column `responseTimer` to the `Poll` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "PollStatus" ADD VALUE 'DRAFT';

-- AlterTable
ALTER TABLE "Poll" ADD COLUMN     "allowResponseEditing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "authenticatedOnly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "responseTimer" INTEGER NOT NULL,
ADD COLUMN     "resultsVisibility" BOOLEAN NOT NULL DEFAULT false;
