import type { PartyStats } from "@/types";
import { PARTY_COLORS, partyLabel } from "@/lib/parties";
import { formatPercent, formatTrend } from "@/lib/format";
import { formatImpact, formatSentimentScore } from "@/lib/sentiment";

interface Props {
  stats: PartyStats[];
  onSelectParty: (party: string) => void;
}

function SentimentBadge({ cls }: { cls: string | null }) {
  if (!cls) return <span className="text-stone-400">—</span>;
  const styles: Record<string, string> = {
    positiv: "bg-emerald-50 text-emerald-800 border-emerald-200",
    neutral: "bg-stone-100 text-stone-600 border-stone-200",
    negativ: "bg-red-50 text-red-800 border-red-200",
    gemischt: "bg-amber-50 text-amber-800 border-amber-200",
  };
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${styles[cls] ?? ""}`}
    >
      {cls}
    </span>
  );
}

function TrendCell({ value, suffix = "" }: { value: number | null; suffix?: string }) {
  if (value === null) return <span className="text-stone-400">—</span>;
  const color = value > 0 ? "text-emerald-700" : value < 0 ? "text-red-700" : "text-stone-500";
  return <span className={`font-medium ${color}`}>{formatTrend(value, suffix)}</span>;
}

export function PartyTable({ stats, onSelectParty }: Props) {
  const withMentions = stats.filter((s) => s.mentionCount > 0);

  if (withMentions.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-stone-700">Keine Parteidaten im Zeitraum</p>
        <p className="mt-1 text-xs text-stone-500">
          Sobald Artikel mit Parteierwähnungen gecrawlt wurden, erscheinen sie hier.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-200 px-6 py-4">
        <h3 className="text-sm font-semibold text-stone-900">Parteien-Übersicht</h3>
        <p className="mt-0.5 text-xs text-stone-500">
          Targeted Sentiment pro Artikel · Klick für Detailansicht
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50 text-xs font-medium uppercase tracking-wide text-stone-500">
              <th className="px-6 py-3">Partei</th>
              <th className="px-4 py-3 text-right">Erwähnungen</th>
              <th className="px-4 py-3 text-right">Medienanteil</th>
              <th className="px-4 py-3 text-right">NRW-Umfrage</th>
              <th className="px-4 py-3 text-right">Sichtbarkeitslücke</th>
              <th className="px-4 py-3 text-right">Ø Score</th>
              <th className="px-4 py-3">Impact</th>
              <th className="px-4 py-3">Klasse</th>
              <th className="px-4 py-3 text-right">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {withMentions.map((row) => (
              <tr
                key={row.party}
                onClick={() => onSelectParty(row.party)}
                className="cursor-pointer transition-colors hover:bg-stone-50"
              >
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: PARTY_COLORS[row.party] ?? "#a8a29e" }}
                    />
                    <span className="font-medium text-stone-900">{partyLabel(row.party)}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-right tabular-nums text-stone-700">
                  {row.mentionCount}
                </td>
                <td className="px-4 py-3.5 text-right tabular-nums text-stone-700">
                  {formatPercent(row.mentionShare)}
                </td>
                <td className="px-4 py-3.5 text-right tabular-nums text-stone-700">
                  {row.pollAvailable ? formatPercent(row.pollValue!) : (
                    <span className="text-stone-400" title="In aktueller Umfrage nicht ausgewiesen">
                      n. a.
                    </span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-right tabular-nums">
                  {row.visibilityGap !== null ? (
                    <span
                      className={
                        row.visibilityGap > 2
                          ? "text-amber-700"
                          : row.visibilityGap < -2
                            ? "text-blue-700"
                            : "text-stone-600"
                      }
                    >
                      {row.visibilityGap > 0 ? "+" : ""}
                      {row.visibilityGap.toFixed(1).replace(".", ",")} PP
                    </span>
                  ) : (
                    <span className="text-stone-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-right tabular-nums font-medium text-stone-800">
                  {formatSentimentScore(row.avgSentimentScore)}
                </td>
                <td className="px-4 py-3.5 text-xs text-stone-600">
                  {formatImpact(row.impactForParty)}
                </td>
                <td className="px-4 py-3.5">
                  <SentimentBadge cls={row.sentimentClass} />
                </td>
                <td className="px-4 py-3.5 text-right">
                  <TrendCell value={row.trendMentions} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-stone-100 px-6 py-2 text-xs text-stone-400">
        Score-Skala −100 bis +100 (artikelbasiert). Sichtbarkeitslücke = Medienanteil − Umfragewert.
      </p>
    </div>
  );
}
