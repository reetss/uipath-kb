# Use Case Dokumentations-Workflow

Standardisierter Prozess für die Transformation von Business-Use-Cases in technische Dokumentation.

## 🎯 Überblick

```
Business Use Case → Recherche → Technische Dokumentation → Validierung
(knowledge/usecases/) → (MCP-Server) → (knowledge/custom/) → (Validator)
```

## 📋 Workflow-Schritte

### 1. Use Case erstellen (Du)

**Location:** `knowledge/usecases/uc-XXX-titel.md`

**Template:** `knowledge/usecases/usecase-template.md`

**Inhalt:**
- Geschäftskontext & Problem
- Ziele & Erfolgskriterien
- Beteiligte Systeme
- Input/Output
- Funktionale & nicht-funktionale Anforderungen

**Beispiel:**
```bash
cp knowledge/usecases/usecase-template.md knowledge/usecases/uc-001-invoice-processing.md
# Dann ausfüllen
```

### 2. Technische Dokumentation beauftragen (Du → Copilot)

**Im VS Code Chat:**
```
"Dokumentiere bitte UC-001 technisch"
```

**Copilot startet dann automatisch:**

### 3. Recherche-Phase (Copilot)

**a) Use Case analysieren**
- Use Case lesen und verstehen
- Kernpunkte extrahieren
- Technische Herausforderungen identifizieren

**b) MCP-Server Recherche (parallel)**

```typescript
// UIPath Official Docs
await uipath_docs_search({ 
  query: "invoice processing best practices" 
});

// YouTube Tutorials
await knowledge_search({ 
  query: "invoice automation", 
  category: "videos" 
});

// Reddit Community
await reddit_search_uipath({ 
  query: "invoice processing challenges",
  limit: 5
});

// Lokale Knowledge Base
await knowledge_search({ 
  query: "invoice processing", 
  category: "custom" 
});
```

**c) Erkenntnisse sammeln**
- Best Practices aus Official Docs
- Community-Learnings aus Reddit
- Video-Insights aus Transkripten
- Vorhandene Patterns aus lokaler KB

### 4. Dokumentation generieren (Copilot)

**a) Template wählen**
```bash
# Für Prozess-Architekturen
templates/architecture/architecture-template.md

# Für Konzepte
templates/concepts/concept-template.md
```

**b) Dokument erstellen**

**Location:** `knowledge/custom/uc-001-invoice-processing-technical.md`

**Struktur:**
```markdown
# UC-001: Invoice Processing - Technische Dokumentation

## Executive Summary
[1-2 Absätze: WAS wird gebaut, WARUM, für WEN]

## Architektur-Übersicht
[Mermaid-Diagramm mit High-Level Komponenten]

## Detaillierte Prozessbeschreibung
[Schritt-für-Schritt mit Flussdiagrammen]

## Technische Implementierung
### UIPath Komponenten
- Workflows
- Activities
- Data Services

### Best Practices
[Aus UIPath Docs + Community]

### Code-Beispiele
[VB.NET/C# Snippets für kritische Teile]

## Exception Handling
[Basierend auf REFramework + Community-Patterns]

## Testing & Validierung
[Test-Szenarien]

## Deployment
[Orchestrator-Konfiguration]

## Monitoring & Maintenance
[Logging, Alerts, KPIs]

## Referenzen
- UIPath Docs: [Links]
- Reddit Discussions: [Links]
- Video Tutorials: [Links]
- Related Use Cases: [Links]
```

**c) Metadaten hinzufügen**
```markdown
**Erstellt:** 2025-12-02
**Version:** 1.0
**Autor:** AI Assistant (basierend auf UC-001)
**Status:** Review
**Tags:** `invoice-processing`, `reframework`, `document-understanding`
**Related Use Case:** UC-001
```

### 5. Validierung (Copilot)

**a) Dokumentations-Validator**
```bash
node validators/validate-documentation.js knowledge/custom/uc-001-invoice-processing-technical.md
```

