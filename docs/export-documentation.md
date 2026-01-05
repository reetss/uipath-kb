# Documentation Export Guide

Automatischer Export von Use-Case-Dokumentationen (README.md, analysis.md) zu DOCX mit integrierter Qualitätsprüfung.

## 🎯 Features

- ✅ **Interaktiver Export** mit Use-Case-Auswahl
- ✅ **Automatische Validation** vor dem Export
- ✅ **Qualitäts-Score** zur Bewertung der Dokumentation
- ✅ **Intelligente Nachfrage** bei niedriger Qualität
- ✅ DOwinget (empfohlen)
winget install JohnMacFarlane.Pandoc

# Oder mit Chocolatey
choco install pandoc
```

**Überprüfung:**
```powershell
pandoc --version
```bash
brew install pandoc
```

**Linux:**
```bash
sudo apt-get install pandoc  # Debian/Ubuntu
sudo dnf install pandoc      # Fedora
```

### 2. (Optional) Mermaid-Diagramm-Support

Für die Darstellung von Mermaid-Diagrammen in PDFs:

```bash
npm install -g @mermaid-js/mermaid-cli mermaid-filter
```

## Verwendung

### Alle Use Cases exportieren

```bash
npm run export:docs
```

ExpoInteraktiver Modus (empfohlen)

```bash
node scripts/export-docs.js
```

Das Script führt dich durch:
1. **Auswahl des Use Cases** (Nummer oder Name)
2. **Format-Auswahl** (pdf/docx/beide)
3. **Automatische Validation** der Dokumente
4. **Qualitäts-Score** wird angezeigt
5. **Bestätigung** bei niedrigem Score (<80)

**Beispiel-Ausgabe:**
```
📦 Use Case Export Tool

Verfügbare Use Cases:
  1. uc-001-onboarding
  2. uc-002-hr-assistant
  3. uc-003-textile-design-classification
  4. uc-004-covid-kredite-datensicherheit

Welcher Use Case? (z.B. uc-003 oder Nummer): 3
Format? (pdf / docx / beide) [beide]: docx

🔍 Validiere Dokumente vor Export...

📄 README.md:
   📊 Score: 85/100

📄 analysis.md:
   ⚠️  Warnings: 2
   📊 Score: 75/100

⚠️  Verbesserungspotenzial (Score: 75/100). Trotzdem exportieren? (j/n): j

📦 Exportiere uc-003-textile-design-classification (docx)...
✅ Exported: knowledge\usecases\uc-003-...\exports\README.docx
✅ Exported: knowledge\usecases\uc-003-...\exports\analysis.docx
```

### Direkter Export (ohne Validation-Nachfrage)

```bash
# Bestimmten Use Case exportieren
node scripts/export-docs.js uc-003-textile-design-classification docx

# Oder mit vollständigem Namen
node scripts/export-docs.js uc-004-covid-kredite-datensicherheit docx
```

## Qualitäts-Validation

### Score-System

Das Script prüft automatisch die Qualität der Dokumente **vor** dem Export:

| Score | Bedeutung | Aktion |
|-------|-----------|--------|
| **90-100** | ✅ Hervorragend | Export ohne Nachfrage |
| **80-89** | ✅ Gut | Export ohne Nachfrage |
| **60-79** | ⚠️ Verbesserungspotenzial | Nachfrage vor Export |
| **<60** | ❌ Niedrige Qualität | Warnung + Nachfrage |

### Was wird geprüft?

**Struktur (kritisch):**
- ✅ Haupt-Überschrift vorhanden
- ✅ Keine unfilled Platzhalter wie `[TODO]` oder `[Platzhalter]`
- ✅ Overview/Executive Summary vorhanden

**Inhalte (wichtig):**
- ⚠️ Metadaten (Autor, Datum, Version)
- ⚠️ Error Handling bei Prozess-Dokumentation
- ⚠️ UIPath-Versionen angegeben (bei Produkt-Erwähnung)

**Best Practices (optional):**
- 💡 Code-Beispiele bei technischen Docs
- 💡 Diagramme bei Architektur/Prozess-Docs
- 💡 Referenzen zu UIPath-Dokumentation

### Validation manuell ausführen

Wenn du nur die Qualität prüfen willst (ohne Export):

```bash
node validators/validate-documentation.js knowledge/usecases/uc-003-textile-design-classification/README.md
```
knowledge/usecases/
├── uc-003-textile-design-classification/
│   ├── README.md
│   PDF-Export funktioniert nicht

PDF-Export benötigt LaTeX (~4GB). Das Script erstellt automatisch DOCX stattdessen.
Du kannst die DOCX in Word/LibreOffice öffnen und dort als PDF speichern.

### Niedriger Qualitäts-Score

1. **Fehler beheben** (❌): Unfilled Platzhalter entfernen, Überschriften hinzufügen
2. **Warnings adressieren** (⚠️): Metadaten ergänzen, Error Handling dokumentieren
3. **Re-validieren**: `node validators/validate-documentation.js <datei.md>`
4. **Erneut exportieren**

### DOCX fehlt Layout/Styles

Erstelle ein Custom-Template unter `templates/export-template.docx` mit gewünschten Styles.
Das Script nutzt es automatisch

## Anpassungen

### Eigenes DOCX-Template

Für einheitliches Styling kannst du ein DOCX-Template erstellen:

```

## Best Practices

1. **Vor Export validieren**: Automatisch integriert – folge den Hinweisen
2. **Metadaten pflegen**: Autor, Datum, Version → verbessert Score
3. **Platzhalter ersetzen**: Alle `[TODO]` und `[Platzhalter]` vor Export entfernen
4. **Diagramme nutzen**: Mermaid-Diagramme für Architektur/Prozesse
5. **Referenzen setzen**: Links zu UIPath Docs, ADRs, anderen Use Cases

---

**Version:** 2.0  
**Erstellt:** 2026-01-05  
**Features:** Interaktiver Export, Pre-Export-Validation, Qualitäts-Score  
**Script:** [scripts/export-docs.js](../scripts/export-docs.js)  
**Validator:** [validators/validate-documentation.js](../validators/validate-documentationgine=xelatex ${mermaidFlag}`;

// Weitere Optionen:
// --toc                  # Table of Contents
// --number-sections      # Nummerierte Überschriften
// --metadata title="..."  # Custom Titel
```

## Troubleshooting

### "Pandoc is not installed"

Installiere Pandoc (siehe oben). Prüfe mit:
```bash
pandoc --version
```

### Mermaid-Diagramme werden nicht gerendert

- Installiere `mermaid-filter` (siehe oben)
- Oder: Mermaid-Diagramme werden als Code-Block dargestellt (funktioniert, aber nicht visuell)

### PDF-Fehler "xelatex not found"

Installiere LaTeX:
- Windows: MiKTeX oder TeX Live
- macOS: `brew install --cask mactex`
- Linux: `sudo apt-get install texlive-xetex`

### DOCX fehlt Layout/Styles

Erstelle ein Template unter `templates/export-template.docx` mit gewünschten Styles.

## Weitere Formate

Pandoc unterstützt viele weitere Formate. Im Script einfach hinzufügen:

```javascript
// HTML-Export
pandocCmd = `pandoc "${mdPath}" -o "${outputPath}" --standalone --self-contained`;

// Reveal.js Präsentation
pandocCmd = `pandoc "${mdPath}" -o "${outputPath}" -t revealjs`;
```

---

**Version:** 1.0  
**Erstellt:** 2026-01-05  
**Script:** [scripts/export-docs.js](../scripts/export-docs.js)
