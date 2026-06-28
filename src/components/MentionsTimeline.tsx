import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Article, DateRange } from "@/types";
import { computeTimeline } from "@/lib/aggregations";
import { PARTY_COLORS, PARTY_ORDER, partyLabel } from "@/lib/parties";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

interface Props {
  articles: Article[];
  range: DateRange;
  activeParties: string[];
}

export function MentionsTimeline({ articles, range, activeParties }: Props) {
  const [selected, setSelected] = useState<string[]>(activeParties.slice(0, 4));

  const timeline = useMemo(
    () => computeTimeline(articles, range, selected.length > 0 ? selected : undefined),
    [articles, range, selected],
  );

  const partiesWithData = useMemo(() => {
    const set = new Set<string>();
    for (const point of timeline) {
      for (const key of Object.keys(point)) {
        if (key !== "date") set.add(key);
      }
    }
    return PARTY_ORDER.filter((p) => set.has(p));
  }, [timeline]);

  const toggleParty = (party: string) => {
    setSelected((prev) =>
      prev.includes(party) ? prev.filter((p) => p !== party) : [...prev, party],
    );
  };

  if (timeline.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-stone-900">Erwähnungen im Zeitverlauf</h3>
        <div className="mt-6 flex h-56 items-center justify-center rounded-lg border border-dashed border-stone-300 bg-stone-50">
          <p className="text-sm text-stone-500">Keine zeitlichen Daten für Parteierwähnungen.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-stone-900">Erwähnungen im Zeitverlauf</h3>
          <p className="mt-1 text-xs text-stone-500">Tägliche Erwähnungen nach Partei</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {partiesWithData.map((party) => (
            <button
              key={party}
              type="button"
              onClick={() => toggleParty(party)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                selected.includes(party)
                  ? "border-stone-800 bg-stone-800 text-white"
                  : "border-stone-200 bg-white text-stone-600 hover:border-stone-400"
              }`}
              style={
                selected.includes(party)
                  ? { backgroundColor: PARTY_COLORS[party], borderColor: PARTY_COLORS[party] }
                  : undefined
              }
            >
              {partyLabel(party)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timeline} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => format(parseISO(v), "dd.MM.", { locale: de })}
              tick={{ fontSize: 11, fill: "#78716c" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#78716c" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              labelFormatter={(v) => format(parseISO(v as string), "dd. MMMM yyyy", { locale: de })}
            />
            {selected.map((party) => (
              <Area
                key={party}
                type="monotone"
                dataKey={party}
                name={partyLabel(party)}
                stroke={PARTY_COLORS[party] ?? "#78716c"}
                fill={PARTY_COLORS[party] ?? "#78716c"}
                fillOpacity={0.12}
                strokeWidth={2}
                stackId="1"
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
