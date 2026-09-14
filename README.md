# Dolchherz Charakterbogen für Obsidian

Interaktiver Charakterbogen für das Daggerheart-Rollenspiel (deutsche
Übersetzung). Der Bogen wird als Code-Block direkt in einer Markdown-Notiz
gerendert; alle Charakterdaten liegen im YAML-Frontmatter der Notiz.

## Funktionen

- **Ribbon-Button links**: öffnet die Ansicht **Dolchherz Charaktere** mit allen
  Charakteren im Vault sowie den Schaltflächen **Neuen Charakter erstellen** und
  **Bogen in aktive Notiz einfügen**.
- **Code-Block `daggerheart-sheet`**: rendert den vollständigen Bogen mit Kopf
  (inklusive Porträt), Schaden & Gesundheit, Attributen & Erfahrungen,
  Rüstung & Waffen, Fähigkeiten, Seelentier, Domänenkarten, Inventar & Gold,
  Stufenaufstieg und einer Schaltfläche zum Löschen der Charakterdaten.
- **Code-Block `daggerheart-overview`**: Tabelle aller Charaktere im Vault mit
  Name, Klasse, Subklasse, Stufe und Rang.
- **Automatische Berechnungen** nach Regelwerk: Rang, Übung, Ausweichen,
  Rüstungswert, Schadensschwellen (Basisschwellen der Rüstung + Stufe),
  TP- und Stress-Maximum sowie der Schadenswurf der ausgerüsteten Waffe.
- **Ausrüstungsboni**: Merkmale von Rüstung und ausgerüsteten Waffen werden für
  Ausweichen, Agilität und Rüstungswert ausgewertet (z. B. „Flexibel“,
  „Sehr schwer“, „Schützend“).
- **Interaktive Tracker**: TP, Rüstung, Stress und Hoffnung per Klick.
- **Schadensrechner**: Schwellenlogik (Leicht 1, Mittel 2, Schwer 3 TP),
  optionale Resistenz (halber Schaden) und Reduzieren durch Markieren eines
  Rüstungsfelds.
- **Zustände**: Versteckt, Festgesetzt und Verwundbar als Schalter, inklusive
  Kurzregel und Warnung bei vollem Stress oder vollständig markierten TP.
- **Fähigkeiten**: Klassen-, Hoffnungs- und Subklassenfähigkeiten sowie
  Abstammung und Gemeinschaft; beim Druiden zusätzlich die Bestiengestalten des
  erreichten Rangs. Jede Kategorie ist einzeln ein- und ausklappbar.
- **Seelentierbogen** für die Waldläufer-Subklasse Bestienbund: Ausweichen,
  Stress, Schadenswürfel, Distanz, Schadenstyp, Erfahrungen und die
  Ausbildungs-Optionen des Stufenaufstiegs.
- **Stufenaufstieg**: Rang-Errungenschaften auf Stufe 2, 5 und 8 sowie die
  Fortschritte (zwei Attribute, TP-/Stressfelder, Erfahrungen, Ausweichen,
  Übung, Domänenkarten, Subklassenkarte und Multiklasse ab Stufe 5).
- **Domänenkarten**: Verwaltung von Auslage (höchstens 5 Karten) und Reserve;
  das Bewegen einer Karte aus der Reserve markiert Stress in Höhe ihrer
  Rückrufkosten.
- **Porträts**: Bild für Charakter und Seelentier aus dem Vault, mit wählbarem
  Seitenverhältnis (Automatisch, 1:1, 3:2, 2:3) und Großansicht per Klick.
- **Inventar & Gold**: Auswahl aus Beute und Verbrauchsgütern, freie Einträge
  mit Anzahl sowie Gold in Handvoll, Beutel und Truhe.
- **Multi-Charakter-Verwaltung** mit Übersichtsansicht sowie JSON-Export und
  -Import je Notiz. Die Charakterdaten lassen sich wieder aus der Notiz
  entfernen, die Notiz selbst bleibt erhalten.

## Installation

```bash
cd dolchherz.charakter
npm install
npm run build
npm run deploy
```

