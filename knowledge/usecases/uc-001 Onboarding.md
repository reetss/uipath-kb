# UC-001: Employee Onboarding and Offboarding

**Erstellt:** 2025-12-02  
**Autor:** Matthias Falland  
**Status:** Documented  
**Priorität:** High

**Technische Dokumentation:** [uc-001-onboarding-technical.md](../custom/uc-001-onboarding-technical.md)

---

## Geschäftskontext

### Problem / Herausforderung
Just like the customer service use case above, an RPA solution can be used to ensure employees experience a smooth welcome to (or exit from) an organization. For onboarding, bots can collate new hire data entry from the multiple systems needed to establish payroll, benefits, email, and systems access. This frees up HR personnel to focus on orientation, training and other high-value activities. Similarly, when an employee leaves an organization, RPA can ensure the admin aspect of the separation process is swift, consistent, and thorough. This includes the removal of employees from email distribution groups, cancellation of benefits, handling transfers or terminations in payroll and HR systems, and completion of all offboarding tasks across platforms.

### Ziele
- Automatisierung der administrativen Onboarding/Offboarding-Prozesse
- Reduzierung der Fehlerquote bei Systemzugriffen und Berechtigungen
- Beschleunigung des Onboarding-Prozesses von mehreren Tagen auf wenige Stunden
- Entlastung der HR-Abteilung für wertschöpfende Tätigkeiten
- Sicherstellung der vollständigen und zeitnahen Offboarding-Durchführung

### Erfolgskriterien
- 90% Zeitersparnis bei administrativen Aufgaben
- Fehlerrate < 1% bei Systemzugriffen
- Vollständige Audit-Trail für Compliance
- Onboarding-Zeit reduziert von 3 Tagen auf 4 Stunden
- 100% Abdeckung aller Offboarding-Schritte

## Beschreibung

### Ausgangssituation
- Manuelle Dateneingabe in 8-12 verschiedene Systeme
- Inkonsistente Prozesse zwischen Abteilungen
- Verzögerungen bei Systemzugriffen (oft mehrere Tage)
- Unvollständige Offboarding-Prozesse führen zu Sicherheitsrisiken
- HR-Mitarbeiter verbringen 60% der Zeit mit Admin-Aufgaben

### Gewünschtes Verhalten
**Onboarding:**
1. Neue Mitarbeiterdaten werden aus HR-System extrahiert
2. Bot erstellt automatisch Accounts in allen relevanten Systemen
3. E-Mail-Account wird angelegt und zu Distribution Groups hinzugefügt
4. Payroll-System wird aktualisiert
5. Benefits-Enrollment wird initiiert
6. IT-Hardware-Request wird erstellt
7. Willkommens-E-Mail mit Zugangsdaten wird versendet
8. Onboarding-Checklist wird in HR-System aktualisiert

**Offboarding:**
1. Kündigungsdatum wird aus HR-System gelesen
2. Systematische Deaktivierung aller Systemzugänge
3. Entfernung aus E-Mail Distribution Groups
4. Benefits-Cancellation
5. Payroll-Abschluss und Final Payment
6. IT-Hardware Return Request
7. Archivierung der Mitarbeiterdaten
8. Compliance-Report wird generiert

### Beteiligte Systeme
- HR Management System (z.B. SAP SuccessFactors, Workday)
- Active Directory / Azure AD
- E-Mail System (Exchange / Office 365)
- Payroll System (z.B. ADP, SAP)
- Benefits Administration Platform
- IT Service Management (z.B. ServiceNow)
- Building Access Control System
- Learning Management System (LMS)
- CRM / Sales Tools (bei Bedarf)
- Project Management Tools (z.B. Jira, Azure DevOps)

## Anforderungen

### Funktionale Anforderungen
1. **Onboarding**: Automatische Account-Erstellung in allen relevanten Systemen
2. **Offboarding**: Vollständige Deaktivierung aller Zugänge binnen 24h nach Kündigungsdatum
3. **Daten-Synchronisation**: Konsistente Mitarbeiterdaten über alle Systeme
4. **Benachrichtigungen**: Automatische E-Mails an relevante Stakeholder
5. **Checklisten**: Tracking des Prozessfortschritts in HR-System
6. **Exception Handling**: Manuelle Review bei System-Fehlern
7. **Audit-Trail**: Vollständige Dokumentation aller durchgeführten Aktionen
8. **Rollback**: Möglichkeit zur Rückabwicklung bei Fehlern

