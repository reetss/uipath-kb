# UC-003: Automatisierte Produktanzeige von Designerstoffen im Webshop – Technische Analyse

## 🔴 Offene Rückfragen
> Diese Fragen müssen vor der Implementierung (mindestens für das MVP) geklärt werden.

### Kritisch (Blockierend)

| #  | Frage | Ansprechpartner | Status |
|----|--------|-----------------|--------|
| Q1 | Was ist das führende System für Produktstammdaten (Preis, Material, Lagerbestand, Artikelnummer)? Gibt es bereits eine „Single Source of Truth“ (z. B. ERP/WAWi) oder ist WooCommerce aktuell führend? | Business / IT (Shop, ERP) | ⏳ Offen |
| Q2 | Wie genau sieht die gewünschte Namenskonvention für Ordner und Dateien aus (Pattern, Pflichtfelder, erlaubte Zeichen)? Die Beispiel-Dateien im assets-Ordner (z. B. `Viskose-Elastan-Jersey-Stoff-0002189-0090024-0000102-5-768x768.jpg`) deuten auf ein bestehendes Schema hin – wie sind die einzelnen Segmente (Basisname, Artikelnummer, Farb-/Variantencode, Bildvariante/Größe) fachlich definiert? Gibt es bereits ein Dokument dazu oder muss sie neu definiert werden? | Shop-Owner / Prozessverantwortliche:r | ⏳ Offen |
| Q3 | Über welche technische Schnittstelle soll WooCommerce angebunden werden (REST API, CSV-Import, Plugin)? Gibt es produktive API-Credentials / Testsystem? | IT / WooCommerce-Admin | ⏳ Offen |
| Q4 | Welche Vision-/Text-KI dürfen aus Compliance- und Kostensicht verwendet werden (Cloud-Dienste vs. On-Prem/selbst gehostet)? Müssen Bilddaten zwingend on-prem/intern bleiben? | IT Security / Datenschutz / Management | ⏳ Offen |
| Q5 | Gibt es Limitierungen oder Abhängigkeiten bei Adobe (Lizenzmodell, erlaubte Automatisierung, Headless/CLI-Verwendung), die die Umsetzung der Stapelverarbeitung durch RPA beeinflussen? | Design-Verantwortliche / IT | ⏳ Offen |
| Q6 | Wie viele neue Produkte (Designerstoffe) fallen typischerweise pro Woche/Monat an? Daraus ergeben sich Anforderungen an Durchsatz, Batch-Fenster und Skalierung. | Business (Einkauf / Sortiment) | ⏳ Offen |

### Wichtig (Vor Go-Live klären)

| #  | Frage | Ansprechpartner | Status |
|----|--------|-----------------|--------|
| Q7 | Welche Felder im WooCommerce-Produkt sind MUSS-Felder für den Go-Live (Titel, Kurzbeschreibung, Beschreibung, Attribute, Variationen, Tags, Kategorien, Meta)? | Shop-Owner | ⏳ Offen |
| Q8 | Gibt es bereits Text- und SEO-Guidelines (Tonality, Stichworte, Mindestlänge, Struktur), an denen sich die KI-Texte orientieren müssen? | Marketing / Content | ⏳ Offen |
| Q9 | Sollen Varianten (z. B. unterschiedliche Farbstellungen oder Breiten) schon im MVP automatisiert angelegt werden oder zunächst nur einfache Produkte ohne Varianten? | Shop-Owner | ⏳ Offen |
| Q10 | Welche Sprachen müssen unterstützt werden (nur Deutsch oder DE/EN, ggf. weitere)? Hat Mehrsprachigkeit Priorität im MVP? | Business / Marketing | ⏳ Offen |
| Q11 | Wie soll der Human-in-the-Loop-Prozess genau aussehen (wer prüft, in welchem Tool, in welchem Zeitfenster, wie wird Freigabe dokumentiert)? | Fachbereich / Prozessowner | ⏳ Offen |
| Q12 | Welche Logs und Reports werden benötigt (z. B. Liste neuer Produkte, KI-Confidence, manueller Korrekturaufwand, Durchlaufzeiten)? | Management / Prozessowner | ⏳ Offen |

### Nice-to-have (Kann später geklärt werden)

| #  | Frage | Ansprechpartner | Status |
|----|--------|-----------------|--------|
| Q13 | Sollen SEO-Tags (Meta-Title, Meta-Description, Keywords) ebenfalls automatisch generiert und gepflegt werden? | Marketing / SEO | ⏳ Offen |
| Q14 | Gibt es mittelfristig Pläne für weitere Vertriebskanäle (z. B. Marktplätze), die vom gleichen Produkt-Feed profitieren sollen? | Management / Vertrieb | ⏳ Offen |
| Q15 | Soll später ein Feedback-Loop implementiert werden, der auf Basis manueller Korrekturen Prompts/Modelle verbessert? | IT / Data / Business | ⏳ Offen |

---

