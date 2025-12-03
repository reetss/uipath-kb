# UC-001: Employee Onboarding Automation

**Erstellt:** 2025-12-03  
**Autor:** Matthias Falland  
**Status:** Draft  
**Priorität:** High

---

## Geschäftskontext

### Problem / Herausforderung

Unsere HR-Abteilung macht das Onboarding komplett manuell und das dauert ewig. Die Leute beschweren sich ständig, dass neue Mitarbeiter am ersten Tag keinen Laptop haben oder sich nicht einloggen können. 

Wir haben ca. 120 Neueinstellungen pro Jahr, verteilt auf München, Berlin und Hamburg. Die HR-Kollegen sagen, sie verbringen "gefühlt die Hälfte ihrer Zeit" mit dem Anlegen von Accounts und so.

### Ziele

- Onboarding soll schneller gehen (aktuell dauert es 2-3 Tage bis alles eingerichtet ist)
- Weniger Fehler bei Systemzugängen
- HR soll mehr Zeit für "echte" HR-Arbeit haben
- Irgendwie müssen wir das auch dokumentieren wegen Compliance (Wirtschaftsprüfer hat das letztes Jahr bemängelt)

### Erfolgskriterien

Noch nicht genau definiert. Der Fachbereich sagt "deutlich schneller" und "weniger Beschwerden".

---

## Beschreibung

### Ausgangssituation (AS-IS)

Wenn jemand Neues anfängt, macht die HR folgendes (ungefähr, jeder macht es ein bisschen anders):

1. Daten aus dem Arbeitsvertrag in SuccessFactors eingeben
2. IT-Ticket für Windows-Account aufmachen (geht über ServiceNow glaub ich)
3. Office 365 Lizenz zuweisen (macht eigentlich die IT, aber HR erinnert die immer)
4. Irgendwas mit SAP für die Zeiterfassung
5. Hardware bestellen
6. Manager informieren

Das Problem ist, dass keiner so richtig weiß, in welcher Reihenfolge das passieren muss und wer wann was macht. Manchmal vergisst jemand einen Schritt und dann fehlt dem neuen Mitarbeiter was.

### Gewünschtes Verhalten (TO-BE)

Der Bot soll das alles automatisch machen, sobald der Arbeitsvertrag unterschrieben ist. Am Ende soll der neue Mitarbeiter eine E-Mail mit seinen Zugangsdaten bekommen und alles funktioniert.

---

## Beteiligte Systeme

- **SAP SuccessFactors** - da sind die HR-Stammdaten drin
- **Active Directory** - für Windows-Accounts (läuft on-premise)
- **Office 365** - E-Mail und so
- **SAP** - irgendeine alte Version, die IT weiß das genauer. Für Zeiterfassung und Gehalt
- **ServiceNow** - für IT-Tickets und Hardware
- **Confluence** - Wiki, da sollen die Neuen auch Zugang bekommen

Die IT hat gesagt, dass man für manche Systeme APIs hat und für andere nicht. Details müssten wir noch klären.

---

## Anforderungen

### Funktionale Anforderungen

1. Bot soll neue Mitarbeiter aus SuccessFactors auslesen
2. Windows-Account anlegen (mit richtigem Namen und Abteilung)
3. E-Mail-Adresse erstellen
4. Irgendwie die richtigen Lizenzen zuweisen (es gibt verschiedene, je nach Position)
5. SAP-Zugang einrichten
6. Hardware bestellen (außer bei Praktikanten und Werkstudenten)
7. Manager benachrichtigen
8. Neue Mitarbeiter benachrichtigen mit Zugangsdaten

### Nicht-funktionale Anforderungen

- Soll stabil laufen
- Muss sicher sein (Passwörter und so)
- Sollte nicht zu lange dauern

---

## Input / Output

### Input

Neue Mitarbeiter kommen aus SuccessFactors. Da sind drin:
- Name, Vorname
- E-Mail (die gewünschte)
- Abteilung
- Position/Jobtitel
- Vorgesetzter
- Startdatum
- Standort

### Output

- Mitarbeiter hat alle Zugänge
- Mitarbeiter bekommt E-Mail mit Infos
- Manager bekommt Info
- Hardware ist bestellt

---

## Besonderheiten / Randbedingungen

### Bekannte Probleme

- SAP ist alt und hat keine API. Da muss man irgendwie "klicken"
- Manche Abteilungen haben Sonderwünsche (IT braucht mehr Rechte, Sales braucht CRM-Zugang)
- Bei Managern ist irgendwas anders mit den Lizenzen

### Offene Punkte

- Wer gibt die Credentials frei?
- Wie läuft das mit VPN?
- Was passiert wenn ein System nicht erreichbar ist?
- Brauchen wir das auch für Offboarding?

---

## Notizen aus dem Erstgespräch

*Meeting mit Hr. Müller (HR-Leitung) am 28.11.2025:*

- "Das muss schnell gehen, der Vorstand will Ergebnisse sehen"
- "Bitte nicht zu kompliziert, unsere Leute sind keine Techniker"
- "Das mit dem SAP ist schwierig, da hat keiner Lust drauf"
- "Frag mal den Peter aus der IT wegen den technischen Details"
- Erwähnte irgendwas von "GDPR" und dass wir aufpassen müssen

---

**Nächster Schritt:** Technische Analyse beauftragen
