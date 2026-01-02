# UIPath Architektur: UC-003 Automatisierte Produktanzeige von Designerstoffen

**Erstellt:** 2026-01-02  
**Version:** 1.0  
**Autor:** Sebastian Steer  
**Status:** Draft

---

## Executive Summary

Dieser Use Case automatisiert den bislang manuellen und fehleranfälligen Prozess zur Anlage neuer Designerstoffe im WooCommerce-Webshop. Auf Basis eines klar strukturierten Produktordners mit fertigen Produktfotos, Designbildern, Metadaten und einer Marker-Datei übernimmt UiPath die End-to-End-Orchestrierung: vom Dateicheck über KI-gestützte Bildanalyse und Texterzeugung bis zur Anlage eines privaten Produkts in WooCommerce und der nachgelagerten Freigabe durch Fachanwender. Dadurch werden Durchlaufzeiten deutlich reduziert, Produkttexte konsistenter und der manuelle Aufwand im Tagesgeschäft spürbar verringert, bei gleichzeitig hoher Transparenz durch Logging und Reporting.

## Business Context

### Problemstellung

Das Anlegen neuer Designerstoffe im WooCommerce-Webshop ist aktuell sehr manuell, zeitintensiv und fehleranfällig, was zu langen Durchlaufzeiten und inkonsistenten Produktbeschreibungen führt.

### Ziele

- **Primäre Ziele:**
  - Deutliche Beschleunigung des Produkt-Onboarding-Prozesses für neue Designerstoffe
  - Automatisierte, konsistente Erstellung von Produkttexten und Designbeschreibungen auf Basis von KI

- **Sekundäre Ziele:**
  - Stabile, nachvollziehbare Anlage neuer Produkte in WooCommerce inklusive Logging und Reporting
  - Reduktion manueller, fehleranfälliger Einzelschritte auf notwendige fachliche Kontrollen (Human-in-the-Loop)

### Erfolgsmetriken

| Metrik | Aktueller Wert | Zielwert | Zeitrahmen |
|--------|---------------|----------|------------|
| Durchschnittliche Durchlaufzeit pro neuem Produkt | Manuell, nicht standardisiert, mehrere Stunden (inkl. Bildbearbeitung & Datenerfassung) | Automatisierter Anteil von READY.txt bis privates Produkt in WooCommerce in unter 30 Minuten | Innerhalb der ersten 3 Monate nach Go-Live |
| Anteil Produkte ohne größere manuelle Korrekturen | Noch nicht systematisch gemessen, erfahrungsgemäß hoher Korrekturaufwand | Mindestens 80 % der Produkte können ohne größere manuelle Text-/Beschreibungsänderungen übernommen werden | Messung im ersten halben Jahr nach Go-Live |

## Architektur-Übersicht

### High-Level Architektur

```
[Architektur-Diagramm oder Beschreibung]

┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Source    │────▶│  UiPath      │────▶│   Target    │
│   Systems   │     │  Processes   │     │   Systems   │
└─────────────┘     └──────────────┘     └─────────────┘
```

### Komponenten


#### 1. UiPath Orchestrator und Robots

**Typ:** RPA-Plattform
**Verantwortlichkeit:** Orchestrierung des End-to-End-Prozesses, Queue-Handling, Logging und Fehlerbehandlung


#### 2. Watch-Folder / Netzwerk-Share

**Typ:** Dateisystem
**Verantwortlichkeit:** Ablageort für vorbereitete Produktordner mit Bildern, Metadaten und Marker-Datei als Trigger


#### 3. Vision-LLM-Service

**Typ:** KI-Service
**Verantwortlichkeit:** Analyse der Designbilder zur Erkennung dominanter Farben, Muster, Stile und weiterer Merkmale


#### 4. Text-LLM-Service

**Typ:** KI-Service
**Verantwortlichkeit:** Generierung von Produkttexten (Titel, Kurzbeschreibung, Beschreibung, optional Meta-Texte) basierend auf Analyse- und Stammdaten


