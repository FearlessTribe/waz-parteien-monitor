import type { DashboardKPIs } from "@/types";
import { partyLabel } from "@/lib/parties";
import { formatNumber } from "@/lib/format";

interface Props {
  kpis: DashboardKPIs;
}

interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}

function KPICard({ label, value, sub, accent }: KPICardProps) {
  return (
    <div
      className={`rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${
        accent ? "border-stone-300" : "border-stone-200"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">{value}</p>
      {sub && <p className="mt-1 text-sm text-stone-500">{sub}</p>}
    </div>
  );
}

export function KPICards({ kpis }: Props) {
  const cards: KPICardProps[] = [
    {
      label: "Gecrawlte Artikel",
      value: formatNumber(kpis.articleCount),
      sub: "Alle WAZ-Artikel im gewählten Zeitraum",
    },
    {
      label: "Mit Parteierwähnung",
      value: formatNumber(kpis.articlesWithPartyMentions),
      sub: "Basis für Tabellen und Charts",
      accent: kpis.articlesWithPartyMentions > 0,
    },
    {
      label: "Targeted Sentiment",
      value: formatNumber(kpis.articlesWithTargetedSentiment),
      sub: "Mit regelbasierter Sentiment-Bewertung",
      accent: kpis.articlesWithTargetedSentiment > 0,
    },
    {
      label: "Analysierte Quellen",
      value: formatNumber(kpis.sourceCount),
      sub: "WAZ-Ressorts / Bereiche",
    },
    {
      label: "Analysezeitraum",
      value: kpis.periodLabel,
    },
    {
      label: "Neuester Artikel",
      value: kpis.lastCrawlDate ?? "—",
      sub: "Im gewählten Zeitraum",
    },
    {
      label: "Meiste Erwähnungen",
      value: kpis.topMentionParty ? partyLabel(kpis.topMentionParty) : "—",
      sub: kpis.topMentionParty ? "Häufigste Partei in Artikeln" : "Keine Parteierwähnungen",
      accent: !!kpis.topMentionParty,
    },
    {
      label: "Positivstes Sentiment",
      value: kpis.mostPositiveParty ? partyLabel(kpis.mostPositiveParty) : "—",
      sub: kpis.mostPositiveParty ? "Höchster Ø-Score" : "Keine Sentiment-Daten",
    },
    {
      label: "Negativstes Sentiment",
      value: kpis.mostNegativeParty ? partyLabel(kpis.mostNegativeParty) : "—",
      sub: kpis.mostNegativeParty ? "Niedrigster Ø-Score" : "Keine Sentiment-Daten",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-9">
      {cards.map((card) => (
        <KPICard key={card.label} {...card} />
      ))}
    </section>
  );
}
