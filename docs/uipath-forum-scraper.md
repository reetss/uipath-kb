# UiPath Forum Scraper MCP Server

Get topics and search the UiPath Forum (Discourse) via MCP tools.

## Tools
- forum_latest: Latest topics (limit)
- forum_top: Top topics by period (daily/weekly/monthly/yearly/all, limit)
- forum_search: Search topics by query (limit)
- forum_get_topic: Get topic detail by ID

## Install & Build
```powershell
cd mcp-servers\uipath-forum
npm install
npm run build
```

## Claude Desktop config
Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "uipath-forum": {
      "command": "node",
      "args": [
        "C:/Users/steer/Workbenches/uipath-kb/mcp-servers/uipath-forum/dist/index.js"
      ],
      "env": {}
    }
  }
}
```

## Examples
- "Suche im UiPath Forum nach Orchestrator Queue Problemen"
- "Zeige die Top-Themen der Woche"
- "Hole Details zum Topic mit ID 12345"

## Notes
- Uses public Discourse JSON endpoints on forum.uipath.com
- No auth required for public content