#### 5. WooCommerce Webshop

**Typ:** E-Commerce-Plattform
**Verantwortlichkeit:** Führendes System für Produktstammdaten und Veröffentlichung der angelegten Produkte


#### 6. Benachrichtigungs- und Review-Kanal

**Typ:** Messaging/Collaboration
**Verantwortlichkeit:** Versand von Benachrichtigungen mit Links zu neu angelegten WooCommerce-Produkten und Unterstützung des Human-in-the-Loop-Freigabeprozesses (Review, Feedback, Freigabe)

## Process Design

### Prozess-Flow

```
1. Watch-Folder überwachen und Produktordner mit Marker-Datei READY.txt erkennen
2. Ordnerstruktur und Dateinamen gegen definierte Konvention validieren
3. Technische Bildprüfung (Formate, Auflösung, Mindestanzahl) durchführen
4. Metadaten-Datei/Fragebogen einlesen und Produktstammdaten aggregieren
5. Designbilder an Vision-LLM senden und strukturierte Analyse (Farben, Muster, Stil, Merkmale) empfangen
6. Text-LLM mit Analyse-Output, Stammdaten und Textvorlagen aufrufen und Produkttexte generieren
7. Produkt samt Bildern, Attributen und Texten als "privat" in WooCommerce anlegen (REST-API oder CSV)
8. Benachrichtigung mit Link zum Produkt an verantwortliche Person senden
9. Human-in-the-Loop: Fachliche Prüfung, Korrekturen und finale Freigabe/Veröffentlichung
10. Logging und KPI-Schreibung im Orchestrator und optionaler Reporting-Struktur
```

### Prozess-Details

#### Input

| Parameter | Typ | Quelle | Validierung |
|-----------|-----|--------|-------------|
| Produktordnerpfad | String | Watch-Folder / Netzwerk-Share | Prüfen, ob Ordner der Namenskonvention entspricht und eine Marker-Datei READY.txt enthält |
| Produktfotos | Datei-Set (Bild) | Produktordner | Dateiformat (z. B. JPG/PNG), Mindestanzahl, Auflösung |
| Designbilder | Datei-Set (Bild) | Produktordner | Wie Produktfotos, zusätzlich Mindestanzahl für Designanalyse |
| Metadaten-Datei | Datei (z. B. CSV/JSON/Excel) | Produktordner | Vollständigkeit der Pflichtfelder (Grammatur, Material, Preis, Lagerbestand etc.) |
| KI-/API-Credentials | Credentials/Assets | UiPath Orchestrator | Vorhandensein und Lesbarkeit, Zugriff nur für Robots |

#### Output

| Output | Typ | Ziel | Format |
|--------|-----|------|--------|
| Neues Produkt in WooCommerce (Status: privat) | Entität im Shop | WooCommerce Webshop | Anlage über REST-API oder CSV-Import gemäß Export-Schema |
| Generierte Produkttexte | Text | WooCommerce-Felder (Titel, Kurzbeschreibung, Beschreibung, optional Meta) | UTF-8, strukturierte Absätze |
| Designanalyse (Farben, Muster, Stil, Merkmale) | Strukturierte Daten | Optional separate Ablage / Logging / Reporting | JSON oder strukturierter Text |
| Benachrichtigung an Reviewer | Nachricht | E-Mail / Collaboration-Tool | Nachricht mit Link zum Produkt und Checkliste |
| Prozess- und KPI-Logs | Logeinträge | UiPath Orchestrator / Reporting-Lösung | Standardisierte Log-Events mit Transaktions-ID |

#### Error Handling