## 📋 Zusammenfassung des Use Cases (technische Sicht)

- Ziel ist ein halb- bis vollautomatisierter End-to-End-Prozess für das Anlegen neuer Designerstoffe im WooCommerce-Shop.
- Eingang sind Bilder (Produktfotos + Designbilder) und manuelle Produktstammdaten; Ausgang ist ein vorkonfiguriertes Produkt im Status „privat“ im Shop.
- UiPath übernimmt primär die Orchestrierung von Dateioperationen, Adobe-Automatisierung, API-/CSV-Operationen und Benachrichtigungen.
- KI-Komponenten (Vision-LLM + Text-LLM) liefern Bildanalyse (Farben, Muster, Stil) und generierte Produkttexte, basierend auf vordefinierten Vorlagen und Regeln.
- Ein Human-in-the-Loop-Schritt stellt sicher, dass Bildbearbeitung und Texte fachlich korrekt sind, bevor das Produkt live geht.

Die im assets-Ordner hinterlegten Dateien (`Bild1.jpg`–`Bild4.jpg` sowie mehrere Dateien vom Typ `Viskose-Elastan-Jersey-Stoff-0002189-...jpg`) zeigen, dass bereits ein reales Datei- und Benennungsschema existiert. Diese Beispiele können
- als Referenz für die finale Namenskonvention dienen,
- für Tests der RPA-Schritte (Ordneranlage, Dateiumbenennung, Verarbeitung) genutzt werden und
- als Grundlage für ein Parsing der Dateinamen (z. B. automatische Ableitung von Artikel-/Farb-IDs) herangezogen werden.

Unklar sind aktuell vor allem: führendes Stammdatensystem, exakte Namenskonventionen, Wahl der KI-Plattform (Cloud vs. On-Prem), sowie Detailtiefe von Varianten und Mehrsprachigkeit im MVP.

---

## 🏗️ Vorläufige Architektur

### Empfohlenes Pattern

- Orchestrierung mit REFramework oder Agentic Framework (für bessere Handhabung von KI-Schritten und Retries).
- UIPath als „Klammer“ um:
  - Dateisystem / Watch-Folder
  - Adobe-Tools (Lightroom/Photoshop)
  - KI-Services (Vision + Text)
  - WooCommerce API/CSV-Schnittstelle
  - Benachrichtigung (E-Mail / Teams / Slack)

### High-Level-Flow (Mermaid)

```mermaid
flowchart TD
    A[Watch-Folder überwachen] --> B[Neuer Produktordner erkannt]
    B --> C[RPA: Ordnerstruktur & Dateinamen anlegen]
    C --> D[RPA: Lightroom Sync & Photoshop Batch starten]
    D --> E[Human: Bildkontrolle & Produktdaten ergänzen]
    E --> F[Agent (Vision-KI): Designbild analysieren]
    F --> G[Agent (Text-KI): Produkttext generieren]
    G --> H[RPA: Produkt in WooCommerce anlegen (privat)]
    H --> I[RPA: URL an Verantwortliche:n senden]
    I --> J[Human: Finale Freigabe & Veröffentlichung]
    H --> K[Logging & Reporting im Orchestrator]
```

### Systemübersicht

- **UiPath Orchestrator / Robots**: zentrale Steuerung, Queue-Handling, Logging.
- **File Storage / Watch-Folder**: Trigger und Ablage der Medien.
- **Adobe Lightroom/Photoshop**: externe Tools, über UI-Automation oder ggf. Skripting/CLI angebunden.
- **Vision-LLM**: über HTTP-API (REST) angebunden; Input = Bild, Output = strukturierte Beschreibung/Farben/Muster.
- **Text-LLM**: über HTTP-API; Input = Vision-Ergebnis + Produktdaten + Vorlagen, Output = Texte.
- **WooCommerce**: Anbindung vorzugsweise über REST-API; alternativ CSV-Export/Import.
// Hinweis: Die konkreten Beispielbilder unter assets eignen sich für frühe End-to-End-Tests (z. B. Erkennung von Mustern/Farben, Performance der Bildverarbeitung, Validierung der Benennung).

---

## ⚠️ Identifizierte Risiken

- **KI-Qualität**: Vision-LLMs liefern bei komplexen Mustern oder Mischmotiven ggf. inkonsistente Ergebnisse → Gegenmaßnahme: Confidence-Schwellen und Review-Queue.
- **Abhängigkeit von Drittdiensten**: Cloud-KI-APIs (Vision/Text) können Latenz- und Verfügbarkeitsprobleme oder Kostenspitzen verursachen.
- **Adobe-Automatisierung**: UI-Automation von Lightroom/Photoshop kann fragil sein (Updates, Popups, Performance). Wo möglich, sollten Scripting/CLI oder Adobe-spezifische Automationskanäle geprüft werden.
- **Daten- und IP-Schutz**: Designerstoffe sind IP-kritisch; Nutzung von Cloud-KI muss rechtlich und vertraglich abgesichert werden (Speicherung, Training, Logging beim Anbieter).
- **WooCommerce-Varianten**: Automatisierte Variantenanlage (z. B. Farbstellungen) kann datenseitig komplex werden (Attribute, Kombinationen, Preise).
- **Change Management**: Akzeptanz von KI-generierten Texten bei Shop-Manager:innen und Designer:innen muss aktiv begleitet werden.

