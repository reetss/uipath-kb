# UC-003: Automatisierte Produktanzeige von Designerstoffen – Architektur

**Erstellt:** 2025-12-17  
**Version:** 1.0  
**Autor:** Sebastian Steer (mit Unterstützung GitHub Copilot)  
**Status:** Draft

---

## Executive Summary

Dieser Use Case automatisiert den Weg von neuen Designerstoffen in den WooCommerce-Webshop: Von der Ablage der Produkt- und Designbilder über Bildverarbeitung und KI-gestützte Designanalyse sowie Texterstellung bis hin zur Anlage des Produkts im Status „privat“. UiPath übernimmt die Orchestrierung von RPA-Schritten (Datei-Handling, Adobe-Automatisierung, WooCommerce-Anbindung, Benachrichtigung), während Vision- und Text-LLMs Farben, Muster und Produkttexte generieren. Ein klar definierter Human-in-the-Loop-Schritt stellt sicher, dass Bildqualität und Inhalte vor der Veröffentlichung geprüft werden.

Die Architektur ist als modularer, skalierbarer End-to-End-Prozess ausgelegt, der mit einem MVP starten und später um Varianten, Mehrsprachigkeit und weitere Kanäle erweitert werden kann.

---

## Business Context

### Problemstellung

- Manuelles, inkonsistentes und fehleranfälliges Anlegen neuer Designerstoffe im Webshop.
- Hoher Zeitaufwand für Bildbearbeitung, Dateibenennung, Textformulierung und WooCommerce-Anlage.
- Keine systematische Nutzung von KI-Potenzial (Bildanalyse, Texterstellung).

### Ziele

- **Primäre Ziele:**
  - Deutliche Reduktion der Zeit pro Produktanlage (End-to-End).
  - Hoher Automatisierungsgrad der wiederkehrenden Schritte (Ordner, Benennung, Import).
  - KI-unterstützte, konsistente und verkaufsstarke Produkttexte.

- **Sekundäre Ziele:**
  - Aufbau eines wiederverwendbaren Patterns für Vision-/Text-KI-Integration in UiPath.
  - Transparente KPIs zur Messung des Nutzens (Zeit, Qualität, Fehlerquote).

### Erfolgsmetriken

| Metrik                               | Aktueller Wert | Zielwert                      | Zeitrahmen       |
|--------------------------------------|----------------|-------------------------------|------------------|
| Durchlaufzeit je Produkt             | X Stunden      | < Y Stunden (inkl. Review)    | nach 3 Monaten   |
| Anteil Produkte ohne Korrektur      | unbekannt      | ≥ 80 %                        | nach 3 Monaten   |
| Fehlerquote WooCommerce-Import      | unbekannt      | < 5 %                         | stabiler Betrieb |
| Subjektive Zufriedenheit (1–5)      | n/a            | ≥ 4/5 (Shop-Manager:innen)    | nach 2 Monaten   |

---

## Architektur-Übersicht

### High-Level Architektur

Auf hoher Ebene besteht die Lösung aus drei Schichten:

1. **Trigger- & Dateischicht** (Watch-Folder, File-System)
2. **Orchestrierung & Prozesslogik** (UiPath + REFramework)
3. **Fachdienste & Zielsysteme** (Adobe, KI-Services, WooCommerce)

```text
┌─────────────────────┐     ┌────────────────────────┐     ┌─────────────────────────┐
│   Watch-Folder &    │     │  UiPath Orchestrierung │     │  Zielsysteme & Services │
│   Produktdaten      │ ───▶│  (REFramework, Queues) │ ───▶│  (Adobe, KI, WooCommerce)│
└─────────────────────┘     └────────────────────────┘     └─────────────────────────┘
```

### Komponenten

#### 1. UiPath Process „UC-003 Product Ingestion“

**Typ:** UiPath Studio Prozess (REFramework-basiert), Unattended Robot.  
**Verantwortlichkeit:** End-to-End-Orchestrierung von Datei-Handling, Adobe-Calls, KI-Aufrufen, WooCommerce-Anlage und Benachrichtigung.

**Technische Details:**
- Technologie: UiPath Studio / Unattended Robot.
- Deployment: Orchestrator, getrennte Pakete für Dev/Test/Prod.
- Trigger: Zeitgesteuert (Schedule) und/oder Queue-basiert.

#### 2. Watch-Folder & File-Handling-Komponente

