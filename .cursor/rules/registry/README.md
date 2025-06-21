# Error Correction Registry

This directory contains rules that were created based on actual errors encountered during development. These rules prevent the same mistakes from being repeated in future projects.

## Registry Rules

### 1. Website Modification Feasibility
**File**: `website-modification-feasibility.mdc`
**Error**: Attempting to modify websites with complex SPA frameworks, strict CSP, or security-critical applications
**Impact**: High - Complete project abandonment after significant development time
**Prevention**: Technical feasibility assessment before project start
**Status**: Resolved with new technical-feasibility.mdc rule

### 2. Task Organization Mistakes
**File**: `task-organization-mistakes.mdc`
**Error**: Creating orphaned tasks, duplicate tasks, and incorrect directory structure
**Impact**: Medium - Required cleanup and reorganization
**Prevention**: Mandatory pre-creation checks and workflow
**Status**: Resolved with updated task-planning.mdc rule

## Registry Structure

Each registry rule follows this format:

```markdown
---
description: Brief description of the error pattern
globs: 
alwaysApply: false
---

# Error Name

## Error Pattern
[Description of the error pattern]

## Root Cause Analysis
[Why the error occurred]

## Correct Approach
[How to prevent the error]

## Examples
[❌ Incorrect and ✅ Correct examples]

## Prevention Checklist
[Specific steps to prevent the error]

## Related Rules
[Links to related rules]

## Implementation
[How to implement the prevention]

## Registry Entry
[Metadata about the error]
```

## Adding New Registry Rules

When a new error is encountered:

1. **Analyze the error** and identify the root cause
2. **Document the incorrect approach** that was taken
3. **Document the correct solution** that fixed the issue
4. **Create a new registry rule** following the template above
5. **Update this README** with the new rule entry
6. **Reference related rules** and update them if needed

## Registry Integration

The registry integrates with:
- `error-correction.mdc` - Main error correction framework
- `technical-feasibility.mdc` - Technical feasibility assessment
- `task-planning.mdc` - Task organization and planning
- Other project-specific rules as needed

## Lessons Learned

### From FirstTechFed Project
1. **Technical Feasibility**: Always assess website architecture before starting modification projects
2. **Task Organization**: Follow strict task creation workflow to prevent organization mistakes
3. **Documentation**: Document project abandonment reasons for future reference
4. **Error Prevention**: Create rules to prevent similar mistakes in future projects

### Key Principles
1. **Fail Fast**: Identify showstoppers early in the project
2. **Document Everything**: Record both successes and failures
3. **Learn from Mistakes**: Convert errors into prevention rules
4. **Continuous Improvement**: Update rules based on new experiences 