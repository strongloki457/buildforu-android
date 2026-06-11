-- CreateTable UserCompany
CREATE TABLE "UserCompany" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "workerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserCompany_pkey" PRIMARY KEY ("id")
);

-- Unique constraints
CREATE UNIQUE INDEX "UserCompany_workerId_key" ON "UserCompany"("workerId");
CREATE UNIQUE INDEX "UserCompany_userId_companyId_key" ON "UserCompany"("userId", "companyId");

-- Indexes
CREATE INDEX "UserCompany_userId_idx" ON "UserCompany"("userId");
CREATE INDEX "UserCompany_companyId_idx" ON "UserCompany"("companyId");
CREATE INDEX "UserCompany_workerId_idx" ON "UserCompany"("workerId");

-- Migrate data: move companyId + role + workerId from User to UserCompany
INSERT INTO "UserCompany" ("id", "userId", "companyId", "role", "workerId", "createdAt", "updatedAt")
SELECT
    'uc_' || "id",
    "id",
    "companyId",
    "role",
    "workerId",
    "createdAt",
    "updatedAt"
FROM "User";

-- AddForeignKey
ALTER TABLE "UserCompany" ADD CONSTRAINT "UserCompany_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserCompany" ADD CONSTRAINT "UserCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserCompany" ADD CONSTRAINT "UserCompany_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Drop old columns from User (drop FK constraints first)
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_companyId_fkey";
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_workerId_fkey";
DROP INDEX IF EXISTS "User_workerId_key";
DROP INDEX IF EXISTS "User_companyId_idx";
DROP INDEX IF EXISTS "User_role_idx";
ALTER TABLE "User" DROP COLUMN "role";
ALTER TABLE "User" DROP COLUMN "companyId";
ALTER TABLE "User" DROP COLUMN "workerId";