- **Retry-Logik:** Technische Fehler bei externen Aufrufen (Vision-LLM, Text-LLM, WooCommerce-API) werden mit konfigurierter Retry-Logik (z. B. 3 Versuche mit Backoff) erneut versucht; Dateien und Queue-Items bleiben bis zur finalen Entscheidung (Success/Business Error/System Error) nachvollziehbar.
- **Error-Benachrichtigung:** Bei wiederholten technischen Fehlern oder nicht behebbaren Business-Fehlern (z. B. fehlende Pflichtdaten) wird eine Benachrichtigung an das verantwortliche Team versendet und das betroffene Produkt in einen Fehlerstatus überführt.
- **Fallback-Strategie:** Falls KI-Services nicht verfügbar sind, kann optional ein Fallback auf Platzhaltertexte oder reine technische Anlage ohne Beschreibung erfolgen; Produkte werden in diesem Fall deutlich gekennzeichnet und müssen vor Veröffentlichung manuell nachbearbeitet werden.

### Exception Handling

| Exception-Typ | Handling-Strategie | Retry | Benachrichtigung |
|---------------|-------------------|-------|------------------|
| System Exception (z. B. API-Timeout, Netzwerkfehler) | Transaction auf System Error setzen, konfigurierten Retry ausführen, technische Details loggen | Ja (begrenzt) | IT/Entwicklung per E-Mail oder Ticket |
| Business Exception (z. B. fehlende Metadaten, ungültige Ordnerstruktur) | Transaction auf Business Error setzen, Ordner kennzeichnen, Ursache im Log dokumentieren | Nein | Fachbereich/Prozessowner mit Hinweisen zur Korrektur |

## Orchestrator Design

### Queues

| Queue Name | Items pro Tag | Priorität | Retention |
|------------|---------------|-----------|-----------|
| UC-003-ProductOnboarding | 5–10 neue Produkte pro Woche (Peak-basiert) | Normal | 30 Tage |

### Assets

| Asset Name | Typ | Zweck | Umgebung |
|------------|-----|-------|----------|
| UC003_WC_ApiKey | Credential | Zugriff auf WooCommerce-REST-API (Produktanlage, Bild-Upload) | Dev/Prod |
| UC003_VisionLLM_Endpoint | Text | Basis-URL des Vision-LLM-Services | Dev/Prod |
| UC003_VisionLLM_ApiKey | Credential | Authentifizierung für Vision-LLM | Dev/Prod |
| UC003_TextLLM_Endpoint | Text | Basis-URL des Text-LLM-Services | Dev/Prod |
| UC003_TextLLM_ApiKey | Credential | Authentifizierung für Text-LLM | Dev/Prod |
| UC003_Notification_Targets | Text | Verteiler/Adresse(n) für Human-in-the-Loop-Benachrichtigungen | Dev/Prod |

### Schedules

| Schedule | Trigger | Frequenz | Robot Pool |
|----------|---------|----------|------------|
| UC-003-QueueWorker | Queue-basiert (UC-003-ProductOnboarding) | Laufend / alle X Minuten | Unattended RPA Robots für UC-003 |

## Integration

### Externe Systeme

#### WooCommerce REST API

**Typ:** HTTP/REST API  
**Zweck:** Anlage und Aktualisierung von Produkten, Upload und Zuordnung von Produktbildern, Pflege von Attributen, Kategorien und Tags  
**Authentifizierung:** API-Key / Basic Auth (über Orchestrator-Credentials verwaltet)  
**Rate Limits:** Shopspezifisch; im MVP werden niedrige Volumina (5–10 neue Produkte pro Woche) erwartet, sodass keine kritischen Limits zu erwarten sind

**Endpoints (Beispiele):**
- `/wp-json/wc/v3/products` – Anlage und Aktualisierung von Produkten
- `/wp-json/wc/v3/products/<id>/images` – Zuordnung von Produktbildern

#### Vision-LLM-Service

**Typ:** HTTP/REST API  
**Zweck:** Analyse von Designbildern zur Erkennung dominanter Farben, Muster, Stile und weiterer Merkmale  
**Authentifizierung:** API-Key (Header-basiert, im Orchestrator als Credential/Asset verwaltet)  
**Rate Limits:** Modell- bzw. Provider-spezifisch; im MVP ausreichend durch geringe Volumina

