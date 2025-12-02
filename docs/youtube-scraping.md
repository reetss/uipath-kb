# YouTube Scraping Guide

Anleitung zur Nutzung des YouTube Scraper MCP-Servers mit fabric-ai Integration.

## Übersicht

Der YouTube Scraper ermöglicht:
- Extraktion von Video-Metadaten (Titel, Channel, Dauer)
- Abruf von Transkripten/Untertiteln
- KI-basierte Insight-Extraktion mit fabric-ai
- Automatische Zusammenfassungen
- Lokales Caching aller Daten

## Verwendung in Claude

### 1. Video-Metadaten abrufen

```
Kannst du die Metadaten für dieses UIPath Video abrufen?
https://www.youtube.com/watch?v=VIDEO_ID
```

**Tool:** `youtube_get_metadata`

**Ausgabe:**
- Titel
- Channel
- Dauer
- Veröffentlichungsdatum
- Beschreibung

### 2. Transkript extrahieren

```
Bitte extrahiere das Transkript von diesem Video:
https://www.youtube.com/watch?v=VIDEO_ID
```

**Tool:** `youtube_get_transcript`

**Optional:** Sprache angeben:
```
Extrahiere das deutsche Transkript von diesem Video
```

### 3. Insights extrahieren (extract_wisdom)

```
Extrahiere die wichtigsten Erkenntnisse aus diesem UIPath Tutorial:
https://www.youtube.com/watch?v=VIDEO_ID
```

**Tool:** `youtube_extract_wisdom`

**Ausgabe:**
- Zusammenfassung
- Hauptpunkte
- Insights
- Zitate
- Empfehlungen
- Fakten
- Referenzen

### 4. Zusammenfassung erstellen

```
Erstelle eine Zusammenfassung für dieses Video:
https://www.youtube.com/watch?v=VIDEO_ID
```

**Tool:** `youtube_summarize`

### 5. Gecachte Videos anzeigen

```
Zeige mir alle Videos, die bereits gescraped wurden
```

**Tool:** `youtube_list_cached`

## fabric-ai Patterns

Der YouTube Scraper nutzt folgende fabric-ai Patterns:

### extract_wisdom
Extrahiert strukturierte Insights aus Videos:
- **SUMMARY**: Kurze Zusammenfassung
- **MAIN POINTS**: Kernaussagen
- **INSIGHTS**: Tiefergehende Erkenntnisse
- **QUOTES**: Bemerkenswerte Zitate
- **HABITS**: Empfohlene Praktiken
- **FACTS**: Faktische Informationen
- **REFERENCES**: Erwähnte Ressourcen
- **RECOMMENDATIONS**: Handlungsempfehlungen

### summarize
Erstellt eine prägnante Zusammenfassung des Video-Inhalts.

## Manuelle Verwendung von fabric-ai

Du kannst fabric-ai auch direkt im Terminal verwenden:

### Video-Metadaten

```bash
/opt/homebrew/opt/fabric-ai/bin/fabric-ai --youtube "VIDEO_URL" --pattern extract_video_metadata
```

### Transkript

```bash
/opt/homebrew/opt/fabric-ai/bin/fabric-ai --youtube "VIDEO_URL" --transcript
```

### Wisdom-Extraktion

```bash
/opt/homebrew/opt/fabric-ai/bin/fabric-ai --youtube "VIDEO_URL" --pattern extract_wisdom
```

### Zusammenfassung

```bash
/opt/homebrew/opt/fabric-ai/bin/fabric-ai --youtube "VIDEO_URL" --pattern summarize
```

## Lokaler Cache

Alle abgerufenen Daten werden lokal gespeichert:

```
knowledge/videos/
├── VIDEO_ID-metadata.json    # Metadaten
├── VIDEO_ID-transcript.json  # Transkript
└── VIDEO_ID-wisdom.json      # Extrahierte Insights
```

### Cache-Struktur

**Metadaten:**
```json
{
  "videoId": "VIDEO_ID",
  "title": "Video Title",
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "channel": "Channel Name",
  "duration": "10:30",
  "publishedAt": "2024-01-01T00:00:00Z",
  "description": "..."
}
```

**Wisdom:**
```json
{
  "videoId": "VIDEO_ID",
  "summary": "...",
  "mainPoints": ["...", "..."],
  "insights": ["...", "..."],
  "quotes": ["...", "..."],
  "recommendations": ["...", "..."],
  "generatedAt": "2024-12-02T00:00:00Z"
}
```

## Best Practices

### 1. Workflow für neue Videos

1. **Metadaten abrufen** → Überblick gewinnen
2. **Wisdom extrahieren** → Schnelle Insights
3. **Transkript bei Bedarf** → Für detaillierte Analyse

### 2. Batch-Processing

Erstelle eine Liste mit Videos und verarbeite sie nacheinander:

```bash
# videos.txt
https://www.youtube.com/watch?v=VIDEO_ID_1
https://www.youtube.com/watch?v=VIDEO_ID_2
https://www.youtube.com/watch?v=VIDEO_ID_3
```

### 3. Regelmäßige Aktualisierungen

Für UIPath Channels:
- Monatlich neue Videos scrapen
- Wichtige Videos mit extract_wisdom verarbeiten
- In lokaler Knowledge Base referenzieren

## Empfohlene UIPath YouTube Channels

- **UiPath** (Official): Tutorials, Produktupdates
- **Anders Jensen**: UIPath Best Practices
- **Mukesh Kala**: UIPath Tutorials
- **Automation Solution**: Advanced UIPath

## Tipps

1. **Cache nutzen**: Gecachte Daten werden automatisch verwendet
2. **Force Refresh**: Bei extract_wisdom mit `force_refresh: true`
3. **Sprache**: Transkripte automatisch in Videosprache
4. **Qualität**: fabric-ai liefert bessere Ergebnisse bei gut strukturierten Videos

## Troubleshooting

### Transkript nicht verfügbar
- Video hat möglicherweise keine Untertitel
- Versuche ein anderes Video

### fabric-ai Fehler
```bash
# Teste fabric-ai manuell
/opt/homebrew/opt/fabric-ai/bin/fabric-ai --version
```

### Langsame Verarbeitung
- extract_wisdom kann bei langen Videos 1-2 Minuten dauern
- Transkript-Extraktion ist schneller

## Weiterführende Links

- [fabric-ai GitHub](https://github.com/danielmiessler/fabric)
- [fabric-ai Patterns](https://github.com/danielmiessler/fabric/tree/main/patterns)
- [UIPath Documentation](https://docs.uipath.com)
