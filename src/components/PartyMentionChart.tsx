import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import type { PartyStats } from "@/types";
import { PARTY_COLORS, partyLabel } from "@/lib/parties";
import { formatPercent } from "@/lib/format";

interface Props {
  stats: PartyStats[];
}

export function PartyMentionChart({ stats }: Props) {
  const data = stats
    .filter((s) => s.mentionCount > 0)
    .map((s) => ({
      party: partyLabel(s.party),
      fullParty: s.party,
      mentions: s.mentionCount,
      share: s.mentionShare,
    }));

  if (data.length === 0) {
    return <EmptyChart message="Keine Parteierwähnungen im gewählten Zeitraum." />;
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-stone-900">Erwähnungen pro Partei</h3>
      <p className="mt-1 text-xs text-stone-500">Absolute Anzahl und Anteil an allen Erwähnungen</p>
      <div className="mt-6 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" vertical={false} />
            <XAxis
              dataKey="party"
              tick={{ fontSize: 12, fill: "#78716c" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: "#78716c" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm shadow-md">
                    <p className="font-medium text-stone-900">{d.party}</p>
                    <p className="text-stone-600">{d.mentions} Erwähnungen</p>
                    <p className="text-stone-500">{formatPercent(d.share)} Anteil</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="mentions" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {data.map((entry) => (
                <Cell key={entry.fullParty} fill={PARTY_COLORS[entry.fullParty] ?? "#a8a29e"} />
              ))}
              <LabelList
                dataKey="share"
                position="top"
                formatter={(v: number) => `${v.toFixed(0)}%`}
                style={{ fontSize: 11, fill: "#78716c" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-72 flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center">
      <p className="text-sm font-medium text-stone-600">{message}</p>
      <p className="mt-1 max-w-sm text-xs text-stone-500">
        Crawlen Sie weitere politische Artikel oder erweitern Sie den Zeitraum.
      </p>
    </div>
  );
}
