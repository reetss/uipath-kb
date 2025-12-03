# Use Case Dokumentations-Workflow

Standardisierter Prozess für die Transformation von Business-Use-Cases in technische Analyse.

## 🎯 Überblick

```
knowledge/usecases/uc-XXX-titel/
├── README.md        ← Business Use Case (Du erstellst)
├── analysis.md      ← Technische Analyse + Rückfragen (Copilot generiert)
└── assets/          ← Zusätzliche Dateien
```

**Wichtig:** Der Use Case muss NICHT perfekt sein! Schreibe auf, was du weißt. Copilot identifiziert die Lücken und formuliert Rückfragen.

---

## 📋 Workflow-Schritte

### 1. Use Case Ordner erstellen (Du)

```bash
# Ordner mit assets erstellen
mkdir -p knowledge/usecases/uc-002-invoice-processing/assets

# Template kopieren
cp knowledge/usecases/usecase-template.md knowledge/usecases/uc-002-invoice-processing/README.md

# Bearbeiten
code knowledge/usecases/uc-002-invoice-processing/README.md
```

**README.md ausfüllen - so wie du es vom Fachbereich gehört hast:**
- Problem / Herausforderung (in eigenen Worten)
- Ziele (auch ungefähre sind ok)
- Beteiligte Systeme (soweit bekannt)
- Was der Bot können soll
- Notizen aus Meetings, Zitate, Ansprechpartner

**Es ist OK wenn:**
- ❓ Details fehlen ("irgendeine SAP-Version")
- ❓ Zahlen geschätzt sind ("gefühlt die Hälfte der Zeit")
- ❓ Prozesse unklar sind ("jeder macht es anders")
- ❓ Ansprechpartner nur mit Vornamen genannt werden

### 2. Technische Analyse beauftragen (Du → Copilot)

**Im VS Code Chat:**
```
"Analysiere bitte UC-002 technisch"
```

oder

```
"Erstelle eine technische Analyse für UC-002"
```

### 3. Recherche & Analyse (Copilot)

**a) Use Case analysieren**
- `README.md` lesen und verstehen
- Lücken und Unklarheiten identifizieren
- Technische Herausforderungen erkennen

**b) MCP-Server Recherche**

```typescript
// UIPath Official Docs
await uipath_docs_search({ query: "onboarding automation" });

// Reddit Community für Real-World Erfahrungen
await reddit_search_uipath({ query: "onboarding challenges" });

// Lokale Knowledge Base
await knowledge_search({ query: "employee onboarding" });
```

**c) Rückfragen formulieren**
- Was MUSS vor der Implementierung geklärt werden?
- Welche Details fehlen für eine Schätzung?
- Wer ist der richtige Ansprechpartner?

### 4. Analyse-Dokument generieren (Copilot)

**Copilot erstellt `analysis.md` im selben Ordner:**

```
knowledge/usecases/uc-002-invoice-processing/
├── README.md        # Dein Business Use Case
├── analysis.md      # ← Copilot erstellt diese Datei
└── assets/
```

---

## 📄 Struktur von analysis.md

```markdown
# UC-XXX: Titel - Technische Analyse

## 🔴 Offene Rückfragen
> Diese Fragen müssen vor der Implementierung geklärt werden!

### Kritisch (Blockierend)
| # | Frage | Ansprechpartner | Status |
|---|-------|-----------------|--------|
| Q1 | ... | ... | ⏳ Offen |

### Wichtig (Vor Go-Live klären)
...

### Nice-to-have (Kann später geklärt werden)
...

## 📋 Zusammenfassung des Use Cases
- Verstandener Scope
- Unklare Punkte aus dem README

## 🏗️ Vorläufige Architektur
- Empfohlenes Pattern (z.B. REFramework)
- Systemanbindung (API vs. UI Automation)
- Mermaid-Diagramme

## ⚠️ Identifizierte Risiken
- Technische Risiken
- Organisatorische Risiken

## 🔧 Vorläufige technische Details
- UIPath Activities
- Credential Management
- Exception Handling

## 📅 Empfohlenes Vorgehen
- Phasenplan
- MVP-Scope

## 📊 Vorläufige Metriken
- KPI-Vorschläge (müssen validiert werden!)
```

---

## 🔄 Iterativer Prozess

```
┌─────────────────┐
│  README.md      │  Du schreibst auf, was du weißt
│  (Lückenhaft)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Copilot        │  Analysiert, recherchiert,
│  analysiert     │  identifiziert Lücken
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  analysis.md    │  Technische Analyse +
│  (mit Fragen)   │  priorisierte Rückfragen
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Du klärst      │  Meetings mit Fachbereich/IT
│  Rückfragen     │  Fragen abhaken
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  README.md      │  Mit neuen Infos ergänzen
│  aktualisieren  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  analysis.md    │  Neu generieren lassen
│  verfeinern     │  (weniger offene Fragen)
└─────────────────┘
```

---

## ✅ Checkliste

### Vor der Analyse:
- [ ] Ordner erstellt (`uc-XXX-name/`)
- [ ] README.md vorhanden
- [ ] Problem beschrieben
- [ ] Ziele genannt (auch grob)
- [ ] Beteiligte Systeme gelistet

### Nach der Analyse:
- [ ] analysis.md generiert
- [ ] Rückfragen priorisiert (Kritisch/Wichtig/Nice-to-have)
- [ ] Ansprechpartner identifiziert
- [ ] Risiken erkannt
- [ ] Nächste Schritte klar

### Vor der Implementierung:
- [ ] Alle kritischen Fragen (Q1-Qn) beantwortet
- [ ] Service Accounts beantragt
- [ ] API-Zugänge geklärt
- [ ] MVP-Scope definiert

---

## 🚨 Anti-Patterns vermeiden

### ❌ NICHT machen:

1. **Auf perfekte Informationen warten**
   - Lieber früh mit Lücken starten
   - Analyse zeigt, was fehlt

2. **Rückfragen ignorieren**
   - Kritische Fragen sind BLOCKIEREND
   - Ohne Antworten keine Implementierung

3. **Alles auf einmal bauen wollen**
   - MVP zuerst
   - Komplexe Systeme (SAP GUI) später

4. **Annahmen treffen**
   - Lieber fragen als raten
   - "Ich nehme an..." → Rückfrage!

### ✅ Stattdessen:

- Früh starten, iterativ verfeinern
- Rückfragen konsequent klären
- MVP-Approach
- Explizite Klärung statt Annahmen

---

## 📚 Beispiel

### Input (README.md) - lückenhaft:
```markdown
## Problem
HR macht Onboarding manuell, dauert ewig.

## Systeme
- SAP irgendwas
- Active Directory
- Office 365
```

### Output (analysis.md) - mit Rückfragen:
```markdown
## 🔴 Offene Rückfragen

### Kritisch
| Q1 | Welche SAP-Version? | Peter (IT) | ⏳ Offen |
| Q2 | API oder UI Automation für SAP? | IT | ⏳ Offen |
| Q3 | Service Account für AD? | IT Security | ⏳ Offen |
```

---

**Version:** 2.0  
**Letzte Aktualisierung:** 2025-12-03  
**Änderung:** Neues Format mit Rückfragen (analysis.md statt technical.md)
