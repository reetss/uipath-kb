# Knowledge Base Directory Structure

**Status:** Accepted  
**Datum:** 2024-12-02  
**Entscheider:** Knowledge Base Team  
**ADR-Nr:** 0002

---

## Context und Problem Statement

Die UIPath Knowledge Base sammelt Informationen aus verschiedenen Quellen: offizielle Dokumentation, YouTube-Videos, eigene Dokumentation und generierte Inhalte. Diese verschiedenen Inhaltstypen müssen organisiert, gespeichert und durchsuchbar gemacht werden.

Die Herausforderung besteht darin, eine Struktur zu finden, die:
- Klare Trennung verschiedener Inhaltsquellen ermöglicht
- Einfaches Auffinden von Dokumenten erlaubt
- Versionierung und Caching unterstützt
- Skalierbar für wachsende Inhaltsmengen ist

### Betroffene Bereiche

- Datei-Organisation
- MCP-Server (local-knowledge)
- Dokumentations-Workflows
- Suchfunktionalität

## Decision Drivers

- **Klarheit**: Entwickler sollen sofort verstehen, wo welcher Content liegt
- **Trennung**: Verschiedene Quellen sollen getrennt bleiben
- **Durchsuchbarkeit**: Alle Inhalte müssen durchsuchbar sein
- **Git-freundlich**: Struktur sollte gut mit Versionskontrolle funktionieren
- **Erweiterbarkeit**: Neue Kategorien sollten einfach hinzufügbar sein
- **Cache-Support**: Externe Inhalte müssen cachebar sein

## Considered Options

- **Option 1**: Flache Struktur mit Prefixes (uipath-*, youtube-*, etc.)
- **Option 2**: Kategorisierte Ordner-Struktur (gewählt)
- **Option 3**: Datenbank-basierte Speicherung
- **Option 4**: Alles in einem Ordner mit Metadaten-Files

## Decision Outcome

**Gewählte Option**: "Option 2: Kategorisierte Ordner-Struktur"

Struktur:
```
knowledge/
├── official/        # Gecachte offizielle UIPath Docs
│   └── cache/      # Cache-Unterordner
├── videos/         # YouTube Video-Daten
├── custom/         # Eigene Dokumentation
└── generated/      # Generierte Architekturen & Konzepte
```

### Positive Consequences

- **Klare Organisation**: Sofort erkennbar, woher Content stammt
- **Git-freundlich**: Leicht zu versionieren und zu mergen
- **Cache-Trennung**: Official/Videos können gecacht werden ohne custom zu beeinflussen
- **Einfache Suche**: MCP-Server kann gezielt nach Kategorien filtern
- **Skalierbar**: Neue Kategorien einfach als neuer Ordner
- **Keine Datenbank**: Reduzierte Komplexität, Markdown ist portable

### Negative Consequences

- **Tiefe Verschachtelung**: Pfade können lang werden
- **Redundanz möglich**: Ähnliche Inhalte in verschiedenen Kategorien
- **Manuelle Pflege**: Keine automatische Kategorisierung
- **Dateisystem-Limits**: Bei sehr vielen Dateien potentiell problematisch

### Confirmation

Die Struktur funktioniert wenn:
- Entwickler intuitiv wissen, wo Dokumente zu finden sind
- MCP local-knowledge Server effizient suchen kann
- Git-Operationen flüssig bleiben (< 1 Sekunde für status)
- Neue Kategorien ohne Code-Änderungen hinzugefügt werden können

## Pros and Cons of the Options

### Option 1: Flache Struktur mit Prefixes

Alle Dateien in einem Ordner: `uipath-studio.md`, `youtube-tutorial-1.md`, etc.

**Pros:**
- ✅ Einfache Struktur
- ✅ Keine tiefen Pfade
- ✅ Schnelle Dateisystem-Operationen

