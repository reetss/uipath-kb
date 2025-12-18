# UC-003: Automatisierte Produktanzeige von Designerstoffen im Webshop

**Erstellt:** 2025-12-16  
**Autor:** Sebastian Steer 
**Status:** Draft  
**Priorität:** High

---

## Geschäftskontext

### Problem / Herausforderung

Das Anlegen neuer Designerstoffe im WooCommerce-Webshop ist aktuell sehr manuell und zeitintensiv. Jeder neue Stoff erfordert das Anlegen von Ordnern, das Benennen und Bearbeiten von Fotos, die Erfassung technischer Produktdaten, das Erstellen ansprechender Produkttexte sowie das Hochladen ins Shopsystem. 

Konkrete Probleme:
- Hoher manueller Aufwand bei der Bildbearbeitung und Dateibenennung
- Inkonsistente Produktbeschreibungen und Farb-/Musterangaben
- Fehlende automatisierte Auswertung der Designbilder führt zu subjektiven und zeitaufwändigen Texten
- Langer Durchlaufzeitraum bis ein Produkt live im Shop ist
- Fehleranfälligkeit bei der Datenübertragung in WooCommerce

### Ziele

- Deutliche Beschleunigung des Produkt-Onboarding-Prozesses für neue Designerstoffe
- Automatisierte Bildverarbeitung, Design-Analyse und Texterstellung
- Konsistente und ansprechende Produktbeschreibungen durch KI-Unterstützung
- Reduktion manueller Schritte auf notwendige Kontrollen und Freigaben (Human-in-the-Loop)
- Vollständige Automatisierung wiederkehrender RPA-Schritte (Ordneranlage, Benennung, Import)

### Erfolgskriterien

- Reduktion der durchschnittlichen Zeit pro neuem Produkt von aktuell X Stunden auf unter Y Stunden
- Mindestens 80 % der Produkte können ohne größere manuelle Korrekturen automatisiert angelegt werden
- Positive Rückmeldung der Shop-Manager:innen zur Qualität der generierten Texte und Bildbeschreibungen (z. B. Bewertung > 4/5)
- Fehlerquote beim WooCommerce-Import unter 5 %

---

## Beschreibung

### Ausgangssituation (AS-IS)

- Neue Stoffe werden manuell mit Produktfotos (ca. 5 Stück) und Designbildern versehen
- Ordner und Dateinamen werden manuell angelegt und benannt
- Bildbearbeitung erfolgt manuell oder halbautomatisch in Lightroom/Photoshop 
- Technische Daten und Texte werden von Hand erfasst und formuliert
- Produkt wird manuell in WooCommerce angelegt und veröffentlicht

### Gewünschtes Verhalten (TO-BE)

- **Human**: Anlage eines Produktordners nach definierter Ordner- und Namenskonvention (z. B. Artikelnummer-Variante-01a-1 usw.) und Ablage von ca. 5 vorab manuell bearbeiteten Produktfotos (Tool-agnostisch, außerhalb dieses Use Cases) sowie 1–2 Designbildern. Wenn der Ordner vollständig vorbereitet ist, legt der Mitarbeiter eine Marker-Datei (z. B. `READY.txt`) im Produktordner an; diese Datei signalisiert, dass der Ordner zur Verarbeitung freigegeben ist.
- **RPA**: Überwachung des Watch-Folders auf neue, vollständig vorbereitete Produktordner, die eine Marker-Datei `READY.txt` enthalten, und Validierung der Ordner- und Dateinamen-Konvention (Fehlermeldung/Hint bei Abweichungen, perspektivisch optional automatisches Anlegen/Korrigieren der Struktur).
- **Human-in-the-Loop**: Kontrolle der bearbeiteten Fotos und Erfassung zusätzlicher Produktdaten (Grammatur, Materialzusammensetzung, Preis, Lagerbestand etc.)
- **Agent (KI)**: Bildanalyse der Designbilder mittels Vision-LLM zur Erkennung von:
  - 5 dominanten Farben (inkl. Hex-Codes)
  - Mustertyp (z. B. Blumen, Tiere/Insekten, Streifen, Geometrisch, Ornamente, Allover, Punkte, Karos, Animal-Print, Paisley, Retro, Maritim, Kinder-/Babymotive etc.)
  - Stil (z. B. verspielt, elegant, grafisch, extravagant, minimalistisch, romantisch, modern, vintage, skandinavisch, boho, sportlich, luxuriös)
  - Weitere mögliche Merkmale (z. B. Saison: Frühling/Sommer, Herbst/Winter; Use-Cases: Kinderkleidung, Heimtextilien, Dekostoffe, Bekleidung, Accessoires; Zielgruppe: Damen, Herren, Kinder, Unisex)
- **Agent (KI)**: Generierung ansprechender Produkttexte basierend auf Bildanalyse, technischen Daten und vordefinierten Textbausteinen/Vorlagen
- **RPA**: Anlage des Produkts in WooCommerce (per API oder CSV-Import) als „privat“ (nicht veröffentlicht)
- **RPA/Human-in-the-Loop**: Versand der Produkt-URL an verantwortliche Person zur finalen Prüfung und Freigabe (Veröffentlichung)

---

## Beteiligte Systeme

