# Use Cases

Dieses Verzeichnis enthält Business-Use-Cases mit technischer Analyse.

## 📁 Ordnerstruktur

Jeder Use Case bekommt einen eigenen Ordner:

```
knowledge/usecases/
├── README.md                    # Diese Datei
├── usecase-template.md          # Template für neue Use Cases
├── uc-001-onboarding/           # UC-001: Employee Onboarding
│   ├── README.md                # Business Use Case (Input vom User)
│   ├── analysis.md              # Technische Analyse + Rückfragen (von Copilot)
│   └── assets/                  # Screenshots, Diagramme, etc.
│       ├── uipath-solution/     # Bestehende UiPath-Workflows (optional)
│       │   ├── Main.xaml
│       │   ├── project.json
│       │   └── ...
│       ├── screenshots/         # Meeting-Screenshots, UI-Mockups
│       └── exports/             # CSV/Excel-Exporte, Testdaten
├── uc-002-invoice-processing/   # UC-002: (Beispiel)
│   ├── README.md
│   ├── analysis.md
│   └── assets/
│       └── uipath-solution/
└── ...
```

## 🔄 Workflow

1. **Ordner erstellen**: `mkdir -p knowledge/usecases/uc-XXX-titel/assets`
2. **README.md erstellen**: Business Use Case vom Template kopieren (muss NICHT perfekt sein!)
3. **Im Chat beauftragen**: "Analysiere bitte UC-XXX technisch"
4. **Copilot erstellt**: `analysis.md` im selben Ordner mit:
   - 🔴 Offene Rückfragen (priorisiert)
   - Vorläufige Architektur
   - Risiko-Assessment
   - MVP-Empfehlung
5. **Rückfragen klären**: Meetings mit Fachbereich/IT
6. **Iterieren**: README.md ergänzen → analysis.md neu generieren

**Wichtig:** Der Use Case muss NICHT perfekt sein! Copilot identifiziert Lücken und formuliert Rückfragen.

## 📝 Neuen Use Case anlegen

```bash
# 1. Ordner erstellen mit Unterstrukturen
mkdir -p knowledge/usecases/uc-002-invoice-processing/assets/uipath-solution
mkdir -p knowledge/usecases/uc-002-invoice-processing/assets/screenshots
mkdir -p knowledge/usecases/uc-002-invoice-processing/assets/exports

# 2. Template kopieren
cp knowledge/usecases/usecase-template.md knowledge/usecases/uc-002-invoice-processing/README.md

# 3. (Optional) Bestehende UiPath-Lösung ablegen
# Kopiere den kompletten Projekt-Ordner nach assets/uipath-solution/
# Das ermöglicht Code-Analyse, Verbesserungsvorschläge und Weiterentwicklung

# 4. Bearbeiten und ausfüllen (grob ist OK!)
code knowledge/usecases/uc-002-invoice-processing/README.md

# 5. Technische Analyse beauftragen
# Im VS Code Chat: "Analysiere bitte UC-002 technisch"
# Falls UiPath-Code vorhanden: "Analysiere UC-002 inkl. bestehendem Code"
```

## 📊 Use Case Index

| Nr | Titel | Status | Offene Fragen | Ordner |
|----|-------|--------|---------------|--------|
| 001 | Employee Onboarding/Offboarding | 🔴 13 Fragen offen | Q1-Q13 | [uc-001-onboarding/](./uc-001-onboarding/) |

### Status-Legende

- 📝 **Draft**: README.md vorhanden, keine Analyse
- 🔴 **Fragen offen**: analysis.md mit offenen Rückfragen
- 🟡 **In Klärung**: Rückfragen werden bearbeitet
- ✅ **Ready**: Alle kritischen Fragen geklärt, bereit für Implementierung

## ✅ Validierung

GitHub Actions validiert automatisch bei jedem Push:
- Ordnerstruktur korrekt (README.md vorhanden)
- analysis.md hat Rückfragen-Sektion
- Anzahl offener Fragen wird gezählt
- Status-Report wird generiert

## 📚 Struktur eines Use Case

### README.md (Business Use Case - Input)

Beschreibt das **WAS** und **WARUM** (aus Sicht des Fachbereichs):
- Problem / Herausforderung
- Ziele (auch ungefähre)
- Beteiligte Systeme (soweit bekannt)
- Meeting-Notizen, Zitate, Ansprechpartner

**Tipp:** Es ist OK wenn Details fehlen, Zahlen geschätzt sind oder Prozesse unklar sind!

### analysis.md (Technische Analyse - Output)

Wird von Copilot generiert und enthält:
- **🔴 Offene Rückfragen** (Kritisch/Wichtig/Nice-to-have)
**Unterordner:**
- **uipath-solution/** – Bestehende UiPath-Workflows (optional)
  - Kompletter Projekt-Ordner mit Main.xaml, project.json, etc.
  - Ermöglicht Code-Analyse, Refactoring-Vorschläge, Weiterentwicklung
  - LLM kann bestehenden Code lesen und darauf aufbauen
- **screenshots/** – Meeting-Screenshots, UI-Mockups, Prozess-Skizzen
- **exports/** – CSV/Excel-Exporte aus Systemen, Testdaten, WooCommerce-Exports Risiken
- Empfohlenes Vorgehen (MVP-Phasen)
- Vorläufige Metriken

### assets/ (Zusätzliche Dateien)

- Screenshots aus Meetings
- Export-Dateien
- Prozess-Diagramme vom Fachbereich
- Test-Daten

---

**Siehe auch:** [Use Case Workflow](../../docs/usecase-workflow.md) für den vollständigen Prozess.
