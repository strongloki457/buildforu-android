-- AlterTable
ALTER TABLE "Worker" ADD COLUMN     "hourlyRate" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "budget" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "MaterialRequest" ADD COLUMN     "totalCost" DOUBLE PRECISION;