### Nicht-funktionale Anforderungen
- **Performance**: Vollständiges Onboarding in < 4 Stunden
- **Fehlerbehandlung**: REFramework mit Retry-Logic, manuelle Review-Queue bei persistenten Fehlern
- **Logging**: Detailliertes Logging in Orchestrator mit Sensitive Data Masking
- **Sicherheit**: Verschlüsselte Credential-Verwaltung, keine Passwörter in Logs, Compliance mit GDPR
- **Verfügbarkeit**: 99.5% Uptime, Fallback auf manuelle Prozesse bei Ausfall
- **Skalierbarkeit**: Verarbeitung von bis zu 50 Onboardings/Offboardings pro Tag

## Input / Output

### Input

| Input | Format | Quelle | Validierung |
|-------|--------|--------|-------------|
| Mitarbeiterdaten | JSON/XML | HR Management System | Pflichtfelder: Name, Abteilung, Position, Startdatum |
| Kündigungsdaten | JSON/XML | HR Management System | Pflichtfelder: Mitarbeiter-ID, Austrittsdatum, Kündigungsgrund |
| System-Templates | Config Files | Orchestrator Assets | Abteilungs-spezifische System-Zugänge |
| Berechtigungsmatrix | Excel/CSV | IT Security | Rolle-basierte Access Control |

### Output

| Output | Format | Ziel | Kriterien |
|--------|--------|------|-----------|
| Account-Credentials | E-Mail | Neue Mitarbeiter | Verschlüsselte Übermittlung |
| Onboarding-Report | PDF | HR Manager | Vollständige Checklist |
| Offboarding-Report | PDF | HR + IT Security | Compliance-Nachweis |
| Audit-Log | JSON | Orchestrator | Jede Aktion geloggt |
| Exception-Report | E-Mail | Process Owner | Bei Fehlern innerhalb 15 min |

## Besonderheiten / Randbedingungen

### Technische Constraints
- Active Directory API Zugriff erforderlich
- API-Authentifizierung für alle Cloud-Systeme (OAuth 2.0)
- VPN-Verbindung für On-Premise Systeme
- Rate Limits bei externen APIs beachten
- Legacy-Systeme eventuell nur via UI-Automation erreichbar

### Business Rules
- Onboarding erst 3 Tage vor Startdatum starten
- Offboarding am Kündigungstag um 18:00 Uhr durchführen
- Manager-Approval erforderlich für bestimmte Systemzugänge
- IT Security Review bei High-Privilege Accounts
- GDPR: Archivierung statt Löschung von Mitarbeiterdaten

### Abhängigkeiten
- HR Management System muss als Master Data Source dienen
- IT Service Management für Hardware-Requests
- Active Directory Sync muss funktionieren
- E-Mail System muss für Automatisierung freigegeben sein

## Offene Fragen

- Welche Legacy-Systeme können nur via UI-Automation angebunden werden?
- Gibt es unterschiedliche Onboarding-Prozesse für verschiedene Abteilungen?
- Wer hat die Berechtigung für manuelle Reviews bei Exceptions?
- Welche Systeme sind kritisch und benötigen sofortige Deaktivierung beim Offboarding?
- Wie wird mit Re-Hires umgegangen (alte Accounts reaktivieren oder neu erstellen)?

## Notizen

**Referenzen:**
- UIPath Documentation: HR Automation Best Practices
- Compliance: GDPR Article 5 (Data Minimization), Article 17 (Right to Erasure)
- Industry Standard: Average Onboarding Time sollte < 1 Tag sein

**Risiken:**
- Falsche Berechtigungen können zu Sicherheitslücken führen
- Unvollständiges Offboarding = Compliance-Risiko
- System-Downtimes können Onboarding verzögern

---

**Nächster Schritt:** Im Chat beauftragen mit "Dokumentiere bitte UC-001 technisch"
