-- CreateEnum
CREATE TYPE "BetResult" AS ENUM ('EXACT_SCORE', 'CORRECT_OUTCOME', 'INCORRECT');

-- AlterTable
ALTER TABLE "Bet" DROP COLUMN "pointsAwarded",
ADD COLUMN     "betResult" "BetResult";
