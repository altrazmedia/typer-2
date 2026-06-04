#!/bin/sh
set -e

echo "Waiting for Postgres..."
until pg_isready -h db -p 5432 -U postgres -d typer_dev >/dev/null 2>&1; do
    sleep 2
done

if [ ! -f node_modules/.bin/next ]; then
    echo "Installing dependencies..."
    npm ci
fi

npx prisma generate
npx prisma migrate deploy
npx prisma db seed

exec npx next dev --hostname 0.0.0.0 --port 3000 --webpack
