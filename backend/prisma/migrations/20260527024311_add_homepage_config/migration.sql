-- CreateTable
CREATE TABLE "HomepageConfig" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageConfig_pkey" PRIMARY KEY ("id")
);
