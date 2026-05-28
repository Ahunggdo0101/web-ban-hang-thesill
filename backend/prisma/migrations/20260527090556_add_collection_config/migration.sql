-- CreateTable
CREATE TABLE "CollectionConfig" (
    "id" TEXT NOT NULL,
    "slots" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollectionConfig_pkey" PRIMARY KEY ("id")
);
