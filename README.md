# UIPath Knowledge Base

Eine lokale Knowledge-Base für UIPath mit MCP-Server Integration für Claude Desktop.

## 🚀 Schnellstart (2 Minuten)

```bash
# 1. Repository klonen
git clone https://github.com/TheTrustedAdvisor/uipath-kb.git
cd uipath-kb

# 2. Setup ausführen
npm run setup

# 3. MCP-Konfiguration kopieren (siehe Output von setup)
```

**Fertig!** Claude Desktop neu starten und loslegen.

## 📋 Voraussetzungen

| Tool | Version | Installation |
|------|---------|--------------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| Python | 3.10+ | [python.org](https://python.org) |
| yt-dlp | (optional) | `brew install yt-dlp` / `pip install yt-dlp` |
| ffmpeg | (optional) | `brew install ffmpeg` / [ffmpeg.org](https://ffmpeg.org) |

> **yt-dlp + ffmpeg** werden nur für Video-Transkription benötigt.

## 🏗️ Architektur

```
uipath-kb/
├── mcp-servers/              # MCP Server für Claude Desktop
│   ├── uipath-docs/          # Offizielle UIPath Dokumentation
│   ├── youtube-scraper/      # YouTube Video Transkription
│   ├── local-knowledge/      # Lokale Dokumentations-Suche
│   └── reddit-search/        # r/UiPath Community Search
├── knowledge/                # Wissens-Repository
│   ├── usecases/             # Use Cases (README.md + analysis.md)
│   ├── videos/               # Video-Transkripte
│   ├── reddit/               # Community Insights
│   ├── forum/                # UiPath Forum Insights
│   └── custom/               # Best Practices & Referenzen
├── docs/                     # Projekt-Dokumentation
│   ├── adr/                  # Architecture Decision Records
│   └── usecase-workflow.md   # Use Case Prozess
├── templates/                # Dokumentations-Templates
├── validators/               # Validierungs-Tools
├── scripts/                  # Utility-Scripts
│   ├── setup.js              # Cross-Platform Setup
│   ├── transcribe-video.py   # Video Transkription
│   └── batch-transcribe.py   # Batch Processing
└── logs/                     # Log-Dateien
```

## 🔧 MCP Server

### 1. UIPath Docs (`uipath-docs`)
Durchsucht die offizielle UIPath Dokumentation.

```
"Suche in UIPath Docs nach REFramework"
"Erkläre Orchestrator Queue Management"
```

### 2. YouTube Scraper (`youtube-scraper`)
Extrahiert Transkripte und Insights aus YouTube Videos.

```
"Transkribiere dieses UIPath Video: https://youtube.com/..."
"Extrahiere die Key Points aus diesem Tutorial"
```

### 3. Local Knowledge (`local-knowledge`)
Durchsucht die lokale Knowledge-Base.

```
"Suche in der Knowledge Base nach Invoice Processing"
"Zeige alle Use Case Dokumentationen"
```

### 4. Reddit Search (`reddit-search`)
Live-Suche auf r/UiPath für Community-Insights.

```
"Suche auf Reddit nach API Integration Problemen"
"Zeige die Top-Probleme aus der UIPath Community"
```

### 5. UiPath Forum (`uipath-forum`)
Abfrage des offiziellen UiPath Community Forums (Discourse) für aktuelle Themen.

```
"Zeige die neuesten Themen aus dem UiPath Forum"
"Suche im Forum nach REFramework Fragen"
```

Siehe Leitfaden: `docs/uipath-forum-scraper.md`

## 📝 Befehle

```bash
# Setup & Installation
npm run setup           # Komplettes Setup (Node + Python + Build)
npm run setup:check     # Status prüfen ohne Änderungen

# Entwicklung
npm run build           # Alle MCP Server bauen
npm run test            # Alle Tests ausführen
npm run test:reddit     # Nur Reddit-Server testen
npm run logs            # Live Logs anzeigen

# Dokumentations-Export (mit Qualitätsprüfung)
node scripts/export-docs.js                         # Interaktiv: Use Case auswählen
node scripts/export-docs.js uc-003-textile... docx  # Direkt exportieren

# Video Transkription (benötigt yt-dlp + ffmpeg)
source .venv-whisper/bin/activate  # macOS/Linux
python scripts/transcribe-video.py <youtube-url>
```

## 📄 Dokumentations-Export

Use-Case-Dokumentationen können automatisch zu DOCX exportiert werden – inklusive integrierter Qualitätsprüfung:

- ✅ **Interaktive Auswahl** von Use Cases
- ✅ **Automatische Validation** vor dem Export
- ✅ **Qualitäts-Score** (100-Punkte-System)
- ✅ **Intelligente Nachfrage** bei niedrigem Score

**Quick Start:**
```bash
node scripts/export-docs.js
```

Siehe [docs/export-documentation.md](docs/export-documentation.md) für Details.

## 🖥️ Plattform-Support

| Feature | macOS | Windows | Linux |
|---------|-------|---------|-------|
| MCP Server | ✅ | ✅ | ✅ |
| Setup Script | ✅ | ✅ | ✅ |
| Video Transkription | ✅ | ✅ | ✅ |
| Claude Desktop | ✅ | ✅ | ❌ |

## 📚 Dokumentation

- [Schnellstart-Anleitung](QUICKSTART.md) - Detaillierte Installationsanleitung
- [MCP Konfiguration](docs/mcp-configuration.md) - Claude Desktop Setup
- [Use Case Workflow](docs/usecase-workflow.md) - Dokumentations-Workflow
- [ADR Index](docs/adr/README.md) - Architektur-Entscheidungen
- [UiPath Forum Scraper](docs/uipath-forum-scraper.md) - Nutzung & Beispiele
- [Changelog](docs/changelog.md) - Änderungen und Releases

## 🤝 Beitragen

Siehe [CONTRIBUTING.md](CONTRIBUTING.md) für:
- Branch-Naming-Konvention
- Commit-Message-Format
- Pull Request Prozess

## 📄 Lizenz

MIT