**Typ:** Dateisystem / Netzwerk-Share + UiPath File Activities.  
**Verantwortlichkeit:** Erkennen neuer Produktordner, Anlegen der Zielstruktur, Umbenennung der Dateien nach Konvention.

#### 3. Adobe-Integration (Lightroom/Photoshop)

**Typ:** Desktop-Applikation, automatisiert via UiPath.  
**Verantwortlichkeit:** Anstoßen und Überwachen vordefinierter Stapelverarbeitungen (Presets, Exportgrößen, Zuschnitte).

#### 4. Vision-KI-Service

**Typ:** REST-basierter Vision-LLM (z. B. GPT-4o, Claude, Grok oder internes Modell).  
**Verantwortlichkeit:** Analyse von Designbildern (Farben, Muster, Stil, ggf. Saison/Use-Cases) und Rückgabe strukturierter Ergebnisse.

#### 5. Text-KI-Service

**Typ:** REST-basierter LLM für Textgenerierung.  
**Verantwortlichkeit:** Generierung von Produkttexten (Titel, Beschreibung, Meta-Text) auf Basis von Vision-Ergebnissen, technischen Daten und vordefinierten Vorlagen.

#### 6. WooCommerce-Anbindung

**Typ:** REST-API (bevorzugt) oder CSV-Import.  
**Verantwortlichkeit:** Anlage/Update von Produkten im Status „privat“, inkl. Bild-Upload, Attributen, Kategorien.

#### 7. Human-in-the-Loop Review

**Typ:** Fachanwender:in im WooCommerce Backend oder separater Review-Flow (z. B. UiPath Forms, E-Mail mit URL).  
**Verantwortlichkeit:** Fachliche Prüfung von Bildern, Texten, Preisen und Attributen; finale Freigabe / Veröffentlichung.

#### 8. Logging & Monitoring

**Typ:** UiPath Orchestrator Logs, Business-Logs (z. B. JSON/CSV, DB).  
**Verantwortlichkeit:** Nachvollziehbarkeit pro Produkt, technische und fachliche KPIs.

---

## Process Design

### Prozess-Flow (fachlich/technisch)

1. Watch-Folder wird periodisch überwacht (Schedule) oder Ereignis getriggert.
2. Neuer Produktordner mit Produkt- und Designbildern wird erkannt.
3. RPA legt Zielordnerstruktur an und benennt Dateien gemäß Namenskonvention um.
4. RPA startet Lightroom-/Photoshop-Stapelverarbeitung und wartet auf Abschluss.
5. Human-in-the-Loop: Sichtprüfung der Bilder, Ergänzung technischer Produktdaten (z. B. Excel/Forms/Backend).
6. Vision-KI analysiert Designbilder und liefert strukturierte Merkmale (Farben, Muster, Stil, ggf. Tags).
7. Text-KI generiert Produkttexte auf Basis der Vision-Ergebnisse, Stammdaten und Textvorlagen.
8. RPA legt das Produkt in WooCommerce im Status „privat“ an (inkl. Bilder, Attribute, Texte).
9. RPA versendet Link/Benachrichtigung an verantwortliche Person.
10. Human gibt Produkt frei (Veröffentlichung) oder fordert Korrektur an.

### Input

| Parameter                         | Typ                    | Quelle              | Validierung                                 |
|-----------------------------------|------------------------|---------------------|---------------------------------------------|
| Produktordner (Bilder)           | Pfad / Dateien         | Watch-Folder        | Ordnerstruktur, Pflichtdateien vorhanden    |
| Manuelle Produktstammdaten       | strukturierte Daten    | Excel/Forms/System  | Pflichtfelder, Datentypen, Wertebereiche    |
| Namenskonventions-Regeln         | Konfigurationsdatei    | Repo / Asset        | Syntaxvalidierung                           |
| KI-API-Konfiguration             | Konfiguration/Assets   | Orchestrator Assets | Endpoints, Timeouts, Auth                   |
| WooCommerce-Credentials/Settings | Credentials / Config   | Orchestrator Assets | Verbindungstest, Rechteprüfung              |

### Output

| Output                            | Typ                 | Ziel                       | Format                      |
|-----------------------------------|---------------------|----------------------------|-----------------------------|
| Produkt in WooCommerce (privat)   | Produktdatensatz    | WooCommerce                | via REST/CSV                |
| Generierte Produkttexte           | strukturierter Text | WooCommerce + Logging      | JSON/Markdown/Text          |
| Design-Analyse                    | strukturierte Daten | Logging / Analyse          | JSON                        |
| Prozesslogs                       | Logeinträge         | Orchestrator               | UiPath Log + Business-Log   |
| Benachrichtigung mit Produkt-URL  | Nachricht           | E-Mail/Teams/Slack         | Text mit Link               |

