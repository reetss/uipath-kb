# UC-004: Covid-Kredite Monitoring & Datensicherheit

**Erstellt:** 2025-12-23  
**Autor:** Matthias Falland  
**Status:** Draft  
**Priorität:** High

---

## Geschäftskontext

### Problem / Herausforderung

Ein Fachbereich möchte auswerten und überwachen, welche Firmen Covid-Kredite erhalten haben, welche Beträge noch ausstehend sind und welche Firmen nicht oder nur teilweise zurückbezahlt haben. Es handelt sich dabei um hochsensible Daten mit grosser politischer und medialer Relevanz.

Diese Informationen dürfen auf keinen Fall an die Öffentlichkeit gelangen oder unkontrolliert geteilt werden. Der Kunde rechnet damit, dass Datensicherheit, Datenschutz und Nachvollziehbarkeit im Vordergrund stehen und im Rahmen von Mini-Tendern kritisch hinterfragt werden.

Der Kunde hat explizit betont, dass hier aufgezeigt werden soll, **wie** die Daten gemäss den Datenschutzvorgaben des Bundes geschützt werden und wie ein sicherer Zugriff für berechtigte Rollen (z.B. Controlling, Revision, Management) umgesetzt werden kann. Wenn diese Lösung tragfähig ist, soll sie als **Blaupause für alle zukünftigen kritischen Mini-Tender** dienen.

### Ziele

- Sichere Auswertung und Überwachung von Covid-Krediten pro Firma (bewilligt, ausstehend, zurückbezahlt, in Verzug)
- Umsetzung eines Sicherheits- und Datenschutzkonzepts, das den Vorgaben des Bundes entspricht (z.B. DSG / spezifische Verordnungen)
- Strikte Zugriffskontrolle nach Rollen und Need-to-know-Prinzip
- Lückenlose Nachvollziehbarkeit, wer wann auf welche Daten zugegriffen hat
- Reduktion des manuellen Aufwands bei gleichzeitiger Erhöhung der Datensicherheit
- Erstellung einer wiederverwendbaren Blaupause für weitere kritische Datenszenarien

### Erfolgskriterien

- Keine unautorisierten Zugriffe oder Datenabflüsse (technische und organisatorische Kontrollen nachweisbar)
- Fachbereich kann relevante Auswertungen (z.B. offene Beträge, Ausfallquoten) für berechtigte Rollen effizient bereitstellen
- Datenschutzbeauftragter und/oder Bundesstellen bestätigen, dass die Lösung den regulatorischen Vorgaben entspricht
- Lösung kann mit vertretbarem Aufwand auf weitere kritische Mini-Tender übertragen werden

---

## Beschreibung

### Ausgangssituation (AS-IS)

- Covid-Kreditdaten liegen heute verteilt in unterschiedlichen Systemen (z.B. Kernbankensystem, Data Warehouse, Excel-Listen, Fileshares).  
- Auswertungen werden manuell erstellt und teilweise per E-Mail oder Dateiablage geteilt.  
- Es ist unklar, wer effektiv Zugriff auf welche Detaildaten hat und ob der Zugriff durchgängig nach dem Need-to-know-Prinzip erfolgt.  
- Es gibt keine einheitliche technische Umsetzung der Datenschutzvorgaben des Bundes für diese spezifischen Daten (z.B. Verschlüsselung, Pseudonymisierung, Zugriffskontrollen, Logging).

Die Kombination aus politischer Brisanz und fehlender technischer Standardisierung führt zu hohem Risiko bei jeder neuen Auswertung oder Mini-Lösung.

### Gewünschtes Verhalten (TO-BE)

- Es existiert eine klar definierte, zentrale Lösung (oder Referenzarchitektur), über die Covid-Kreditdaten sicher bereitgestellt und ausgewertet werden.  
- Nur klar definierte Rollen (z.B. Controlling, Revision, wenige dedizierte Fachrollen) können auf identifizierende Einzelinformationen zugreifen.  
- Andere Stakeholder (z.B. Management) sehen nur aggregierte/anonymisierte Kennzahlen ohne Rückschluss auf einzelne Firmen.  
- Alle Zugriffe, Exporte und administrativen Tätigkeiten werden revisionssicher protokolliert und können im Audit nachgewiesen werden.  
- Das Sicherheitskonzept kann auf weitere kritische Datenszenarien übertragen werden.

---

## Beteiligte Systeme

(Stand heute: Annahmen, müssen mit Kunde/IT verifiziert werden.)

