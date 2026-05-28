-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "vatCompanyAddr" TEXT,
ADD COLUMN     "vatCompanyName" TEXT,
ADD COLUMN     "vatEmail" TEXT,
ADD COLUMN     "vatRequested" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "vatTaxCode" TEXT;
