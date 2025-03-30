# Graphiti Knowledge Graph: https://github.com/getzep/graphiti

## Overview
Graphiti is a temporal knowledge graph framework for AI agents that continuously integrates user interactions, structured data, and external information into a queryable graph. Unlike traditional RAG systems that rely on batch processing, Graphiti provides real-time incremental updates, bi-temporal tracking, and hybrid retrieval.

## Core Capabilities
- **Real-Time Updates:** Immediate integration without batch recomputation
- **Bi-Temporal Model:** Tracks both event occurrence and ingestion times
- **Hybrid Retrieval:** Combines semantic embeddings, keyword (BM25), and graph traversal
- **Custom Entities:** Supports developer-defined entities via Pydantic models
- **Temporal Awareness:** Handles changing relationships with historical context

## Entity Types
- **Preference:** User preferences with category and description fields
- **Procedure:** Step-by-step instructions or workflows with clear guidance
- **Requirement:** Specific needs with project name, priority, and status fields

## MCP Tools
- `add_episode`: Add content (text, JSON, messages) to the graph
- `search_nodes`: Find entity nodes with optional entity type filtering
- `search_facts`: Retrieve relationships between entities
- `delete_entity_edge`/`delete_episode`: Remove specific content
- `get_entity_edge`/`get_episodes`: Retrieve specific items
- `clear_graph`: Reset the knowledge graph

## Best Practices
1. **Search First:** Always check for existing preferences/procedures
2. **Capture Immediately:** Store new information as it appears
3. **Follow Discovered Knowledge:** Align with found preferences and procedures
4. **Use Entity Filtering:** Specify entity types when searching
5. **Maintain Context:** Use center_node_uuid for related information

## Requirements
- Python 3.10+
- Neo4j 5.26+
- OpenAI API key (or compatible alternative)