- Kernbankensystem / Kreditapplikation – operative Daten zu Covid-Krediten (Bewilligung, Saldo, Status)
- Data Warehouse / Reporting-Plattform – konsolidierte Finanz- und Kreditdaten
- Identitäts- und Zugriffssystem(e) – z.B. Active Directory / AAD / IdP des Kunden
- Mögliche Analytics-/Visualisierungsplattform – z.B. Power BI, internes Reporting-Portal, UiPath Apps o.ä.
- Archivierungssystem – für revisionssichere Ablage und Audit-Trails

---

## Anforderungen

### Funktionale Anforderungen

1. Sichere Bereitstellung von Covid-Kreditdaten (inkl. Status "offen", "in Verzug", "abgeschrieben") für berechtigte Rollen.
2. Filter- und Auswertungsmöglichkeiten nach Branche, Region, Betrag, Status, Zeitraum etc.
3. Möglichkeit, kritische Fälle (z.B. hohe Ausstände, bestimmte Branchen) zu identifizieren und für weitere Bearbeitung zu kennzeichnen.
4. Rollenbasierte Sichten: 
   - Detaillierte Einzelfallansicht nur für streng limitierte Nutzergruppen.
   - Aggregierte/anononymisierte Übersichten für Management und andere Stakeholder.
5. Protokollierung aller Zugriffe (lesen, exportieren, administrieren) mit Benutzer, Zeitpunkt und Operation.
6. Möglichkeit, Exporte zu kontrollieren bzw. einzuschränken (z.B. nur pseudonymisierte Exporte, Freigabeprozesse für Rohdatendownloads).

### Nicht-funktionale Anforderungen

- Strikte Einhaltung der Datenschutz- und Datensicherheitsvorgaben des Bundes
- Datenhaltung und -verarbeitung ausschliesslich in definierten Jurisdiktionen (z.B. Schweiz / EU) gemäss Vorgaben des Kunden
- Hohe Verfügbarkeit für berechtigte Nutzer, gleichzeitig starke Zugriffskontrollen (MFA, Netzwerksegmente, etc.)
- Klare Trennung von Test/Dev vs. Produktion (keine Produktivdaten in unsicheren Umgebungen)

---

## Input / Output

### Input

- Stammdaten zu Firmen mit Covid-Krediten (Name, Identifikatoren, Branche, Standort, etc.)
- Kreditdaten (bewilligter Betrag, ausstehender Betrag, Zahlungsverlauf, Status, Sicherheiten etc.)
- Regulatorische Vorgaben und interne Weisungen (Datenschutz, Aufbewahrungsfristen, Zugriffsregelungen)

### Output

- Sichere Dashboards/Reports mit:
  - Offenen und bereits zurückgezahlten Covid-Krediten
  - Ausfallquoten / Rückzahlungsmuster
  - Kritischen Fällen (z.B. hohe Beträge, lang überfällig)
- Nachweisbare Audit-Trails zu Zugriffen und Exporten
- Dokumentiertes Sicherheits- und Datenschutzkonzept für diesen Use Case (als Vorlage für weitere Mini-Tender)

---

## Besonderheiten / Randbedingungen

### Bekannte Probleme oder Einschränkungen

- Sehr hohe Sensitivität der Daten (politische und mediale Relevanz)
- Strenge regulatorische Vorgaben des Bundes hinsichtlich Datenschutz und Datensicherheit
- Heterogene Systemlandschaft, potenziell unterschiedliche Datenhaltung (on-prem, Cloud, Fileshares)
- Bisher keine einheitliche, etablierte Blaupause für kritische analytische Mini-Tender

### Offene Punkte

- Konkrete rechtliche Grundlagen und Weisungen (Bund, interne Richtlinien) für diesen Use Case im Detail
- Vorgaben zur Datenresidenz (nur Schweiz? Schweiz/EU?) und zur Verschlüsselung (Key-Management, HSM, etc.)
- Genaue Zielgruppe je Ansicht (wer darf was sehen?) und benötigte Rollen
- Anforderungen an Pseudonymisierung/Anonymisierung für bestimmte Zielgruppen
- Erwartete technische Plattformen (bestehende Tools vs. neue Komponenten)

---

## Notizen

- Kunde erwartet, dass Datensicherheit und Datenschutz im Zentrum des Gesprächs stehen und kritisch hinterfragt werden.
- Dieser Use Case soll als **Blaupause** für alle weiteren Mini-Tender mit kritischen Daten dienen.
- Wichtig ist eine verständliche Darstellung des Sicherheitskonzepts für Fachbereich, IT-Security und Datenschutzbeauftragte.

---

**Nächster Schritt:** Technische Analyse beauftragen mit "Dokumentiere bitte UC-004 technisch" bzw. Erstellung von analysis.md für Architektur, Rückfragen und Risiko-Assessment.
