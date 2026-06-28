import type { DateRangePreset } from "@/types";
import { formatNumber } from "@/lib/format";

interface Props {
  articleCount: number;
  articlesWithPartyMentions: number;
  lastCrawlDate: string | null;
  referenceDateLabel: string | null;
  preset: DateRangePreset;
  onPresetChange: (preset: DateRangePreset) => void;
  customStart: string;
  customEnd: string;
  onCustomStartChange: (v: string) => void;
  onCustomEndChange: (v: string) => void;
}

const PRESETS: { id: DateRangePreset; label: string }[] = [
  { id: "90d", label: "3 Monate" },
  { id: "30d", label: "30 Tage" },
  { id: "7d", label: "7 Tage" },
  { id: "today", label: "Letzter Tag" },
  { id: "custom", label: "Benutzerdefiniert" },
];

export function DashboardHeader({
  articleCount,
  articlesWithPartyMentions,
  lastCrawlDate,
  referenceDateLabel,
  preset,
  onPresetChange,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
}: Props) {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-stone-500">
              NRW · WAZ Analytics
            </p>
            <h1 className="mt-1 font-serif text-4xl font-normal tracking-tight text-stone-900 sm:text-5xl">
              WAZ Parteien-Monitor
            </h1>
            <p className="mt-2 max-w-xl text-base text-stone-600">
              Mediale Präsenz, Sentiment und aktuelle Umfragewerte
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <div className="flex flex-wrap gap-1 rounded-lg border border-stone-200 bg-stone-50 p-1">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onPresetChange(p.id)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    preset === p.id
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {preset === "custom" && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => onCustomStartChange(e.target.value)}
                  className="rounded-md border border-stone-200 px-2 py-1.5 text-stone-700"
                />
                <span className="text-stone-400">bis</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => onCustomEndChange(e.target.value)}
                  className="rounded-md border border-stone-200 px-2 py-1.5 text-stone-700"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-stone-500">
              {referenceDateLabel && (
                <span>
                  Stichtag:{" "}
                  <span className="font-medium text-stone-700">{referenceDateLabel}</span>
                </span>
              )}
              <span>
                <span className="font-medium text-stone-700">{formatNumber(articleCount)}</span>{" "}
                gecrawlte Artikel
              </span>
              <span>
                <span className="font-medium text-stone-700">
                  {formatNumber(articlesWithPartyMentions)}
                </span>{" "}
                mit Parteierwähnung
              </span>
              {lastCrawlDate && (
                <span>
                  Neuester Artikel im Filter:{" "}
                  <span className="font-medium text-stone-700">{lastCrawlDate}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
