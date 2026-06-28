import {
  startOfDay,
  endOfDay,
  subDays,
  isWithinInterval,
  parseISO,
  format,
  differenceInCalendarDays,
} from "date-fns";
import { de } from "date-fns/locale";
import type {
  Article,
  ArticleRef,
  DateRange,
  DateRangePreset,
  DashboardKPIs,
  ImpactForParty,
  PartyDetail,
  PartyStats,
  PollData,
  SentimentLabel,
  TimelinePoint,
} from "@/types";
import { PARTY_ORDER } from "./parties";
import { getPollValue } from "@/data/nrwPolls";
import {
  classifyFromLabel,
  classifySentimentScore,
  getArticlePartySentimentScore,
  getDetectedParty,
} from "./sentiment";

const STOP_WORDS = new Set([
  "der", "die", "das", "und", "in", "zu", "den", "von", "mit", "auf", "für",
  "ist", "sich", "nicht", "ein", "eine", "einer", "einem", "einen", "auch",
  "als", "an", "bei", "nach", "aus", "über", "unter", "dass", "wird", "werden",
  "hat", "haben", "war", "waren", "kann", "soll", "nur", "noch", "aber", "oder",
  "wenn", "dann", "durch", "vor", "bis", "seit", "gegen", "ohne", "zwischen",
  "dieser", "diese", "dieses", "diesen", "diesem", "ihre", "ihrer", "seine",
  "seiner", "ihm", "ihn", "sie", "er", "es", "wir", "uns", "ihnen", "man",
  "mehr", "sehr", "schon", "jetzt", "hier", "dort", "alle", "allem", "allen",
  "während", "weil", "wie", "was", "wer", "wo", "zum", "zur", "vom", "im", "am",
]);

export function getLatestArticleDate(articles: Article[]): Date {
  const dates = articles
    .map((a) => (a.publishing_date ? parseISO(a.publishing_date) : null))
    .filter((d): d is Date => d !== null);
  if (dates.length === 0) return new Date();
  return new Date(Math.max(...dates.map((d) => d.getTime())));
}

export function buildDateRange(
  preset: DateRangePreset,
  customStart?: Date,
  customEnd?: Date,
  referenceDate: Date = new Date(),
): DateRange {
  const end = endOfDay(referenceDate);
  switch (preset) {
    case "today":
      return { preset, start: startOfDay(referenceDate), end };
    case "7d":
      return { preset, start: startOfDay(subDays(referenceDate, 6)), end };
    case "30d":
      return { preset, start: startOfDay(subDays(referenceDate, 29)), end };
    case "90d":
      return { preset, start: startOfDay(subDays(referenceDate, 89)), end };
    case "custom":
      return {
        preset,
        start: startOfDay(customStart ?? subDays(referenceDate, 29)),
        end: endOfDay(customEnd ?? referenceDate),
      };
  }
}

export function formatPeriodLabel(range: DateRange): string {
  if (range.preset === "today") return "Letzter Tag";
  const days = differenceInCalendarDays(range.end, range.start) + 1;
  if (range.preset === "7d") return "Letzte 7 Tage";
  if (range.preset === "30d") return "Letzte 30 Tage";
  if (range.preset === "90d") return "Letzte 3 Monate";
  return `${format(range.start, "dd.MM.yyyy", { locale: de })} – ${format(range.end, "dd.MM.yyyy", { locale: de })} (${days} Tage)`;
}

export function filterArticlesByRange(articles: Article[], range: DateRange): Article[] {
  return articles.filter((a) => {
    if (!a.publishing_date) return false;
    const date = parseISO(a.publishing_date);
    return isWithinInterval(date, { start: range.start, end: range.end });
  });
}

export function getLastCrawlDate(articles: Article[]): string | null {
  if (articles.length === 0) return null;
  return format(getLatestArticleDate(articles), "dd.MM.yyyy HH:mm", { locale: de });
}

export function formatReferenceDate(date: Date): string {
  return format(date, "dd.MM.yyyy", { locale: de });
}

function extractSource(url: string): string {
  try {
    const path = new URL(url).pathname;
    const parts = path.split("/").filter(Boolean);
    if (parts.length >= 2 && parts[0] !== "www.waz.de") return parts[0];
    return parts[0] ?? "waz.de";
  } catch {
    return "waz.de";
  }
}

