/*
  Warnings:

  - Added the required column `timerInMinutes` to the `Poll` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `responseTimer` on the `Poll` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Poll" ADD COLUMN     "timerInMinutes" INTEGER NOT NULL,
DROP COLUMN "responseTimer",
ADD COLUMN     "responseTimer" BOOLEAN NOT NULL;
