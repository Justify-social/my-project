# Graphiti Knowledge Graph Integration

## Overview

This project integrates with Graphiti, a knowledge graph system that stores project knowledge, preferences, and procedures. Graphiti helps maintain institutional knowledge and ensures consistency across the project.

## Directory Structure

```
/graphiti/                # Main Graphiti directory
/graphiti-env/            # Environment-specific configurations
/docs/graphiti/           # Documentation about Graphiti usage
```

## Key Concepts

### Knowledge Types

Graphiti manages several types of knowledge:

1. **Preferences**: Project-wide design decisions, conventions, and standards
2. **Procedures**: Step-by-step guides for common development tasks
3. **Facts**: Specific pieces of information about the project
4. **Relationships**: Connections between different knowledge entities

### Storage Mechanism

The knowledge is stored in a graph database, allowing for:

- Relationship-based queries
- Semantic search capabilities
- Knowledge traversal
- Contextual information retrieval

## Working with Graphiti

### Adding Knowledge

Use the `mcp_Graphiti_add_episode` function to add information to the graph:

```javascript
// Adding a preference
mcp_Graphiti_add_episode({
  name: 'Button Color Preference',
  episode_body: 'Primary buttons should use accent color #00BFFF',
  source: 'text',
  source_description: 'UI Guidelines',
});

// Adding a procedure
mcp_Graphiti_add_episode({
  name: 'Adding a New UI Component',
  episode_body:
    '1. Create component directory\n2. Add index.ts file\n3. Create component file\n4. Add tests\n5. Update registry',
  source: 'text',
  source_description: 'Development Procedures',
});

// Adding structured data
mcp_Graphiti_add_episode({
  name: 'UI Component Registry',
  episode_body: JSON.stringify({
    components: [
      { name: 'Button', path: 'src/components/ui/atoms/button' },
      { name: 'Card', path: 'src/components/ui/atoms/card' },
    ],
  }),
  source: 'json',
  source_description: 'Component Registry',
});
```

### Searching Knowledge

Use the `mcp_Graphiti_search_nodes` function to find relevant nodes:

```javascript
// Search for all preferences
const preferences = await mcp_Graphiti_search_nodes({
  query: 'preferences',
  entity: 'Preference',
});

// Search for a specific procedure
const addComponentProcedure = await mcp_Graphiti_search_nodes({
  query: 'adding new component',
});

// Search with specific filters
const colorPreferences = await mcp_Graphiti_search_nodes({
  query: 'color',
  entity: 'Preference',
});
```

### Searching Facts

Use the `mcp_Graphiti_search_facts` function to find specific facts:

```javascript
// Search for facts about buttons
const buttonFacts = await mcp_Graphiti_search_facts({
  query: 'button',
});

// Search for facts about a specific feature
const wizardFacts = await mcp_Graphiti_search_facts({
  query: 'campaign wizard',
});
```

### Deleting Knowledge

Use the `mcp_Graphiti_delete_episode` or `mcp_Graphiti_delete_entity_edge` functions:

```javascript
// Delete an episode
await mcp_Graphiti_delete_episode({
  uuid: 'episode-uuid',
});

// Delete a relationship
await mcp_Graphiti_delete_entity_edge({
  uuid: 'edge-uuid',
});
```

## Best Practices

### Before Starting Any Task

1. Always check Graphiti for existing preferences and procedures before starting any task
2. Use `mcp_Graphiti_search_nodes` to find relevant information
3. Filter by entity type (`Preference` or `Procedure`) for more specific results
4. Review all knowledge before taking action

### Capturing New Knowledge

1. Use `mcp_Graphiti_add_episode` to capture preferences and procedures as soon as they're established
2. Keep episodes concise (less than 10 words where possible)
3. Break long preferences into clear, logical chunks
4. Be explicit when updating existing knowledge
5. Label entries with specific categories for better recall

### Aligning with Existing Knowledge

1. Follow existing preferences and procedures exactly
2. Support decisions with stored facts
3. Avoid guesswork or hallucination - stick to what's known

### Knowledge Management

1. Provide memory-based suggestions when relevant
2. Keep memory updated by removing outdated information
3. Make sure all preferences and procedures are stored in memory
4. Show users what's in memory when helpful

## UI and UX Integration

Graphiti knowledge is integrated into the development workflow in several ways:

1. **Development Tools**: IDE plugins and CLI tools query Graphiti for relevant knowledge
2. **Code Review**: Automated checks compare changes against stored preferences
3. **Documentation**: Auto-generated docs pull from Graphiti knowledge
4. **Onboarding**: New developers use Graphiti to learn project conventions

## Example Use Cases

### UI Component Development

```javascript
// Before developing a new button variant
const buttonPreferences = await mcp_Graphiti_search_nodes({
  query: 'button preferences',
  entity: 'Preference',
});

// After establishing a new standard
await mcp_Graphiti_add_episode({
  name: 'Button Size Standard',
  episode_body: 'Button sizes should be: sm (24px), md (32px), lg (40px), xl (48px)',
  source: 'text',
  source_description: 'UI Component Standards',
});
```

### Documentation Generation

```javascript
// Generate documentation from procedures
const componentProcedures = await mcp_Graphiti_search_nodes({
  query: 'component development',
  entity: 'Procedure',
});

// Format the procedures into markdown
const markdown = componentProcedures
  .map(procedure => {
    return `## ${procedure.name}\n\n${procedure.content}`;
  })
  .join('\n\n');
```

### Consistency Checks

```javascript
// Check if a UI change aligns with preferences
const colorPreferences = await mcp_Graphiti_search_nodes({
  query: 'color preferences',
  entity: 'Preference',
});

// Compare proposed changes against preferences
function validateColorChanges(changes, preferences) {
  // Validation logic
}
```

## Technical Implementation

Graphiti is implemented using:

1. **Backend**: Node.js service with graph database (Neo4j or similar)
2. **API Layer**: RESTful API for knowledge operations
3. **MCP Tools**: Integration with the marketing-cloud-platform toolset
4. **Client Libraries**: JavaScript/TypeScript libraries for easy integration

## Security Considerations

1. **Access Control**: Only authorized users can modify the knowledge graph
2. **Validation**: Knowledge additions are validated before storage
3. **History**: All changes are tracked with full history
4. **Backups**: Regular backups of the knowledge graph
