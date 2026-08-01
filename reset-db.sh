#!/bin/bash
set -e # Ititigil ang script kapag may nag-error

echo "🛑 Simula ng Database Reset at Schema Sync para sa Docker DB..."

# Gamitin ang localhost dahil na-expose ang port 5432 sa host machine mo
export DATABASE_URL="postgresql://aedev_admin:admin123@localhost:5432/paupahan_db?schema=public"

echo "🗑️ Nire-reset at niri-sync ang Database gamit ang Prisma schema (Walang migrations)..."
npx prisma db push --force-reset --skip-generate

echo "⚙️ Re-generating Prisma Client..."
npx prisma generate

# (Opsyonal) Kung may seed ka:
# echo "🌱 Nagpapatakbo ng Database Seeder..."
# npx prisma db seed

echo "✅ Tagumpay! Malinis na ang Docker database at na-update na ang schema."