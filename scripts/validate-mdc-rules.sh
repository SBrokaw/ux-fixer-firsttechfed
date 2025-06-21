#!/bin/bash

# MDC Rules Validation Script
# This script validates that all MDC rule files follow the established standards

set -e

echo "🔍 Validating MDC Rules..."

RULES_DIR=".cursor/rules"
ERRORS=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_error() {
    echo -e "${RED}❌ $1${NC}"
    ((ERRORS++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Check if rules directory exists
if [ ! -d "$RULES_DIR" ]; then
    print_error "Rules directory $RULES_DIR does not exist"
    exit 1
fi

# Find all MDC files
MDC_FILES=$(find "$RULES_DIR" -name "*.mdc" -type f)

if [ -z "$MDC_FILES" ]; then
    print_error "No MDC files found in $RULES_DIR"
    exit 1
fi

echo "Found $(echo "$MDC_FILES" | wc -l) MDC files"

# Validate each MDC file
for file in $MDC_FILES; do
    echo ""
    echo "📄 Validating: $(basename "$file")"
    
    # Check if file starts with YAML frontmatter
    if ! head -1 "$file" | grep -q "^---$"; then
        print_error "Missing YAML frontmatter in $file"
        continue
    fi
    
    # Check if file has closing YAML frontmatter
    if ! grep -A 20 "^---$" "$file" | grep -q "^---$"; then
        print_error "Missing closing YAML frontmatter in $file"
        continue
    fi
    
    # Check for required fields
    if ! grep -q "description:" "$file"; then
        print_error "Missing 'description' field in $file"
    fi
    
    if ! grep -q "globs:" "$file"; then
        print_error "Missing 'globs' field in $file"
    fi
    
    if ! grep -q "ruleType:" "$file"; then
        print_error "Missing 'ruleType' field in $file"
    fi
    
    # Validate ruleType values
    RULE_TYPE=$(grep "ruleType:" "$file" | sed 's/.*ruleType: *//' | tr -d ' ')
    case $RULE_TYPE in
        "Always"|"Auto Attached"|"Agent Requested"|"Manual")
            print_success "Valid ruleType: $RULE_TYPE"
            ;;
        *)
            print_error "Invalid ruleType: '$RULE_TYPE' in $file"
            ;;
    esac
    
    # Check for content after YAML frontmatter
    YAML_END=$(grep -n "^---$" "$file" | tail -1 | cut -d: -f1)
    if [ "$YAML_END" -eq 1 ]; then
        print_error "No content found after YAML frontmatter in $file"
    fi
    
    # Check for markdown content
    if ! grep -A 10 "^---$" "$file" | grep -q "^#"; then
        print_warning "No markdown headers found in $file"
    fi
done

# Check for essential rules
echo ""
echo "📋 Checking essential rules..."

ESSENTIAL_RULES=(
    "mdc-rules-standards.mdc"
    "git-workflow.mdc"
    "firefox-extension-development.mdc"
    "css-styling-standards.mdc"
    "testing-standards.mdc"
    "documentation-standards.mdc"
)

for rule in "${ESSENTIAL_RULES[@]}"; do
    if [ -f "$RULES_DIR/$rule" ]; then
        print_success "Found essential rule: $rule"
    else
        print_error "Missing essential rule: $rule"
    fi
done

# Check file naming conventions
echo ""
echo "📝 Checking naming conventions..."

for file in $MDC_FILES; do
    filename=$(basename "$file")
    
    # Check for kebab-case
    if [[ ! "$filename" =~ ^[a-z0-9-]+\.mdc$ ]]; then
        print_warning "File naming should be kebab-case: $filename"
    fi
    
    # Check for descriptive names
    if [[ "$filename" =~ ^(rule|test|temp|new) ]]; then
        print_warning "File name should be more descriptive: $filename"
    fi
done

# Check for duplicate rules
echo ""
echo "🔍 Checking for duplicate rules..."

DUPLICATES=$(find "$RULES_DIR" -name "*.mdc" -exec basename {} \; | sort | uniq -d)
if [ ! -z "$DUPLICATES" ]; then
    print_error "Duplicate rule files found:"
    echo "$DUPLICATES"
else
    print_success "No duplicate rule files found"
fi

# Summary
echo ""
echo "📊 Validation Summary:"
echo "Total MDC files: $(echo "$MDC_FILES" | wc -l)"
echo "Errors found: $ERRORS"

if [ $ERRORS -eq 0 ]; then
    print_success "All MDC rules are valid!"
    exit 0
else
    print_error "Found $ERRORS validation errors. Please fix them before proceeding."
    exit 1
fi 