# 🚀 Quick Start Guide

Schnelleinstieg in die UIPath Knowledge Base.

## 📋 Voraussetzungen

Vor dem Start sicherstellen:

- ✅ **Node.js 18+** installiert
- ✅ **Python 3.10+** installiert (für zukünftige Erweiterungen)
- ✅ **fabric-ai** via Homebrew installiert: `brew install fabric-ai`
- ✅ **Claude Desktop** installiert
- ✅ **Git** für Versionskontrolle

## 🏁 Installation

### 1. Repository Setup

```bash
cd /Users/mfalland/git/uipath-kb

# Dependencies installieren
npm install
npm run install-servers

# MCP-Server bauen
npm run build
```

### 2. Server testen

```bash
# UIPath Docs Server
node mcp-servers/uipath-docs/dist/index.js <<< '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# YouTube Scraper
node mcp-servers/youtube-scraper/dist/index.js <<< '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# Local Knowledge
node mcp-servers/local-knowledge/dist/index.js <<< '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Alle sollten JSON-Responses mit verfügbaren Tools zurückgeben.

### 3. Claude Desktop konfigurieren

Öffne: `~/Library/Application Support/Claude/claude_desktop_config.json`

Füge hinzu:

```json
{
  "mcpServers": {
    "uipath-docs": {
      "command": "node",
      "args": [
        "/Users/mfalland/git/uipath-kb/mcp-servers/uipath-docs/dist/index.js"
      ]
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
      ]
    }
  }
}
```

### 4. Claude Desktop neu starten

1. Claude Desktop **komplett beenden**
2. Neu starten
3. MCP-Server sollten automatisch laden

## ✅ Verifizierung

In Claude Desktop testen:

```
Liste alle verfügbaren UIPath Produkte auf
```

Sollte `uipath_docs_list_products` Tool verwenden.

```
Zeige mir alle gecachten YouTube-Videos
```

Sollte `youtube_list_cached` Tool verwenden.

```
Durchsuche die lokale Knowledge Base nach "best practices"
```

Sollte `knowledge_search` Tool verwenden.

## 📚 Erste Schritte

### Dokumentation erstellen

```bash
# 1. Beispiel-Requirements nutzen
node validators/generate-architecture.js knowledge/custom/example-requirements.json

# 2. Generiertes Dokument prüfen
node validators/validate-documentation.js knowledge/generated/architecture-invoice-processing-automation.md

# 3. In docs verschieben
mv knowledge/generated/architecture-invoice-processing-automation.md docs/
```

### YouTube-Video scrapen

In Claude:
```
Extrahiere die wichtigsten Insights aus diesem UIPath Tutorial:
https://www.youtube.com/watch?v=[VIDEO_ID]
```

### UIPath Docs durchsuchen

In Claude:
```
Suche in der UIPath Dokumentation nach "REFramework best practices"
```

## 🔧 Troubleshooting

### Server starten nicht

```bash
# Check Build
npm run build

# Test manually
cd mcp-servers/uipath-docs
node dist/index.js
# Sollte "UIPath Docs MCP Server running on stdio" ausgeben
```

### fabric-ai nicht gefunden

```bash
# Prüfen
which fabric-ai
ls /opt/homebrew/opt/fabric-ai/bin/fabric-ai

# Ggf. neu installieren
brew reinstall fabric-ai
```

### Tools nicht sichtbar in Claude

1. Check Claude Desktop Logs: `~/Library/Logs/Claude/`
2. Prüfe JSON-Syntax in config
3. Stelle sicher alle Pfade sind absolut
4. Claude komplett neu starten

## 📖 Weiterführend

- [MCP Configuration](docs/mcp-configuration.md) - Detaillierte Setup-Anleitung
- [YouTube Scraping](docs/youtube-scraping.md) - Video-Processing Guide
- [Copilot Instructions](.github/copilot-instructions.md) - Workflows & Best Practices
- [ADR Index](docs/adr/README.md) - Architecture Decision Records

## 🎯 Nächste Schritte

1. **Erkunde die Knowledge Base**
   ```
   In Claude: "Zeige mir alle verfügbaren Dokumente in der Knowledge Base"
   ```

2. **Erste Architektur erstellen**
   - Requirements definieren
   - Generator nutzen
   - Validieren
   - In docs ablegen

3. **YouTube-Videos sammeln**
   - Relevante UIPath Tutorials finden
   - Mit fabric-ai verarbeiten
   - Insights extrahieren

4. **Eigene Dokumentation hinzufügen**
   ```bash
   # Markdown-Datei in knowledge/custom/ erstellen
   # Index neu aufbauen
   In Claude: "Baue den Knowledge Base Index neu auf"
   ```

## 💡 Tipps

- **ADRs nutzen**: Bei wichtigen Entscheidungen ADR erstellen
- **Validieren**: Immer `validate-documentation.js` vor Commit
- **Templates**: Bestehende Templates als Basis nutzen
- **MCP-Server**: Bei Änderungen immer `npm run build`
- **Cache**: YouTube und UIPath Docs werden automatisch gecacht

## 🆘 Support

Bei Problemen:
1. Check Logs in `~/Library/Logs/Claude/`
2. Test Server einzeln mit `tools/list`
3. Prüfe [ADRs](docs/adr/) für Architektur-Details
4. Review [Copilot Instructions](.github/copilot-instructions.md)

---

**Viel Erfolg mit der UIPath Knowledge Base! 🚀**
