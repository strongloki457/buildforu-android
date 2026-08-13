-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Expense_companyId_idx" ON "Expense"("companyId");

-- CreateIndex
CREATE INDEX "Expense_projectId_idx" ON "Expense"("projectId");

-- CreateIndex
CREATE INDEX "Expense_companyId_projectId_idx" ON "Expense"("companyId", "projectId");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

