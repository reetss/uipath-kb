# UIPath Knowledge Base

Eine umfassende Knowledge-Base für UIPath mit MCP-Server Integration, YouTube-Scraping und Dokumentations-Management.

## 🏗️ Architektur

```
uipath-kb/
├── mcp-servers/           # MCP Server Implementierungen
│   ├── uipath-docs/       # UIPath Dokumentations-Server
│   ├── youtube-scraper/   # YouTube Video Scraping mit fabric-ai & Whisper
│   ├── local-knowledge/   # Lokale Dokumentations-Suche
│   └── reddit-search/     # r/UiPath Community Search
├── knowledge/             # Wissens-Repository
│   ├── official/          # Gecachte UIPath Docs
│   ├── videos/            # Video-Transkripte & Metadaten
│   ├── reddit/            # Reddit Community Insights
│   ├── custom/            # Eigene Dokumentation
│   └── generated/         # Generierte Architekturen & Konzepte
├── scripts/               # Utility-Scripts
│   ├── transcribe-video.py        # Whisper Transcription
│   ├── batch-transcribe.py        # Batch Processing
│   └── monitor-reddit.py          # Reddit Monitoring
├── templates/             # Vorlagen für Dokumentation
│   ├── architecture/      # Architektur-Templates
│   └── concepts/          # Konzept-Templates
└── validators/            # Validierungs-Tools
```

## 🚀 Features

### MCP-Server
- **UIPath Docs**: Durchsucht und cached die offizielle UIPath Dokumentation
- **YouTube Scraper**: Extrahiert Transkripte (Whisper) und Metadaten aus UIPath Videos
- **Local Knowledge**: Semantische Suche über lokale Dokumentation
- **Reddit Search**: On-Demand Suche in r/UiPath für Community-Insights

### Knowledge-Base Management
- Strukturierte Ablage von offizieller und eigener Dokumentation
- Versionierung mit Git
- Metadaten-Tracking für alle Dokumente

### Generierung & Validierung
- Automatische Generierung von Architekturen und Konzepten
- Validierung gegen die Knowledge-Base
- Template-basierte Dokumentationserstellung

## 📋 Voraussetzungen

- Python 3.10+
- Node.js 18+
- yt-dlp (via Homebrew: `brew install yt-dlp`)
- ffmpeg (via Homebrew: `brew install ffmpeg`)
- faster-whisper (in Python venv: `.venv-whisper`)

## 🔧 Installation

```bash
# 1. Repository klonen
git clone <repository-url>
cd uipath-kb

# 2. Python Environment für Whisper
python3 -m venv .venv-whisper
source .venv-whisper/bin/activate
pip install faster-whisper

# 3. MCP-Server Abhängigkeiten installieren
cd mcp-servers/uipath-docs && npm install && cd ../..
cd mcp-servers/youtube-scraper && npm install && cd ../..
cd mcp-servers/local-knowledge && npm install && cd ../..
cd mcp-servers/reddit-search && npm install && cd ../..

# 4. MCP-Server bauen
cd mcp-servers/uipath-docs && npm run build && cd ../..
cd mcp-servers/youtube-scraper && npm run build && cd ../..
cd mcp-servers/local-knowledge && npm run build && cd ../..
cd mcp-servers/reddit-search && npm run build && cd ../..

# 5. MCP-Server in Claude Desktop konfigurieren
# Siehe: docs/mcp-configuration.md
```

## 📚 Verwendung

### MCP-Server starten

Die MCP-Server werden automatisch von Claude Desktop gestartet, wenn sie in der Konfiguration eingetragen sind.

### YouTube Videos transkribieren

```bash
# Einzelnes Video mit Whisper
source .venv-whisper/bin/activate
python3 scripts/transcribe-video.py <video-url>

# Batch-Processing
python3 scripts/batch-transcribe.py
```

### Reddit Community durchsuchen

Über Claude Desktop mit aktiviertem reddit-search MCP-Server:
- "Suche auf Reddit nach API-Integration-Problemen"
- "Zeige aktuelle Trending-Topics aus r/UiPath"
- "Was sind die häufigsten Community-Probleme?"

### Dokumentation generieren

```bash
# Architektur generieren
./validators/generate-architecture.sh --input knowledge/custom/requirements.md

# Konzept validieren
./validators/validate-concept.sh --input knowledge/generated/architecture.md
```

## 🛠️ Konfiguration

Siehe [docs/configuration.md](docs/configuration.md) für Details zur Konfiguration der MCP-Server und Tools.

## 📖 Dokumentation

- [MCP-Server Konfiguration](docs/mcp-configuration.md)
- [YouTube Scraping Guide](docs/youtube-scraping.md)
- [Reddit Integration](docs/reddit-integration.md)
- [Architektur-Generierung](docs/architecture-generation.md)
- [Validierungs-Framework](docs/validation-framework.md)

## 🤝 Contributing

Beiträge sind willkommen! Siehe [CONTRIBUTING.md](CONTRIBUTING.md) für Details.

## 📄 Lizenz

[MIT](LICENSE)
