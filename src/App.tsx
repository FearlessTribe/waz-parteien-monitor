import { useCallback, useEffect, useMemo, useState } from "react";
import { subDays, format } from "date-fns";
import type { Article, DateRangePreset, PartyDetail } from "@/types";
import { DEFAULT_DATE_PRESET } from "@/types";
import { NRW_POLL_DATA } from "@/data/nrwPolls";
import {
  buildDateRange,
  computeKPIs,
  computePartyDetail,
  computePartyStats,
  formatReferenceDate,
  getLatestArticleDate,
  loadArticles,
} from "@/lib/aggregations";
import { DashboardHeader } from "@/components/DashboardHeader";
import { KPICards } from "@/components/KPICards";
import { PartyMentionChart } from "@/components/PartyMentionChart";
import { PollComparisonChart } from "@/components/PollComparisonChart";
import { SentimentChart } from "@/components/SentimentChart";
import { MentionsTimeline } from "@/components/MentionsTimeline";
import { PartyTable } from "@/components/PartyTable";
import { PartyDetailDrawer } from "@/components/PartyDetailDrawer";
import { MethodologyCard } from "@/components/MethodologyCard";

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState<DateRangePreset>(DEFAULT_DATE_PRESET);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [selectedParty, setSelectedParty] = useState<string | null>(null);

  useEffect(() => {
    loadArticles()
      .then(setArticles)
      .finally(() => setLoading(false));
  }, []);

  const referenceDate = useMemo(() => getLatestArticleDate(articles), [articles]);
  const referenceDateLabel = useMemo(
    () => (articles.length > 0 ? formatReferenceDate(referenceDate) : null),
    [articles.length, referenceDate],
  );

  useEffect(() => {
    if (articles.length === 0) return;
    const end = format(referenceDate, "yyyy-MM-dd");
    const start = format(subDays(referenceDate, 89), "yyyy-MM-dd");
    setCustomStart(start);
    setCustomEnd(end);
  }, [articles.length, referenceDate]);

  const range = useMemo(
    () =>
      buildDateRange(
        preset,
        preset === "custom" ? new Date(customStart) : undefined,
        preset === "custom" ? new Date(customEnd) : undefined,
        referenceDate,
      ),
    [preset, customStart, customEnd, referenceDate],
  );

  const partyStats = useMemo(
    () => computePartyStats(articles, NRW_POLL_DATA, range),
    [articles, range],
  );

  const kpis = useMemo(
    () => computeKPIs(articles, range, partyStats),
    [articles, range, partyStats],
  );

  const partyDetail: PartyDetail | null = useMemo(() => {
    if (!selectedParty) return null;
    return computePartyDetail(articles, selectedParty, range, NRW_POLL_DATA);
  }, [articles, selectedParty, range]);

  const activeParties = useMemo(
    () => partyStats.filter((s) => s.mentionCount > 0).map((s) => s.party),
    [partyStats],
  );

  const handleSelectParty = useCallback((party: string) => {
    setSelectedParty(party);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-stone-800" />
          <p className="mt-4 text-sm text-stone-500">Lade Artikeldaten…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <DashboardHeader
        articleCount={kpis.articleCount}
        articlesWithPartyMentions={kpis.articlesWithPartyMentions}
        lastCrawlDate={kpis.lastCrawlDate}
        referenceDateLabel={referenceDateLabel}
        preset={preset}
        onPresetChange={setPreset}
        customStart={customStart}
        customEnd={customEnd}
        onCustomStartChange={setCustomStart}
        onCustomEndChange={setCustomEnd}
      />

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {articles.length === 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            <strong>Keine Artikeldaten gefunden.</strong> Exportieren Sie zuerst die Crawl-Daten:{" "}
            <code className="rounded bg-amber-100 px-1">npm run export-data</code> im{" "}
            <code className="rounded bg-amber-100 px-1">dashboard/</code>-Verzeichnis.
          </div>
        )}

        <KPICards kpis={kpis} />

        <PartyTable stats={partyStats} onSelectParty={handleSelectParty} />

        <div className="grid gap-6 lg:grid-cols-2">
          <PartyMentionChart stats={partyStats} />
          <PollComparisonChart stats={partyStats} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SentimentChart stats={partyStats} />
          <MentionsTimeline articles={articles} range={range} activeParties={activeParties} />
        </div>

        <MethodologyCard polls={NRW_POLL_DATA} referenceDateLabel={referenceDateLabel} />
      </main>

      <PartyDetailDrawer
        detail={partyDetail}
        onClose={() => setSelectedParty(null)}
      />

      <footer className="border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-400">
        WAZ Parteien-Monitor · Daten: crawlWAZ · Umfragen:{" "}
        <a
          href={NRW_POLL_DATA.sourceUrl}
          className="underline hover:text-stone-600"
          target="_blank"
          rel="noopener noreferrer"
        >
          {NRW_POLL_DATA.institute} / {NRW_POLL_DATA.source}
        </a>{" "}
        ({NRW_POLL_DATA.publishedAt})
      </footer>
    </div>
  );
}
