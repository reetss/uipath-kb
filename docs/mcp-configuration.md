# MCP-Server Konfiguration für Claude Desktop

Diese Anleitung zeigt, wie du die UIPath Knowledge Base MCP-Server in Claude Desktop integrierst.

## Voraussetzungen

1. **Claude Desktop** installiert
2. **Node.js 18+** installiert
3. **MCP-Server** gebaut (siehe Hauptdokumentation)

## Installation der MCP-Server

```bash
cd /Users/mfalland/git/uipath-kb

# Alle Abhängigkeiten installieren
npm run install-all

# Alle Server bauen
npm run build
```

## Konfiguration in Claude Desktop

Die MCP-Server werden in der Claude Desktop Konfigurationsdatei eingetragen:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

### Beispiel-Konfiguration

Öffne die Konfigurationsdatei und füge folgende MCP-Server hinzu:

```json
{
  "mcpServers": {
    "uipath-docs": {
      "command": "node",
      "args": [
        "/Users/mfalland/git/uipath-kb/mcp-servers/uipath-docs/dist/index.js"
      ],
      "env": {}
    },
    "youtube-scraper": {
      "command": "node",
      "args": [
        "/Users/mfalland/git/uipath-kb/mcp-servers/youtube-scraper/dist/index.js"
      ],
      "env": {
        "FABRIC_PATH": "/opt/homebrew/opt/fabric-ai/bin/fabric-ai"
      }
    },
    "local-knowledge": {
      "command": "node",
      "args": [
        "/Users/mfalland/git/uipath-kb/mcp-servers/local-knowledge/dist/index.js"
      ],
      "env": {}
    },
    "reddit-search": {
      "command": "node",
      "args": [
        "/Users/mfalland/git/uipath-kb/mcp-servers/reddit-search/dist/index.js"
      ],
      "env": {}
    }
  }
}
```

**Wichtig:** Passe die Pfade an deine lokale Installation an!

## Server einzeln aktivieren/deaktivieren

Du kannst Server einzeln aktivieren, indem du nur die gewünschten Server in die Konfiguration aufnimmst:

### Nur UIPath Docs

```json
{
  "mcpServers": {
    "uipath-docs": {
      "command": "node",
      "args": [
        "/Users/mfalland/git/uipath-kb/mcp-servers/uipath-docs/dist/index.js"
      ]
    }
  }
}
```

### Nur YouTube Scraper

```json
{
  "mcpServers": {
    "youtube-scraper": {
      "command": "node",
      "args": [
        "/Users/mfalland/git/uipath-kb/mcp-servers/youtube-scraper/dist/index.js"
      ],
      "env": {
        "FABRIC_PATH": "/opt/homebrew/opt/fabric-ai/bin/fabric-ai"
      }
    }
  }
}
```

## Verfügbare MCP-Tools nach Aktivierung

### UIPath Docs Server
- `uipath_docs_search` - Suche in der UIPath Dokumentation
- `uipath_docs_fetch` - Vollständige Dokumentationsseite abrufen
- `uipath_docs_list_products` - Liste aller UIPath Produkte

### YouTube Scraper Server
- `youtube_get_metadata` - Video-Metadaten extrahieren
- `youtube_get_transcript` - Transkript/Untertitel abrufen
- `youtube_extract_wisdom` - Key Insights mit fabric-ai extrahieren
- `youtube_summarize` - Video-Zusammenfassung erstellen
- `youtube_list_cached` - Alle gecachten Videos anzeigen

### Local Knowledge Server
- `knowledge_search` - Lokale Knowledge Base durchsuchen
- `knowledge_get_document` - Spezifisches Dokument abrufen
- `knowledge_list_documents` - Alle Dokumente auflisten
- `knowledge_add_document` - Neues Dokument hinzufügen
- `knowledge_rebuild_index` - Suchindex neu aufbauen

### Reddit Search Server
- `reddit_search_uipath` - Suche r/UiPath für Probleme und Lösungen
- `reddit_get_trending` - Aktuelle Trending-Topics aus r/UiPath
- `reddit_get_top_problems` - Meist diskutierte Probleme aus der Community

## Neustart nach Konfiguration

Nach dem Hinzufügen oder Ändern der Konfiguration:

1. **Speichere** die `claude_desktop_config.json`
2. **Beende** Claude Desktop vollständig
3. **Starte** Claude Desktop neu

Die MCP-Server werden automatisch beim Start von Claude Desktop geladen.

## Troubleshooting

### Server startet nicht

1. Überprüfe, ob alle Server gebaut sind:
   ```bash
   cd /Users/mfalland/git/uipath-kb
   npm run build
   ```

2. Teste Server manuell:
   ```bash
   node /Users/mfalland/git/uipath-kb/mcp-servers/uipath-docs/dist/index.js
   ```

3. Überprüfe die Pfade in der Konfiguration

### fabric-ai wird nicht gefunden

Stelle sicher, dass der `FABRIC_PATH` korrekt ist:

```bash
which fabric-ai
# oder
ls /opt/homebrew/opt/fabric-ai/bin/fabric-ai
```

### Keine Tools sichtbar in Claude

1. Überprüfe die Claude Desktop Logs
2. Stelle sicher, dass die JSON-Syntax korrekt ist
3. Prüfe, ob Node.js im PATH verfügbar ist

## Logs anzeigen

Claude Desktop Logs befinden sich unter:
- **macOS:** `~/Library/Logs/Claude/`

Öffne die neueste Log-Datei, um Fehler zu diagnostizieren.

## Weiterführende Dokumentation

- [YouTube Scraping Guide](youtube-scraping.md)
- [Knowledge Base Management](knowledge-management.md)
- [Architektur-Generierung](architecture-generation.md)
