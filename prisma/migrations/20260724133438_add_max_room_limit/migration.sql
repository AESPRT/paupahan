-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "max_room_limit" INTEGER NOT NULL DEFAULT 3,
ALTER COLUMN "max_units_limit" SET DEFAULT 1;
