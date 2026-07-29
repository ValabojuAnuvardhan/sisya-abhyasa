#!/usr/bin/env bash
set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="backups/backup_${TIMESTAMP}"

echo "=== Backup Process Started (${TIMESTAMP}) ==="
mkdir -p "${BACKUP_DIR}"

if [ -f "apps/api/sisya_dev.db" ]; then
    cp "apps/api/sisya_dev.db" "${BACKUP_DIR}/sisya_dev.db"
    echo "Backed up SQLite database."
fi

if [ -f "apps/api/.env" ]; then
    cp "apps/api/.env" "${BACKUP_DIR}/api.env"
    echo "Backed up API environment configuration."
fi

echo "=== Backup Saved to ${BACKUP_DIR} ==="
