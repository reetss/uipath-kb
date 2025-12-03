# Contributing Guide

Danke für dein Interesse an der UIPath Knowledge Base! Diese Anleitung erklärt, wie du zum Projekt beitragen kannst.

## 🚀 Schnellstart für Contributors

```bash
# 1. Repository forken (auf GitHub)

# 2. Fork klonen
git clone https://github.com/DEIN-USERNAME/uipath-kb.git
cd uipath-kb

# 3. Setup ausführen
npm run setup

# 4. Feature-Branch erstellen
git checkout -b feature/meine-aenderung
```

## 📋 Branch-Naming-Konvention

| Typ | Format | Beispiel |
|-----|--------|----------|
| Feature | `feature/beschreibung` | `feature/add-sap-connector` |
| Bugfix | `fix/beschreibung` | `fix/reddit-api-timeout` |
| Documentation | `docs/beschreibung` | `docs/update-quickstart` |
| Refactoring | `refactor/beschreibung` | `refactor/mcp-server-structure` |

## 💬 Commit-Message-Format

Wir verwenden [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Beschreibung |
|------|--------------|
| `feat` | Neue Funktion |
| `fix` | Bugfix |
| `docs` | Dokumentation |
| `refactor` | Code-Refactoring (keine neuen Features, keine Bugfixes) |
| `test` | Tests hinzufügen oder ändern |
| `chore` | Maintenance (Dependencies, CI, etc.) |
| `ci` | CI/CD Änderungen |

### Scopes (optional)

- `uipath-docs` - UIPath Docs MCP Server
- `youtube` - YouTube Scraper MCP Server
- `local-knowledge` - Local Knowledge MCP Server
- `reddit` - Reddit Search MCP Server
- `ci` - GitHub Actions
- `docs` - Dokumentation

### Beispiele

```bash
# Feature
git commit -m "feat(reddit): Add trending topics endpoint"

# Bugfix
git commit -m "fix(youtube): Handle missing transcripts gracefully"

# Documentation
git commit -m "docs: Update QUICKSTART for Windows users"

# CI
git commit -m "ci: Add documentation validation step"

# Mit Body
git commit -m "feat(local-knowledge): Add use case search

- New tool: knowledge_list_usecases
- New tool: knowledge_get_usecase
- Updated category enum to include 'usecases'

Closes #123"
```

## 🔄 Pull Request Prozess

### 1. Vor dem PR

- [ ] Branch ist aktuell mit `main`
- [ ] Alle Tests laufen lokal: `npm run build`
- [ ] Code ist formatiert
- [ ] Commit-Messages folgen der Konvention

### 2. PR erstellen

1. Push deinen Branch: `git push origin feature/meine-aenderung`
2. Öffne PR auf GitHub
3. Fülle das PR-Template aus
4. Warte auf CI-Checks

### 3. PR-Beschreibung

```markdown
## Beschreibung
[Was wurde geändert und warum?]

## Änderungen
- [ ] Feature hinzugefügt
- [ ] Bug behoben
- [ ] Dokumentation aktualisiert
- [ ] Tests hinzugefügt

## Testing
[Wie kann man die Änderung testen?]

## Screenshots (falls relevant)
[Screenshots hier einfügen]

## Checklist
- [ ] Ich habe die Commit-Message-Konvention befolgt
- [ ] Ich habe die Dokumentation aktualisiert (falls nötig)
- [ ] Alle CI-Checks sind grün
```

### 4. Review-Prozess

- Mindestens 1 Approval erforderlich
- CI muss grün sein
- Merge via "Squash and merge" (für saubere History)

## 🧪 Lokales Testen

```bash
# Alle MCP Server bauen
npm run build

# Reddit-Tests ausführen
npm run test:reddit

# Dokumentation validieren
node validators/validate-documentation.js docs/mein-dokument.md

# Setup prüfen (ohne Änderungen)
npm run setup:check
```

## 📁 Projekt-Struktur

```
uipath-kb/
├── mcp-servers/           # MCP Server (TypeScript)
│   ├── uipath-docs/       # UIPath Docs Suche
│   ├── youtube-scraper/   # YouTube Transkription
│   ├── local-knowledge/   # Lokale Knowledge Base
│   └── reddit-search/     # Reddit Community Search
├── knowledge/             # Wissens-Repository
│   ├── usecases/          # Business Use Cases + Analyse
│   ├── custom/            # Best Practices
│   └── ...
├── docs/                  # Projekt-Dokumentation
├── scripts/               # Utility-Scripts
├── templates/             # Dokumentations-Templates
└── validators/            # Validierungs-Tools
```

## 🎯 Bereiche für Contributions

### 🟢 Einfach (Good First Issues)

- Dokumentation verbessern
- Typos fixen
- Beispiele hinzufügen
- Tests ergänzen

### 🟡 Mittel

- Neue Use Cases dokumentieren
- MCP-Tools erweitern
- Validator verbessern
- CI/CD optimieren

### 🔴 Fortgeschritten

- Neue MCP-Server implementieren
- Architektur-Änderungen
- Performance-Optimierungen

## ❓ Fragen?

- **Issues**: Für Bugs und Feature Requests
- **Discussions**: Für Fragen und Ideen

---

**Danke für deinen Beitrag!** 🎉
