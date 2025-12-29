# UIPath Konzept: Best Practices & Guidelines

**Erstellt:** 2025-12-29  
**Version:** 1.0  
**Autor:** Knowledge Base Team  
**Kategorie:** Technical

---

## Übersicht

Dieses Konzept konsolidiert UIPath Best Practices, Patterns und Guidelines für Entwicklung, Orchestrator-Nutzung, Performance und Sicherheit. Es dient als zentrale Referenz für alle Automatisierungsprojekte und bildet die Grundlage für Architektur-Entscheidungen und Use-Case-Analysen.

## Kontext

### Problem

Ohne konsolidierte Best Practices entstehen inkonsistente Lösungen, schwer wartbare Workflows, Sicherheitsrisiken und Performance-Probleme. Wissen verteilt sich über Projekte, Personen und externe Quellen und ist schwer wiederzufinden.

### Motivation

Ein einheitliches Set an Best Practices:
- erhöht Qualität und Wartbarkeit von Prozessen,
- reduziert Projektrisiken (Fehler, Ausfälle, Security-Issues),
- beschleunigt Onboarding und Reviews,
- schafft eine gemeinsame Sprache zwischen Entwicklern, Architekten und Betrieb.

## Konzept-Details

### Beschreibung

Das Konzept "UIPath Best Practices & Guidelines" definiert verbindliche Empfehlungen für:
- **Entwicklung** (Projekt-Struktur, Code-Qualität, Logging, Error Handling),
- **Orchestrator** (Queue-Management, Asset-Management),
- **Performance & Skalierung** (Selektoren, Timeouts, Parallelisierung),
- **Sicherheit & Compliance** (Credentials, PII, Zugriffskonzepte).

Es wird kontinuierlich aus offiziellen UIPath-Quellen, Community-Beiträgen und eigenen Projekterfahrungen gepflegt.

### Schlüssel-Komponenten

#### 1. Entwicklungs-Guidelines

Richtlinien für Projekt-Struktur, Namenskonventionen, Versionierung, Error Handling, Logging und Kommentare.

**Eigenschaften:**
- Fördert modulare, wiederverwendbare Workflows.
- Stellt sicher, dass Fehler behandlungsfähig und nachvollziehbar sind.
- Verbessert Lesbarkeit und Review-Fähigkeit des Codes.

#### 2. Orchestrator-Guidelines

Empfehlungen für Queue-Design, Prioritäten, Deadletter-Handling, SLA-Tracking sowie Asset-Strategien.

**Eigenschaften:**
- Unterstützt skalierbare, robuste Verarbeitung über Queues.
- Erzwingt sicheres Handling von Credentials und Konfigurationen.
- Ermöglicht saubere Trennung von Umgebungen (Dev/UAT/Prod).

#### 3. Performance- und Skalierungs-Guidelines

Regeln für stabile Selektoren, sinnvolle Timeouts, Parallelisierung und Monitoring.

**Eigenschaften:**
- Vermeidet unnötige Wartezeiten und Timeouts.
- Ermöglicht horizontale Skalierung über mehrere Robots.
- Schafft Transparenz zu Durchsatz und Engpässen.

#### 4. Sicherheits- und Compliance-Guidelines

Vorgaben für Umgang mit Credentials, API Keys, PII-Daten, Audit-Trails und Berechtigungen.

**Eigenschaften:**
- Minimiert Sicherheitsrisiken und Audit-Findings.
- Unterstützt Prinzip der minimalen Rechte.
- Reduziert manuelle Kontrollen durch klare Standards.

### Thematische Leitlinien aus dem UiPath Automation Best Practice Guide

Dieses Konzept fasst die zentralen Inhalte des internen Dokuments "UiPath Automation Best Practice Guide" zusammen und strukturiert sie für die Wiederverwendung in Architektur, Entwicklung und Use-Case-Analysen.

#### 1. Naming Conventions & Artefakt-Strategien

