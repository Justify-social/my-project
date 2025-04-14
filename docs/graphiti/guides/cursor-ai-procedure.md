# CursorAI Graphiti Check Procedure

## Overview

This document outlines the mandatory procedure for CursorAI to check the Graphiti knowledge graph before starting any new task. This ensures consistent behavior, leverages existing knowledge, and maintains a reliable system of record.

## Mandatory Procedure

Before starting any new CursorAI task, the following procedure **must** be followed:

1. Use `mcp_Graphiti_search_nodes` to find existing preferences, procedures or facts relevant to the task
2. Filter by entity type when searching (e.g., "Preference" or "Procedure")
3. Use `mcp_Graphiti_search_facts` to uncover relationships or relevant factual data
4. Review all matches before taking any action
5. If relevant preferences or procedures are found, follow them precisely
6. Support decisions with stored facts and avoid guesswork
7. If no relevant information is found, proceed with the task using best practices
8. After completing the task, use `mcp_Graphiti_add_episode` to capture any new preferences, procedures, or facts discovered

## Implementation Details

This procedure is enforced through multiple robust mechanisms:

1. **Cursor Rules**: The `.cursor/rules/graphiti-rules.mdc` file contains these instructions with `alwaysApply: true`
2. **Graphiti Knowledge Graph**: This procedure is stored in the Graphiti knowledge graph itself
3. **Documentation**: This document serves as a central reference
4. **Technical Enforcement**:
   - **Middleware**: The `graphitiCheckEnforcer` middleware intercepts all CursorAI requests and blocks any new task that doesn't check Graphiti first
   - **Agent Configuration**: The `createAgentConfig` function injects mandatory Graphiti check instructions into agent system messages
   - **Query Validation**: The `validateUserQuery` function identifies new tasks and ensures Graphiti checks were performed

These technical enforcement mechanisms provide multiple layers of protection to ensure CursorAI agents check Graphiti before starting any task, making it virtually impossible to bypass this requirement.

## Verification

After completing any task, CursorAI should verify that:

1. All new preferences or procedures have been properly added to the knowledge graph
2. Existing preferences or procedures were followed accurately
3. Any relevant facts were considered in decision making

## Example Usage

```
// Before starting a UI component task
mcp_Graphiti_search_nodes(
  query: "UI component design preference",
  entity: "Preference"
)

// Check for related facts
mcp_Graphiti_search_facts(
  query: "UI component relationships"
)

// After completing the task, add new knowledge
mcp_Graphiti_add_episode(
  name: "Button Hover Effect Preference",
  episode_body: "Buttons should use fa-light by default and fa-solid on hover states.",
  source: "text",
  source_description: "UI preference"
)
```

## Benefits

By consistently following this procedure, CursorAI will:

1. Maintain consistency across tasks
2. Avoid duplicating work by leveraging existing knowledge
3. Build a more valuable and comprehensive knowledge graph over time
4. Provide better personalized assistance to users
5. Ensure compliance with established standards and preferences

## References

- [Graphiti Documentation](./graphiti.md)
- [Graphiti Rules File](./.cursor/rules/graphiti-rules.mdc)
- [Cursor AI Integration Documentation](./graphiti-complete-documentation.md)
