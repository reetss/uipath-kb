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
│   ├── videos/               # Video-Transkripte
│   ├── reddit/               # Community Insights
│   ├── usecases/             # Business Use Cases
│   └── custom/               # Eigene Dokumentation
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

# Video Transkription (benötigt yt-dlp + ffmpeg)
source .venv-whisper/bin/activate  # macOS/Linux
python scripts/transcribe-video.py <youtube-url>
```

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

## 🤝 Beitragen

1. Feature-Branch erstellen
2. Änderungen committen
3. Tests hinzufügen
4. Pull Request öffnen

## 📄 Lizenz

MIT
