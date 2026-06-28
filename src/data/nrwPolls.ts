import type { PollData } from "@/types";

/**
 * NRW Landtagswahl Sonntagsfrage — INSA im Auftrag von BILD
 * Quelle: DAWUM (api.dawum.de), abgerufen am 27.06.2026
 * Veröffentlichung: 08.05.2026 | Befragungszeitraum: 30.04.–05.05.2026 | n=1.000
 */
export const NRW_POLL_DATA: PollData = {
  source: "DAWUM / Wahlrecht.de",
  sourceUrl: "https://dawum.de/Nordrhein-Westfalen/INSA/2026-05-08/",
  institute: "INSA",
  commissioner: "BILD",
  publishedAt: "2026-05-08",
  surveyPeriodStart: "2026-04-30",
  surveyPeriodEnd: "2026-05-05",
  surveyedPersons: 1000,
  method: "Online-Befragung",
  results: [
    { party: "CDU/CSU", value: 34, available: true },
    { party: "SPD", value: 18, available: true },
    { party: "AfD", value: 17, available: true },
    { party: "GRÜNE", value: 15, available: true },
    { party: "Die Linke", value: 9, available: true },
    { party: "FDP", value: 4, available: true },
    { party: "BSW", value: 0, available: false },
    { party: "Freie Wähler", value: 0, available: false },
    { party: "Tierschutzpartei", value: 0, available: false },
    { party: "SSW", value: 0, available: false },
  ],
  note:
    "Sonstige Parteien: 3 % (nicht den einzelnen Kleinstparteien zugeordnet). " +
    "BSW und weitere Parteien wurden in dieser Umfrage nicht separat ausgewiesen.",
};

export function getPollValue(polls: PollData, party: string): number | null {
  const entry = polls.results.find((r) => r.party === party);
  if (!entry || !entry.available) return null;
  return entry.value;
}