### Error & Exception Handling

- **Technische Fehler (z. B. Netzwerk, API-Timeout):**
  - Mehrstufige Retry-Logik mit exponentiellem Backoff (REFramework Queue Retries).
  - Eskalation via Mail/Teams bei wiederholtem Fehlschlag.
- **KI-Fehler oder schlechte Ergebnisse (Low Confidence):**
  - Produkt wird in Review-Queue markiert; KI-Ergebnisse werden nur als Vorschlag gespeichert.
  - Human-in-the-Loop muss aktiv freigeben oder korrigieren.
- **WooCommerce-Importfehler:**
  - Validierung der Payload vor dem Call.
  - Logging von Response und Payload zur Analyse.
  - Option auf manuelle Nachanlage (Fallback) für kritische Produkte.

---

## Orchestrator Design

### Queues

| Queue Name                  | Items/Tag (Schätzung) | Priorität | Retention |
|----------------------------|------------------------|----------|-----------|
| UC003_ProductCreation      | abhängig vom Volumen   | Normal   | 30 Tage   |

- Eine Transaction entspricht einem neuen Produkt (Stoff) inklusive Bild-Set.
- Retries werden über Queue-Einstellungen gesteuert.

### Assets

| Asset Name                         | Typ         | Zweck                                   | Umgebung |
|------------------------------------|------------|-----------------------------------------|----------|
| UC003_WC_ApiBaseUrl                | Text       | Basis-URL WooCommerce API               | Dev/Prod |
| UC003_WC_ApiKey                    | Credential | Authentifizierung WooCommerce           | Dev/Prod |
| UC003_VisionApi_Endpoint           | Text       | Vision-KI Endpoint                      | Dev/Prod |
| UC003_VisionApi_Key                | Credential | Vision-KI Auth                          | Dev/Prod |
| UC003_TextApi_Endpoint             | Text       | Text-LLM Endpoint                       | Dev/Prod |
| UC003_TextApi_Key                  | Credential | Text-LLM Auth                           | Dev/Prod |
| UC003_FolderConfig                 | Text/JSON  | Pfade, Struktur, Namenskonvention       | Dev/Prod |
| UC003_Notification_Recipients      | Text       | Verteiler für Benachrichtigungen        | Dev/Prod |

### Schedules

| Schedule Name             | Trigger   | Frequenz         | Robot Pool      |
|---------------------------|-----------|------------------|-----------------|
| UC003_ProductScan_Sched   | Time      | alle 15–30 Min   | UC003_Unattended|

---

## Integration

### Externe Systeme

#### WooCommerce

**Typ:** REST-API (bevorzugt)  
**Zweck:** Produktanlage, Bild-Upload, Attributpflege.  
**Authentifizierung:** API-Key/OAuth (abhängig von Setup).  

**Typische Endpoints:**
- `POST /wp-json/wc/v3/products`
- `POST /wp-json/wc/v3/products/{id}/images`

#### Vision-LLM

**Typ:** REST-API.  
**Zweck:** Analyse von Designbildern, Rückgabe strukturierter Merkmale.  
**Authentifizierung:** API-Key, ggf. zusätzliche Tenant-/Projekt-IDs.  

#### Text-LLM

**Typ:** REST-API.  
**Zweck:** Generierung von Produkttexten, Titeln, Meta-Beschreibungen.  
**Authentifizierung:** API-Key.  

### Datenfluss (vereinfacht)

```text
[Watch-Folder] ──▶ [UiPath File Handling] ──▶ [Adobe Batch] ──▶ [Vision-KI] ──▶ [Text-KI]
                                            │
                                            └────────▶ [WooCommerce (privat)] ──▶ [Human Review]
```

---

## Sicherheit

### Authentifizierung & Autorisierung

- Nutzung von Orchestrator-Credentials für WooCommerce und KI-APIs.
- Robots laufen unter technischen Accounts mit minimal nötigen Rechten.
- Dateifreigaben (Shares) nur für notwendige Service-Accounts und Fachanwender:innen.

### Datenschutz