#### Text-LLM-Service

**Typ:** HTTP/REST API  
**Zweck:** Generierung von Produkttexten basierend auf strukturierten Prompts (Analyse-Output, Stammdaten, Textvorlagen)  
**Authentifizierung:** API-Key (Header-basiert, im Orchestrator als Credential/Asset verwaltet)  
**Rate Limits:** Modell- bzw. Provider-spezifisch; Monitoring der Token-/Kostenentwicklung empfohlen

### Datenfluss

```
Manueller Schritt: Bildbearbeitung & Produktordner vorbereiten
  │
  ▼
[Watch-Folder / Netzwerk-Share] ──(Dateien/Metadaten/READY.txt)──▶ [UiPath Robots]
  │                                              │
  │                                              ├─(HTTP/REST)──▶ [Vision-LLM-Service]
  │                                              │                 (Designanalyse)
  │                                              └─(HTTP/REST)──▶ [Text-LLM-Service]
  │                                                                (Produkttexte)
  ▼
[UiPath Orchestrator Queue (UC-003-ProductOnboarding)]
  │
  └─(HTTP/REST oder CSV)──▶ [WooCommerce Webshop]
              │
              └─(Benachrichtigung/Link)──▶ [Human Reviewer]
```

## Sicherheit

### Authentifizierung & Autorisierung

- **Robot-Credentials:** Unattended Robots erhalten dedizierte Service-Accounts mit minimal notwendigen Rechten auf Dateisystem, Orchestrator und externe APIs; Zugangsdaten werden ausschließlich über Orchestrator-Credentials verwaltet.
- **System-Zugriff:** Rollenbasierter Zugriff auf Orchestrator (Entwicklung, Betrieb, Fachbereich-Viewer) und WooCommerce-Backend; nur berechtigte Personen dürfen Produkte final veröffentlichen.
- **API-Keys:** KI- und WooCommerce-API-Keys werden als Credentials/Assets im Orchestrator hinterlegt, regelmäßig rotiert und nicht im Workflow-Code hartkodiert.

### Datenschutz

- **PII-Daten:** Es werden primär Produkt- und Bilddaten ohne personenbezogene Informationen verarbeitet; sollten in Ausnahmefällen PII auftauchen (z. B. Dateinamen mit Klarnamen), sind diese vor Verarbeitung zu bereinigen.
- **Verschlüsselung:** Transportverschlüsselung (HTTPS/TLS) für alle externen API-Aufrufe; ruhende Daten (Bilder, Logs) folgen den unternehmensweiten Verschlüsselungsrichtlinien.
- **Logging:** Logs enthalten keine sensiblen Inhalte der Bilder oder vollständige KI-Prompts, sondern verweisen über Transaktions-IDs und technische Status; Retention wird gemäß zentraler Logging-Policy (z. B. 30–90 Tage) konfiguriert.

### Compliance

- [x] GDPR-konform (keine oder nur minimale PII, klare Zweckbindung, Löschkonzepte über zentrale Policies)
- [ ] Weitere Anforderungen nach Bedarf des Kunden (z. B. branchenspezifische Vorgaben)

## Monitoring & Logging

### Metriken

| Metrik | Schwellwert | Alert | Dashboard |
|--------|-------------|-------|-----------|
| Fehlgeschlagene Transactions pro Tag (System Errors) | > 1 pro Tag über 3 Tage in Folge | Ja | Optionales UC-003-Dashboard im Orchestrator oder extern |
| Durchschnittliche Verarbeitungszeit pro Transaction (READY.txt bis Produkt privat) | > 45 Minuten | Ja | Orchestrator-Queue-Ansicht / Monitoring |

### Logging-Strategie

**Log-Level:**
- Info: Normaler Prozessverlauf (Ordner erkannt, Validierung erfolgreich, KI-Aufruf gestartet/beendet, Produkt erfolgreich angelegt).
- Warning: Nicht blockierende Auffälligkeiten (z. B. fehlende optionale Daten, KI-Confidence unter Schwelle, leichte Abweichungen von Namenskonventionen).
- Error: Prozessabbrüche oder Systemfehler (z. B. API-Fehler, fehlende Pflichtdaten, beschädigte Dateien).