---

## 🔧 Vorläufige technische Details

- **Trigger**: Datei-basierter Trigger (Watch-Folder) oder zeitgesteuerte Queue-Befüllung (z. B. Liste neuer Produkte aus Excel/CSV/ERP).
- **REFramework**: Nutzung von Queues für „Product Creation“-Transactions; jede Transaction = „neuer Stoff mit Bild-Set“.
- **Vision-KI-Integration**:
  - REST-Call aus UIPath (HTTP Request Activity) zu Vision-API.
  - Vereinheitlichung der Antworten in ein internes Schema (z. B. JSON mit Farben [Hex], Muster-Typ, Stil-Tags).
- **Text-KI-Integration**:
  - Prompt-Engineering in separaten Dateien/Vorlagen (z. B. Markdown/JSON) versioniert im Repo.
  - Übergabe von strukturierten Daten (Vision-Output + Stammdaten) an Text-LLM.
- **WooCommerce-Anbindung**:
  - Bevorzugt REST-API (Authentifizierung via API-Key / OAuth).
  - Abbilden der Produktstruktur (Simple/Variable Products, Attribute, Kategorien, Bilder-Upload).
  - Alternativ oder ergänzend: CSV-Export, Upload ins Backend und RPA für Import.
- **Logging**:
  - Orchestrator Logs + eigene Business-Logs (z. B. JSON-Datei oder DB-Tabelle pro angelegtem Produkt).
  - Speichern der KI-Ergebnisse (Vision-Output, Textvorschläge) zur Nachvollziehbarkeit.
- **Human-in-the-Loop**:
  - Variante 1: E-Mail mit Link zum „privaten“ WooCommerce-Produkt (Bearbeitung direkt im Backend).
  - Variante 2: Review-Formular (z. B. UiPath Forms, Power Apps, internes Tool) mit strukturiertem Feedback für spätere Prompt-Optimierung.

---

## 📅 Empfohlenes Vorgehen (MVP)

### Phase 1 – Discovery & Grundlagen
- Klärung der kritischen Fragen Q1–Q6 (Stammdaten, Schnittstellen, KI-Vorgaben, Volumen).
- Aufnahme der bestehenden manuellen Schritte im Detail (Screencasts, Prozessdokumentation).
- Definition der Namenskonventionen, Ordnerstrukturen und Muss-Felder in WooCommerce.

### Phase 2 – Technischer MVP (ohne KI oder mit Minimal-KI)
- Implementierung eines „Basic RPA“-Flows:
  - Watch-Folder → Ordnerstruktur → Dateibenennung → einfache WooCommerce-Anlage (ohne KI-Texte).
- Ziel: Stabiler, messbarer End-to-End-Prozess für 1–2 Beispielprodukte.

### Phase 3 – KI-Integration (Vision + Text)
- Anbindung eines Vision-LLM für Designanalyse (Farben, Muster, Stil) auf Testdaten.
- Anbindung des Text-LLMs mit einfachen, klar versionierten Prompts.
- Evaluierung der Qualität mit realen Stoffen; Definition von Confidence-Schwellen und Regeln, wann Human-Review nötig ist.

### Phase 4 – Human-in-the-Loop & Härtung
- Ausgestaltung eines klaren Freigabeprozesses (Rollen, SLAs, Tools).
- Ergänzung von Monitoring/Reporting (Durchlaufzeiten, KI-Qualität, manuelle Nacharbeit).
- Vorbereitung auf produktiven Einsatz (Fehlerhandling, Retry-Strategien, Exception-Flows im REFramework).

---

## 📊 Vorläufige Metriken / KPIs

- **Durchlaufzeit pro Produkt**: Start (Bild in Watch-Folder) bis „Produkt privat in WooCommerce angelegt“.
- **Automatisierungsgrad**: Anteil der Produkte, die ohne inhaltliche Korrektur der KI-Texte und -Analysen live gehen.
- **KI-Qualität**:
  - Akzeptanzquote der Vision-Analyse (Farben, Muster, Stil) durch Fachexperten.
  - Akzeptanzquote der KI-generierten Texte (Bewertungsskala, z. B. 1–5).
- **Fehlerquote Import**: Anzahl fehlgeschlagener WooCommerce-Anlagen / Gesamtanlagen.
- **Manueller Aufwand**: Zeitaufwand pro Produkt im Human-in-the-Loop-Schritt.

Diese KPIs sollten bereits in der MVP-Phase mitgeloggt und ausgewertet werden, um den Nutzen des Use Cases gegenüber dem heutigen Prozess transparent zu machen.