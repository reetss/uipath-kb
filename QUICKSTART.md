# Schnellstart-Anleitung

Diese Anleitung führt dich durch die Installation der UIPath Knowledge Base auf Windows und macOS.

## 📋 Voraussetzungen prüfen

### Node.js installieren

**macOS:**
```bash
# Mit Homebrew
brew install node

# Oder von nodejs.org herunterladen
```

**Windows:**
1. Gehe zu [nodejs.org](https://nodejs.org)
2. Lade die LTS-Version herunter
3. Führe den Installer aus
4. Starte eine neue PowerShell

**Prüfen:**
```bash
node --version  # Sollte v18+ anzeigen
npm --version
```

### Python installieren

**macOS:**
```bash
# Mit Homebrew
brew install python@3.12

# Oder von python.org herunterladen
```

**Windows:**
1. Gehe zu [python.org](https://python.org)
2. Lade Python 3.10+ herunter
3. **Wichtig:** Aktiviere "Add Python to PATH" im Installer
4. Starte eine neue PowerShell

**Prüfen:**
```bash
python --version  # Sollte 3.10+ anzeigen
```

---

## 🚀 Installation

### Schritt 1: Repository klonen

```bash
git clone https://github.com/TheTrustedAdvisor/uipath-kb.git
cd uipath-kb
```

### Schritt 2: Setup ausführen

```bash
npm run setup
```

Das Setup-Script macht automatisch:
- ✅ Verzeichnisse erstellen
- ✅ Node.js Dependencies installieren
- ✅ MCP Server bauen
- ✅ Python venv erstellen (falls yt-dlp + ffmpeg vorhanden)
- ✅ Tests ausführen
- ✅ Claude Desktop Konfiguration generieren

### Schritt 3: Claude Desktop konfigurieren

Das Setup erstellt eine Datei `claude-desktop-config.json`. Kopiere den Inhalt in deine Claude Desktop Konfiguration:

**macOS:**
```bash
# Öffne die Konfigurationsdatei
open ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Kopiere den Inhalt von claude-desktop-config.json hinein
```

**Windows:**
```powershell
# Öffne die Konfigurationsdatei
notepad "$env:APPDATA\Claude\claude_desktop_config.json"

# Kopiere den Inhalt von claude-desktop-config.json hinein
```

### Schritt 4: Claude Desktop neu starten

1. Claude Desktop komplett beenden
2. Claude Desktop starten
3. In einem neuen Chat testen:

```
"Suche auf Reddit nach UIPath API Problemen"
```

---

## 🎥 Video-Transkription einrichten (Optional)

Für die Transkription von YouTube-Videos brauchst du zusätzlich yt-dlp und ffmpeg.

### macOS

```bash
brew install yt-dlp ffmpeg
```

### Windows

```powershell
# yt-dlp installieren
pip install yt-dlp

# ffmpeg von https://ffmpeg.org/download.html herunterladen
# Entpacken und den bin-Ordner zum PATH hinzufügen
```

### Setup erneut ausführen

```bash
npm run setup
```

Das Script erstellt jetzt automatisch das Python venv mit faster-whisper.

### Video transkribieren

**macOS/Linux:**
```bash
source .venv-whisper/bin/activate
python scripts/transcribe-video.py https://www.youtube.com/watch?v=VIDEO_ID
```

**Windows:**
```powershell
.venv-whisper\Scripts\Activate.ps1
python scripts\transcribe-video.py https://www.youtube.com/watch?v=VIDEO_ID
```

---

## ✅ Installation prüfen

```bash
npm run setup:check
```

Alle Punkte sollten ✅ anzeigen:

```
✅ Node.js v18+
✅ npm
✅ Python
✅ yt-dlp (optional)
✅ ffmpeg (optional)
✅ Python venv (optional)
✅ MCP Server uipath-docs: built
✅ MCP Server youtube-scraper: built
✅ MCP Server local-knowledge: built
✅ MCP Server reddit-search: built
```

---

## 🔧 Fehlerbehebung

### "npm: command not found"

Node.js ist nicht installiert oder nicht im PATH. Installiere Node.js und starte ein neues Terminal.

### "python: command not found" (Windows)

1. Python neu installieren mit "Add Python to PATH"
2. Oder manuell zum PATH hinzufügen:
   - Systemsteuerung → System → Erweiterte Systemeinstellungen
   - Umgebungsvariablen → PATH bearbeiten
   - Python-Pfad hinzufügen (z.B. `C:\Python312`)

### MCP Server werden nicht erkannt

1. Prüfe ob die Server gebaut sind: `npm run build`
2. Prüfe die Claude Desktop Konfiguration
3. Claude Desktop komplett neu starten (nicht nur das Fenster schließen)

### Video-Transkription funktioniert nicht

1. Prüfe: `yt-dlp --version` und `ffmpeg -version`
2. Prüfe ob das venv existiert: `ls .venv-whisper`
3. Setup erneut ausführen: `npm run setup`

---

## 📞 Support

- GitHub Issues: [TheTrustedAdvisor/uipath-kb/issues](https://github.com/TheTrustedAdvisor/uipath-kb/issues)
- Dokumentation: [docs/](docs/)

---

## Nächste Schritte

1. **MCP Server testen:**
   - "Suche in der UIPath Dokumentation nach Queues"
   - "Zeige trending Topics auf r/UiPath"

2. **Knowledge Base nutzen:**
   - Eigene Dokumentation in `knowledge/custom/` ablegen
   - Use Cases in `knowledge/usecases/` dokumentieren

3. **Videos transkribieren:**
   - UIPath Tutorial-Videos transkribieren
   - Transkripte landen automatisch in `knowledge/videos/`
