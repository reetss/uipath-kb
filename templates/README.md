# Templates

Vorlagen für die Dokumentationserstellung in der UIPath Knowledge Base.

## 📁 Struktur

```
templates/
├── README.md                              # Diese Datei
├── architecture/
│   └── architecture-template.md           # Architektur-Dokument Template
├── concepts/
│   └── concept-template.md                # Konzept-Dokument Template
└── examples/
    ├── example-requirements.json          # Input für Architektur-Generator
    └── example-concept-input.json         # Input für Konzept-Generator
```

## 🏗️ Architektur-Template

**Pfad:** `architecture/architecture-template.md`

**Verwendung:** Für technische Architektur-Dokumentation von UIPath Lösungen.

**Enthält:**
- Executive Summary
- Business Context & Ziele
- High-Level Architektur-Diagramme
- Komponenten-Beschreibung
- REFramework Integration
- Systemanbindungen
- Sicherheit & Compliance
- Deployment & Operations

### Generator verwenden

```bash
# Architektur-Dokument generieren
node validators/generate-architecture.js templates/examples/example-requirements.json

# Output: knowledge/generated/architecture-[projektname].md
```

### Input-Format (requirements.json)

```json
{
  "projectName": "Invoice Processing Automation",
  "businessProblem": "Manuelles Problem beschreiben...",
  "goals": ["Ziel 1", "Ziel 2"],
  "systems": [
    {"name": "System", "type": "Input/Output/Target", "role": "Beschreibung"}
  ],
  "processType": "unattended|attended|hybrid",
  "volumes": {"itemsPerDay": 500, "peakLoad": 800}
}
```

---

## 📝 Konzept-Template

**Pfad:** `concepts/concept-template.md`

**Verwendung:** Für technische Konzept-Dokumentation (Best Practices, Patterns, Referenzen).

**Enthält:**
- Übersicht & Kontext
- Problem & Motivation
- Konzept-Details & Komponenten
- Funktionsweise
- Best Practices
- Anti-Patterns
- Referenzen

### Generator verwenden

```bash
# Konzept-Dokument generieren
node validators/generate-concept.js templates/examples/example-concept-input.json

# Output: knowledge/generated/concept-[name].md
```

### Input-Format (concept-input.json)

```json
{
  "name": "REFramework Best Practices",
  "category": "technical|business|process",
  "problem": "Beschreibung des Problems...",
  "motivation": "Warum ist das wichtig?",
  "components": ["Komponente 1", "Komponente 2"],
  "tags": ["tag1", "tag2"]
}
```

---

## 📋 Wann welches Template?

| Anwendungsfall | Template | Generator |
|----------------|----------|-----------|
| Neue UIPath Lösung entwerfen | `architecture-template.md` | `generate-architecture.js` |
| Best Practice dokumentieren | `concept-template.md` | `generate-concept.js` |
| Use Case technisch analysieren | `docs/usecase-workflow.md` | Copilot (analysis.md) |

---

## 🔄 Workflow

### Manuell (Template kopieren)

```bash
# 1. Template kopieren
cp templates/architecture/architecture-template.md docs/mein-projekt.md

# 2. Platzhalter ersetzen
code docs/mein-projekt.md

# 3. Validieren
node validators/validate-documentation.js docs/mein-projekt.md
```

### Automatisch (Generator)

```bash
# 1. Input-JSON erstellen (kopiere Example)
cp templates/examples/example-requirements.json meine-anforderungen.json

# 2. Anpassen
code meine-anforderungen.json

# 3. Generieren
node validators/generate-architecture.js meine-anforderungen.json

# 4. Verfeinern & Validieren
code knowledge/generated/architecture-*.md
node validators/validate-documentation.js knowledge/generated/architecture-*.md
```

---

## ✅ Qualitäts-Checkliste

Nach Verwendung eines Templates:

- [ ] Alle `[Platzhalter]` ersetzt
- [ ] Metadaten ausgefüllt (Autor, Datum, Version)
- [ ] Diagramme aktualisiert/hinzugefügt
- [ ] Code-Beispiele angepasst
- [ ] Validator ausgeführt (Score ≥ 80)
- [ ] In korrektem Verzeichnis abgelegt

---

## 📚 Weiterführende Dokumentation

- [Use Case Workflow](../docs/usecase-workflow.md) - Für Business Use Cases
- [ADR Index](../docs/adr/README.md) - Architektur-Entscheidungen
- [Copilot Instructions](../.github/copilot-instructions.md) - Copilot-Regeln

---

**Version:** 1.0  
**Erstellt:** 2025-12-03