`npm run deploy` kopiert `main.js`, `manifest.json` und `styles.css` nach
`.obsidian/plugins/dolchherz-charakterbogen/` im Vault; ein früherer Ordner
unter dem alten Namen wird dabei entfernt. Danach das Plugin in Obsidian unter
**Einstellungen > Community-Plugins** aktivieren. Vorausgesetzt wird Obsidian
1.4.0 oder neuer ([`manifest.json`](manifest.json)).

Beide Skripte gehen davon aus, dass der Projektordner direkt im Vault liegt: Die
Vault-Wurzel ist der übergeordnete Ordner des Projekts. `npm run deploy` legt den
Plugin-Ordner dort unter `.obsidian/plugins/` an, und `npm run sync-data` liest
die Quelldaten aus `../data`.

Für die Entwicklung: `npm run dev` startet den esbuild-Watch-Modus, danach
jeweils `npm run deploy` ausführen oder die Dateien direkt kopieren.

## Verwendung

1. Links in der Symbolleiste auf **Dolchherz: Charakterübersicht** klicken oder
   den Befehl **Charakterübersicht öffnen** ausführen. Die Ansicht listet alle
   Charaktere und bietet die Schaltflächen **Neuen Charakter erstellen** und
   **Bogen in aktive Notiz einfügen**.
2. Beim Anlegen eines Charakters Name und Klasse wählen. Optional
   **Empfohlene Werte übernehmen** setzt Attribute, Startwaffen, Rüstung und
   Gold aus den Klassendaten; das **Startinventar** wird kommagetrennt
   eingegeben (eine führende Zahl gilt als Anzahl, z. B. „3 Fackel“). Die Notiz
   wird im Charakterordner mit Frontmatter und `daggerheart-sheet`-Block
   erstellt.
3. Alternativ den Code-Block direkt in eine Notiz einfügen, über den Befehl
   **Charakterbogen-Codeblock einfügen** oder von Hand:

   <pre>
   ```daggerheart-sheet
   ```
   </pre>

4. Falls noch kein Frontmatter existiert, bietet der Bogen die Schaltfläche
   **Charakterbogen anlegen** an.
5. Für eine Übersicht innerhalb einer Notiz einen `daggerheart-overview`-Block
   einfügen.

### Befehle

- **Charakterübersicht öffnen**
- **Charakterbogen-Codeblock einfügen**
- **Charakterübersicht-Codeblock einfügen**
- **Neuen Charakter erstellen**
- **Charakter als JSON exportieren** (schreibt eine `.json` neben die Notiz)
- **Charakter aus JSON importieren** (Dateiauswahl aus dem Vault)

## Daten

Das Plugin nutzt die deutschen SRD-Spieldaten vollständig:

| Datei | Einträge |
| --- | --- |
| `klassen.json` | 9 |
| `subklassen.json` | 54 |
| `waffen.json` | 192 |
| `ruestungen.json` | 34 |
| `abstammungen.json` | 18 |
| `gemeinschaften.json` | 9 |
| `domaenen.json` | 189 |
| `beute.json` | 60 |
| `verbrauchsgueter.json` | 60 |

Die Daten liegen in zwei Ebenen vor:

1. **Gebündelte Standarddaten** in [`src/data/bundled`](src/data/bundled), beim
   Build in das Plugin eingebettet. Erzeugt über `npm run sync-data` aus
   `../data`.
2. **Optionaler Vault-Override** über den konfigurierbaren Datenordner
   (Standard `data/`). Enthält der Ordner gültige Dateien, ersetzt er die
   gebündelten Daten. Änderungen im Ordner werden über die Dateizeit erkannt und
   zwischengespeichert.

Für den Override erwartet der Lader Waffen und Rüstungen unter den Schlüsseln
`waffen` und `ruestungen`, Beute und Verbrauchsgüter unter `items` sowie die
Domänenkarten als reine Liste. Als Alternative zu `domaenen.json` liest er
`faehigkeiten.json`. Weitere Dateien im Datenordner (etwa `gegner.json`,
`schauplaetze.json` oder `regelwerk.md`) wertet dieses Plugin nicht aus.

## Frontmatter-Schema

