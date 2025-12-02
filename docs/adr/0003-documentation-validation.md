# Documentation Validation Framework

**Status:** Accepted  
**Datum:** 2024-12-02  
**Entscheider:** Knowledge Base Team  
**ADR-Nr:** 0003

---

## Context und Problem Statement

Die Knowledge Base generiert und sammelt Dokumentation aus verschiedenen Quellen. Um Qualität und Konsistenz sicherzustellen, benötigen wir ein automatisiertes Validierungs-System.

Die Herausforderung:
- Dokumentation muss bestimmte Standards erfüllen
- Templates sollen vollständig ausgefüllt werden
- Technische Korrektheit soll geprüft werden
- Feedback soll konstruktiv und umsetzbar sein

### Betroffene Bereiche

- Dokumentations-Qualität
- Entwickler-Workflow
- Template-System
- Generator-Scripts

## Decision Drivers

- **Qualitätssicherung**: Keine unvollständigen Dokumente
- **Automatisierung**: Manuelles Review reduzieren
- **Entwicklerfreundlich**: Klares, umsetzbares Feedback
- **Flexibilität**: Verschiedene Dokumenttypen unterstützen
- **Integration**: In Git-Workflow einbindbar
- **Messbarkeit**: Objektive Qualitäts-Scores

## Considered Options

- **Option 1**: Manuelle Code-Reviews
- **Option 2**: Linting mit existierenden Tools (markdownlint)
- **Option 3**: Custom Validation Framework (gewählt)
- **Option 4**: KI-basierte Validierung

## Decision Outcome

**Gewählte Option**: "Option 3: Custom Validation Framework"

Implementierung als Node.js Script mit:
- Regel-basierte Validierung
- Scoring-System (0-100)
- Kategorisierte Feedback (Errors, Warnings, Suggestions)
- Erweiterbare Regel-Sets

### Positive Consequences

- **Konsistenz**: Alle Dokumente erfüllen Mindeststandards
- **Frühes Feedback**: Probleme werden vor Commit erkannt
- **Objektiv**: Klare Kriterien, kein subjektives Review
- **Lerneffekt**: Entwickler lernen Best Practices durch Feedback
- **Automatisierbar**: In CI/CD Pipeline integrierbar
- **Anpassbar**: Regeln können projektspezifisch erweitert werden

### Negative Consequences

- **Wartung**: Validator muss gepflegt werden
- **False Positives**: Regeln können zu strikt sein
- **Entwicklungsaufwand**: Custom-Lösung braucht Zeit
- **Regel-Komplexität**: Balance zwischen zu streng und zu lasch

### Confirmation

Validierung ist erfolgreich wenn:
- Dokumentations-Score durchschnittlich > 80/100
- < 5% false positives bei Warnings
- Entwickler nutzen Validator freiwillig
- Alle generierten Dokumente bestehen Validierung

## Pros and Cons of the Options

### Option 1: Manuelle Code-Reviews

Jedes Dokument wird manuell von Teammitgliedern geprüft.

**Pros:**
- ✅ Flexible, kontextbezogene Bewertung
- ✅ Kann inhaltliche Qualität beurteilen
- ✅ Keine Implementierung nötig

**Cons:**
- ❌ Zeitaufwändig
- ❌ Inkonsistente Bewertung
- ❌ Skaliert nicht
- ❌ Blockiert Entwicklung
- ❌ Subjektiv

### Option 2: Existierende Linting-Tools

markdownlint, remark-lint, etc.

**Pros:**
- ✅ Bereits verfügbar
- ✅ Gut getestet
- ✅ Community-Support
- ✅ Schnelle Implementierung

**Cons:**
- ❌ Nur Markdown-Syntax, keine inhaltlichen Checks
- ❌ UIPath-spezifische Regeln nicht verfügbar
- ❌ Template-Validierung nicht möglich
- ❌ Kein Scoring-System
- ❌ Schwer erweiterbar

### Option 3: Custom Framework (GEWÄHLT)

Eigenes Validierungs-Script mit projektspezifischen Regeln.

**Pros:**
- ✅ Vollständige Kontrolle über Regeln
- ✅ UIPath-spezifische Validierung
- ✅ Template-Checks möglich
- ✅ Scoring-System integrierbar
- ✅ Kategorisiertes Feedback
- ✅ Einfach erweiterbar

**Cons:**
- ❌ Entwicklungsaufwand
- ❌ Wartung erforderlich
- ❌ Muss selbst getestet werden
- ❌ Kein Community-Support

### Option 4: KI-basierte Validierung

LLM (z.B. GPT-4) zur Dokumentations-Bewertung.

**Pros:**
- ✅ Kann inhaltliche Qualität beurteilen
- ✅ Versteht Kontext
- ✅ Natürliches Feedback

**Cons:**
- ❌ Nicht deterministisch
- ❌ API-Kosten
- ❌ Langsam (API-Calls)
- ❌ Potentiell inkonsistent
- ❌ Schwer zu debuggen
- ❌ Offline nicht verfügbar

## More Information

### Related Decisions

- [ADR-0001: MCP Server Architecture](0001-mcp-server-architecture.md)
- [ADR-0002: Knowledge Base Structure](0002-knowledge-base-structure.md)

### References

- [markdownlint Rules](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md)
- [Documentation Style Guides](https://www.writethedocs.org/guide/writing/style-guides/)

### Implementation Notes

**Validator-Struktur:**

```javascript
interface ValidationRule {
  name: string;
  check: (content: string) => boolean;
  message: string;
  type: 'error' | 'warning' | 'suggestion';
}
```

**Regel-Kategorien:**

1. **Errors** (Score -20):
   - Fehlender Titel
   - Unfilled [placeholders]
   - Broken links

2. **Warnings** (Score -10):
   - Fehlende Metadaten
   - Keine Code-Beispiele (wenn erwartet)
   - Fehlende Versions-Angaben

3. **Suggestions** (Score -5):
   - Fehlende Diagramme
   - Keine Tags
   - Kurzes Dokument (< 100 Wörter)

**Scoring:**
- Start: 100 Punkte
- Jeder Fehler reduziert Score
- Minimum: 0 Punkte
- Quality Gates:
  - < 60: Invalid
  - 60-79: Needs Improvement
  - 80-94: Good
  - 95-100: Excellent

**CLI Usage:**
```bash
node validators/validate-documentation.js docs/my-doc.md
```

**Output:**
```
🔍 UIPath Documentation Validator

📄 Validating: docs/my-doc.md

═══════════════════════════════════════
📊 Validation Score: 85/100

⚠️  WARNINGS:
   ⚠️  Document should include tags

💡 SUGGESTIONS:
   💡 Consider adding diagrams

✓  Document is valid and well-structured!
═══════════════════════════════════════
```

### Follow-up Tasks

- [x] Implementiere Basis-Validator
- [x] Definiere initiale Regel-Sets
- [x] Integriere in Generator-Scripts
- [ ] CI/CD Pipeline Integration
- [ ] Pre-commit Hook erstellen
- [ ] Regel-Dokumentation schreiben
- [ ] Performance-Tests (> 100 Docs)

---

**Änderungshistorie:**

| Datum | Änderung | Autor |
|-------|----------|-------|
| 2024-12-02 | Initiale Version | Knowledge Base Team |
| 2024-12-02 | Status auf Accepted | Knowledge Base Team |
