# Auswahl der Architektur für UC-003 (Textile Design Classification & Produktanlage)

**Status:** Proposed  
**Datum:** 2025-12-17  
**Entscheider:** Shop-Owner / Architektur-Team  
**ADR-Nr:** UC-003-A1

---

## Context und Problem Statement

Für UC-003 sollen neue Designerstoffe weitgehend automatisiert im WooCommerce-Webshop angelegt werden. Der aktuelle Prozess ist stark manuell: Bilder werden per Hand bearbeitet und benannt, technische Produktdaten manuell gepflegt und Produkttexte freitextlich formuliert. Die WooCommerce-Anlage erfolgt ebenfalls händisch. Das führt zu:

- Hohem Zeitaufwand pro Produkt
- Inkonsistenten Beschreibungen und Attributen
- Fehlern bei Benennung und Import

Gleichzeitig gibt es bereits gute Erfahrungen mit Vision-LLMs zur Muster-/Farb-Klassifikation einzelner Stoffe. Ziel ist eine Architektur, die UiPath für die Orchestrierung nutzt, Vision-/Text-LLMs für Bildanalyse und Texterstellung einbindet und WooCommerce per API/CSV ansteuert – bei klar definiertem Human-in-the-Loop-Review vor der Veröffentlichung.

### Betroffene Bereiche

- UiPath Implementierung (REFramework, Orchestrator, Robots)
- KI-Integration (Vision-LLM, Text-LLM)
- E-Commerce-Landschaft (WooCommerce, Produktdatenprozesse)
- Datei- und Bildverarbeitungsprozesse (Watch-Folder, Adobe Lightroom/Photoshop)

## Decision Drivers

- Deutliche Reduktion der Durchlaufzeit je Produkt
- Hoher Automatisierungsgrad bei gleichzeitigem Human-in-the-Loop für Qualität
- Wiederverwendbare, skalierbare Architektur (auch für weitere Produktlinien)
- Saubere Integration in bestehende Tool-Landschaft (Adobe, WooCommerce)
- Minimierung rechtlicher und Datenschutz-Risiken bei KI-Nutzung

## Considered Options

- **Option 1**: UiPath REFramework + Vision-/Text-LLM + WooCommerce API/CSV + Adobe-Automatisierung (voll orchestrierter End-to-End-Prozess)
- **Option 2**: Reiner RPA-Prozess ohne KI (nur Datei-Handling, Adobe, WooCommerce)
- **Option 3**: Externer PIM/Commerce-Service für Produktanlage + Minimal-RPA für Bild-Upload

## Decision Outcome

**Gewählte Option**: "Option 1: UiPath REFramework + Vision-/Text-LLM + WooCommerce API/CSV + Adobe-Automatisierung"

Begründung: Diese Option ermöglicht den größten Hebel bei gleichzeitiger Wiederverwendung vorhandener KI-Experimente. Sie kombiniert robuste Orchestrierung (REFramework, Queues, Logging) mit KI-gestützter Bild- und Textgenerierung und integriert sich direkt in den bestehenden WooCommerce-Shop.

### Positive Consequences

- Höchster Automatisierungsgrad bei gleichzeitiger Kontrollmöglichkeit (Human-in-the-Loop)
- Klare Trennung von Orchestrierung (UiPath) und fachlicher Intelligenz (KI-Services)
- Wiederverwendbares Muster für weitere Content-/Produktprozesse
- Gute Beobachtbarkeit durch Orchestrator-Logging und Business-Logs

### Negative Consequences

- Höhere Komplexität im Vergleich zu reinem RPA (zusätzliche KI-Integrationen, Error-Handling)
- Abhängigkeit von externen KI-Diensten bzw. zusätzlichen Plattformen
- Notwendigkeit von Governance/Compliance-Freigaben für Bilddaten in KI-Services

### Confirmation

- Pilot-/MVP-Messungen: Durchlaufzeit, Automatisierungsgrad, Fehlerquote Import, Akzeptanz der KI-Texte
- A/B- oder Vorher-Nachher-Vergleich mit dem manuellen Prozess
- Regelmäßige Reviews der KI-Ergebnisse (Qualität der Farb-/Musterklassifikation, Textqualität)

