# Architecture Decision Records (ADR)

Dieser Ordner enthält alle wichtigen Architektur- und Design-Entscheidungen für die UIPath Knowledge Base.

## Was sind ADRs?

Architecture Decision Records (ADRs) dokumentieren wichtige Entscheidungen, die während der Entwicklung getroffen wurden. Sie helfen dabei:

- **Nachvollziehbarkeit**: Warum wurde diese Entscheidung getroffen?
- **Kontext**: Welche Alternativen wurden betrachtet?
- **Konsequenzen**: Was sind die Auswirkungen?
- **Wissensbewahrung**: Für neue Team-Mitglieder und zukünftige Referenz

## Format

Wir verwenden das [MADR](https://adr.github.io/madr/) (Markdown Architectural Decision Records) Format.

## Nummerierung

ADRs werden sequentiell nummeriert:
- `0001-erste-entscheidung.md`
- `0002-zweite-entscheidung.md`
- etc.

## Status

Ein ADR kann folgende Status haben:

- **Proposed**: Zur Diskussion vorgeschlagen
- **Accepted**: Entscheidung getroffen und implementiert
- **Superseded**: Durch neueren ADR ersetzt (mit Link zum Nachfolger)
- **Deprecated**: Nicht mehr empfohlen, aber noch in Verwendung
- **Rejected**: Entscheidung wurde abgelehnt

## Index aller ADRs

### Accepted

| Nr | Titel | Datum | Status |
|----|-------|-------|--------|
| [0001](0001-mcp-server-architecture.md) | MCP Server Architecture | 2024-12-02 | Accepted |
| [0002](0002-knowledge-base-structure.md) | Knowledge Base Structure | 2024-12-02 | Accepted |
| [0003](0003-documentation-validation.md) | Documentation Validation Framework | 2024-12-02 | Accepted |

### Proposed

_Keine zur Zeit_

### Superseded

_Keine zur Zeit_

### Deprecated

_Keine zur Zeit_

### Rejected

_Keine zur Zeit_

## Wann einen ADR erstellen?

Erstelle einen ADR wenn:

✅ **Architektur-Entscheidungen**: Neue Pattern oder Strukturen eingeführt werden  
✅ **Technologie-Wahl**: Wichtige Tools oder Frameworks gewählt werden  
✅ **Breaking Changes**: Änderungen die bestehende Systeme beeinflussen  
✅ **Prozess-Änderungen**: Neue Workflows oder Standards definiert werden  
✅ **Kontroverse Entscheidungen**: Wenn es mehrere gute Optionen gibt

Erstelle KEINEN ADR für:

❌ Kleine Bug-Fixes  
❌ Routine-Updates  
❌ Offensichtliche Entscheidungen  
❌ Temporary Workarounds

## Prozess

1. **Template kopieren**
   ```bash
   cp docs/adr/template.md docs/adr/NNNN-titel.md
   ```

2. **ADR ausfüllen**
   - Context beschreiben
   - Optionen evaluieren
   - Entscheidung dokumentieren
   - Konsequenzen aufzeigen

3. **Review**
   - Team-Review (falls Team vorhanden)
   - Feedback einarbeiten
   - Status auf "Accepted" setzen

4. **Index aktualisieren**
   - Diesen README.md aktualisieren
   - Link zum neuen ADR hinzufügen

5. **Implementieren & Referenzieren**
   - Im Code: `// See ADR-NNNN`
   - In Commits: `Refs: ADR-NNNN`
   - In Dokumentation: `[ADR-NNNN](link)`

## Template

Verwende [template.md](template.md) als Vorlage für neue ADRs.

## Weitere Ressourcen

- [MADR Documentation](https://adr.github.io/madr/)
- [ADR on GitHub](https://github.com/joelparkerhenderson/architecture-decision-record)
- [When to use ADRs](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