Alle Auswahlfelder verweisen per Namen auf die Spieldaten. Dieses Beispiel
entspricht dem Gerüst, das **Charakterbogen anlegen** und **Neuen Charakter
erstellen** schreiben:

```yaml
daggerheart:
  type: character
  version: 1
  name: ""
  pronomen: ""
  portrait: ""
  portraitFormat: 1:1
  klasse: ""
  subklasse: ""
  stufe: 1
  herkunft: { abstammung: "", gemeinschaft: "", gemischt: false, abstammungsfaehigkeiten: [] }
  attribute: { agilitaet: 0, staerke: 0, geschick: 0, instinkt: 0, praesenz: 0, wissen: 0 }
  attributMarkierungen: []
  ausweichenBonus: 0
  uebung: 1
  fortschritteOffen: 0
  ruestung: { name: "", markierteFelder: 0 }
  tpMarkiert: 0
  stressMarkiert: 0
  hoffnung: 2
  tpZusatz: 0
  stressZusatz: 0
  erfahrungen: [ { name: "", mod: 2 }, { name: "", mod: 2 } ]
  waffen: { primaer: "", sekundaer: "", inventar: [] }
  domaenenkarten: { auslage: [], reserve: [] }
  multiklasse: { klasse: null, domaene: null, klassenfaehigkeit: null, subklasse: null, auslage: [] }
  zustaende: []
  inventar: []
  seelentier:
    name: ""
    tier: ""
    portrait: ""
    portraitFormat: 1:1
    schadenswuerfel: W6
    distanz: unmittelbar
    schadenstyp: phy
    stressMarkiert: 0
    erfahrungen: [ { name: "", mod: 2 }, { name: "", mod: 2 } ]
    ausbildung: []
  gold: { handvoll: 0, beutel: 0, truhe: 0 }
  notizen: ""
```

- `portrait` und `seelentier.portrait` enthalten Vault-Pfade zu Bilddateien,
  `portraitFormat` das Seitenverhältnis der Miniatur (`auto`, `1:1`, `3:2`, `2:3`).
- `fortschritteOffen` zählt die noch offenen Fortschritts-Felder der aktuellen
  Stufe (0 bis 2).
- `zustaende` enthält die Bezeichner `versteckt`, `festgesetzt` und `verwundbar`.
- `tpZusatz`, `stressZusatz` und `ausweichenBonus` sind dauerhafte Zuschläge aus
  Fortschritten; `abstammungsfaehigkeiten` ist nur bei gemischter Abstammung gefüllt.
- Fehlende Felder werden beim Laden mit Standardwerten aufgefüllt, damit auch
  handgeschriebene oder ältere Notizen gerendert werden können. Ein früheres Feld
  `beute` wird dabei ins `inventar` übernommen; beim Zurückschreiben erscheint
  `beute` dann als leere Liste.

## Einstellungen

- **Datenordner** (Standard `data`): Vault-Ordner mit den JSON-Spieldaten.
- **Vault-Daten verwenden** (Standard an): aktiviert den Override.
- **Charakterordner** (Standard `Charaktere`): Zielordner für neue
  Charakter-Notizen.
- **Massiver Schaden** (Standard aus): optionale Regel — erreicht der Schaden
  das Doppelte der Schweren Schwelle, werden 4 TP markiert.
- **Rang-Errungenschaften automatisch anwenden** (Standard an): setzt beim
  Stufenaufstieg Übung, neue Erfahrung und das Löschen der Attributmarkierungen
  automatisch.

## Projektstruktur

- [`src/main.ts`](src/main.ts): Plugin-Einstieg, Code-Blöcke, Ribbon, Befehle, Einstellungen.
- [`src/view/CharacterHubView.ts`](src/view/CharacterHubView.ts): Übersichtsansicht.
- [`src/model`](src/model): Typen für Charakter und Spieldaten.
- [`src/logic`](src/logic): reine, getestete Regelberechnungen (abgeleitete Werte,
  Stufenaufstieg, Seelentier, Zustände, Inventar-Eingabe).