- **Variablen & Argumente**: Klare, sprechende Namen (PascalCase), eindeutige Präfixe für Argument-Richtung (in_/out_/io_), eine Variable für genau einen Zweck, möglichst kleiner Scope.
- **Activities**: Jede Activity wird umbenannt, so dass Aufgabe und Ziel-Element erkennbar sind; das erleichtert Debugging und Log-Auswertung.
- **Workflows & Projekte**: Verb-basierte Workflow-Namen (z.B. GetTransactionData, ProcessTransaction), konsistente Projekt-Namen inkl. Domain/Abteilung und ID, klare Trennung von Dispatcher/Performer.
- **Orchestrator-Objekte**: Standardisierte Namensmuster für Robots, Environments, Assets und Queues, damit alle Artefakte schnell zuordenbar sind.
- **Konfigurationen**: Trennung zwischen hart codierten Konstanten, zentraler Config (Excel/JSON/Asset) und Orchestrator-Assets für environment-spezifische Werte.
- **Credentials & SecureString**: Immer über Credential-Assets oder sichere Stores beziehen; SecureString nur lokal und so kurz wie möglich im Scope in Plaintext umwandeln.
- **Code-Hygiene**: Vor dem Publish Aufräumen (unbenutzte Variablen, temporäre Logs, kommentierten Code entfernen, sinnvolle Beschreibungen und Annotations ergänzen).

**Beispiele:**

- Variable: CustomerName, TransactionNumber, HasOpenItems, ItemsTableDt.  
- Argument: in_ConfigPath, out_ValidationMessage, io_RetryCounter.  
- Projektname: FIN_010_InvoiceApproval, HR_005_EmployeeOnboarding.  
- Queue: FIN_010_InvoiceApproval_Queue.  
- Asset: C_365_FIN_010_InvoicePortal_Credentials (Credential-Asset mit Gültigkeit 365 Tage).

#### 2. Workflow-Design & Layouts

- **General Principles**: Prozesse werden in kleine, testbare Workflows zerlegt; komplexe Logik nicht in einem großen Sequence-Block verstecken.
- **Sequences**: Für lineare Schritte ohne komplexe Entscheidungen, mit begrenzter Anzahl Activities pro Datei.
- **Flowcharts**: Für Geschäftslogik mit mehreren Entscheidungen; in REFramework typischerweise in Process.xaml, möglichst angelehnt an das fachliche TO-BE-Diagramm.
- **State Machines**: Für wiederkehrende transaktionale Abläufe (z.B. REFramework), nicht für jedes Detail-Szenario.
- **Decisions**: Bewusste Wahl zwischen If/Flow Decision/If-Operator/Switch/Flow Switch, um Lesbarkeit zu optimieren und verschachtelte If-Kaskaden zu vermeiden.
- **Reusability**: Trennung von Business-Logik und Automations-Komponenten; wiederkehrende Aktionen (Login, Navigation, Init) als Libraries oder klar gekapselte Workflows.

#### 3. Error Handling & Logging

- **Business Rule vs. System Exceptions**: Klare Unterscheidung; BusinessRuleException für erwartbare fachliche Abweichungen (keine Retries), System-/Application Exceptions für technische Fehler.
- **Try/Catch-Einsatz**: Zielgerichtet verwenden – nur dort fangen, wo sinnvoll reagiert werden kann; ansonsten Exceptions nach oben durchreichen (Rethrow) und zentral behandeln.
- **Retry-Mechanismen**: Retry Scope für sporadische Fehler oder instabile UI-Situationen, REFramework-Retries nur für unerwartete Systemfehler.
- **Logging-Strategie**: Einheitlicher Einsatz von Log Leveln (Fatal, Error, Warn, Info, Trace), Logging an Workflow-Ein-/Austritt, bei Datenzugriffen, in Entscheidungs-Pfaden und bei jeder Exception.
- **Custom Log Fields**: Standardisierte Zusatzfelder (z.B. Process, TransactionId, BusinessKey) über Add Log Fields, um Monitoring/Reporting (Kibana, Insights, SIEM) zu verbessern.

