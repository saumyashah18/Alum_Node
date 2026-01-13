-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alumnus" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT,
    "batch" TEXT,
    "organization" TEXT,
    "designation" TEXT,
    "location" TEXT,
    "email" TEXT,
    "data" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alumnus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Alumnus_projectId_idx" ON "Alumnus"("projectId");

-- CreateIndex
CREATE INDEX "Alumnus_batch_idx" ON "Alumnus"("batch");

-- CreateIndex
CREATE INDEX "Alumnus_organization_idx" ON "Alumnus"("organization");

-- AddForeignKey
ALTER TABLE "Alumnus" ADD CONSTRAINT "Alumnus_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