- Designerbilder gelten als IP-kritische Assets; Speicherung ausschließlich in kontrollierten Umgebungen.
- Bei Cloud-KI-Nutzung: Prüfung der Nutzungsbedingungen (kein Training auf Kundendaten, Logging/Retention klären).
- Minimierung personenbezogener Daten im gesamten Prozess (hauptsächlich Produktdaten).

### Compliance

- Sicherstellen, dass alle vertraglichen/Compliance-Vorgaben für externe KI-Dienste erfüllt sind.
- Dokumentation der Datenflüsse für interne Audits.

---

## Monitoring & Logging

### Metriken

| Metrik                            | Schwellwert             | Alert | Dashboard |
|-----------------------------------|--------------------------|-------|-----------|
| Anzahl verarbeiteter Produkte/Tag | projektspezifisch       | Ja    | Ja        |
| Fehlerquote WooCommerce-Import    | > 5 %                   | Ja    | Ja        |
| Anteil Low-Confidence-KI-Fälle    | projektspezifisch       | Ja    | Ja        |
| Durchschnittliche Durchlaufzeit   | > Zielwert über Zeitraum| Ja    | Ja        |

### Logging-Strategie

- Verwendung der REFramework-Logging-Levels (Info, Warn, Error, Fatal).
- Zusätzliches Business-Logging pro Produkt (z. B. JSON-Datei oder DB-Eintrag mit Produkt-ID, Zeiten, KI-Ergebnissen, Reviewer:in).
- Retention gemäß Unternehmensrichtlinien.

---

## Deployment & Umgebungen

### Umgebungen

- **Development:** schnelle Iteration, Test mit Beispieldaten (assets aus UC-003).
- **Test/UAT:** Fachlicher Prozess-Test mit realistischen Daten, Freigabe durch Business.
- **Production:** stabile, überwachte Umgebung mit definiertem Change-Prozess.

### CI/CD (optional)

- Versionierung der UiPath-Prozesse in Git.
- Automatisierte Builds und Deployment-Pipelines in Orchestrator (z. B. über UiPath Automation Ops / DevOps-Integration).

---

## Skalierung & Performance

- **Horizontal:** Skalierung über zusätzliche Unattended Robots im UC003-Robot-Pool.
- **Vertikal:** Anpassung der Robot-Hardware bei hoher Bildverarbeitungs-Last.
- **Batch-Verarbeitung:** Nacht-/Randzeiten für aufwändige Bildverarbeitung nutzen, wenn Volumen steigt.

---

## Risiken & Mitigierung

| Risiko                                      | Wahrscheinlichkeit | Impact | Mitigierung                                                   |
|---------------------------------------------|--------------------|--------|----------------------------------------------------------------|
| KI-Analyse liefert unpassende Ergebnisse    | Mittel             | Hoch   | Confidence-Schwellen, Review-Pflicht, Feedback-Loop           |
| Instabile Adobe-Automatisierung (UI-Änder.) | Mittel             | Mittel | Standardisierte Presets, Scripting prüfen, enge Tests         |
| API-Limits / Latenz bei KI-Diensten         | Mittel             | Mittel | Caching, Batch-Aufrufe, Limits und Kosten überwachen          |
| WooCommerce-Änderungen (Plugins/Updates)    | Mittel             | Mittel | Regression-Tests, Sandbox-Umgebung, Versionskontrolle         |
| Mangelnde Akzeptanz bei Fachanwender:innen  | Niedrig–Mittel     | Mittel | Frühzeitiges Einbinden, Transparenz, einfache Korrekturpfade  |

---

## Timeline (grobe MVP-Planung)

| Phase                         | Dauer (Schätzung) | Inhalt                                           |
|-------------------------------|--------------------|--------------------------------------------------|
| Discovery & Detailkonzept     | 2–3 Wochen         | Rückfragen klären, Namenskonvention, Muss-Felder |
| MVP-Implementierung (RPA-Basis)| 3–4 Wochen        | End-to-End ohne/mit Minimal-KI                   |
| KI-Integration & Tuning       | 3–4 Wochen         | Vision/Text-LLM, Prompt-Tuning, Tests            |
| UAT & Go-Live                 | 2–3 Wochen         | Fachlicher Test, Schulung, Rollout               |

---

## Referenzen

- Use Case Beschreibung: knowledge/usecases/uc-003-textile-design-classification/README.md
- Technische Analyse: knowledge/usecases/uc-003-textile-design-classification/analysis.md
- Architektur-Template: templates/architecture/architecture-template.md
- UIPath Dokumentation: https://docs.uipath.com
