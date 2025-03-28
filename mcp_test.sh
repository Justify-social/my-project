#!/bin/bash
export GRAPHITI_MCP_URL=http://localhost:8000
export OPENAI_API_KEY=$(grep OPENAI_API_KEY ~/my-project/graphiti/mcp_server/.env | cut -d"=" -f2-)
