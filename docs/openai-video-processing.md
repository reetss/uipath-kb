# Video Processing mit OpenAI - Sichere Nutzung

## ⚠️ WICHTIGER SICHERHEITSHINWEIS

**NIEMALS** API Keys in Git committen oder öffentlich teilen!

## 🔐 Einrichtung

### 1. OpenAI API Key erstellen

1. Gehe zu https://platform.openai.com/api-keys
2. Klicke "Create new secret key"
3. Kopiere den Key (wird nur einmal angezeigt!)

### 2. Key sicher speichern

**Option A: Environment Variable (temporär)**
```bash
# In deinem Terminal
export OPENAI_API_KEY="sk-proj-..."

# Prüfen
echo $OPENAI_API_KEY
```

**Option B: .env File (persistent)**
```bash
# .env File erstellen (wird von .gitignore ignoriert)
cp .env.template .env

# Key in .env eintragen
echo 'OPENAI_API_KEY=sk-proj-...' > .env

# Dann in Script laden:
# source .env oder dotenv nutzen
```

**Option C: Direkt im Script (NUR für Tests)**
```bash
# NICHT für Production!
node scripts/extract-wisdom-openai.js
# Wenn OPENAI_API_KEY fehlt, wird danach gefragt
```

### 3. Key widerrufen wenn kompromittiert

Falls ein Key versehentlich geteilt wurde:

1. https://platform.openai.com/api-keys
2. Key finden und "Revoke" klicken
3. Neuen Key erstellen

## 🚀 Verwendung

### Schritt 1: Transkripte herunterladen

```bash
# Schnell: Nur Transkripte (10-15s pro Video)
node scripts/batch-process-transcripts.js knowledge/videos/video-list-clean.txt
```

**Ergebnis:** Dateien wie `VIDEO_ID-transcript.txt` in `knowledge/videos/`

### Schritt 2: Wisdom mit OpenAI extrahieren

```bash
# API Key setzen
export OPENAI_API_KEY="sk-proj-..."

# Wisdom extrahieren (5-10s pro Video)
node scripts/extract-wisdom-openai.js knowledge/videos/
```

**Ergebnis:** Dateien wie `VIDEO_ID-wisdom-openai.md` in `knowledge/videos/`

### Kombination (beide Schritte)

```bash
# 1. Transkripte
node scripts/batch-process-transcripts.js knowledge/videos/video-list-clean.txt

# 2. Wisdom
export OPENAI_API_KEY="sk-proj-..."
node scripts/extract-wisdom-openai.js knowledge/videos/
```

## 📊 Performance-Vergleich

| Methode | Pro Video | 12 Videos | Kosten |
|---------|-----------|-----------|--------|
| fabric-ai | 2-4 Min | 30-50 Min | Gratis |
| OpenAI API | 5-10s | **1-2 Min** | ~$0.02 |

**Empfehlung:** OpenAI für Batch-Processing, fabric-ai für einzelne Videos

## 💰 Kosten

**Geschätzte Kosten mit gpt-4o-mini:**
- Pro Video: ~$0.001-0.003
- 12 Videos: ~$0.02-0.04
- 50 Videos: ~$0.05-0.15

**Tipp:** Nutze `--skip-existing` um bereits verarbeitete Videos zu überspringen

## 🔍 Output-Format

```markdown
knowledge/videos/
├── DjcilDjdvqw-transcript.txt       # Von fabric-ai
├── DjcilDjdvqw-wisdom-openai.md     # Von OpenAI (strukturiert)
└── ...
```

### Wisdom-Struktur

```markdown
# SUMMARY
...

# MAIN POINTS
- Point 1
- Point 2

# INSIGHTS
- Insight 1
- Insight 2

# RECOMMENDATIONS
- Recommendation 1
- Recommendation 2

# KEY QUOTES
"Important quote"

# TOPICS COVERED
- Topic 1
- Topic 2
```

## ⚠️ Troubleshooting

### "OPENAI_API_KEY not set"
```bash
# Prüfe ob Key gesetzt ist
echo $OPENAI_API_KEY

# Nochmal setzen
export OPENAI_API_KEY="sk-proj-..."
```

### "API error: 401"
Key ist ungültig oder widerrufen
- Neuen Key erstellen
- Richtig kopiert? (Kein Whitespace)

### "API error: 429"
Rate Limit erreicht
- Warte 1 Minute
- Nutze `--delay=5000` für längere Pausen

### "Transcript too short"
Transkript konnte nicht geladen werden
- Prüfe ob `-transcript.txt` Datei existiert
- Lade Transkript nochmal herunter

## 🔒 Sicherheits-Best-Practices

✅ **DO:**
- Keys in .env speichern
- .env in .gitignore
- Keys regelmäßig rotieren
- Separate Keys für Dev/Prod

❌ **DON'T:**
- Keys in Code committen
- Keys in Chat/Email teilen
- Keys in Screenshots zeigen
- Alte Keys nicht widerrufen

## 📚 Weiterführende Links

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [OpenAI Pricing](https://openai.com/api/pricing/)
- [Rate Limits](https://platform.openai.com/docs/guides/rate-limits)
- [Best Practices](https://platform.openai.com/docs/guides/production-best-practices)
