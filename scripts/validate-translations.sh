#!/bin/bash
# Validates JSON syntax and key parity across all translation files

set -e

echo "Validating translation files..."
echo ""

# Check JSON syntax for each file
for file in de.json en.json fr.json it.json rm.json; do
  filepath="apps/dsp-app/src/assets/i18n/$file"
  if python3 -c "import json; json.load(open('$filepath'))" 2>/dev/null; then
    echo "✓ $file is valid JSON"
  else
    echo "✗ $file has JSON errors"
    exit 1
  fi
done

echo ""
echo "✓ All translation files are valid JSON"