**Log-Retention:** Entsprechend zentraler Vorgaben, z. B. 30 Tage für Detail-Logs und längere Aufbewahrung aggregierter KPI-Daten.

### Alerting

| Alert | Bedingung | Empfänger | Kanal |
|-------|-----------|-----------|-------|
| UC-003 System Error Spike | Mehrere System Errors in kurzer Zeit oder wiederholte Fehler bei externen APIs | IT/Entwicklung | E-Mail / Ticket-System |
| UC-003 Verarbeitungszeit überschreitet Schwellwert | Durchschnittliche Transaction-Dauer > definierter Schwelle | Betrieb / Prozessowner | E-Mail / Teams |

## Deployment

### Umgebungen

#### Development
- Orchestrator: [URL]
- Robots: [Anzahl & Typ]
- Test-Daten: [Quelle]

#### UAT
- Orchestrator: [URL]
- Robots: [Anzahl & Typ]
- Test-Daten: [Quelle]

#### Production
- Orchestrator: [URL]
- Robots: [Anzahl & Typ]
- High Availability: [Ja/Nein]

### CI/CD Pipeline

```
[Git] → [Build] → [Test] → [Package] → [Deploy to Dev] → [Deploy to UAT] → [Deploy to Prod]
```

**Tools:**
- Source Control: [Git/Azure DevOps/etc.]
- CI/CD: [Azure Pipelines/Jenkins/etc.]
- Package Management: [Orchestrator/UiPath Feed]

## Skalierung & Performance

### Performance-Anforderungen

| Metrik | Anforderung | Aktuell |
|--------|-------------|---------|
| Durchsatz | Verarbeitung von 5–10 neuen Produkten pro Woche ohne Backlog-Aufbau | Manuell, nicht standardisiert; abhängig von Verfügbarkeit der Fachanwender |
| Verarbeitungszeit | Automatisierte Pipeline von READY.txt bis privates Produkt in WooCommerce in < 30 Minuten | Noch nicht automatisiert gemessen |
| Verfügbarkeit | Hohe Verfügbarkeit während der üblichen Geschäftszeiten (z. B. 99 % Mo–Fr) | Noch nicht definiert, abhängig von Orchestrator-/Robot-Betrieb |

### Skalierungs-Strategie

- **Horizontal:** Bei steigenden Volumina können zusätzliche Unattended Robots dem UC-003-Queue-Worker-Pool zugewiesen werden.
- **Vertikal:** Bei Performance-Engpässen (z. B. lange KI-Antwortzeiten) können Robot-Maschinen mit mehr CPU/RAM oder schnelleren Netzwerkverbindungen ausgestattet werden.
- **Load Balancing:** Orchestrator verteilt Queue-Items gleichmäßig auf verfügbare Robots; zeitgesteuerte Läufe können so geplant werden, dass sie sich nicht mit anderen Lastspitzen überschneiden.

## Wartung & Support

### Wartungs-Fenster

- **Geplante Wartung:** Wartungsfenster für Orchestrator, Robots und ggf. KI-Integrationen werden außerhalb der typischen Produktanlegezeiten geplant (z. B. abends/wochenends); in dieser Zeit werden keine neuen Transactions gestartet.
- **Emergency-Patches:** Kritische Fehler (z. B. bei API-Änderungen von WooCommerce oder KI-Providern) werden über einen definierten Hotfix-Prozess adressiert, inklusive schneller Rollback-Möglichkeit.

### Support-Struktur

**L1 Support:** Betrieb/Service Desk (Überwachung der Queues, erste Fehlerannahme)  
**L2 Support:** UiPath-Entwicklungsteam (Analyse und Behebung von Workflow-/Integrationsthemen)  
**L3 Support:** Hersteller-/Provider-Support (UiPath, WooCommerce, KI-Provider) bei Produktfehlern oder Plattformproblemen

