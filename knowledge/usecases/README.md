# Use Cases

Dieses Verzeichnis enthält Business-Use-Cases, die als Grundlage für die technische Dokumentation dienen.

## 📁 Ordnerstruktur

Jeder Use Case bekommt einen eigenen Ordner:

```
knowledge/usecases/
├── README.md                    # Diese Datei
├── usecase-template.md          # Template für neue Use Cases
├── uc-001-onboarding/           # UC-001: Employee Onboarding
│   ├── README.md                # Business Use Case (WAS & WARUM)
│   ├── technical.md             # Technische Dokumentation (WIE)
│   └── assets/                  # Screenshots, Diagramme
├── uc-002-invoice-processing/   # UC-002: Invoice Processing
│   ├── README.md
│   ├── technical.md
│   └── assets/
└── ...
```

## 🔄 Workflow

1. **Ordner erstellen**: `mkdir -p knowledge/usecases/uc-XXX-titel/assets`
2. **README.md erstellen**: Business Use Case vom Template kopieren
3. **Im Chat beauftragen**: "Dokumentiere bitte UC-XXX technisch"
4. **Copilot erstellt**: `technical.md` im selben Ordner

## 📝 Neuen Use Case anlegen

```bash
# 1. Ordner erstellen
mkdir -p knowledge/usecases/uc-002-invoice-processing/assets

# 2. Template kopieren
cp knowledge/usecases/usecase-template.md knowledge/usecases/uc-002-invoice-processing/README.md

# 3. Bearbeiten und ausfüllen
code knowledge/usecases/uc-002-invoice-processing/README.md

# 4. Technische Doku beauftragen
# Im VS Code Chat: "Dokumentiere bitte UC-002 technisch"
```

## 📊 Use Case Index

| Nr | Titel | Status | Ordner |
|----|-------|--------|--------|
| 001 | Employee Onboarding/Offboarding | ✅ Documented | [uc-001-onboarding/](./uc-001-onboarding/) |

### Status-Legende

- 📝 **Draft**: Use Case in Bearbeitung
- 🔄 **In Progress**: Technische Doku wird erstellt
- ✅ **Documented**: Vollständig dokumentiert
- 🔍 **Review**: In Review durch Team

## ✅ Validierung

GitHub Actions validiert automatisch bei jedem Push:
- Ordnerstruktur korrekt (README.md vorhanden)
- Links zwischen README.md und technical.md funktionieren
- Pflichtfelder ausgefüllt
- Keine [Platzhalter] mehr vorhanden

## 📚 Struktur eines Use Case

### README.md (Business Use Case)

Beschreibt das **WAS** und **WARUM**:
- Geschäftskontext & Problem
- Ziele & Erfolgskriterien
- Beteiligte Systeme
- Anforderungen (funktional & nicht-funktional)
- Input/Output

### technical.md (Technische Dokumentation)

Beschreibt das **WIE**:
- Architektur-Übersicht (Mermaid-Diagramme)
- Detaillierte Prozessbeschreibung
- UIPath Komponenten (Workflows, Activities)
- Exception Handling
- Testing & Deployment
- Monitoring

### assets/ (Zusätzliche Dateien)

- Screenshots
- Export-Dateien
- Zusätzliche Diagramme
- Test-Daten

---

**Hinweis:** Nutze `usecase-template.md` als Vorlage für die README.md eines neuen Use Cases.