**Beispiele:**

- Business Rule Exception: Wenn ein Pflichtfeld im Eingangsdokument fehlt, wird eine BusinessRuleException mit einer klaren, fachlichen Nachricht geworfen (inkl. Business-Key).  
- System Exception: Unerwarteter Selector-Fehler oder Datenbank-Timeout wird als System.Exception behandelt und durch das Framework ggf. automatisch erneut versucht.  
- Logging: Beim Start eines Workflows ein Info-Log ("Start ProcessInvoice"), beim Ende ein Info-Log ("End ProcessInvoice - Status=Success"), bei jeder Exception ein Error-Log mit Exception.Message und Business-Key.  
- Custom Fields: Vor der Verarbeitung eines Queue Items werden Felder wie ProcessName, TransactionId und CustomerId per Add Log Fields gesetzt und nach der Verarbeitung wieder entfernt.

#### 4. Framework: REFramework

- **Verwendung als Standard**: Für produktive, transaktionsbasierte Prozesse wird REFramework als Basis verwendet.
- **Strukturelle Regeln**: Vordefinierte States, Transitions und Logs möglichst nicht ändern; eigene Logik in separaten Workflows und klar dokumentierten Erweiterungen.
- **Init State**: Initialisierung von Config, Assets, Anwendungen und Verbindungen konsequent in InitAllApplications.xaml; kein Business-Processing an dieser Stelle.
- **Get Transaction Data**: Anpassung je nach Quelle (Queues, Tabellen, linearer Prozess), State aber immer beibehalten.
- **Process Transaction**: Fachlogik über aufgerufene Workflows, Behandlung vorhersehbarer Ausnahmen lokal (BRE, selektorspezifische Issues), unerwartete Fehler via Framework-Mechanismus.
- **End Process**: Zentrale Abschluss-Logik (z.B. Reports, Abschluss-Mails, Aufräumarbeiten), nicht verteilt über Einzelschritte im Prozess.

**Beispiele:**

- Config-Datei: Zentrale Excel-/JSON-Config mit Sektionen wie "Orchestrator" (QueueName, AssetName), "Applications" (Urls, Pfade) und "Logging" (LogLevel, CustomFields).  
- States: Init lädt Config und öffnet Anwendungen, GetTransactionData liest das nächste Queue Item, Process bearbeitet genau eine Transaktion, EndProcess schließt Anwendungen und verschickt einen Abschlussbericht.  
- Retry-Strategie: BusinessRuleExceptions führen zu "Business Exception"-Status ohne Retry, System.Exceptions werden über die in REFramework definierte Retry-Anzahl erneut versucht.

#### 5. UI Automation

- **Ansatzwahl**: Bevorzugt API-/Integrations-Ansätze, danach klassische/modern UIA mit stabilen Selektoren; Computer Vision und reine Image-Automation nur als letzte Stufe.
- **Input Methods**: Priorität: Simulate > SendWindowMessages > Hardware Events; dabei Hintergrundfähigkeit und Störanfälligkeit beachten.
- **Timeouts & Delays**: Timeouts zentral konfigurierbar halten, harte Delays vermeiden und stattdessen UI-Synchronisation (Element Exists, Check App State etc.) nutzen.
- **Selektoren**: Volatile Attribute bereinigen, Wildcards gezielt einsetzen, idx nur in Ausnahmefällen, Nutzung von Containern (Use Application/Browser) und relative/Anchor-basierte Ansätze.
- **Modern vs. Classic UIA**: Im modernen Modus konsequent mit Containern und eingebauten Anchors arbeiten; Legacy-Ansätze nur, wenn technische Gründe dagegen sprechen.

**Beispiele:**