**Cons:**
- ❌ Unübersichtlich bei vielen Dateien
- ❌ Schwierig zu filtern
- ❌ Naming-Konventionen schwer durchzusetzen
- ❌ Cache-Management kompliziert
- ❌ Git-Diffs schwer lesbar

### Option 2: Kategorisierte Ordner (GEWÄHLT)

Hierarchische Ordnerstruktur nach Inhaltsquelle.

**Pros:**
- ✅ Klare Trennung nach Quelle
- ✅ Intuitive Navigation
- ✅ Einfaches Filtern nach Kategorie
- ✅ Cache-Verwaltung isoliert
- ✅ Git-freundliche Struktur
- ✅ Skalierbar für neue Kategorien

**Cons:**
- ❌ Längere Pfade
- ❌ Potentielle Ordner-Proliferation
- ❌ Inhalte könnten in mehrere Kategorien passen

### Option 3: Datenbank-basiert

SQLite oder ähnliche Datenbank für Metadaten und Content.

**Pros:**
- ✅ Flexible Queries
- ✅ Indexierung automatisch
- ✅ Keine Dateisystem-Limits
- ✅ Transaktionssicherheit

**Cons:**
- ❌ Zusätzliche Komplexität
- ❌ Schwierig zu versionieren mit Git
- ❌ Backup/Restore komplizierter
- ❌ Nicht human-readable
- ❌ Vendor Lock-in
- ❌ Migration bei Schema-Änderungen

### Option 4: Flat mit Metadaten

Alle Files in einem Ordner mit begleitenden .meta.json Files.

**Pros:**
- ✅ Flexible Kategorisierung
- ✅ Metadaten erweiterbar

**Cons:**
- ❌ Doppelte Dateianzahl
- ❌ Metadaten und Content können desynchronisieren
- ❌ Unübersichtlich
- ❌ Mehr Parsing-Aufwand

## More Information

### Related Decisions

- [ADR-0001: MCP Server Architecture](0001-mcp-server-architecture.md)
- [ADR-0003: Documentation Validation](0003-documentation-validation.md)

### References

- [Documentation as Code Best Practices](https://www.writethedocs.org/guide/docs-as-code/)
- [Git for Documentation](https://www.git-scm.com/book/en/v2)

### Implementation Notes

**Kategorie-Definitionen:**

1. **official/**: Gecachte UIPath Dokumentation
   - Von `uipath_docs_fetch` abgerufen
   - Cache-Unterordner für temporäre Daten
   - JSON-Format für strukturierte Speicherung

2. **videos/**: YouTube-Daten
   - `{videoId}-metadata.json`: Video-Metadaten
   - `{videoId}-transcript.json`: Transkripte
   - `{videoId}-wisdom.json`: fabric-ai Insights

3. **custom/**: Eigene Dokumentation
   - Markdown-Dateien
   - Frontmatter für Metadaten
   - Frei organisierbar in Unterordnern

4. **generated/**: Generierte Dokumente
   - Von Generatoren erstellt
   - Architektur-Dokumente
   - Konzept-Dokumente

**Datei-Naming:**
- Lowercase mit Bindestrichen: `my-document.md`
- Keine Leerzeichen oder Sonderzeichen
- Sprechende Namen bevorzugen

**Gitignore:**
```
knowledge/official/cache/*
knowledge/videos/temp/*
*.tmp
```

### Follow-up Tasks

- [x] Ordnerstruktur erstellen
- [x] MCP-Server an Struktur anpassen
- [x] Beispiel-Dateien hinzufügen
- [ ] Index-Funktion für local-knowledge optimieren
- [ ] Cleanup-Script für alte Cache-Einträge
- [ ] Dokumentation der Kategorie-Regeln

---

**Änderungshistorie:**

| Datum | Änderung | Autor |
|-------|----------|-------|
| 2024-12-02 | Initiale Version | Knowledge Base Team |
| 2024-12-02 | Status auf Accepted | Knowledge Base Team |
