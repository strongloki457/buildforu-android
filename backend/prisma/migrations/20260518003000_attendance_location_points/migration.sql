-- CreateTable
CREATE TABLE "AttendanceLocationPoint" (
    "id" TEXT NOT NULL,
    "attendanceId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceLocationPoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AttendanceLocationPoint_attendanceId_idx" ON "AttendanceLocationPoint"("attendanceId");

-- CreateIndex
CREATE INDEX "AttendanceLocationPoint_workerId_idx" ON "AttendanceLocationPoint"("workerId");

-- CreateIndex
CREATE INDEX "AttendanceLocationPoint_companyId_idx" ON "AttendanceLocationPoint"("companyId");

-- CreateIndex
CREATE INDEX "AttendanceLocationPoint_companyId_workerId_idx" ON "AttendanceLocationPoint"("companyId", "workerId");

-- CreateIndex
CREATE INDEX "AttendanceLocationPoint_attendanceId_recordedAt_idx" ON "AttendanceLocationPoint"("attendanceId", "recordedAt");

-- AddForeignKey
ALTER TABLE "AttendanceLocationPoint" ADD CONSTRAINT "AttendanceLocationPoint_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceLocationPoint" ADD CONSTRAINT "AttendanceLocationPoint_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceLocationPoint" ADD CONSTRAINT "AttendanceLocationPoint_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