- Selektor mit Wildcard im Fenstertitel, wenn sich Datumsanteile ändern können (z.B. title beginnt mit einem stabilen Teil und nutzt * für den variablen Rest).  
- Verwendung von Use Application/Browser als Container mit darin platzierten Click/Type-Into-Aktivitäten, die nur noch partielle Selektoren benötigen.  
- UI-Synchronisation über Check App State oder Element Exists, bevor Klicks durchgeführt werden, anstatt fester Delays.  
- Für Hintergrund-Automation bevorzugt SimulateType/SimulateClick oder SendWindowMessages verwenden, erst bei Bedarf auf Hardware-Events zurückfallen.

#### 6. Integrationen

- **E-Mail**: Standardisierte Patterns für Postfächer, Ordner-Handling und Authentifizierung; robustes Error Handling bei Verbindungs- und Formatfehlern.
- **Excel & Dateiverarbeitung**: Trennung von Datenzugriff und Business-Logik, Nutzung robuster Activities, klare Strategie für Dateipfade und Sperr-Situationen.

**Beispiele:**

- E-Mail: Für unbeaufsichtigte Szenarien bevorzugt serverseitige Protokolle (z.B. Exchange/O365/IMAP) statt direkter Outlook-Interaktion, insbesondere wenn die Robot-VM keinen aktiven User-Desktop hat.  
- Excel: Für einfache Lese-/Schreiboperationen Workbook-Aktivitäten verwenden; bei komplexen Makro-Szenarien oder Format-Anpassungen Excel Scope einsetzen, aber intensive, transaktionsnahe Schreibzugriffe vermeiden.

#### 7. Automation Lifecycle

- **Process Understanding**: Saubere Aufnahme und fachliche Dokumentation (PDD/DSD) als Voraussetzung für stabile Automatisierungen.
- **Dokumentation**: Strukturiertes Festhalten von Business Rules, Ausnahmen und Systemverhalten; enge Kopplung an Use-Case-Dokumente in der Knowledge Base.
- **Development & Code Review**: Nutzung der hier beschriebenen Guidelines als Review-Checkliste; konsequente Nutzung von Source Control und Branching-Strategien.
- **Test**: Systematische Unit-, Integration- und UAT-Tests inkl. negativer Szenarien, Fehlerpfade und Wiederanläufen.
- **Release & Betrieb**: Klar definierter Übergang in Produktion (inkl. Monitoring, Alerting, Rollback-Strategie) und regelmäßige Health-Checks der Prozesse.

### Funktionsweise

```
1. Konsolidierung von Best Practices aus offiziellen Docs, Community und Projekten.
2. Strukturierung nach Themen (Entwicklung, Orchestrator, Performance, Sicherheit).
3. Ableitung konkreter Do's & Don'ts inkl. Checklisten.
4. Nutzung in Architektur-Workshops, Code Reviews und Use-Case-Analysen.
5. Kontinuierliche Pflege basierend auf Projekterfahrungen und neuen UIPath Releases.
```

## Implementierung

### Voraussetzungen

- UIPath Entwicklungs- und Betriebsprozesse sind dokumentiert.
- Repository-Struktur für zentrale Dokumentation (dieses Projekt) ist etabliert.
- Verantwortliche für Pflege und Review der Best Practices sind benannt.

### Implementierungs-Schritte

#### Schritt 1: Einführung der Guidelines

- Dokument allen relevanten Stakeholdern vorstellen (Entwicklung, Architektur, Betrieb).
- Minimal-Set an verpflichtenden Regeln definieren (z.B. kein Hardcoding, Logging, Error Handling).
- In Onboarding-Material und Projekt-Templates verlinken.

#### Schritt 2: Integration in den Projekt-Workflow

- Checklisten (Vor Deployment, Code Review) in Definition-of-Done integrieren.
- Pull Requests / Reviews explizit gegen diese Guidelines prüfen.
- In Use-Case-Analysen (analysis.md) auf relevante Sections verweisen.

