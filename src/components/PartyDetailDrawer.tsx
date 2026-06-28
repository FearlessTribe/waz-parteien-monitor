import type { ReactNode } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ArticleRef, PartyDetail } from "@/types";
import { PARTY_COLORS, partyLabel } from "@/lib/parties";
import { formatPercent } from "@/lib/format";
import {
  formatImpact,
  formatSentimentScore,
  sentimentColor,
} from "@/lib/sentiment";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

interface Props {
  detail: PartyDetail | null;
  onClose: () => void;
}

function ArticleList({ items, empty }: { items: ArticleRef[]; empty: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-stone-500">{empty}</p>;
  }
  return (
    <ul className="space-y-2">
      {items.map((a) => (
        <li key={a.url}>
          <a
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-lg border border-stone-100 p-3 transition-colors hover:border-stone-300 hover:bg-stone-50"
          >
            <p className="text-sm font-medium text-stone-900 group-hover:text-stone-700 line-clamp-2">
              {a.title}
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-xs text-stone-500">
              <span>{a.date}</span>
              <span>·</span>
              <span>{a.section}</span>
              {a.sentimentScore !== null && (
                <>
                  <span>·</span>
                  <span className={sentimentColor(a.sentimentScore)}>
                    Score {formatSentimentScore(a.sentimentScore)}
                  </span>
                </>
              )}
              {a.impactForParty && (
                <>
                  <span>·</span>
                  <span>{formatImpact(a.impactForParty)}</span>
                </>
              )}
            </div>
            {a.reasoningShort && (
              <p className="mt-2 text-xs leading-relaxed text-stone-600 line-clamp-2">
                {a.reasoningShort}
              </p>
            )}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function PartyDetailDrawer({ detail, onClose }: Props) {
  if (!detail) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-stone-900/20 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="drawer-enter fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-stone-200 bg-white shadow-2xl"
        role="dialog"
        aria-label={`Details ${partyLabel(detail.party)}`}
      >
        <header className="flex items-start justify-between border-b border-stone-200 px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: PARTY_COLORS[detail.party] }}
              />
              <h2 className="text-xl font-semibold text-stone-900">
                {partyLabel(detail.party)}
              </h2>
            </div>
            <p className="mt-1 text-sm text-stone-500">Targeted Sentiment · Detailansicht</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
            aria-label="Schließen"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Erwähnungen" value={String(detail.mentionCount)} />
            <Metric
              label="NRW-Umfrage"
              value={detail.pollValue !== null ? formatPercent(detail.pollValue) : "n. a."}
            />
            <Metric label="Ø Score" value={formatSentimentScore(detail.avgSentimentScore)} />
            <Metric label="Impact" value={formatImpact(detail.impactForParty)} />
          </div>

          {detail.topSources.length > 0 && (
            <Section title="Häufigste Quellen">
              <div className="flex flex-wrap gap-2">
                {detail.topSources.map((s) => (
                  <span
                    key={s.name}
                    className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-700"
                  >
                    {s.name} ({s.count})
                  </span>
                ))}
              </div>
            </Section>
          )}

          {detail.topSignals.length > 0 && (
            <Section title="Häufigste Signale">
              <div className="flex flex-wrap gap-1.5">
                {detail.topSignals.map((s) => (
                  <span
                    key={s.sub_signal}
                    className={`rounded-md px-2 py-1 text-xs ${
                      s.polarity === "positive"
                        ? "bg-emerald-50 text-emerald-800"
                        : "bg-red-50 text-red-800"
                    }`}
                  >
                    {s.sub_signal.replace(/_/g, " ")} ({s.count})
                  </span>
                ))}
              </div>
            </Section>
          )}

          <Section title="Wichtigste Artikel">
            <ArticleList items={detail.keyArticles} empty="Keine Artikel mit Erwähnungen." />
          </Section>

          <Section title="Positivste Artikel">
            <ArticleList items={detail.positiveArticles} empty="Keine positiven Artikel." />
          </Section>

          <Section title="Negativste Artikel">
            <ArticleList items={detail.negativeArticles} empty="Keine negativen Artikel." />
          </Section>

          {detail.topTerms.length > 0 && (
            <Section title="Auffällige Begriffe">
              <div className="flex flex-wrap gap-1.5">
                {detail.topTerms.map((t) => (
                  <span
                    key={t.term}
                    className="rounded-md bg-stone-100 px-2 py-1 text-xs text-stone-700"
                  >
                    {t.term}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {detail.sentimentTimeline.length > 0 && (
            <Section title="Score-Verlauf">
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={detail.sentimentTimeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(v) => format(parseISO(v), "dd.MM.", { locale: de })}
                      tick={{ fontSize: 10, fill: "#a8a29e" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis domain={[-100, 100]} tick={{ fontSize: 10, fill: "#a8a29e" }} width={32} />
                    <Tooltip
                      labelFormatter={(v) =>
                        format(parseISO(v as string), "dd. MMM yyyy", { locale: de })
                      }
                      formatter={(v) => [formatSentimentScore(v as number), "Score"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="sentimentScore"
                      name="Score"
                      stroke={PARTY_COLORS[detail.party] ?? "#1e3a5f"}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Section>
          )}
        </div>
      </aside>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 text-center">
      <p className="text-xs text-stone-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-stone-900">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}