function extractSection(url: string): string {
  try {
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    return parts[0] ?? "allgemein";
  } catch {
    return "allgemein";
  }
}

function dominantLabel(scores: SentimentLabel[]): SentimentLabel | null {
  if (scores.length === 0) return null;
  const counts: Record<string, number> = {};
  for (const l of scores) counts[l] = (counts[l] ?? 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as SentimentLabel;
}

function dominantImpact(impacts: ImpactForParty[]): ImpactForParty | null {
  if (impacts.length === 0) return null;
  const counts: Record<string, number> = {};
  for (const i of impacts) counts[i] = (counts[i] ?? 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as ImpactForParty;
}

function buildArticleRef(article: Article, party: string): ArticleRef {
  const detected = getDetectedParty(article, party);
  const partyMentions = article.party_analysis.mentions.filter((m) => m.party === party);

  return {
    url: article.url,
    title: article.title ?? "Ohne Titel",
    date: article.publishing_date
      ? format(parseISO(article.publishing_date), "dd.MM.yyyy", { locale: de })
      : "—",
    sentimentScore: detected?.sentiment_score ?? getArticlePartySentimentScore(article, party),
    sentimentLabel: detected?.sentiment_label ?? null,
    impactForParty: detected?.impact_for_party ?? null,
    reasoningShort: detected?.reasoning_short ?? null,
    mentionCount: partyMentions.length,
    section: extractSection(article.url),
    signals: detected?.signals ?? [],
  };
}

function computePartyStatsForArticles(
  articles: Article[],
  polls: PollData,
): { stats: PartyStats[]; totalMentions: number } {
  const mentionCounts: Record<string, number> = {};
  const scoreSums: Record<string, number[]> = {};
  const labels: Record<string, SentimentLabel[]> = {};
  const impacts: Record<string, ImpactForParty[]> = {};
  const confidences: Record<string, number[]> = {};
  const articleCounts: Record<string, number> = {};

  for (const article of articles) {
    for (const mention of article.party_analysis.mentions) {
      mentionCounts[mention.party] = (mentionCounts[mention.party] ?? 0) + 1;
    }
    for (const party of article.party_analysis.parties_mentioned) {
      const detected = getDetectedParty(article, party);
      const score = detected?.sentiment_score ?? getArticlePartySentimentScore(article, party);
      if (score === null) continue;

      if (!scoreSums[party]) scoreSums[party] = [];
      scoreSums[party].push(score);
      articleCounts[party] = (articleCounts[party] ?? 0) + 1;

      if (detected) {
        if (!labels[party]) labels[party] = [];
        labels[party].push(detected.sentiment_label);
        if (!impacts[party]) impacts[party] = [];
        impacts[party].push(detected.impact_for_party);
        if (!confidences[party]) confidences[party] = [];
        confidences[party].push(detected.confidence);
      }
    }
  }

  const totalMentions = Object.values(mentionCounts).reduce((s, v) => s + v, 0);
  const parties = new Set([...PARTY_ORDER, ...Object.keys(mentionCounts)]);

  const stats: PartyStats[] = Array.from(parties)
    .filter((p) => PARTY_ORDER.includes(p as (typeof PARTY_ORDER)[number]) || (mentionCounts[p] ?? 0) > 0)
    .map((party) => {
      const mentionCount = mentionCounts[party] ?? 0;
      const mentionShare = totalMentions > 0 ? (mentionCount / totalMentions) * 100 : 0;
      const pollValue = getPollValue(polls, party);
      const pollAvailable = pollValue !== null;
      const visibilityGap =
        pollAvailable && totalMentions > 0 ? mentionShare - pollValue : null;

      const scores = scoreSums[party] ?? [];
      const avgSentimentScore =
        scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
      const partyLabels = labels[party] ?? [];
      const sentimentLabel = dominantLabel(partyLabels) ?? null;
      const sentimentClass =
        sentimentLabel
          ? classifyFromLabel(sentimentLabel)
          : classifySentimentScore(avgSentimentScore);

      const partyConf = confidences[party] ?? [];
      const avgConfidence =
        partyConf.length > 0
          ? partyConf.reduce((a, b) => a + b, 0) / partyConf.length
          : null;

      return {
        party,
        mentionCount,
        mentionShare,
        pollValue,
        pollAvailable,
        visibilityGap,
        avgSentimentScore,
        sentimentLabel,
        sentimentClass,
        impactForParty: dominantImpact(impacts[party] ?? []),
        avgConfidence,
        articlesWithSentiment: articleCounts[party] ?? 0,
        trendMentions: null,
        trendSentiment: null,
      };
    })
    .filter((s) => s.mentionCount > 0 || s.pollAvailable);

  stats.sort((a, b) => b.mentionCount - a.mentionCount);
  return { stats, totalMentions };
}

export function computePartyStats(
  articles: Article[],
  polls: PollData,
  range: DateRange,
): PartyStats[] {
  const filtered = filterArticlesByRange(articles, range);
  const { stats } = computePartyStatsForArticles(filtered, polls);

  const periodDays = differenceInCalendarDays(range.end, range.start) + 1;
  const prevRange: DateRange = {
    preset: range.preset,
    start: subDays(range.start, periodDays),
    end: subDays(range.end, periodDays),
  };
  const prevFiltered = filterArticlesByRange(articles, prevRange);
  const { stats: prevStats } = computePartyStatsForArticles(prevFiltered, polls);
  const prevMap = Object.fromEntries(prevStats.map((s) => [s.party, s]));

  return stats.map((s) => {
    const prev = prevMap[s.party];
    return {
      ...s,
      trendMentions:
        prev && prevFiltered.length > 0 ? s.mentionCount - prev.mentionCount : null,
      trendSentiment:
        prev?.avgSentimentScore !== null &&
        prev?.avgSentimentScore !== undefined &&
        s.avgSentimentScore !== null &&
        prevFiltered.length > 0
          ? s.avgSentimentScore - prev.avgSentimentScore
          : null,
    };
  });
}

export function computeKPIs(
  articles: Article[],
  range: DateRange,
  partyStats: PartyStats[],
): DashboardKPIs {
  const filtered = filterArticlesByRange(articles, range);
  const sources = new Set(filtered.map((a) => extractSource(a.url)));
  const withPartyMentions = filtered.filter((a) => a.party_analysis.has_party_mention).length;
  const withTargeted = filtered.filter((a) => a.party_analysis.targeted_sentiment).length;

  const withMentions = partyStats.filter((s) => s.mentionCount > 0);
  const topMention = withMentions[0]?.party ?? null;

  const withSentiment = withMentions.filter((s) => s.avgSentimentScore !== null);
  const mostPositive =
    withSentiment.length > 0
      ? [...withSentiment].sort((a, b) => (b.avgSentimentScore ?? 0) - (a.avgSentimentScore ?? 0))[0]
          ?.party ?? null
      : null;
  const mostNegative =
    withSentiment.length > 0
      ? [...withSentiment].sort((a, b) => (a.avgSentimentScore ?? 0) - (b.avgSentimentScore ?? 0))[0]
          ?.party ?? null
      : null;

  return {
    articleCount: filtered.length,
    articlesWithPartyMentions: withPartyMentions,
    articlesWithTargetedSentiment: withTargeted,
    sourceCount: sources.size,
    periodLabel: formatPeriodLabel(range),
    lastCrawlDate: getLastCrawlDate(filtered),
    topMentionParty: topMention,
    mostPositiveParty: mostPositive,
    mostNegativeParty: mostNegative,
  };
}

export function computeTimeline(
  articles: Article[],
  range: DateRange,
  selectedParties?: string[],
): TimelinePoint[] {
  const filtered = filterArticlesByRange(articles, range);
  const byDate: Record<string, Record<string, number>> = {};

  for (const article of filtered) {
    if (!article.publishing_date) continue;
    const dateKey = format(parseISO(article.publishing_date), "yyyy-MM-dd");
    if (!byDate[dateKey]) byDate[dateKey] = {};
    for (const mention of article.party_analysis.mentions) {
      if (selectedParties && selectedParties.length > 0 && !selectedParties.includes(mention.party)) {
        continue;
      }
      byDate[dateKey][mention.party] = (byDate[dateKey][mention.party] ?? 0) + 1;
    }
  }

  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, parties]) => ({ date, ...parties }));
}

