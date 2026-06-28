import type {
  Article,
  DetectedParty,
  ImpactForParty,
  SentimentClass,
  SentimentLabel,
  SentimentResult,
} from "@/types";

export function getDetectedParty(article: Article, party: string): DetectedParty | null {
  const summary = article.party_analysis.party_summary[party];
  if (summary?.targeted_sentiment?.mentioned) {
    return summary.targeted_sentiment;
  }

  const fromArticle = article.party_analysis.targeted_sentiment?.detected_parties.find(
    (p) => p.party_name === party && p.mentioned,
  );
  if (fromArticle) return fromArticle;

  const portrayal = summary?.article_portrayal;
  if (portrayal && portrayal.sentiment_score !== undefined) {
    return {
      party_id: party.toLowerCase(),
      party_name: party,
      mentioned: true,
      matched_terms: [],
      matched_politicians: [],
      relevance: portrayal.relevance ?? 0,
      mention_count: { title: 0, subtitle: 0, summary: 0, body: 0, total: summary?.mention_count ?? 0 },
      sentiment_score: portrayal.sentiment_score ?? 0,
      sentiment_label: (portrayal.label as SentimentLabel) ?? "neutral",
      impact_for_party: (portrayal.impact_for_party as ImpactForParty) ?? "neutral",
      main_frame: portrayal.main_frame ?? "",
      signals: portrayal.signals ?? [],
      evidence: portrayal.evidence ?? [],
      reasoning_short: portrayal.reasoning_short ?? "",
      confidence: portrayal.confidence ?? 0,
    };
  }

  return null;
}

export function getArticlePartySentimentScore(article: Article, party: string): number | null {
  const detected = getDetectedParty(article, party);
  if (detected) return detected.sentiment_score;

  const mentions = article.party_analysis.mentions.filter((m) => m.party === party);
  if (mentions.length === 0) return null;

  const legacy = mentions
    .map((m) => sentimentToLegacyScore(m.sentiment))
    .filter((s): s is number => s !== null);
  if (legacy.length === 0) return null;
  return Math.round((legacy.reduce((a, b) => a + b, 0) / legacy.length) * 100);
}

function sentimentToLegacyScore(sentiment: SentimentResult | null): number | null {
  if (!sentiment) return null;
  const dir = sentiment.label === "positive" ? 1 : sentiment.label === "negative" ? -1 : 0;
  return dir * sentiment.score;
}

export function classifySentimentScore(score: number | null): SentimentClass | null {
  if (score === null) return null;
  if (score > 15) return "positiv";
  if (score < -15) return "negativ";
  return "neutral";
}

export function classifyFromLabel(label: SentimentLabel | string | null): SentimentClass | null {
  if (!label) return null;
  if (label === "positive") return "positiv";
  if (label === "negative") return "negativ";
  if (label === "mixed") return "gemischt";
  return "neutral";
}

export function formatSentimentScore(score: number | null): string {
  if (score === null) return "—";
  const sign = score > 0 ? "+" : "";
  return `${sign}${Math.round(score)}`;
}

export function formatImpact(impact: ImpactForParty | string | null): string {
  if (!impact) return "—";
  const labels: Record<string, string> = {
    very_positive: "Sehr positiv",
    positive: "Positiv",
    slightly_positive: "Leicht positiv",
    neutral: "Neutral",
    slightly_negative: "Leicht negativ",
    negative: "Negativ",
    very_negative: "Sehr negativ",
    mixed: "Gemischt",
  };
  return labels[impact] ?? impact;
}

export function sentimentColor(score: number | null): string {
  if (score === null) return "";
  if (score > 15) return "text-emerald-700";
  if (score < -15) return "text-red-700";
  return "text-stone-600";
}