### Backup & Recovery

- **Backup-Frequenz:** Gemäß zentralen Backup-Policies für Orchestrator-Datenbanken, Konfigurationen und ggf. zusätzliche Reporting-Daten.
- **Recovery Time Objective (RTO):** z. B. < 4 Stunden für Wiederherstellung der Automatisierung im Fehlerfall (organisationseigene Vorgaben maßgeblich).
- **Recovery Point Objective (RPO):** Verlust maximal der seit dem letzten Backup gestarteten Transactions; einzelne Produktordner bleiben im Dateisystem erhalten und können erneut verarbeitet werden.

## Risiken & Mitigierung

| Risiko | Wahrscheinlichkeit | Impact | Mitigierung |
|--------|-------------------|--------|-------------|
| Schwankende KI-Qualität bei komplexen Mustern/Designs | Mittel | Mittel | Confidence-Schwellen definieren, Human-Review verpflichtend bei Unsicherheit, Taxonomie und Prompts iterativ verbessern |
| Änderungen an WooCommerce- oder KI-APIs | Mittel | Hoch | Technisches Monitoring, frühzeitige Tests in Nicht-Produktivumgebungen, klarer Prozess für Anpassungen und Hotfixes |

## Kosten

### Infrastruktur

| Komponente | Kosten (monatlich) | Kommentar |
|------------|-------------------|-----------|
| Orchestrator | abhängig vom vorhandenen Setup | Nutzung bestehender Orchestrator-Instanz, ggf. ohne zusätzliche Kosten |
| Robots | abhängig von Anzahl Unattended Robots | Skalierung nach Volumen; im MVP voraussichtlich mit bestehendem Robot-Pool abbildbar |
| Storage | geringfügig steigend | Zusätzlicher Bedarf durch Produktordner, Logs und Analyseartefakte |
| **Total** | **nach Kundenspezifikation zu konkretisieren** | |

### Lizenzierung

| Lizenz | Anzahl | Kosten | Total |
|--------|--------|--------|-------|
| UiPath Studio / StudioX | Nach Bedarf für Entwicklung und Wartung | Nach Kundentarif | Zu definieren |
| UiPath Unattended Robots | Mindestens 1 Robot für UC-003, perspektivisch skalierbar | Nach Kundentarif | Zu definieren |
| Orchestrator | In der Regel bereits vorhanden | Nach Kundentarif | Zu definieren |
| KI-Provider (Vision/Text) | Nutzungsbasiert (Token-/Aufrufkosten) | abhängig vom gewählten Modell | Zu definieren |

## Timeline

| Phase | Dauer | Start | Ende | Status |
|-------|-------|-------|------|--------|
| Design | ca. 2–3 Wochen | tbd | tbd | geplant |
| Development | ca. 4–6 Wochen | tbd | tbd | geplant |
| Testing | ca. 2–3 Wochen | tbd | tbd | geplant |
| Deployment | ca. 1–2 Wochen | tbd | tbd | geplant |
| Hypercare | ca. 2 Wochen | tbd | tbd | geplant |

## Anhänge

### Referenzen

- [UiPath Dokumentation](https://docs.uipath.com)
- Internes Dokument: Technische Analyse UC-003 in knowledge/usecases/uc-003-textile-design-classification/analysis.md
- Internes Dokument: Use Case Beschreibung UC-003 in knowledge/usecases/uc-003-textile-design-classification/README.md

### Änderungshistorie

| Version | Datum | Autor | Änderungen |
|---------|-------|-------|------------|
| 1.0 | 2026-01-02 | Sebastian Steer | Initiale Architektur für UC-003 auf Basis der technischen Analyse |

---

**Review & Approval**

| Rolle | Name | Datum | Signatur |
|-------|------|-------|----------|
| Architekt | | | |
| Product Owner | | | |
| Tech Lead | | | |
