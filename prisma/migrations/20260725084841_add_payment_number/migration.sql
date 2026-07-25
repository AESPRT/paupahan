-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "auto_renew" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "payment_method_id" TEXT,
ADD COLUMN     "payment_number" TEXT;
