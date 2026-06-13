#!/bin/sh
set -e

echo "Waiting for Postgres..."
until pg_isready -h db -p 5432 -U postgres -d typer_dev >/dev/null 2>&1; do
    sleep 2
done

LOCKFILE_HASH=$(md5sum package-lock.json | awk '{print $1}')
INSTALLED_HASH=$(cat node_modules/.package-lock-hash 2>/dev/null || echo "")

if [ "$LOCKFILE_HASH" != "$INSTALLED_HASH" ]; then
    echo "Dependencies changed, installing..."
    npm ci
    echo "$LOCKFILE_HASH" > node_modules/.package-lock-hash
fi

npx prisma generate
npx prisma migrate deploy
npx prisma db seed

exec npx next dev --hostname 0.0.0.0 --port 3000 --webpack
