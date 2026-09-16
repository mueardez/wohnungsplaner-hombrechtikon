# Bestehende Version und neue Raumplanung

## Aktuelle Version

Die veröffentlichte Anwendung bleibt auf
https://mueardez.github.io/wohnungsplaner-hombrechtikon/ erreichbar.
Ihr Stand vor Beginn der parallelen Entwicklung ist mit
`stable-v1-2026-09-16` gesichert.

## Neue Version

Die neue Entwicklung liegt im Branch `development-v2` und lokal im Ordner
`wohnungsplaner-v2`. Sie beginnt mit einer unveränderten Kopie der aktuellen
Anwendung. Die Raumplanung verwendet nun dieselben Geometriedaten für SVG-2D
und WebGL-3D. Enthalten sind Drehgriff, Einrasten, Wandabstände,
Überschneidungshinweise, Rückgängig/Wiederholen und schematische Möbelformen.

Inventarliste und PDF-Export werden funktional unverändert übernommen; Keller
ist zusätzlich ein Inventarbereich ohne Grundrissgeometrie. Für lokale Tests
werden Testdaten oder ausdrücklich importierte Sicherungskopien verwendet.
Die lokale Vorschau auf Port 4174 hat einen eigenen Browserspeicher und
übernimmt die Daten der öffentlichen Website nicht automatisch.

Start der separaten lokalen Vorschau:

```sh
npm ci
npm run dev:github -- --host 127.0.0.1 --port 4174
```

Prüfung vor einer Vorschau:

```sh
npm run build:github
```

Dieser Branch veröffentlicht nichts auf der bestehenden Website. Die separate
öffentliche V2-Vorschau liegt unter
https://mueardez.github.io/wohnungsplaner-hombrechtikon-v2/.
Ihr Repository heisst `mueardez/wohnungsplaner-hombrechtikon-v2`.
Auch bei gleichem Browser-Ursprung sind IndexedDB und Plan-Speicherung durch
eigene Namen getrennt. Der Inventar-PDF-Code und das Sicherungsformat sind
unverändert. Bestehende Inventardateien können bewusst als Kopie importiert werden.
Die Ablösung der bestehenden Website erfolgt nur nach ausdrücklicher Freigabe.