## Pros and Cons of the Options

### Option 1: UiPath REFramework + Vision-/Text-LLM + WooCommerce API/CSV + Adobe-Automatisierung

**Beschreibung:**
End-to-End-Prozess in UiPath, der Bilder aus einem Watch-Folder verarbeitet, Adobe-Batches anstößt, Vision-/Text-LLMs aufruft und Produkte via WooCommerce-API oder CSV anlegt. Human-in-the-Loop vor Veröffentlichung.

**Pros:**
- ✅ Hoher Automatisierungsgrad und Zeitersparnis
- ✅ Flexible Erweiterbarkeit (Varianten, Mehrsprachigkeit, weitere Kanäle)
- ✅ Saubere Trennung von Concerns (Orchestrierung vs. KI-Logik)
- ✅ Gute Monitoring- und Fehlerbehandlungs-Möglichkeiten durch REFramework

**Cons:**
- ❌ Erhöhter Implementierungsaufwand
- ❌ Abhängigkeit von KI-Diensten und deren Kosten/SLAs
- ❌ Zusätzliche Governance-Vorgaben für den Umgang mit Bilddaten

### Option 2: Reiner RPA-Prozess ohne KI

**Beschreibung:**
UiPath automatisiert nur die technischen Schritte (Ordneranlage, Dateibenennung, Adobe, WooCommerce-Anlage). Bildanalyse und Texte bleiben manuell.

**Pros:**
- ✅ Geringere technische Komplexität
- ✅ Keine externen KI-Abhängigkeiten / geringere Datenschutzrisiken
- ✅ Schnellere erste Umsetzung möglich

**Cons:**
- ❌ Deutlich geringerer Nutzen, da Text- und Analyseaufwand beim Menschen bleibt
- ❌ Kaum Lerneffekt für KI-basierte Produktprozesse
- ❌ Weniger Differenzierungspotenzial im Markt

### Option 3: Externer PIM/Commerce-Service + Minimal-RPA

**Beschreibung:**
Ein spezialisiertes PIM-/Commerce-System übernimmt Produktstammdaten-Management und ggf. KI-Funktionen; UiPath nutzt es nur als Backend und kümmert sich primär um Bild-Upload.

**Pros:**
- ✅ Nutzung von Standardfunktionen eines PIM/Commerce-Systems
- ✅ Ggf. integrierte Workflows, Versionierung, Multi-Channel-Exports

**Cons:**
- ❌ Neue Plattform, Lizenzkosten, Integrationsaufwand
- ❌ Vendor-Lock-in und längere Einführungszeit
- ❌ Aktueller WooCommerce-Stack müsste teils neu gedacht werden

## More Information

### Related Decisions

- ADR-0001: MCP Server Architecture
- ADR-0002: Knowledge Base Structure
- ADR-0003: Documentation Validation Framework
- ADR-UC-002-A1: Architektur für UC-002 (HR Assistant)

### References

- Use Case: knowledge/usecases/uc-003-textile-design-classification/README.md
- Technische Analyse: knowledge/usecases/uc-003-textile-design-classification/analysis.md
- Architektur-Dokument: docs/architecture-uc-003-textile-design-classification.md

### Implementation Notes

- Verwendung des REFramework mit Queue pro Produkt (Stoff).
- KI-Aufrufe über HTTP Request Activities mit klar definierten JSON-Schemata.
- Config/Assets im Orchestrator für Pfade, APIs, Credentials.
- Strikter Human-in-the-Loop-Schritt vor Veröffentlichung im WooCommerce-Backend.

### Follow-up Tasks

- [ ] Finales Architekturreview mit Business/IT und Security
- [ ] Klärung der konkreten Vision-/Text-LLM-Plattform (Cloud vs. On-Prem)
- [ ] Definition der Namenskonventionen und Muss-Felder in WooCommerce
- [ ] Umsetzung des MVP gemäß Architektur-Dokument
- [ ] Nach Go-Live: ADR-Status auf "Accepted" setzen

---

**Änderungshistorie:**

| Datum      | Änderung           | Autor    |
|------------|--------------------|----------|
| 2025-12-17 | Initiale Version   | Copilot  |
