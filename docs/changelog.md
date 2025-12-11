# Changelog

Alle bedeutsamen Änderungen an diesem Projekt werden hier dokumentiert.

## 2025-12-11

- feat: Neuer MCP-Server `uipath-forum`
  - Tools: `forum_latest`, `forum_top`, `forum_get_topic`, `forum_search`
  - Code: `mcp-servers/uipath-forum/` (TypeScript, MCP Stdio)
  - Doku: `docs/uipath-forum-scraper.md`
  - Konfiguration: `claude-desktop-config.json` Beispiel ergänzt
- docs: README aktualisiert (Server-Übersicht + Link zur Forum-Doku)
- docs: MCP-Konfigurationsleitfaden um Forum-Server erweitert
- chore: Secret-Scanning Blockierung behoben
  - Entfernt: `.specstory/history/2025-12-02_13-39Z-building-a-uipath-knowledge-base-architecture.md`
  - Historie bereinigt mit `git-filter-repo` und Force-Push
  - Empfehlung: Betroffene API Keys rotieren
