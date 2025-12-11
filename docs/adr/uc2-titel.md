# Auswahl der Architektur für UC-002 (HR Assistant)

**Status:** Accepted  
**Datum:** 2025-12-11  
**Entscheider:** HR Automation Team  
**ADR-Nr:** UC-002-A1

---

## Context und Problem Statement

HR-Prozesse (E-Mail-Ingestion, Dokumentenablage, inhaltliche Analyse, Matching, Terminierung) sollen für Bewerbungen automatisiert werden. Die Lösung muss Gmail/Drive/Calendar anbinden, Dokumente robust verarbeiten (OCR/Parsing), semantisch matchen (LLM/Agentic) und belastbar im Betrieb laufen (Logging/Retry, Orchestrator).

### Betroffene Bereiche

- MCP-Server (Recherche, Forum/Docs/Reddit)  
- Knowledge Base (Use Case Dokumentation)  
- UiPath Implementierung (REFramework, DU, GSuite, Agentic)

## Decision Drivers

- Stabilität und Wiederholbarkeit (REFramework, Queues)  
- Datenschutz/DSGVO bei LLM-Nutzung  
- Wartbarkeit (klare Ordnerschemata, Logging, Assets)  
- Kosten (LLM/API) und Time-to-Value (MVP)  
- Integration mit Google Workspace (APIs, Rechte)

## Considered Options

- Option 1: REFramework + DU + Agentic (LLM) + GSuite APIs  
- Option 2: Reines DU ohne LLM (regelbasiertes Matching)  
- Option 3: Externes ATS + leichte UiPath-Orchestrierung

## Decision Outcome

**Gewählte Option**: "Option 1: REFramework + DU + Agentic (LLM) + GSuite APIs"

Begründung: Maximale Flexibilität und Qualität beim semantischen Matching, etablierte Stabilitäts- und Fehlerbehandlungs-Pattern, direkte Integration mit Gmail/Drive/Calendar.

### Positive Consequences

- Robuste Verarbeitung und klare Betriebsverfahren (Retry/Logging)  
- Höhere Matching-Qualität durch LLM  
- Gute Erweiterbarkeit (Mehrsprachigkeit, Templates)

### Negative Consequences

- LLM-Kosten und Datenschutzklärung notwendig  
- Komplexere Pipeline (DU + LLM)  
- Mehr initiale Integration (APIs, Assets)

### Confirmation

- MVP-Metriken: Durchlaufzeit, Automatisierungsgrad, Genauigkeit/Fehlerquote, Kosten/Bewerbung  
- Testfälle: fehlende Dokumente, schlechte OCR, API-Token-Expiry, Kalender-Konflikte  
- Review: HR-Abnahme und Security/Fach-Review

## Pros and Cons of the Options

### Option 1: REFramework + DU + Agentic (LLM) + GSuite APIs

**Pros:**
- ✅ Stabil, bewährt, skalierbar  
- ✅ Best-in-class Analyse via LLM  
- ✅ Direkte Google Workspace Integration

**Cons:**
- ❌ Kosten/DSGVO-Freigaben  
- ❌ Komplexere Implementierung

### Option 2: Reines DU ohne LLM

**Pros:**
- ✅ Kostengünstiger, einfacher  
- ✅ Weniger Datenschutz-Fragestellungen

**Cons:**
- ❌ Schwächeres semantisches Matching  
- ❌ Mehr Regelpflege, geringere Flexibilität

### Option 3: Externes ATS + leichte UiPath-Orchestrierung

**Pros:**
- ✅ Best-of-breed ATS-Funktionen  
- ✅ Weniger Eigenentwicklung

**Cons:**
- ❌ Lizenz/Integration/Komplexität  
- ❌ Vendor-Lock-in, geringere Kontrolle

## More Information

### Related Decisions

- ADR-0002: Knowledge Base Structure  
- ADR-0003: Documentation Validation Framework

### References

- `knowledge/usecases/uc-002-hr-assistant/README.md`  
- `knowledge/usecases/uc-002-hr-assistant/analysis.md`  
- `docs/usecase-workflow.md`

### Implementation Notes

- Assets: API Credentials in Orchestrator (Gmail/Drive/Calendar, LLM)  
- Drive-Schema und Templates vorab freigeben  
- REFramework: Queue-Item = Bewerbung; Retry-Strategie  
- DU Pipeline + LLM Match; Threshold 60 (anpassbar)

### Follow-up Tasks

- [ ] IT Security/DSGVO-Freigaben für LLM/Workspace APIs  
- [ ] Drive-Ordnerschema und E-Mail-Templates definieren  
- [ ] MVP bauen und Metriken tracken  
- [ ] Review/Abnahme und ADR-Status auf Accepted setzen

---

**Änderungshistorie:**

| Datum | Änderung | Autor |
|-------|----------|-------|
| 2025-12-11 | Initiale Version | Copilot |
| 2025-12-11 | Status auf Accepted | Copilot |