### Code-Beispiele

**VB.NET:**
```vb
' Beispiel für strukturiertes Logging in einem Try-Catch-Block
Try
    ' Business-Logik
Catch ex As Exception
    LogMessage("System Exception: " & ex.Message, LogLevel.Error)
    Throw
End Try
```

**C#:**
```csharp
// Beispiel für klare Namenskonvention und Logging
try
{
    ProcessInvoice(currentTransaction);
}
catch (Exception ex)
{
    LogMessage($"System Exception in ProcessInvoice: {ex.Message}", LogLevel.Error);
    throw;
}
```

## Best Practices

### Do's

✅ Verwende modulare, wiederverwendbare Workflows statt monolithischer XAML-Dateien.  
✅ Implementiere konsistentes Error Handling und strukturiertes Logging in allen kritischen Pfaden.  
✅ Nutze Orchestrator Assets für Credentials und environment-spezifische Konfigurationen.  
✅ Setze stabile, robuste Selektoren und valide sie regelmäßig.  
✅ Nutze Queues und Dispatcher/Performer-Pattern für skalierbare Verarbeitung.

### Don'ts

❌ Keine Hardcoded Credentials, URLs oder Pfade im Code.  
❌ Keine großen, unstrukturierten Workflows ohne klare Verantwortlichkeiten.  
❌ Kein Verzicht auf Logging oder nur sporadische Logs.  
❌ Keine fragilen Selektoren (z.B. nur idx, volatile aaname).  
❌ Keine unvalidierten direkten DB-Zugriffe aus Prozessen.

## Anwendungsfälle

### Use Case 1: Neuer produktiver End-to-End-Prozess

**Szenario:** Ein neuer geschäftskritischer Prozess (z.B. Kreditprüfung, Onboarding) soll produktiv gesetzt werden.

**Lösung:**
- Architektur auf Basis REFramework und ggf. Dispatcher/Performer gestalten.
- Projekt-Struktur, Logging und Error Handling gemäß Guidelines umsetzen.
- Vor Go-Live alle Checklisten (Deployment, Code Review) anwenden.

**Ergebnis:**
- Stabiler, skalierbarer Prozess mit klarer Nachvollziehbarkeit und geringem Betriebsrisiko.

### Use Case 2: Review eines bestehenden Prozesses

**Szenario:** Ein bestehender Prozess ist instabil oder schwer wartbar.

**Lösung:**
- Prozess mit Hilfe der Best-Practices-Checklisten bewerten.
- Identifizierte Anti-Patterns (Hardcoding, fehlendes Logging, schlechte Selektoren) gezielt refactoren.

**Ergebnis:**
- Verbesserte Stabilität, geringere Fehlerquote und besseres Monitoring.

## Vor- und Nachteile

### Vorteile

| Vorteil | Beschreibung | Impact |
|--------|--------------|--------|
| Einheitliche Standards | Gemeinsame Sprache und klare Erwartungshaltung | Hoch |
| Höhere Qualität | Weniger Fehler, bessere Wartbarkeit | Hoch |
| Schnellere Reviews | Checklisten-basiertes Vorgehen | Mittel |
| Besseres Onboarding | Neue Entwickler greifen auf klare Guidelines zu | Mittel |

### Nachteile

| Nachteil | Beschreibung | Mitigierung |
|----------|--------------|-------------|
| Initialer Aufwand | Erstellung und Pflege der Guidelines kosten Zeit | Klare Verantwortlichkeiten und iterative Pflege definieren |
| Widerstand gegen Änderungen | Teams müssen bestehende Arbeitsweisen anpassen | Kommunikation, Schulungen und Management-Support |

## Alternativen

### Alternative 1: Projekt-spezifische, informelle Regeln

**Beschreibung:** Jedes Projekt definiert eigene Regeln, oft nur mündlich oder in verstreuten Dokumenten.

