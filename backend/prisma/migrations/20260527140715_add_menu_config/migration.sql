-- CreateTable
CREATE TABLE "MenuConfig" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuConfig_pkey" PRIMARY KEY ("id")
);