- [`src/data`](src/data): Datenlader und gebündelte Daten.
- [`src/frontmatter`](src/frontmatter): Lesen und Schreiben des Frontmatters.
- [`src/render`](src/render): Renderer, Sektionen des Bogens, Porträts und Übersicht.
- [`src/character`](src/character): Anlegen neuer Notizen sowie JSON-Export und -Import.
- [`src/settings`](src/settings): Einstellungen und Einstellungsdialog.
- [`src/ui`](src/ui): Dialoge für neue Charaktere, Bildauswahl und JSON-Auswahl.
- [`src/util`](src/util): kleine Formatierungshelfer.
- [`scripts`](scripts): `deploy.mjs` und `sync-data.mjs`.
- [`tests`](tests): Unit-Tests mit Vitest.

## Tests

```bash
npm test
```

Abgedeckt sind die abgeleiteten Werte (Rang, Übung, Ausweichen, Rüstungswert,
Schadensschwellen, Schadenswurf, TP-Markierungen, Zauber-Attribut,
Attributverteilung), Stufenaufstieg und Fortschritte, die Seelentier-Regeln,
Zustände und das Zerlegen von Inventar-Eingaben.

## Hinweise und Einschränkungen

- Das Regelwerk nennt keinen expliziten Höchstwert für Hoffnung; die Anzeige
  verwendet 6 als Obergrenze ([`HOFFNUNG_MAX`](src/logic/derived.ts)). Die
  Seelentier-Ausbildung **Licht im Dunkeln** erhöht sie um 1.
- Merkmalsboni werden nur für Ausweichen, Agilität und Rüstungswert ausgewertet.
  Weitere Boni aus einzelnen Fähigkeiten, etwa auf Schadensschwellen, werden
  nicht automatisch angewendet.
- Der Hinweis zur Attributverteilung (+2/+1/+1/+0/+0/−1) erscheint nur auf Stufe 1.
- Das Seelentier wird nur bei der Klasse Waldläufer mit der Subklasse Bestienbund
  eingeblendet; die Ausbildungs-Optionen stehen ab Stufe 2 entsprechend der
  erreichten Stufe zur Verfügung.
- Domänenkarten der Auslage sind auf 5 begrenzt, die Gesamtzahl der Karten auf
  Stufe + 1. Karten aus der Multiklassen-Domäne stehen bis zur halben Stufe
  (aufgerundet) zur Verfügung.
- Rückschreiben ins Frontmatter erfolgt nur bei echten Änderungen, um
  Render-Schleifen zu vermeiden.
- Die Code-Block-Namen beginnen weiterhin mit `daggerheart-`, da es sich um den
  Systemnamen handelt; die Plugin-Bezeichnung ist Dolchherz.

## Herkunft der Daten

Die Werte und Karteninhalte beruhen auf dem Daggerheart-Systemreferenzdokument.

- Englisches Original: Daggerheart SRD 1.0, © Critical Role, LLC.
- Deutsche Übersetzung der Spieldaten: [github.com/MorastBlitz/daggerheart-srd-ger](https://github.com/MorastBlitz/daggerheart-srd-ger)

Öffentliches Spielmaterial im Sinne der Darrington Press Community Gaming License:
<https://darringtonpress.com/license/>.

## Lizenz und Rechtliches

- **Code:** MIT, siehe [`LICENSE`](LICENSE).
- **Inhalte:** Die deutschen Regelinhalte und Kartentexte der mitgelieferten
  Spieldaten beruhen auf dem Daggerheart SRD und werden unter der *Darrington
  Press Community Gaming License* verwendet. Die Übersetzung wurde mit Werkzeugen
  zur künstlichen Intelligenz erstellt und anschließend redaktionell bearbeitet
  und geprüft.

Dieses Projekt ist ein unabhängiges Fanprojekt ohne Verbindung zu Critical Role LLC,
Darrington Press LLC oder Pegasus Spiele GmbH.

„Daggerheart™“, „Darrington Press™“, „Critical Role™“ sowie zugehörige Marken und
Logos sind Eigentum ihrer jeweiligen Rechteinhaber. Die Verwendung dieser Begriffe
erfolgt ausschließlich zur Beschreibung des zugrunde liegenden Rollenspielsystems,
der Kompatibilität und zur Kennzeichnung von Inhalten dieses Fanprojekts.