**Vergleich:**
| Kriterium | Dieses Konzept | Alternative |
|----------|----------------|------------|
| Konsistenz | Hoch | Niedrig |
| Auffindbarkeit | Zentral | Verteilt |
| Pflegeaufwand | Zentralisiert | Pro Projekt |

**Empfehlung:**
- Die Alternative ist nur für sehr kleine, einmalige Automatisierungen akzeptabel.
- Für produktive, langfristige Prozesse sollte immer das zentrale Best-Practices-Konzept genutzt werden.

## Validierung

### Test-Kriterien

- [ ] Guidelines werden in Onboarding und Projekt-Start-Workshops verwendet.  
- [ ] Checklisten sind Teil des Deployment- und Review-Prozesses.  
- [ ] Mindestens ein bestehender Prozess wurde erfolgreich anhand der Guidelines refactored.  
- [ ] Bei Use-Case-Analysen wird explizit auf relevante Best Practices verwiesen.

### Erfolgsmetriken

| Metrik | Zielwert | Messmethode |
|--------|----------|-------------|
| Anzahl kritischer Incidents | Reduktion um X % | Betriebs- und Incident-Reports |
| Review-Dauer pro PR | Reduktion um X % | Messung der Review-Zeiten |
| Anteil Prozesse mit vollständigem Logging | > 90 % | Stichproben / Audits |

## Dependencies

### UIPath Komponenten

- **Studio:** 2021.x oder höher (empfohlen aktuell unterstützte LTS-Version).  
- **Robot:** Kompatibel zur verwendeten Studio-Version.  
- **Orchestrator:** Für Queue- und Asset-Management erforderlich.  
- **Activities:** Offizielle System-, UIAutomation- und Orchestrator-Packages, plus projektspezifische Libraries.

### Externe Dependencies

- Versionsverwaltung (z.B. Git, GitHub, Azure DevOps).  
- Logging- und Monitoring-Tools (z.B. Orchestrator Logs, Insights, externe SIEM-Systeme).  

## Wartung

### Bekannte Issues

| Issue | Severity | Workaround | Status |
|-------|----------|------------|--------|
| Uneinheitliche Anwendung in Alt-Projekten | Mittel | Guidelines schrittweise bei Refactorings anwenden | Offen |

### Roadmap

- **Q1 2026:** Ergänzung um konkrete Beispiel-Templates (Projekt-Layout, Logging-Framework).  
- **Q2 2026:** Erweiterung um spezialisierte Guidelines für Document Understanding und API-basierte Automatisierungen.

## Referenzen

### UIPath Dokumentation

- Official Docs: https://docs.uipath.com  
- Community Forum: https://forum.uipath.com

### Externe Quellen

- UIPath Academy Kurse zu Best Practices und Architektur.

### Interne Quellen / Kundenvorgaben

- UiPath Automation Best Practice Guide (Kundenvorgabe): siehe [knowledge/custom/UiPath Automation Best Practice Guide_md](knowledge/custom/UiPath%20Automation%20Best%20Practice%20Guide_md)

### Related Concepts

- Internes Dokument: knowledge/custom/best-practices.md

## Anhang

### Glossar

| Begriff | Definition |
|---------|------------|
| REFramework | Standardisiertes UIPath-Prozess-Template für robuste, transaktionsbasierte Verarbeitung |
| Dispatcher/Performer | Pattern zur Trennung von Datenerfassung (Dispatcher) und Verarbeitung (Performer) |
| PII | Persönlich identifizierbare Informationen, die besonders zu schützen sind |

### Änderungshistorie

| Version | Datum | Autor | Änderungen |
|---------|-------|-------|------------|
| 1.0 | 2025-12-29 | Knowledge Base Team | Initiale Version basierend auf best-practices.md |

---

**Tags:** `best-practices`, `guidelines`, `uipath`  
**Status:** Draft
