---
description: Create a comprehensive implementation plan from requirements document through extensive research
argument-hint: [requirements-file-path]
---

# Create Implementation Plan from Requirements

You are about to create a comprehensive implementation plan based on initial requirements. This involves extensive research, analysis, and planning to produce a detailed roadmap for execution.

## Step 1: Read and Analyze Requirements

Read the requirements document from: $ARGUMENTS

**Special handling for existing implementation plans**: If the argument points to an existing implementation plan (such as `.cursor/plans/akada-phase-2-implementation-4935040c.plan.md`), extract the requirements and technical specifications from the plan's overview, weekly breakdowns, and task lists rather than treating it as raw requirements.

For existing implementation plans, focus on extracting:
- Core features from the overview section and weekly breakdowns
- Technical requirements from database schema definitions and component specifications
- Integration points from the "Files to Create/Modify" sections
- Performance requirements from testing and audit sections
- Technologies and frameworks from dependencies and architecture sections

Extract and understand:
- Core feature requests and objectives
- Technical requirements and constraints
- Expected outcomes and success criteria
- Integration points with existing systems
- Performance and scalability requirements
- Any specific technologies or frameworks mentioned

## Step 2: Research Phase

### 2.1 Knowledge Base Search (if instructed)
If Archon RAG is available and relevant:
- Use `mcp__archon__rag_get_available_sources()` to see available documentation
- Search for relevant patterns: `mcp__archon__rag_search_knowledge_base(query="...")`
- Find code examples: `mcp__archon__rag_search_code_examples(query="...")`
- Focus on implementation patterns, best practices, and similar features

### 2.2 Codebase Analysis (for existing projects)
If this is for an existing codebase:

**IMPORTANT: Use the `codebase-analyst` agent for deep pattern analysis**
- Launch the codebase-analyst agent using the Task tool to perform comprehensive pattern discovery
- The agent will analyze: architecture patterns, coding conventions, testing approaches, and similar implementations
- Use the agent's findings to ensure your plan follows existing patterns and conventions

For quick searches you can also:
- Use Grep to find specific features or patterns
- Identify the project structure and conventions
- Locate relevant modules and components
- Understand existing architecture and design patterns
- Find integration points for new features
- Check for existing utilities or helpers to reuse

## Step 3: Planning and Design

Based on your research, create a detailed plan that includes:

### 3.1 Task Breakdown
Create a prioritized list of implementation tasks:
- Each task should be specific and actionable
- Tasks should be sized appropriately
- Include dependencies between tasks
- Order tasks logically for implementation flow

### 3.2 Technical Architecture
Define the technical approach:
- Component structure and organization
- Data flow and state management
- API design (if applicable)
- Database schema changes (if needed)
- Integration points with existing code

### 3.3 Implementation References
Document key resources for implementation:
- Existing code files to reference or modify
- Documentation links for technologies used
- Code examples from research
- Patterns to follow from the codebase
- Libraries or dependencies to add

## Step 4: Create the Plan Document

Write a comprehensive plan to `PRPs/[feature-name].md` with roughly this structure (n represents that this could be any number of those things):

```markdown
# Implementation Plan: [Feature Name]

## Overview
[Brief description of what will be implemented]

## Requirements Summary
- [Key requirement 1]
- [Key requirement 2]
- [Key requirement n]

## Research Findings
### Best Practices
- [Finding 1]
- [Finding n]

### Reference Implementations
- [Example 1 with link/location]
- [Example n with link/location]

### Technology Decisions
- [Technology choice 1 and rationale]
- [Technology choice n and rationale]

## Implementation Tasks

### Phase 1: Foundation
1. **Task Name**
   - Description: [What needs to be done]
   - Files to modify/create: [List files]
   - Dependencies: [Any prerequisites]
   - Estimated effort: [time estimate]

2. **Task Name**
   - Description: [What needs to be done]
   - Files to modify/create: [List files]
   - Dependencies: [Any prerequisites]
   - Estimated effort: [time estimate]

### Phase 2: Core Implementation
[Continue with numbered tasks...]

### Phase 3: Integration & Testing
[Continue with numbered tasks...]

## Codebase Integration Points
### Files to Modify
- `path/to/file1.js` - [What changes needed]
- `path/to/filen.py` - [What changes needed]

### New Files to Create
- `path/to/newfile1.js` - [Purpose]
- `path/to/newfilen.py` - [Purpose]

### Existing Patterns to Follow
- [Pattern 1 from codebase]
- [Pattern n from codebase]

## Technical Design

### Architecture Diagram (if applicable)
```
[ASCII diagram or description]