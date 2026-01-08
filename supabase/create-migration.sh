#!/bin/bash

# Script to create a new database migration file
# Usage: ./create-migration.sh "description of change"

if [ -z "$1" ]; then
  echo "Error: Migration description is required"
  echo "Usage: ./create-migration.sh \"description of change\""
  echo "Example: ./create-migration.sh \"add user preferences table\""
  exit 1
fi

# Get the description and convert to snake_case
DESCRIPTION=$(echo "$1" | tr '[:upper:]' '[:lower:]' | tr ' ' '_' | tr -cd '[:alnum:]_')

# Generate timestamp in format YYYYMMDD_HHMMSS
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create filename
FILENAME="${TIMESTAMP}_${DESCRIPTION}.sql"
FILEPATH="migrations/${FILENAME}"

# Copy template to new file
cp migrations/TEMPLATE.sql "$FILEPATH"

# Replace placeholders in the template
sed -i.bak "s/YYYY-MM-DD/$(date +"%Y-%m-%d")/g" "$FILEPATH"
sed -i.bak "s/\[Brief description of the change\]/$1/g" "$FILEPATH"

# Remove backup file created by sed
rm "${FILEPATH}.bak"

echo "✅ Created new migration file: $FILEPATH"
echo ""
echo "Next steps:"
echo "1. Edit the file and add your SQL migration"
echo "2. Test the migration on your local database"
echo "3. Apply to production via Supabase SQL Editor or CLI"
echo ""
echo "To apply this migration:"
echo "  - Supabase Dashboard: Copy SQL and run in SQL Editor"
echo "  - Supabase CLI: supabase db execute --file $FILEPATH"
