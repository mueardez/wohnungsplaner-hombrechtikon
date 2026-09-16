# Bestehende Version und neue Raumplanung

## Aktuelle Version

Die veröffentlichte Anwendung bleibt auf
https://mueardez.github.io/wohnungsplaner-hombrechtikon/ erreichbar.
Ihr Stand vor Beginn der parallelen Entwicklung ist mit
`stable-v1-2026-09-16` gesichert.

## Neue Version

Die neue Entwicklung liegt im Branch `development-v2` und lokal im Ordner
`wohnungsplaner-v2`. Sie beginnt mit einer unveränderten Kopie der aktuellen
Anwendung. Neue Grundriss- und 3D-Funktionen sind noch nicht umgesetzt.

Inventarliste und PDF-Export werden unverändert übernommen. Für lokale Tests
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

Dieser Branch veröffentlicht nichts auf der bestehenden Website. Ein separater
öffentlicher Testlink wird erst bei Einrichtung einer V2-Vorschau ergänzt.
Die Ablösung der bestehenden Website erfolgt nur nach ausdrücklicher Freigabe.

