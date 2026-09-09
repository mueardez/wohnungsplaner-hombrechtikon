# Raumplaner Hombrechtikon

Interaktiver, browserbasierter Einrichtungsplaner für die Wohnung im Erdgeschoss.

Erfasst sind Wohnen/Essen mit Küche, zwei Kinderzimmer, Bad, WC, Reduit,
Büro, Elternzimmer und Dusche.

## Enthalten

- dreh- und zoombare 3D-Ansicht
- umschaltbarer Grundriss
- Möbelkatalog mit Sofa, Tisch, Stuhl, Bett und Schrank
- Möbel per Maus oder Touch verschieben
- Masse und Drehung ausgewählter Möbel ändern
- automatische lokale Speicherung
- teilbarer Link mit dem vollständigen Planstand

## Annahmen

- Raumhöhe: 2,39 m, aus Schnitt A-A des gelieferten Plans abgeleitet
- Geometrie: erste Rekonstruktion anhand des eingescannten Plans; vor einer Bestellung vor Ort kontrollieren
- Fenster, Türen, Küche und Sanitärdetails werden in der nächsten Präzisionsstufe ergänzt

## Lokal starten

```bash
npm install
npm run dev
```

Danach `http://localhost:3000` öffnen.

## Veröffentlichen

Das Projekt ist für statisches Webhosting ausgelegt. Für eine gemeinsame Nutzung eignet sich ein privates Repository mit einem Hosting-Dienst, der das Repository direkt baut. Alternativ kann es über Codex Sites veröffentlicht werden. Der Button **Plan teilen** erzeugt einen Link, der den aktuellen Möbelstand direkt enthält.

## Nächster Schritt

Sobald die bestehenden Möbel mit Breite, Tiefe und Höhe vorliegen, werden sie als eigener Katalog ergänzt. Fotos helfen bei Farben und Form, sind für die Platzierung aber nicht zwingend.
