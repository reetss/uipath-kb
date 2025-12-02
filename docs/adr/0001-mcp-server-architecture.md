# MCP Server Architecture Choice

**Status:** Accepted  
**Datum:** 2024-12-02  
**Entscheider:** Knowledge Base Team  
**ADR-Nr:** 0001

---

## Context und Problem Statement

Für die UIPath Knowledge Base benötigen wir eine Möglichkeit, verschiedene Datenquellen (offizielle Dokumentation, YouTube-Videos, lokale Dokumente) zu integrieren und über eine einheitliche Schnittstelle verfügbar zu machen. Die Integration soll in Claude Desktop erfolgen, um KI-assistierte Recherche und Dokumentationserstellung zu ermöglichen.

Die Herausforderung besteht darin, eine erweiterbare Architektur zu schaffen, die:
- Mehrere Datenquellen unterstützt
- In Claude Desktop integrierbar ist
- Wartbar und testbar bleibt
- Unabhängig voneinander entwickelt werden kann

### Betroffene Bereiche

- Integration mit Claude Desktop
- Datenquellen-Anbindung (UIPath Docs, YouTube, lokale Files)
- Entwicklungs-Workflow
- Wartbarkeit und Erweiterbarkeit

## Decision Drivers

- **Erweiterbarkeit**: Neue Datenquellen sollten einfach hinzugefügt werden können
- **Isolation**: Fehler in einem Server sollten andere nicht beeinflussen
- **Standardkonformität**: Nutzung etablierter Protokolle und Standards
- **Claude Desktop Integration**: Native Unterstützung erforderlich
- **TypeScript**: Team-Expertise und Type-Safety
- **Wartbarkeit**: Klare Trennung von Verantwortlichkeiten

## Considered Options

- **Option 1**: Monolithischer MCP-Server mit allen Funktionen
- **Option 2**: Separate MCP-Server pro Datenquelle (gewählt)
- **Option 3**: REST API mit eigenem Backend
- **Option 4**: Direkte Integration ohne Server-Komponenten

## Decision Outcome

**Gewählte Option**: "Option 2: Separate MCP-Server pro Datenquelle"

Wir implementieren drei separate MCP-Server:
1. `uipath-docs`: Für offizielle UIPath Dokumentation
2. `youtube-scraper`: Für YouTube-Videos mit fabric-ai Integration
3. `local-knowledge`: Für lokale Dokumentations-Suche

### Positive Consequences

- **Isolation**: Jeder Server kann unabhängig entwickelt, getestet und deployed werden
- **Fehlertoleranz**: Fehler in einem Server beeinflussen andere nicht
- **Skalierbarkeit**: Server können einzeln aktiviert/deaktiviert werden
- **Wartbarkeit**: Klare Code-Grenzen, kleinere Codebases
- **Flexibilität**: Verschiedene Dependencies pro Server möglich
- **Standard-konform**: MCP ist offizielles Protokoll von Anthropic

### Negative Consequences

- **Mehr Boilerplate**: Jeder Server braucht eigene package.json, tsconfig, etc.
- **Build-Komplexität**: Mehrere Build-Prozesse zu verwalten
- **Konfiguration**: Drei separate Einträge in Claude Desktop Config
- **Overhead**: Mehr Code für Server-Setup (3x statt 1x)

### Confirmation

Die Entscheidung ist erfolgreich wenn:
- Alle drei Server stabil laufen
- Neue Datenquellen in < 1 Tag als neuer Server hinzugefügt werden können
- Server-Fehler isoliert bleiben
- Build-Zeit pro Server < 5 Sekunden

## Pros and Cons of the Options

### Option 1: Monolithischer MCP-Server

Ein einzelner MCP-Server mit allen Tools für alle Datenquellen.

**Pros:**
- ✅ Einfacherer Build-Prozess (nur einmal)
- ✅ Eine Konfiguration in Claude Desktop
- ✅ Weniger Code-Duplikation
- ✅ Einfachere Dependency-Verwaltung

**Cons:**
- ❌ Große Codebase schwer zu warten
- ❌ Fehler können alle Funktionen beeinflussen
- ❌ Alle Dependencies immer geladen (auch wenn nicht genutzt)
- ❌ Schwierig parallel zu entwickeln
- ❌ Tight coupling zwischen Komponenten

### Option 2: Separate MCP-Server (GEWÄHLT)

Ein MCP-Server pro Datenquelle/Funktionalität.

**Pros:**
- ✅ Klare Separation of Concerns
- ✅ Unabhängige Entwicklung und Testing
- ✅ Fehler-Isolation
- ✅ Flexible Aktivierung/Deaktivierung
- ✅ Kleinere, wartbare Codebases
- ✅ Unterschiedliche Dependencies pro Server
- ✅ Einfacher zu verstehen für neue Entwickler

**Cons:**
- ❌ Mehr Boilerplate-Code
- ❌ Komplexerer Build-Prozess
- ❌ Mehrere Konfigurationseinträge
- ❌ Potentielle Code-Duplikation

### Option 3: REST API mit Backend

Eigener REST API Server statt MCP.

**Pros:**
- ✅ Bekannte Technologie (REST)
- ✅ Unabhängig von Claude Desktop
- ✅ Eigenes Backend mit Datenbank möglich

**Cons:**
- ❌ Keine native Claude Desktop Integration
- ❌ Zusätzliche Infrastruktur (Server hosting)
- ❌ Authentifizierung und Security zu implementieren
- ❌ Nicht das Standard-Protokoll für Claude
- ❌ Mehr Komplexität

### Option 4: Direkte Integration

Tools direkt in Claude ohne Server.

**Pros:**
- ✅ Keine Server-Komponenten
- ✅ Minimale Infrastruktur

**Cons:**
- ❌ Begrenzte Möglichkeiten in Claude
- ❌ Kein Caching möglich
- ❌ Keine Kontrolle über Implementierung
- ❌ Schwierig externe Tools (fabric-ai) zu integrieren

## More Information

### Related Decisions

- [ADR-0002: Knowledge Base Structure](0002-knowledge-base-structure.md)
- [ADR-0003: Documentation Validation](0003-documentation-validation.md)

### References

- [Model Context Protocol (MCP) Specification](https://modelcontextprotocol.io/)
- [MCP SDK für TypeScript](https://github.com/modelcontextprotocol/typescript-sdk)
- [Claude Desktop Configuration](https://docs.anthropic.com/claude/docs/mcp)

### Implementation Notes

Projekt-Struktur:
```
mcp-servers/
├── uipath-docs/
│   ├── src/index.ts
│   ├── package.json
│   └── tsconfig.json
├── youtube-scraper/
│   ├── src/index.ts
│   ├── package.json
│   └── tsconfig.json
└── local-knowledge/
    ├── src/index.ts
    ├── package.json
    └── tsconfig.json
```

Gemeinsame Dependencies werden im Root package.json verwaltet (npm workspaces).

### Follow-up Tasks

- [x] Implementiere uipath-docs MCP-Server
- [x] Implementiere youtube-scraper MCP-Server
- [x] Implementiere local-knowledge MCP-Server
- [x] Konfiguriere Claude Desktop
- [x] Teste alle Server einzeln
- [ ] Monitoring und Logging hinzufügen
- [ ] Performance-Optimierung

---

**Änderungshistorie:**

| Datum | Änderung | Autor |
|-------|----------|-------|
| 2024-12-02 | Initiale Version | Knowledge Base Team |
| 2024-12-02 | Status auf Accepted | Knowledge Base Team |
