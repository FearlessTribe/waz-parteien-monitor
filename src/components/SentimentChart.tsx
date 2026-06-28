import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import type { PartyStats } from "@/types";
import { partyLabel } from "@/lib/parties";
import { formatSentimentScore } from "@/lib/sentiment";

interface Props {
  stats: PartyStats[];
}

export function SentimentChart({ stats }: Props) {
  const data = stats
    .filter((s) => s.avgSentimentScore !== null && s.articlesWithSentiment > 0)
    .map((s) => ({
      party: partyLabel(s.party),
      fullParty: s.party,
      score: s.avgSentimentScore as number,
      label: s.sentimentLabel,
    }));

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-stone-900">Sentiment pro Partei</h3>
        <div className="mt-6 flex h-64 items-center justify-center rounded-lg border border-dashed border-stone-300 bg-stone-50">
          <p className="text-sm text-stone-500">Keine Targeted-Sentiment-Daten im Zeitraum.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-stone-900">Sentiment pro Partei</h3>
      <p className="mt-1 text-xs text-stone-500">
        Durchschnittlicher artikelbasierter Score (−100 bis +100)
      </p>
      <div className="mt-2 flex gap-4 text-xs text-stone-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-red-400" /> negativ
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-stone-300" /> neutral
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> positiv
        </span>
      </div>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" horizontal={false} />
            <XAxis
              type="number"
              domain={[-100, 100]}
              tick={{ fontSize: 12, fill: "#78716c" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="party"
              width={56}
              tick={{ fontSize: 12, fill: "#78716c" }}
              axisLine={false}
              tickLine={false}
            />
            <ReferenceLine x={0} stroke="#d6d3d1" strokeWidth={1.5} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm shadow-md">
                    <p className="font-medium text-stone-900">{d.party}</p>
                    <p className="text-stone-600">Ø Score: {formatSentimentScore(d.score)}</p>
                    {d.label && <p className="text-stone-500 capitalize">{d.label}</p>}
                  </div>
                );
              }}
            />
            <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={20}>
              {data.map((entry) => (
                <Cell
                  key={entry.fullParty}
                  fill={
                    entry.score > 15
                      ? "#10b981"
                      : entry.score < -15
                        ? "#f87171"
                        : "#d6d3d1"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