**Prüfung:**
- Score ≥ 80/100
- Keine [Platzhalter]
- Metadaten vollständig
- Code-Beispiele vorhanden
- Diagramme vorhanden
- Referenzen gesetzt

**b) Iterative Verbesserung**
```
Score < 80 → Dokument verbessern → Neu validieren
Score ≥ 80 → Weiter zu Schritt 6
```

### 6. Cross-Referenzierung (Copilot)

**a) Use Case Index aktualisieren**
```markdown
# knowledge/usecases/README.md

| Nr | Titel | Status | Technische Doku |
|----|-------|--------|-----------------|
| 001 | Invoice Processing | Documented | [uc-001-technical.md](../custom/uc-001-invoice-processing-technical.md) |
```

**b) Interne Verlinkungen**
```markdown
# Im Use Case (knowledge/usecases/uc-001-*.md)
**Technische Dokumentation:** [uc-001-technical.md](../custom/uc-001-invoice-processing-technical.md)

# In der technischen Doku (knowledge/custom/uc-001-*-technical.md)
**Basierend auf:** [UC-001 Invoice Processing](../usecases/uc-001-invoice-processing.md)
```

### 7. Review & Finalisierung (Du + Copilot)

**a) Du prüfst:**
- Entspricht die Doku dem Use Case?
- Sind alle Anforderungen abgedeckt?
- Fehlen wichtige Details?

**b) Feedback geben:**
```
"In UC-001 fehlt noch die Validierung der Rechnungsnummer"
"Kannst du mehr Details zu Exception Handling hinzufügen?"
```

**c) Copilot überarbeitet → Neu validieren**

**d) Finalisierung:**
```markdown
**Status:** Review → Approved
```

### 8. ADR erstellen (falls nötig)

**Wann:** Bei wichtigen Architektur-Entscheidungen

```bash
cp docs/adr/template.md docs/adr/0004-invoice-ocr-provider-choice.md
```

**Inhalt:**
- Kontext: Warum brauchten wir eine Entscheidung?
- Optionen: UIPath Document Understanding vs. externe OCR
- Entscheidung: Was haben wir gewählt?
- Konsequenzen: Auswirkungen

## 🔄 Parallel-Workflows

### Mehrere Use Cases gleichzeitig

```
UC-001 (Invoice) → Recherche → Dokumentation
UC-002 (Order)   → Recherche → Dokumentation
UC-003 (Master)  → Recherche → Dokumentation

→ Alle validieren → Cross-Referenzen → Review
```

### Iterative Verfeinerung

```
UC-001 v1.0 → Review → Feedback
         ↓
      v1.1 → Überarbeitung
         ↓
      v1.2 → Final
```

## 📊 Quality Gates

### Minimum (MUSS)
- [ ] Use Case vollständig ausgefüllt
- [ ] Technische Doku erstellt
- [ ] Validierungs-Score ≥ 60
- [ ] Metadaten vollständig
- [ ] Cross-Referenzen gesetzt

### Standard (SOLLTE)
- [ ] Validierungs-Score ≥ 80
- [ ] Code-Beispiele vorhanden
- [ ] Mermaid-Diagramme vorhanden
- [ ] Best Practices referenziert
- [ ] Exception Handling dokumentiert

### Excellence (KANN)
- [ ] Validierungs-Score = 100
- [ ] Video-Tutorials verlinkt
- [ ] Community-Insights integriert
- [ ] ADR für kritische Entscheidungen
- [ ] Test-Szenarien mit Daten

## 🛠️ Copilot-Befehle

### Basis-Befehle
```
"Dokumentiere bitte UC-001 technisch"
"Validiere die Dokumentation für UC-002"
"Erstelle ein ADR für die OCR-Provider-Wahl in UC-001"
```

