# Graphiti Integration Guide

## Overview

This guide provides comprehensive documentation on how to effectively use and integrate with the Graphiti knowledge graph in our codebase. Graphiti serves as our central memory store for preferences, procedures, and knowledge, ensuring consistent behavior and decisions across our application.

## Table of Contents

1. [Architecture](#architecture)
2. [Entity Types](#entity-types)
3. [Integration Points](#integration-points)
4. [Required Procedures](#required-procedures)
5. [Working with MCP Tools](#working-with-mcp-tools)
6. [Troubleshooting](#troubleshooting)
7. [Examples](#examples)
8. [Dashboard & Monitoring](#dashboard-and-monitoring)

<a id="architecture"></a>

## 1. Architecture

The Graphiti integration follows a layered architecture:

```
┌────────────────────┐      ┌────────────────┐      ┌────────────────┐
│    CursorAI        │◄────►│  Middleware    │◄────►│   Graphiti     │
│    Assistant       │      │  Enforcement   │      │  Knowledge     │
└────────────────────┘      └────────────────┘      └────────────────┘
          │                         │                       │
          ▼                         ▼                       ▼
┌────────────────────┐      ┌────────────────┐      ┌────────────────┐
│  User Interface    │      │   Telemetry    │      │    Neo4j       │
│                    │      │   Monitoring   │      │   Database     │
└────────────────────┘      └────────────────┘      └────────────────┘
```

### Key Components

- **MCP Tools**: Functions exposed to Cursor AI for interacting with Graphiti
- **Middleware**: The `graphitiCheckEnforcer` ensures compliance with procedures
- **Knowledge Graph**: Neo4j database storing relationships and entities
- **Telemetry**: Monitoring system for tracking usage and compliance

<a id="entity-types"></a>

## 2. Entity Types

Graphiti supports three core entity types:

### Preference

Represents user preferences or system configuration choices. Examples include UI styles, color schemes, or feature toggles.

**Required Fields:**

- `category`: The domain of the preference (UI, Code, Process)
- `description`: Clear description of the preference

### Procedure

Represents a sequence of steps or actions to accomplish a task. Essentially "how to do something" in our system.

**Required Fields:**

- `description`: Step-by-step guidance on executing the procedure

### Requirement

Represents system requirements or constraints that must be followed.

**Required Fields:**

- `project_name`: Which project/component this applies to
- `description`: Details of the requirement

<a id="integration-points"></a>

## 3. Integration Points

Our codebase integrates with Graphiti at several key points:

1. **Middleware Layer** (`src/middlewares/cursor-ai/graphiti-check-enforcer.ts`)

   - Enforces Graphiti checks before new tasks
   - Tracks session state and compliance
   - Collects telemetry data

2. **Agent Configuration** (`src/services/cursor-ai/agent-config.ts`)

   - Injects Graphiti instructions into agent prompts
   - Configures agent behavior for different tasks

3. **Cursor Rules** (`.cursor/rules/graphiti-rules.mdc`)

   - Defines best practices for Graphiti usage
   - Applied automatically to all agent interactions

4. **Telemetry API** (`src/app/api/internal/graphiti-telemetry/route.ts`)
   - Exposes monitoring data for Graphiti usage
   - Restricted to admin users for debugging

<a id="required-procedures"></a>

## 4. Required Procedures

Before starting any task, the following procedure **must** be followed:

1. Use `mcp_Graphiti_search_nodes` to find existing preferences, procedures, or facts
2. Filter by entity type when searching
3. Use `mcp_Graphiti_search_facts` to uncover relationships
4. Review all matches before taking action
5. If relevant procedures or preferences are found, follow them precisely
6. After completing a task, store new knowledge with `mcp_Graphiti_add_episode`

This procedure is enforced by middleware that blocks requests without proper Graphiti checks.

<a id="working-with-mcp-tools"></a>

## 5. Working with MCP Tools

### Search Nodes

Find entity nodes (preferences, procedures) in the knowledge graph:

```typescript
mcp_Graphiti_search_nodes({
  query: 'UI button component', // Search query
  entity: 'Preference', // Optional filter by entity type
  max_nodes: 5, // Maximum results to return
});
```

### Search Facts

Find relationships between entities:

```typescript
mcp_Graphiti_search_facts({
  query: 'API integration pattern', // Search query
  max_facts: 10, // Maximum facts to return
});
```

### Add Episode

Store new knowledge in the graph:

```typescript
mcp_Graphiti_add_episode({
  name: 'Error Handling Procedure', // Short, descriptive name
  episode_body: 'When handling errors, always...', // Content to store
  source: 'text', // Content type (text, json, message)
  source_description: 'Development procedure', // Category/description
});
```

<a id="troubleshooting"></a>

## 6. Troubleshooting

### Common Issues

1. **Blocked Requests**

   - **Symptom**: Request blocked with "GRAPHITI_CHECK_REQUIRED" error
   - **Solution**: Include Graphiti search calls at the beginning of your task

2. **Missing Knowledge**

   - **Symptom**: Graphiti searches return no results for expected preferences
   - **Solution**: Add missing knowledge using `mcp_Graphiti_add_episode`

3. **Session Tracking Issues**
   - **Symptom**: Repeatedly asked to check Graphiti despite already checking
   - **Solution**: Ensure session identifiers are consistent or use bypass header in development

### Development Tools

For development and testing, you can use:

1. **Bypass Header**:

   - Add `x-graphiti-check-bypass: <secret>` header to bypass checks
   - Secret must match the `GRAPHITI_BYPASS_SECRET` environment variable

2. **Session State Inspection**:
   - Visit the internal telemetry API at `/api/internal/graphiti-telemetry`
   - Requires admin privileges to view

<a id="examples"></a>

## 7. Examples

### Example 1: Creating a New UI Component

```typescript
// Step 1: Check for existing UI preferences
mcp_Graphiti_search_nodes({
  query: 'tooltip component design',
  entity: 'Preference',
});

// Step 2: Check for related facts
mcp_Graphiti_search_facts({
  query: 'tooltip relationship button',
});

// Step 3: Create component following discovered preferences
// ...component implementation...

// Step 4: Store any new preferences discovered
mcp_Graphiti_add_episode({
  name: 'Tooltip Positioning Preference',
  episode_body:
    'Tooltips should appear above elements by default, falling back to below only when space is constrained.',
  source: 'text',
  source_description: 'UI component preference',
});
```

### Example 2: Implementing an API Integration

```typescript
// Step 1: Check for API integration procedures
mcp_Graphiti_search_nodes({
  query: 'API integration pattern',
  entity: 'Procedure',
});

// Step 2: Check for related facts
mcp_Graphiti_search_facts({
  query: 'API error handling',
});

// Step 3: Implement API integration following procedures
// ...API integration code...

// Step 4: Store any new knowledge gained
mcp_Graphiti_add_episode({
  name: 'Third-Party API Rate Limiting',
  episode_body:
    'When integrating with ExampleAPI, implement exponential backoff for rate limit errors starting with 500ms delay.',
  source: 'text',
  source_description: 'API integration requirement',
});
```

<a id="dashboard-and-monitoring"></a>

## 8. Dashboard & Monitoring

The Graphiti integration includes telemetry and monitoring capabilities:

### Telemetry API

Access metrics about Graphiti usage at `/api/internal/graphiti-telemetry`:

```json
{
  "telemetry": {
    "activeSessions": [
      {
        "sessionId": "user-123-session-456",
        "lastUpdated": "2025-03-29T15:32:14.253Z",
        "hasCheckedGraphiti": true,
        "taskType": "ui-development",
        "queryCount": 12
      }
    ],
    "telemetry": [
      {
        "timestamp": 1679951534000,
        "sessionId": "user-123-session-456",
        "action": "check",
        "taskType": "ui-development",
        "success": true
      }
    ]
  },
  "stats": {
    "activeSessions": 1,
    "checkCount": 54,
    "blockCount": 3,
    "completeCount": 12,
    "bypassCount": 32,
    "successRate": 95
  },
  "timestamp": "2025-03-29T15:32:17.089Z"
}
```

### Future Enhancements

We plan to implement:

1. **Visual Dashboard**: Web interface for Graphiti telemetry
2. **Knowledge Explorer**: UI for browsing and editing knowledge
3. **Integration Analytics**: Performance metrics for Graphiti integration

## Resources

- [Graphiti Core Documentation](./graphiti.md)
- [Cursor AI Integration](./cursor-ai-graphiti-procedure.md)
- [Neo4j Database Schema](./database/neo4j-schema.md)
