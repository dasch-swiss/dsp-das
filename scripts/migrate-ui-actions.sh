#!/bin/bash
# Script to migrate ui.form.action.* to ui.common.actions.*

set -e

echo "Migrating ui.form.action to ui.common.actions..."

# Find all TypeScript and HTML files
files=$(find libs apps -type f \( -name "*.ts" -o -name "*.html" \) 2>/dev/null || true)

# Counter for changes
changes=0

for file in $files; do
  if [ -f "$file" ]; then
    # Create a backup and perform replacement
    if grep -q "ui\.form\.action\." "$file" 2>/dev/null; then
      echo "Processing: $file"

      # Replace ui.form.action with ui.common.actions
      sed -i.bak "s/ui\.form\.action\./ui.common.actions./g" "$file"

      # Remove backup file
      rm "${file}.bak"

      changes=$((changes + 1))
    fi
  fi
done

echo ""
echo "✓ Migrated $changes files from ui.form.action to ui.common.actions"
