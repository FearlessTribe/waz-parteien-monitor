# WAZ Parteien-Monitor

Analytics-Dashboard für mediale Parteipräsenz und Targeted Sentiment in WAZ-Artikeln (NRW).

**Live:** https://fearlesstribe.github.io/waz-parteien-monitor/

## Lokal starten

```bash
npm install
npm run dev
```

Daten aus dem Crawler exportieren (Pfad anpassen, falls nötig):

```bash
npm run export-data
```

## Build

```bash
npm run build
npm run preview
```

## Daten

`public/articles.json` enthält den exportierten Artikeldatensatz (inkl. Parteierkennung und Targeted Sentiment). Die Datei wird mit dem Repo versioniert, damit das Dashboard ohne Backend auskommt.