export function computePartyDetail(
  articles: Article[],
  party: string,
  range: DateRange,
  polls: PollData,
): PartyDetail {
  const filtered = filterArticlesByRange(articles, range);
  const partyArticles = filtered.filter((a) =>
    a.party_analysis.parties_mentioned.includes(party),
  );

  const sourceCounts: Record<string, number> = {};
  const articleRefs: ArticleRef[] = [];
  const termCounts: Record<string, number> = {};
  const signalCounts: Record<string, { count: number; polarity: string }> = {};
  const sentimentByDate: Record<string, { sum: number; count: number; mentions: number }> = {};

  for (const article of partyArticles) {
    const ref = buildArticleRef(article, party);
    articleRefs.push(ref);
    sourceCounts[ref.section] = (sourceCounts[ref.section] ?? 0) + 1;

    for (const sig of ref.signals) {
      const key = sig.sub_signal;
      if (!signalCounts[key]) signalCounts[key] = { count: 0, polarity: sig.polarity };
      signalCounts[key].count += 1;
    }

    const text = (article.plaintext ?? article.title ?? "").toLowerCase();
    const words = text.match(/[a-zäöüß]{4,}/gi) ?? [];
    for (const word of words) {
      const w = word.toLowerCase();
      if (!STOP_WORDS.has(w) && !PARTY_ORDER.some((p) => p.toLowerCase().includes(w))) {
        termCounts[w] = (termCounts[w] ?? 0) + 1;
      }
    }

    if (article.publishing_date && ref.sentimentScore !== null) {
      const dateKey = format(parseISO(article.publishing_date), "yyyy-MM-dd");
      if (!sentimentByDate[dateKey]) {
        sentimentByDate[dateKey] = { sum: 0, count: 0, mentions: 0 };
      }
      sentimentByDate[dateKey].sum += ref.sentimentScore;
      sentimentByDate[dateKey].count += 1;
      sentimentByDate[dateKey].mentions += ref.mentionCount;
    }
  }

  const mentionCount = partyArticles.reduce(
    (sum, a) => sum + a.party_analysis.mentions.filter((m) => m.party === party).length,
    0,
  );

  const allScores = articleRefs
    .map((a) => a.sentimentScore)
    .filter((s): s is number => s !== null);
  const avgSentimentScore =
    allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : null;

  const allLabels = articleRefs
    .map((a) => a.sentimentLabel)
    .filter((l): l is SentimentLabel => l !== null);

  const allImpacts = articleRefs
    .map((a) => a.impactForParty)
    .filter((i): i is ImpactForParty => i !== null);

  const sortedArticles = [...articleRefs].sort((a, b) => b.mentionCount - a.mentionCount);
  const withScore = articleRefs.filter((a) => a.sentimentScore !== null);

  return {
    party,
    mentionCount,
    pollValue: getPollValue(polls, party),
    avgSentimentScore,
    sentimentLabel: dominantLabel(allLabels),
    impactForParty: dominantImpact(allImpacts),
    topSources: Object.entries(sourceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count })),
    keyArticles: sortedArticles.slice(0, 5),
    positiveArticles: [...withScore]
      .sort((a, b) => (b.sentimentScore ?? 0) - (a.sentimentScore ?? 0))
      .slice(0, 3),
    negativeArticles: [...withScore]
      .sort((a, b) => (a.sentimentScore ?? 0) - (b.sentimentScore ?? 0))
      .slice(0, 3),
    topSignals: Object.entries(signalCounts)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 8)
      .map(([sub_signal, data]) => ({ sub_signal, ...data })),
    topTerms: Object.entries(termCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 12)
      .map(([term, count]) => ({ term, count })),
    sentimentTimeline: Object.entries(sentimentByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        sentimentScore: data.count > 0 ? Math.round(data.sum / data.count) : 0,
        mentions: data.mentions,
      })),
  };
}

export async function loadArticles(): Promise<Article[]> {
  const res = await fetch("/articles.json");
  if (!res.ok) return [];
  return res.json();
}