### Erweiterte Befehle
```
"Vergleiche UC-001 mit ähnlichen Reddit-Diskussionen"
"Finde YouTube-Videos zu Invoice Processing und verlinke sie"
"Extrahiere Best Practices aus UIPath Docs für UC-003"
"Prüfe ob es vorhandene Architekturen in der KB gibt für UC-002"
```

### Review-Befehle
```
"Verbessere die Exception-Handling-Section in UC-001"
"Füge mehr Code-Beispiele zu UC-002 hinzu"
"Erstelle ein detailliertes Prozess-Diagramm für UC-003"
```

## 📁 Datei-Konventionen

### Use Cases
```
knowledge/usecases/uc-001-invoice-processing.md
knowledge/usecases/uc-002-order-management.md
```

### Technische Dokumentation
```
knowledge/custom/uc-001-invoice-processing-technical.md
knowledge/custom/uc-002-order-management-technical.md
```

### ADRs (falls benötigt)
```
docs/adr/0004-uc001-ocr-provider-choice.md
docs/adr/0005-uc002-queue-strategy.md
```

## 🔍 Recherche-Prioritäten

### 1. UIPath Official Docs (IMMER)
- Autoritativ
- Aktuell
- Best Practices

### 2. Local Knowledge Base (IMMER)
- Vorhandene Patterns
- Lessons Learned
- Wiederverwendbarkeit

### 3. Video Transkripte (Bei Bedarf)
- Visual Tutorials
- Step-by-Step Guides
- Komplexe Konzepte

### 4. Reddit Community (Bei Bedarf)
- Real-World Probleme
- Workarounds
- Community-Tipps

## ✅ Checkliste für Copilot

**Vor Dokumentationserstellung:**
- [ ] Use Case vollständig gelesen
- [ ] UIPath Docs durchsucht
- [ ] Lokale KB geprüft
- [ ] Template gewählt

**Während Erstellung:**
- [ ] Alle Sections ausgefüllt
- [ ] Code-Beispiele hinzugefügt
- [ ] Diagramme erstellt
- [ ] Referenzen verlinkt

**Nach Erstellung:**
- [ ] Validierung durchgeführt (Score ≥ 80)
- [ ] Cross-Referenzen gesetzt
- [ ] Index aktualisiert
- [ ] Keine [Platzhalter]

**Bei Finalisierung:**
- [ ] User-Review eingeholt
- [ ] Feedback eingearbeitet
- [ ] Status auf "Approved" gesetzt
- [ ] ADR erstellt (falls nötig)

## 🚨 Anti-Patterns vermeiden

❌ **NICHT machen:**
- Use Case überspringen und direkt dokumentieren
- Recherche-Phase auslassen
- Validierung ignorieren
- Keine Referenzen setzen
- [Platzhalter] im finalen Dokument
- Status nicht aktualisieren

✅ **Stattdessen:**
- Use Case immer als Grundlage nutzen
- Alle MCP-Server für Recherche verwenden
- Validierung vor Finalisierung
- Alle Referenzen dokumentieren
- Alle Sections vollständig ausfüllen
- Status-Tracking konsequent

## 📚 Beispiel-Session

```
User: "Dokumentiere bitte UC-001 technisch"

Copilot:
1. ✅ Use Case gelesen (UC-001: Invoice Processing)
2. ✅ UIPath Docs durchsucht: "invoice processing", "document understanding"
3. ✅ Lokale KB geprüft: Keine ähnlichen Use Cases
4. ✅ Reddit durchsucht: 3 relevante Diskussionen gefunden
5. ✅ Video-Transkripte: 2 relevante Tutorials identifiziert
6. ✅ Dokument erstellt: knowledge/custom/uc-001-invoice-processing-technical.md
7. ✅ Validierung: Score 85/100
8. ✅ Cross-Referenzen gesetzt
9. ✅ Index aktualisiert

Dokument bereit für Review!
```

---

**Version:** 1.0  
**Letzte Aktualisierung:** 2025-12-02  
**Maintainer:** Knowledge Base Team
