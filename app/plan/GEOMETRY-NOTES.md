# Abgleich mit Grundrissplan.pdf

Quelle: einseitiger Scan Erdgeschoss, Schnitt A–A, Planbeschriftung 1:50.
Die PDF-Datei selbst wird nicht veröffentlicht. Betrachtungsrichtung wie im Scan:
Büro Reto und Büro Tam links oben, Wohnen/Essen links unten, Noa und Eltern rechts unten.

## Lesbare lichte Raummasse

| Heutiger Raum | Beschriftung im Scan | Breite × Tiefe |
| --- | --- | --- |
| Büro Reto | KINDER oben | 4,13 × 3,80 m |
| Büro Tam | KINDER unten | 3,51 × 3,30 m |
| Bad | BAD | 2,22 × 2,75 m |
| WC | WC | 1,31 × 2,75 m |
| Reduit | RED. | 2,12 × 3,29 m |
| Wohnen / Essen | WOHNEN / ESSEN | 7,90 × 7,82 m |
| Kinderzimmer Noa | BÜRO | 4,10 × 2,93 m |
| Eltern | ELTERN | 3,68 × 4,90 m |
| Dusche | DUSCHE | 3,00 × 2,00 m |

Lichte Höhenangabe im Schnitt A–A: 2,39 m (kein Vor-Ort-Aufmass).
Aussenmass unten: 16,45 m. Linke Masskette: 15,56 m.
Innenmass links rekonstruiert: 3,80 + 0,12 + 3,30 + 0,12 + 7,82 = 15,16 m.
Innenbreite: 7,90 + 0,25 + 4,10 + 0,12 + 3,68 = 16,05 m.

## Grenzen der Rekonstruktion

- Der Scan ist leicht verzogen; Zahlen haben Vorrang vor Pixelmessungen.
- Positionen und Schwenkrichtungen von Türen, Garderobe, Nischen, Küche,
  Fenstertüren und Sanitärobjekten sind schematisch aus dem Scan rekonstruiert.
- Küche verweist im Original auf einen separaten Spezialplan, der nicht vorliegt.
- Einbaumasse und Fenstertürhöhen bleiben Annahmen. Sie sind keine Bestellmasse.
- Gang Dusche ist eine offene Zone im Zugangsbereich Eltern; dort wird keine
  zusätzliche Trennwand erfunden.
- Küche, Gang Dusche und Nischen sind Auswahlzonen, keine zusätzlichen Räume
  in der Flächensumme. Kleine obere Gangversprünge werden als Nischen markiert.
- Flächen werden aus den modellierten Bodenpolygonen berechnet und mit „ca.“
  ausgewiesen; es sind keine amtlichen Wohnflächen.
- Keller, Technik, Trocknen und Treppenhaus gehören nicht zur erfassten Wohnung.
- Terrasse bleibt ausschliesslich eine Inventarzuordnung.

## Einheitliches Modell

`geometry.ts` ist die einzige Datenquelle für 2D und 3D: Meter, x nach rechts,
y nach unten; 3D-Abbildung (x, Höhe, y). Türöffnungen sind in den Wandsegmenten
ausgespart. Warnungen sind Planungshilfen; insbesondere Schwenkbereiche und
Einbauten müssen vor Ort überprüft werden.
