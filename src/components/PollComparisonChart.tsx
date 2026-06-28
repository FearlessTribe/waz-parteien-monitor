import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { PartyStats } from "@/types";
import { partyLabel } from "@/lib/parties";
import { formatPercent } from "@/lib/format";

interface Props {
  stats: PartyStats[];
}

export function PollComparisonChart({ stats }: Props) {
  const data = stats
    .filter((s) => s.mentionCount > 0 || s.pollAvailable)
    .map((s) => ({
      party: partyLabel(s.party),
      mediaShare: s.mentionShare,
      pollValue: s.pollValue ?? 0,
      pollAvailable: s.pollAvailable,
      gap: s.visibilityGap,
    }));

  if (data.every((d) => d.mediaShare === 0)) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-stone-900">Medienanteil vs. Umfragewert</h3>
        <div className="mt-6 flex h-64 items-center justify-center rounded-lg border border-dashed border-stone-300 bg-stone-50">
          <p className="text-sm text-stone-500">Keine Medienerwähnungen zum Vergleich verfügbar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-stone-900">Medienanteil vs. Umfragewert</h3>
      <p className="mt-1 text-xs text-stone-500">
        Über- oder Unterrepräsentation im Vergleich zur NRW-Sonntagsfrage
      </p>
      <div className="mt-6 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" vertical={false} />
            <XAxis
              dataKey="party"
              tick={{ fontSize: 11, fill: "#78716c" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 12, fill: "#78716c" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm shadow-md">
                    <p className="font-medium text-stone-900">{d.party}</p>
                    <p className="text-stone-600">Medienanteil: {formatPercent(d.mediaShare)}</p>
                    <p className="text-stone-600">
                      Umfrage: {d.pollAvailable ? formatPercent(d.pollValue) : "n. a."}
                    </p>
                    {d.gap !== null && (
                      <p className={d.gap > 0 ? "text-amber-700" : "text-blue-700"}>
                        Sichtbarkeitslücke: {d.gap > 0 ? "+" : ""}
                        {d.gap.toFixed(1).replace(".", ",")} PP
                      </p>
                    )}
                  </div>
                );
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
              formatter={(value) => (value === "mediaShare" ? "Medienanteil" : "NRW-Umfrage")}
            />
            <Bar dataKey="mediaShare" name="mediaShare" fill="#1e3a5f" radius={[3, 3, 0, 0]} maxBarSize={28} />
            <Bar dataKey="pollValue" name="pollValue" fill="#d6d3d1" radius={[3, 3, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