- Watch-Folder / Netzwerk-Share (Quelle für neue Produktfotos und Designbilder)
- UiPath Orchestrator, Studio & Robots (RPA-Automatisierung)
- Vision-LLM / KI-Service (z. B. GPT-4o, Claude, Grok oder internes Modell) für Bildanalyse
- Text-Generierungs-LLM (für Produktbeschreibungen)
- WooCommerce (Shop-System) mit API oder CSV-Import-Funktion
- E-Mail / Benachrichtigungssystem (für Human-in-the-Loop-Freigabe)

---

## Anforderungen

### Funktionale Anforderungen

1. Überwachung eines Watch-Folders auf neu angelegte, vollständig vorbereitete Produktordner mit vorab manuell bearbeiteten Produktfotos und Designbildern, die eine Marker-Datei (z. B. `READY.txt`) als explizites Freigabe-Signal enthalten.
2. Validierung der Ordnerstrukturen und Dateinamen gegen eine definierte Konvention (inkl. Feedback an den Mitarbeiter bei Abweichungen; perspektivisch optional automatisches Anlegen/Korrigieren der Struktur durch RPA).
3. Technische Prüfung der bereitgestellten Bilder (z. B. Dateiformat, Auflösung, Mindestanzahl) für alle Produktordner, die ein gültiges Freigabe-Signal (Marker-Datei `READY.txt`) besitzen – ohne Eingriff in die vorab manuelle, kreative Bildbearbeitung.
4. Bildanalyse der Designbilder (dominante Farben, Muster, Stil etc.) durch Vision-KI
5. Generierung von Produkttexten basierend auf KI-Analyse und manuellen Produktdaten
6. Anlage des Produkts in WooCommerce als „privat“ per API oder CSV-Import
7. Versand der Produkt-URL zur finalen Freigabe
8. Logging aller Schritte und Ergebnisse im Orchestrator
9. Möglichkeit zur manuellen Nachbearbeitung bei niedriger KI-Confidence

### Nicht-funktionale Anforderungen

- Verarbeitung eines neuen Produkts in unter 30 Minuten (ohne manuelle Kontrollzeiten)
- Hohe Genauigkeit der KI-Bildanalyse (mind. 90 % akzeptable Ergebnisse bei Testmustern)
- Stabile Integration mit WooCommerce und den angebundenen KI-Services
- Datenschutz: Designbilder und Fotos bleiben im internen Netzwerk, keine unkontrollierte Cloud-Nutzung falls möglich
- Versionierung von Textvorlagen und Prompt-Templates für die KI

---

## Input / Output

### Input

- Ca. 5 Produktfotos und 1–2 Designbilder (JPG/PNG/TIFF) im Watch-Folder
- Manuell erfasste Produktdaten (Grammatur, Preis, Material, Lagerbestand etc.)
- Definierte Namenskonventionen, Ordnerstrukturen und Textvorlagen
 - Marker-Datei (z. B. `READY.txt`) im Produktordner als explizites Freigabe-Signal für die Verarbeitung

### Output

- Ordnerstruktur mit korrekt benannten und bearbeiteten Fotos
- KI-generierte Design-Analyse (Farben, Muster, Stil etc.)
- Vollständige, ansprechende Produkttexte (Beschreibung, Titel, Meta etc.)
- Neues Produkt in WooCommerce (privat) mit allen Bildern, Daten und Texten
- Benachrichtigung mit Produkt-URL zur Freigabe
- Log-Einträge und ggf. Report über Verarbeitungsstatus

---

## Besonderheiten / Randbedingungen

### Bekannte Probleme oder Einschränkungen

- Qualität und Konsistenz der eingereichten Produktfotos kann variieren
- KI-Bildanalyse funktioniert bei komplexen Mustern unterschiedlich gut (aktuell „missbräuchlich“ über LLMs, aber effektiv)
- Abhängigkeit von vorgelagerten manuellen Bildbearbeitungs-Workflows (Qualität, Konsistenz, verfügbare Kapazitäten)
- WooCommerce-Import per CSV kann bei vielen Variationen komplex werden

### Offene Punkte

- Welche genaue Namenskonvention und Ordnerstruktur soll verbindlich gelten?
- Welche Vision-/Text-KI soll eingesetzt werden (Cloud vs. On-Prem, Kosten)?
- Wie sollen Textvorlagen und Prompts für die KI-Texterstellung gepflegt werden?
- Wer ist verantwortlich für die finale Freigabe und Taxonomie der Muster/Farben?
- Soll die Anlage auch Varianten (z. B. Farbstellungen) automatisiert unterstützen?
- Erwartete tägliche/monatliche Produktanzahl?

---

## Notizen

- Die aktuelle Lösung mit Vision-LLMs für Design-Analyse hat sich bereits als überraschend effektiv erwiesen (Beispiel: Schmetterlingsmuster)
- Mögliche spätere Erweiterung: Automatische Tag-Generierung für SEO oder Filter im Shop
- Potenzial für Feedback-Loop: Korrekturen der KI-Texte fließen in Prompt-Verbesserungen ein
 - Der Einsatz einer einfachen Marker-Datei (z. B. `READY.txt`) reduziert das Risiko, dass halbfertige Ordner verarbeitet werden, und trennt klar zwischen manueller Vorbereitungsphase (manuelle Bildbearbeitung etc.) und automatisierter Verarbeitung (KI, WooCommerce).

---

**Nächster Schritt:** Technische Analyse beauftragen mit "Analysiere bitte UC-004 technisch".