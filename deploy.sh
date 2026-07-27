#!/bin/bash
echo "🚀 Simula ng deployment para sa Paupahan..."

# 📥 1. Kunin ang pinakabagong code mula sa GitHub
git pull origin main

npx prisma db push
npx prisma generate

# 📦 2. I-update ang mga npm dependencies para sa security patches at bug fixes
echo "📦 Nag-u-update ng mga npm packages..."
npm audit fix --audit-level=high
npm update

# 🐳 3. I-build ang mga Docker containers
echo "🐳 Nagbi-build ng Docker containers..."
docker compose down
docker compose up -d --build

echo "✅ Tapos na ang deployment, na-update ang mga packages, at online na ang mga containers!"
