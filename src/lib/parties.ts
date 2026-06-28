export const PARTY_ORDER = [
  "CDU/CSU",
  "SPD",
  "GRÜNE",
  "AfD",
  "Die Linke",
  "BSW",
  "FDP",
  "Freie Wähler",
  "Tierschutzpartei",
  "SSW",
] as const;

export type PartyId = (typeof PARTY_ORDER)[number];

export const PARTY_COLORS: Record<string, string> = {
  "CDU/CSU": "#1B3A57",
  SPD: "#B91C3C",
  GRÜNE: "#3D7A36",
  AfD: "#2B6CB0",
  "Die Linke": "#9D3A7A",
  BSW: "#6B3FA0",
  FDP: "#C9A800",
  "Freie Wähler": "#4A6FA5",
  Tierschutzpartei: "#2F855A",
  SSW: "#3182CE",
};

export const PARTY_SHORT: Record<string, string> = {
  "CDU/CSU": "CDU",
  GRÜNE: "Grüne",
  "Die Linke": "Linke",
  "Freie Wähler": "FW",
  Tierschutzpartei: "Tierschutz",
};

export function partyLabel(party: string): string {
  return PARTY_SHORT[party] ?? party;
}

export const PARTY_ALIASES_DOC: Record<string, string[]> = {
  "CDU/CSU": ["CDU", "CSU", "Union", "Unionsparteien", "Christdemokraten"],
  SPD: ["Sozialdemokraten", "Sozialdemokratische Partei Deutschlands"],
  GRÜNE: ["Grüne", "Bündnis 90/Die Grünen", "Bündnisgrüne"],
  AfD: ["Alternative für Deutschland"],
  "Die Linke": ["Linke", "DIE LINKE", "Linkspartei"],
  BSW: ["Bündnis Sahra Wagenknecht", "Wagenknecht-Partei"],
  FDP: ["Freie Demokraten", "Liberale"],
  "Freie Wähler": ["FW", "FREIE WÄHLER"],
  Tierschutzpartei: ["Partei Mensch Umwelt Tierschutz"],
  SSW: ["Südschleswigscher Wählerverband"],
};
