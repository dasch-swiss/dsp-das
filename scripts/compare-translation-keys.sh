#!/bin/bash
# Compares translation keys across all language files to ensure parity

set -e

echo "Comparing translation keys across language files..."
echo ""

BASE_FILE="apps/dsp-app/src/assets/i18n/en.json"
TEMP_DIR=$(mktemp -d)

# Extract all keys from each file (flattened dot notation)
extract_keys() {
  python3 -c "
import json
import sys

def flatten_keys(d, parent_key=''):
    items = []
    for k, v in d.items():
        new_key = f'{parent_key}.{k}' if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_keys(v, new_key))
        else:
            items.append(new_key)
    return sorted(items)

with open('$1', 'r') as f:
    data = json.load(f)
    for key in flatten_keys(data):
        print(key)
"
}

# Extract keys from all files
for file in en.json de.json fr.json it.json rm.json; do
  filepath="apps/dsp-app/src/assets/i18n/$file"
  extract_keys "$filepath" > "$TEMP_DIR/${file%.json}.keys"
done

# Compare all files against English (base)
all_match=true
for file in de.json fr.json it.json rm.json; do
  lang="${file%.json}"
  if diff -q "$TEMP_DIR/en.keys" "$TEMP_DIR/${lang}.keys" > /dev/null; then
    echo "✓ $file has matching keys with en.json"
  else
    echo "✗ $file has different keys than en.json"
    echo "   Differences:"
    diff "$TEMP_DIR/en.keys" "$TEMP_DIR/${lang}.keys" | head -20
    all_match=false
  fi
done

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
if [ "$all_match" = true ]; then
  echo "✓ All language files have matching keys"
  exit 0
else
  echo "✗ Some language files have mismatched keys"
  exit 1
fi
