/*
  Warnings:

  - You are about to drop the column `unit_id` on the `leases` table. All the data in the column will be lost.
  - You are about to drop the column `unit_id` on the `maintenance_requests` table. All the data in the column will be lost.
  - You are about to drop the column `amenities` on the `units` table. All the data in the column will be lost.
  - You are about to drop the column `max_occupants` on the `units` table. All the data in the column will be lost.
  - You are about to drop the column `monthly_rent` on the `units` table. All the data in the column will be lost.
  - You are about to drop the column `photos` on the `units` table. All the data in the column will be lost.
  - You are about to drop the column `room_number` on the `units` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `units` table. All the data in the column will be lost.
  - Added the required column `room_id` to the `leases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `room_id` to the `maintenance_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `units` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "leases" DROP CONSTRAINT "leases_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "maintenance_requests" DROP CONSTRAINT "maintenance_requests_unit_id_fkey";

-- DropIndex
DROP INDEX "leases_unit_id_status_idx";

-- DropIndex
DROP INDEX "units_property_id_room_number_key";

-- DropIndex
DROP INDEX "units_property_id_status_idx";

-- AlterTable
ALTER TABLE "bills" ADD COLUMN     "metadata" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "utility_amount" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "leases" DROP COLUMN "unit_id",
ADD COLUMN     "advance_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "advance_months" DECIMAL(4,2) NOT NULL DEFAULT 1,
ADD COLUMN     "deposit_months" DECIMAL(4,2) NOT NULL DEFAULT 1,
ADD COLUMN     "room_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "maintenance_requests" DROP COLUMN "unit_id",
ADD COLUMN     "room_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "units" DROP COLUMN "amenities",
DROP COLUMN "max_occupants",
DROP COLUMN "monthly_rent",
DROP COLUMN "photos",
DROP COLUMN "room_number",
DROP COLUMN "status",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "room_number" TEXT NOT NULL,
    "status" "RoomStatus" NOT NULL DEFAULT 'vacant',
    "monthly_rent" DECIMAL(12,2) NOT NULL,
    "max_occupants" INTEGER NOT NULL DEFAULT 1,
    "amenities" JSONB NOT NULL DEFAULT '[]',
    "photos" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utility_rates" (
    "id" TEXT NOT NULL,
    "type" "UtilityType" NOT NULL,
    "name" TEXT NOT NULL,
    "rate_per_unit" DECIMAL(12,2) NOT NULL,
    "unit_label" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utility_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rooms_unit_id_status_idx" ON "rooms"("unit_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_unit_id_room_number_key" ON "rooms"("unit_id", "room_number");

-- CreateIndex
CREATE UNIQUE INDEX "utility_rates_type_key" ON "utility_rates"("type");

-- CreateIndex
CREATE INDEX "leases_room_id_status_idx" ON "leases"("room_id", "status");

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
