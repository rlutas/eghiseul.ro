#!/bin/bash
#
# Run Supabase Database Migration
# Usage: ./scripts/run-migration.sh [migration_file.sql]
#
# If no file specified, runs all pending migrations in order.
#

set -e

# Load environment variables
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

# Configuration
SUPABASE_REF="llbwmitdrppomeptqlue"
DB_HOST="db.${SUPABASE_REF}.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"
MIGRATIONS_DIR="supabase/migrations"

# Check for password
if [ -z "$SUPABASE_DB_PASSWORD" ]; then
  echo "Error: SUPABASE_DB_PASSWORD not set in .env.local"
  exit 1
fi

# URL encode password (handle special characters)
DB_PASSWORD_ENCODED=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$SUPABASE_DB_PASSWORD'))" 2>/dev/null || echo "$SUPABASE_DB_PASSWORD")

# Build connection string
CONNECTION_STRING="postgresql://${DB_USER}:${DB_PASSWORD_ENCODED}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# Check if psql is available
if ! command -v psql &> /dev/null; then
  echo "Error: psql not found. Install PostgreSQL client:"
  echo "  macOS: brew install postgresql"
  echo "  Ubuntu: sudo apt install postgresql-client"
  echo ""
  echo "Alternative: Run migration manually in Supabase Dashboard:"
  echo "  https://supabase.com/dashboard/project/${SUPABASE_REF}/sql/new"
  exit 1
fi

# Function to run a single migration
run_migration() {
  local file=$1
  echo "Running migration: $file"

  if psql "$CONNECTION_STRING" -f "$file" 2>&1; then
    echo "✓ Migration completed: $file"
    return 0
  else
    echo "✗ Migration failed: $file"
    return 1
  fi
}

# Main logic
if [ -n "$1" ]; then
  # Run specific migration
  MIGRATION_FILE="$MIGRATIONS_DIR/$1"
  if [ ! -f "$MIGRATION_FILE" ]; then
    # Try without directory prefix
    MIGRATION_FILE="$1"
  fi

  if [ ! -f "$MIGRATION_FILE" ]; then
    echo "Error: Migration file not found: $1"
    echo "Available migrations:"
    ls -1 "$MIGRATIONS_DIR"/*.sql 2>/dev/null || echo "No migrations found"
    exit 1
  fi

  run_migration "$MIGRATION_FILE"
else
  # Run all migrations
  echo "Running all migrations from $MIGRATIONS_DIR..."
  echo ""

  for file in $(ls "$MIGRATIONS_DIR"/*.sql 2>/dev/null | sort); do
    run_migration "$file"
    echo ""
  done

  echo "All migrations completed!"
fi
